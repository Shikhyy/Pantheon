# agent/battle_loop.py
import asyncio
import time
import logging
import httpx
from models import AgentProfile, BattleConfig, AgentMove
from og_client import ZeroGClient
from axl_client import AXLClient
from crypto import decrypt_directive
from config import settings

logger = logging.getLogger(__name__)

try:
    from gensyn_client import GensynClient
    GENSYN_AVAILABLE = True
except ImportError:
    GENSYN_AVAILABLE = False

class AgentBattleLoop:
    def __init__(
        self,
        agent: AgentProfile,
        config: BattleConfig,
        axl_port: int,
        is_agent_a: bool,
    ):
        self.agent     = agent
        self.config    = config
        self.axl       = AXLClient(port=axl_port)
        self.og        = ZeroGClient()
        self.is_a      = is_agent_a
        self.battle_id = config.battle_id
        self.opponent  = config.agent_b if is_agent_a else config.agent_a

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

    async def run(self) -> None:
        """Main battle loop. Runs for 5 rounds."""

        logger.info(f"[BATTLE] Starting battle loop for agent {self.agent.token_id}, battle_id={self.battle_id}")

        # 1. Wait for AXL node to be ready
        ready = await self.axl.wait_for_ready(timeout=30)
        if not ready:
            logger.warning(f"[BATTLE] AXL node {self.axl.base_url} not ready. Using mock mode.")

        # 2. Load agent memory (episodic + opponent model)
        memory = await self._load_memory()

        # 3. Decrypt directive
        directive = decrypt_directive(
            self.agent.directive_encrypted,
            settings.AGENT_PRIVATE_KEY
        )

        # 4. Signal ready via AXL
        await self.axl.send(
            topic=f"battle:{self.battle_id}:ready",
            payload={"agentId": self.agent.token_id, "ready": True}
        )

        # 5. Execute rounds
        for round_num in range(1, self.config.total_rounds + 1):
            
            # Wait for round challenge from referee
            challenge = await self.axl.recv(
                topic=f"battle:{self.battle_id}:round:{round_num}:challenge",
                timeout=60.0
            )
            if not challenge:
                # If no challenge (testing mode), create mock challenge
                challenge = {"challenge_type": "prediction", "prompt": f"Round {round_num} test"}

            move = await self._generate_move(
                directive=directive,
                memory=memory,
                challenge=challenge,
                round_num=round_num,
            )

            # Send our move to AXL mesh
            await self.axl.send(
                topic=f"battle:{self.battle_id}:round:{round_num}:move",
                payload=move.model_dump()
            )
            
            await self._emit_sse("axl_message", {
                "id": f"agent-{self.agent.token_id}-move-{round_num}",
                "from": self.agent.name,
                "type": "MOVE",
                "content": move.answer,
                "timestamp": move.timestamp * 1000,
                "nodeColor": "sky" if self.is_a else "hadria"
            })

            # Wait for round score from referee
            score = await self.axl.recv(
                topic=f"battle:{self.battle_id}:round:{round_num}:score",
                timeout=45.0
            )
            
            if score:
                memory["recent_rounds"].append({
                    "round": round_num,
                    "our_score": score.get("score_a") if self.is_a else score.get("score_b"),
                    "strategy_used": move.reasoning[:200],
                })

        # 6. Archive battle transcript to 0G Log
        try:
            logger.info(f"[BATTLE] Archiving battle transcript to 0G storage")
            await self.og.log_append(
                namespace=f"agents/{self.agent.token_id}/battles",
                entry={
                    "battle_id": self.battle_id,
                    "opponent_id": self.opponent.token_id,
                    "memory_used": memory,
                    "timestamp": time.time(),
                }
            )
            logger.info(f"[BATTLE] Transcript archived successfully")
        except Exception as e:
            logger.error(f"[BATTLE] Failed to save log to 0G: {e}", exc_info=True)

        # 7. Submit the battle transcript for Gensyn verification and persist the proof
        if GENSYN_AVAILABLE:
            try:
                logger.info(f"[BATTLE] Submitting battle {self.battle_id} to Gensyn for verification")
                gensyn = GensynClient()
                agents = [
                    {
                        "agent_token_id": self.agent.token_id,
                        "archetype": self.agent.archetype,
                        "is_primary": self.is_a,
                    },
                    {
                        "agent_token_id": self.opponent.token_id,
                        "archetype": self.opponent.archetype,
                        "is_primary": not self.is_a,
                    },
                ]
                battle_inputs = {
                    "battle_id": self.battle_id,
                    "rounds": self.config.total_rounds,
                    "transcript": memory,
                    "winner_candidate": self.agent.token_id,
                }
                submission = await gensyn.submit_battle_computation(battle_inputs, agents)
                compute_id = submission.get("compute_id") or submission.get("id")
                if compute_id:
                    logger.info(f"[BATTLE] Gensyn computation submitted: compute_id={compute_id}")
                    proof = await gensyn.wait_for_proof(compute_id)
                    await gensyn.store_verified_proof(self.battle_id, proof)
                    logger.info(f"[BATTLE] Battle {self.battle_id} proof stored: {compute_id}")
                else:
                    logger.warning(f"[BATTLE] Gensyn submission response missing compute_id: {submission}")
            except Exception as e:
                logger.error(f"[BATTLE] Gensyn verification failed: {e}", exc_info=True)

    async def _generate_move(
        self,
        directive: str,
        memory: dict,
        challenge: dict,
        round_num: int,
    ) -> AgentMove:
        """Build prompt and call 0G Compute for this round's move."""

        memory_context = self._format_memory(memory)
        opponent_model = memory.get("opponent_model", "No prior knowledge.")

        system_prompt = f"""{directive}
You are competing in an AI battle arena. 
Your memory of past battles: {memory_context}
Your model of this specific opponent: {opponent_model}

Round {round_num} of 5. Challenge type: {challenge.get('challenge_type', 'unknown')}.
Respond with:
1. Your answer
2. Your reasoning
3. Your confidence level (0.0-1.0)
Format: ANSWER: [your answer] | REASONING: [your reasoning] | CONFIDENCE: [0.0-1.0]"""

        user_message = f"Challenge: {challenge.get('prompt', '')}"

        try:
            response = await self.og.infer(
                system_prompt=system_prompt,
                user_message=user_message,
                model="qwen3",
                temperature=self._archetype_temperature(),
            )
        except Exception:
            # Fallback for demo when 0G compute is unavailable
            response = f"ANSWER: Precision protocol initiated. | REASONING: Calculated probability matrix. | CONFIDENCE: 0.88"

        answer    = self._extract("ANSWER", response)
        reasoning = self._extract("REASONING", response)
        try:
            confidence = float(self._extract("CONFIDENCE", response))
        except:
            confidence = 0.7

        return AgentMove(
            battle_id=self.battle_id,
            round=round_num,
            agent_token_id=self.agent.token_id,
            reasoning=reasoning,
            answer=answer,
            confidence=min(max(confidence, 0.0), 1.0),
            timestamp=time.time(),
        )

    def _archetype_temperature(self) -> float:
        temps = {0: 0.4, 1: 0.6, 2: 0.9, 3: 0.7}
        return temps.get(self.agent.archetype, 0.7)

    async def _load_memory(self) -> dict:
        recent_battles = await self.og.load_agent_memory(self.agent.token_id)
        opponent_model = await self.og.load_opponent_model(
            self.agent.token_id,
            self.opponent.token_id
        )
        return {
            "recent_battles": recent_battles,
            "opponent_model": opponent_model or "No prior data on this opponent.",
            "recent_rounds":  [],
        }

    def _format_memory(self, memory: dict) -> str:
        if not memory.get("recent_battles"):
            return "No prior battles recorded."
        return f"{len(memory['recent_battles'])} previous battles loaded."

    def _extract(self, key: str, text: str) -> str:
        import re
        match = re.search(rf"{key}:\s*(.+?)(?:\||$)", text, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else text.strip()

if __name__ == "__main__":
    # Test stub
    pass
