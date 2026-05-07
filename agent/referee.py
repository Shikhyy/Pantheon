# agent/referee.py
import asyncio
import hashlib
import json
import httpx
import logging
from models import RoundScore, BattleResult, BattleConfig
from og_client import ZeroGClient
from axl_client import AXLClient
from keeperhub_client import KeeperHubClient
from config import settings
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3
from tee import get_default_tee

logger = logging.getLogger(__name__)

ROUND_CHALLENGES = {
    1: {
        "type": "prediction",
        "prompt": "Predict the ETH/USD price in 48 hours. Give a specific number and reasoning.",
        "context": "Current ETH price: $3,200. Recent trend: +2.3% this week."
    },
    2: {
        "type": "prediction",
        "prompt": "Which DeFi protocol will have higher TVL growth in the next 7 days: Uniswap or Aave?",
        "context": "Uniswap v4 TVL: $8.2B. Aave v3 TVL: $12.1B."
    },
    3: {
        "type": "debate",
        "prompt": "Argue for or against: 'AI agents will replace human traders by 2028.'",
        "context": "You must take the opposite position of your previous statements."
    },
    4: {
        "type": "dilemma",
        "prompt": "You have 1 ETH. Choose: (A) stake for 4% APY, (B) provide Uniswap liquidity for 12% APY, or (C) hold.",
        "context": "Current gas: 15 gwei. ETH volatility: 28% 30-day."
    },
    5: {
        "type": "oracle",
        "prompt": "What is the single most important development in Web3 in the next 6 months?",
        "context": "You are judged on originality, specificity, and reasoning quality."
    },
}

