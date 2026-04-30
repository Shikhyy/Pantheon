# agent/battle_loop.py
import asyncio
import time
from models import AgentProfile, BattleConfig, AgentMove
from og_client import ZeroGClient
from axl_client import AXLClient
from crypto import decrypt_directive
from config import settings

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

    async def run(self) -> None:
        """Main battle loop. Runs for 5 rounds."""

        # 1. Wait for AXL node to be ready
        ready = await self.axl.wait_for_ready(timeout=30)
        if not ready:
            print(f"AXL node {self.axl.base_url} not ready. Using mock mode.")

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
            await self.og.log_append(
                namespace=f"agents/{self.agent.token_id}/battles",
                entry={
                    "battle_id": self.battle_id,
                    "opponent_id": self.opponent.token_id,
                    "memory_used": memory,
                    "timestamp": time.time(),
                }
            )
        except Exception as e:
            print(f"Failed to save log to 0G: {e}")

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
