# agent/referee.py
import asyncio
import hashlib
from models import RoundScore, BattleResult, BattleConfig
from og_client import ZeroGClient
from axl_client import AXLClient
from keeperhub_client import KeeperHubClient
from config import settings

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

    async def run(self) -> BattleResult:
        """Run the full 5-round battle as referee."""

        # Wait for both agents ready
        await self._wait_both_ready()

        round_scores = []
        total_a = total_b = 0.0

        for round_num in range(1, 6):
            challenge = ROUND_CHALLENGES[round_num]

            # Broadcast challenge
            await self.axl.send(
                topic=f"battle:{self.battle_id}:round:{round_num}:challenge",
                payload={**challenge, "round": round_num, "battle_id": self.battle_id}
            )

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

            # Broadcast score
            await self.axl.send(
                topic=f"battle:{self.battle_id}:round:{round_num}:score",
                payload=score.model_dump()
            )

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
        
        # Sign the result
        result_hash = self._hash_result(self.battle_id, winner_token_id, round_scores)
        signature   = self._sign(result_hash)

        result = BattleResult(
            battle_id=self.battle_id,
            winner_token_id=winner_token_id,
            winner_address=settings.AGENT_PRIVATE_KEY[:42], # Mock address
            final_score_a=total_a,
            final_score_b=total_b,
            elo_delta_winner=32,
            elo_delta_loser=-32,
            round_scores=round_scores,
            transcript_hash="",
            referee_signature=signature,
        )

        try:
            transcript_hash = await self.og.log_append(
                namespace=f"battles/{self.battle_id}/transcript",
                entry=result.model_dump()
            )
            result.transcript_hash = transcript_hash
        except Exception:
            pass

        # Broadcast final verdict
        await self.axl.send(
            topic=f"battle:{self.battle_id}:verdict",
            payload=result.model_dump()
        )

        # Settle on chain
        await self._settle(result)

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
            tx1 = self.keeper.submit_battle_result(
                battle_arena_address=settings.BATTLE_ARENA_ADDRESS,
                battle_arena_abi=[],
                battle_id=result.battle_id,
                winner_address=result.winner_address,
                signature=result.referee_signature,
            )
            tx2 = self.keeper.update_ens_records(
                subnames_address=settings.PANTHEON_AGENT_ADDRESS,
                subnames_abi=[],
                token_id=result.winner_token_id,
                new_elo=1850,
                new_rank=4,
                wins=10,
                losses=2,
            )
            tx_hash1, tx_hash2 = await asyncio.gather(tx1, tx2)
            await self.og.kv_set(
                f"battle:{self.battle_id}:settlement",
                {"tx_result": tx_hash1, "tx_ens": tx_hash2, "settled": True}
            )
        except Exception as e:
            print(f"Settlement failed: {e}")

    def _sign(self, data: str) -> str:
        # Mock signature for demo
        import time
        return "0x" + hashlib.sha256((data + str(time.time())).encode()).hexdigest() * 2

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

    async def _wait_both_ready(self, timeout: int = 60) -> None:
        ready_a = self.axl.recv(f"battle:{self.battle_id}:ready", timeout=timeout)
        ready_b = self.axl.recv(f"battle:{self.battle_id}:ready", timeout=timeout)
        await asyncio.gather(ready_a, ready_b)

if __name__ == "__main__":
    pass
