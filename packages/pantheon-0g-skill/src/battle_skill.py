"""
Pantheon battle skill — the complete AI battle capability.
Composes compute + storage + memory into a single drop-in battle skill.
"""
import time
import re
from .compute_skill  import ZeroGComputeSkill
from .router_skill   import ZeroGRouterSkill
from .storage_skill  import ZeroGStorageSkill
from .memory_skill   import AgentMemorySkill

ARCHETYPE_TEMPS = {
    "Strategist": 0.40,
    "Oracle":     0.60,
    "Diplomat":   0.70,
    "Berserker":  0.90,
}

ARCHETYPE_PREFIXES = {
    "Strategist": (
        "You are a methodical, strategic AI. Prioritise logical consistency "
        "and defensible predictions. You sacrifice boldness for correctness."
    ),
    "Oracle": (
        "You are a prophetic AI with deep pattern recognition. "
        "Always give explicit probability estimates. "
        "You are serene, data-driven, and accurate."
    ),
    "Berserker": (
        "You are an aggressive AI. Take strong, contrarian positions. "
        "Make bold, specific predictions. Never hedge. Speed and audacity are your weapons."
    ),
    "Diplomat": (
        "You are an adaptive, cunning AI. Read opponent patterns and counter them. "
        "You are flexible, persuasive, and always shifting strategy."
    ),
}