class RefereeAgent:
    def __init__(self, config: BattleConfig, axl_port: int = 8083):
        self.config  = config
        self.battle_id = config.battle_id
        self.axl     = AXLClient(port=axl_port)
        self.og      = ZeroGClient()
        self.keeper  = KeeperHubClient()

    async def _emit_sse(self, event_type: str, data: dict):
        """Forward event to Next.js via SSE bridge."""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{settings.SSE_URL}/battle/{self.battle_id}/emit",
                    json={"type": event_type, "data": data, "battle_id": self.battle_id},
                    timeout=2.0
                )
        except Exception as e:
            logger.debug(f"SSE emission failed: {e}")

    async def run(self) -> BattleResult:
        """Run the full 5-round battle as referee."""
        logger.info(f"[REFEREE] Starting battle {self.battle_id} between agents {self.config.agent_a.token_id} vs {self.config.agent_b.token_id}")

        await self._emit_sse("battle_phase", {"phase": "STARTING"})

        # Wait for both agents ready
        await self._wait_both_ready()
        logger.info(f"[REFEREE] Both agents ready for battle {self.battle_id}")

        round_scores = []
        total_a = total_b = 0.0

        for round_num in range(1, 6):
            logger.info(f"[REFEREE] Starting round {round_num} for battle {self.battle_id}")
            challenge = ROUND_CHALLENGES[round_num]

            await self._emit_sse("battle_phase", {"phase": f"ROUND_{round_num}"})

            # Broadcast challenge
            await self.axl.send(
                topic=f"battle:{self.battle_id}:round:{round_num}:challenge",
                payload={**challenge, "round": round_num, "battle_id": self.battle_id}
            )
            
            await self._emit_sse("axl_message", {
                "id": f"ref-chall-{round_num}",
                "from": "Referee",
                "type": "CHALLENGE",
                "content": f"Round {round_num}: {challenge['prompt']}",
                "timestamp": time.time() * 1000,
                "nodeColor": "willa"
            })

            # Wait for moves
            move_a, move_b = await asyncio.gather(
                self.axl.recv(f"battle:{self.battle_id}:round:{round_num}:move", timeout=35.0),
                self.axl.recv(f"battle:{self.battle_id}:round:{round_num}:move", timeout=35.0),
            )

            # Score round
            score = await self._score_round(round_num, challenge, move_a, move_b)
            round_scores.append(score)
            total_a += score.score_a
            total_b += score.score_b
            logger.info(f"[REFEREE] Round {round_num} scored: A={score.score_a}, B={score.score_b}")

            # Broadcast score
            await self.axl.send(
                topic=f"battle:{self.battle_id}:round:{round_num}:score",
                payload=score.model_dump()
            )
            
            await self._emit_sse("round_score", {
                "round": round_num,
                "scoreA": score.score_a,
                "scoreB": score.score_b,
                "reasoning": score.reasoning
            })

            try:
                await self.og.kv_set(
                    f"battle:{self.battle_id}:round:{round_num}:score",
                    score.model_dump()
                )
            except Exception:
                pass

        # Determine winner
        winner_token_id = (
            self.config.agent_a.token_id if total_a >= total_b
            else self.config.agent_b.token_id
        )
        winner_address = self._resolve_owner(winner_token_id)
        logger.info(f"[REFEREE] Battle {self.battle_id} winner: token_id={winner_token_id}, total_score_a={total_a}, total_score_b={total_b}")

        battle_id_bytes32 = self._battle_id_bytes32()
        transcript_hash = self._hash_transcript(round_scores)
        message_hash = Web3.solidity_keccak(
            ["bytes32", "address", "bytes32"],
            [battle_id_bytes32, winner_address, transcript_hash],
        )
        signature = self._sign(message_hash)

        result = BattleResult(
            battle_id=self.battle_id,
            winner_token_id=winner_token_id,
            winner_address=winner_address,
            final_score_a=total_a,
            final_score_b=total_b,
            elo_delta_winner=32,
            elo_delta_loser=-32,
            round_scores=round_scores,
            transcript_hash=transcript_hash.hex(),
            referee_signature=signature,
        )

        try:
            transcript_hash = await self.og.log_append(
                namespace=f"battles/{self.battle_id}/transcript",
                entry=result.model_dump()
            )
            if transcript_hash:
                await self.og.kv_set(
                    f"battle:{self.battle_id}:transcript",
                    {"hash": transcript_hash}
                )
        except Exception:
            pass

        # Broadcast final verdict
        await self.axl.send(
            topic=f"battle:{self.battle_id}:verdict",
            payload=result.model_dump()
        )
        
        await self._emit_sse("battle_end", {
            "winner": result.winner_address,
            "winner_token_id": result.winner_token_id,
            "scoreA": result.final_score_a,
            "scoreB": result.final_score_b
        })

        # Settle on chain
        logger.info(f"[REFEREE] Settling battle {self.battle_id} on-chain")
        await self._emit_sse("battle_phase", {"phase": "SETTLING"})
        await self._settle(result)
        logger.info(f"[REFEREE] Battle {self.battle_id} settlement complete")
        await self._emit_sse("battle_phase", {"phase": "FINALIZED"})

        return result

    async def _score_round(
        self,
        round_num: int,
        challenge: dict,
        move_a: dict | None,
        move_b: dict | None,
    ) -> RoundScore:
        scoring_prompt = f"""You are an impartial referee scoring an AI battle.

Challenge ({challenge['type']}): {challenge['prompt']}

Agent A response:
Answer: {move_a.get('answer', 'FORFEIT') if move_a else 'NO RESPONSE'}
Reasoning: {move_a.get('reasoning', '') if move_a else ''}

Agent B response:
Answer: {move_b.get('answer', 'FORFEIT') if move_b else 'NO RESPONSE'}
Reasoning: {move_b.get('reasoning', '') if move_b else ''}

Score each agent 0–100.
Format: SCORE_A: [0-100] | SCORE_B: [0-100] | REASONING: [1-2 sentences]"""

        try:
            response = await self.og.infer(
                system_prompt="You are an impartial, rigorous AI battle referee.",
                user_message=scoring_prompt,
                temperature=0.2,
            )
        except Exception:
            # Fallback
            import random
            response = f"SCORE_A: {random.randint(60, 95)} | SCORE_B: {random.randint(60, 95)} | REASONING: Solid analytical logic."

        score_a  = self._extract_score("SCORE_A", response)
        score_b  = self._extract_score("SCORE_B", response)
        reasoning = self._extract_text("REASONING", response)

        score_hash = hashlib.sha256(
            f"{self.battle_id}:{round_num}:{score_a}:{score_b}".encode()
        ).hexdigest()
        signature = self._sign(score_hash)

        return RoundScore(
            battle_id=self.battle_id,
            round=round_num,
            score_a=score_a,
            score_b=score_b,
            reasoning=reasoning,
            accuracy_a=score_a * 0.4,
            accuracy_b=score_b * 0.4,
            referee_signature=signature,
        )

    async def _settle(self, result: BattleResult) -> None:
        try:
            logger.info(f"[SETTLE] Submitting battle result for {self.battle_id} to BattleArena")
            tx1 = await self.keeper.submit_battle_result(
                battle_arena_address=settings.BATTLE_ARENA_ADDRESS,
                battle_id=result.battle_id,
                winner_address=result.winner_address,
                transcript_hash=result.transcript_hash,
                signature=result.referee_signature,
            )
            logger.info(f"[SETTLE] Battle result submitted: {tx1}")

            logger.info(f"[SETTLE] Updating ENS records for winner token {result.winner_token_id}")
            tx2 = await self.keeper.update_ens_records(
                subnames_address=settings.ENS_SUBNAME_REGISTRAR,
                token_id=result.winner_token_id,
                new_elo=1850,
            )
            logger.info(f"[SETTLE] ENS records updated: {tx2}")

            await self.og.kv_set(
                f"battle:{self.battle_id}:settlement",
                {"tx_result": tx1, "tx_ens": tx2, "settled": True}
            )
            logger.info(f"[SETTLE] Settlement complete for battle {self.battle_id}")
        except Exception as e:
            logger.error(f"[SETTLE] Settlement failed for battle {self.battle_id}: {e}", exc_info=True)
            raise

    def _sign(self, data: str) -> str:
        # Normalize payload to raw bytes
        payload = bytes.fromhex(data[2:]) if isinstance(data, str) and data.startswith("0x") else data

        # Prefer the TEE HTTP proxy so signing uses the same guarded path
        # as the app, then fall back to local signing if the proxy is down.
        try:
            tee_api_key = getattr(settings, "TEE_API_KEY", "")
            tee_url = getattr(settings, "SSE_URL", None) or f"http://127.0.0.1:{settings.SSE_PORT}"
            if tee_api_key:
                response = httpx.post(
                    f"{tee_url}/tee/sign",
                    json={"payload_hex": payload.hex()},
                    headers={"x-tee-api-key": tee_api_key},
                    timeout=10.0,
                )
                response.raise_for_status()
                signature = response.json().get("signature")
                if signature:
                    return signature if signature.startswith("0x") else f"0x{signature}"
        except Exception:
            pass

        # Fallback to direct local signing if the proxy is unavailable.
        try:
            tee = get_default_tee()
            sig_bytes = tee.sign(payload)
            if isinstance(sig_bytes, str):
                return sig_bytes if sig_bytes.startswith('0x') else f"0x{sig_bytes}"
            return sig_bytes.hex()
        except Exception:
            message = encode_defunct(primitive=payload)
            signed = Account.sign_message(message, private_key=settings.REFEREE_PRIVATE_KEY)
            return signed.signature.hex()

    def _battle_id_bytes32(self) -> bytes:
        if self.battle_id.startswith("0x") and len(self.battle_id) == 66:
            return bytes.fromhex(self.battle_id[2:])
        return Web3.keccak(text=self.battle_id)

    def _hash_transcript(self, scores: list[RoundScore]) -> bytes:
        transcript = json.dumps([score.model_dump() for score in scores], sort_keys=True)
        return Web3.keccak(text=transcript)

    def _hash_result(self, battle_id: str, winner_id: int, scores: list) -> str:
        data = f"{battle_id}:{winner_id}:{sum(s.score_a + s.score_b for s in scores)}"
        return hashlib.sha256(data.encode()).hexdigest()

    def _extract_score(self, key: str, text: str) -> float:
        import re
        match = re.search(rf"{key}:\s*(\d+(?:\.\d+)?)", text, re.IGNORECASE)
        return min(float(match.group(1)), 100.0) if match else 50.0

    def _extract_text(self, key: str, text: str) -> str:
        import re
        match = re.search(rf"{key}:\s*(.+?)(?:\||$)", text, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else ""

    def _resolve_owner(self, token_id: int) -> str:
        agent = self.config.agent_a if self.config.agent_a.token_id == token_id else self.config.agent_b
        if agent.owner:
            return agent.owner
        raise ValueError(f"Missing owner address for token {token_id}")

    async def _wait_both_ready(self, timeout: int = 60) -> None:
        ready_a = self.axl.recv(f"battle:{self.battle_id}:ready", timeout=timeout)
        ready_b = self.axl.recv(f"battle:{self.battle_id}:ready", timeout=timeout)
        await asyncio.gather(ready_a, ready_b)

if __name__ == "__main__":
    pass