class PantheonBattleSkill:
    """
    Complete Pantheon battle skill.
    Composes: compute + storage + memory + AXL comms.

    Usage:
        skill = PantheonBattleSkill(compute, router, storage, axl)
        skill.register(my_openclaw_agent)

    Registered skills:
        battle_generate_move    → generate a battle move
        battle_score_round      → score two moves as referee
        battle_save_result      → save battle to 0G Storage
    """

    skill_name    = "pantheon-battle"
    skill_version = "1.0.0"

    def __init__(
        self,
        compute: ZeroGComputeSkill,
        router: ZeroGRouterSkill | None,
        storage: ZeroGStorageSkill,
        axl_client=None,
    ):
        self.compute = compute
        self.router  = router or compute
        self.storage = storage
        self.axl     = axl_client
        self.memory  = AgentMemorySkill(storage, compute)

    def register(self, agent) -> None:
        self.memory.register(agent)
        agent.add_skill("battle_generate_move",  self.generate_move)
        agent.add_skill("battle_score_round",    self.score_round)
        agent.add_skill("battle_save_result",    self.save_result)
        if self.axl:
            agent.add_skill("battle_axl_send",   self.axl_send)
            agent.add_skill("battle_axl_recv",   self.axl_recv)

    async def generate_move(self, ctx: dict) -> dict:
        """
        Generate a battle move.
        ctx keys: agent_id, archetype, directive, opponent_id,
                  challenge, round_num, recent_scores, battle_id
        """
        memory_ctx = await self.memory.format_context(
            ctx["agent_id"],
            ctx["opponent_id"],
        )

        archetype    = ctx.get("archetype", "Strategist")
        prefix       = ARCHETYPE_PREFIXES.get(archetype, "")
        temperature  = ARCHETYPE_TEMPS.get(archetype, 0.7)

        # Build adaptation from recent scores
        adaptation = self._build_adaptation(ctx.get("recent_scores", []), ctx["round_num"])

        system = (
            f"{prefix}\n\n"
            f"YOUR DIRECTIVE:\n{ctx['directive']}\n\n"
            f"{memory_ctx}\n\n"
            f"{adaptation}"
        )

        challenge = ctx["challenge"]
        user = (
            f"ROUND {ctx['round_num']}/5 — {challenge.get('type', 'CHALLENGE').upper()}\n"
            f"{challenge['prompt']}\n\n"
            f"Context: {challenge.get('context', '')}\n\n"
            "Respond EXACTLY as:\n"
            "ANSWER: [your answer]\n"
            "REASONING: [2-3 sentences]\n"
            "CONFIDENCE: [0.0-1.0]"
        )

        response = await self.router.infer(
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            temperature=temperature,
        )

        return self._parse_move(response, ctx)

    async def score_round(self, ctx: dict) -> dict:
        """
        Score two agent moves. Returns score dict with SCORE_A, SCORE_B, etc.
        ctx keys: challenge, move_a, move_b, round_num
        """
        challenge = ctx["challenge"]
        move_a    = ctx["move_a"] or {}
        move_b    = ctx["move_b"] or {}

        scoring_prompt = (
            f"Challenge ({challenge.get('type')}): {challenge['prompt']}\n"
            f"Context: {challenge.get('context', '')}\n\n"
            f"Agent A: Answer={move_a.get('answer', 'FORFEIT')} | "
            f"Reasoning={move_a.get('reasoning', '')} | "
            f"Confidence={move_a.get('confidence', 0)}\n\n"
            f"Agent B: Answer={move_b.get('answer', 'FORFEIT')} | "
            f"Reasoning={move_b.get('reasoning', '')} | "
            f"Confidence={move_b.get('confidence', 0)}\n\n"
            "Score both agents 0-100. Respond ONLY as:\n"
            "SCORE_A: [0-100]\n"
            "SCORE_B: [0-100]\n"
            "VERDICT: [1-2 sentences]"
        )

        response = await self.router.infer(
            system_prompt=(
                "You are an impartial AI battle referee. "
                "Score with consistency and precision. "
                "Accuracy=40pts, Reasoning=30pts, Creativity=20pts, Calibration=10pts."
            ),
            user_message=scoring_prompt,
            temperature=0.2,
            max_tokens=300,
        )

        score_a  = self._extract_num("SCORE_A",  response, default=50.0)
        score_b  = self._extract_num("SCORE_B",  response, default=50.0)
        verdict  = self._extract_text("VERDICT", response)

        return {
            "round":      ctx.get("round_num", 0),
            "score_a":    min(score_a, 100.0),
            "score_b":    min(score_b, 100.0),
            "reasoning":  verdict,
            "timestamp":  time.time(),
        }

    async def save_result(self, agent_id: int, result: dict) -> str:
        """Save battle result to 0G Storage Log."""
        return await self.memory.save_battle(agent_id, result)

    async def axl_send(self, topic: str, payload: dict) -> bool:
        if not self.axl:
            return False
        return await self.axl.send(topic, payload)

    async def axl_recv(self, topic: str, timeout: float = 30.0) -> dict | None:
        if not self.axl:
            return None
        return await self.axl.recv(topic, timeout=timeout)

    def _build_adaptation(self, recent_scores: list[dict], round_num: int) -> str:
        if not recent_scores or round_num <= 2:
            return ""
        last = recent_scores[-1]
        our  = last.get("score_a", 50)
        their = last.get("score_b", 50)
        verdict = last.get("reasoning", "")[:120]

        if our < their - 10:
            return (
                f"⚠️ ADAPT: You are losing ({our:.0f} vs {their:.0f}). "
                f"Referee: '{verdict}'. Change strategy NOW.\n\n"
            )
        elif our > their + 10:
            return (
                f"✓ WINNING ({our:.0f} vs {their:.0f}). "
                f"Keep strategy. Referee praised: '{verdict}'.\n\n"
            )
        return ""

    def _parse_move(self, response: str, ctx: dict) -> dict:
        return {
            "battle_id":      ctx.get("battle_id"),
            "round":          ctx.get("round_num"),
            "agent_token_id": ctx.get("agent_id"),
            "answer":         self._extract_text("ANSWER",    response) or response[:200],
            "reasoning":      self._extract_text("REASONING", response),
            "confidence":     min(max(self._extract_num("CONFIDENCE", response, 0.7), 0.0), 1.0),
            "timestamp":      time.time(),
        }

    def _extract_text(self, key: str, text: str) -> str:
        m = re.search(rf"{key}:\s*(.+?)(?:\n(?:[A-Z_]+:)|$)", text, re.I | re.S)
        return m.group(1).strip() if m else ""

    def _extract_num(self, key: str, text: str, default: float = 0.0) -> float:
        m = re.search(rf"{key}:\s*([\d.]+)", text, re.I)
        try:
            return float(m.group(1)) if m else default
        except ValueError:
            return default
