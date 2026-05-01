"""
Agent memory skill for OpenClaw.
Provides episodic memory and opponent modelling backed by 0G Storage.
Any OpenClaw battle agent can use this to gain persistent memory.
"""
from .storage_skill import ZeroGStorageSkill
from .compute_skill  import ZeroGComputeSkill


class AgentMemorySkill:
    """
    OpenClaw skill: persistent agent memory.

    Registers:
        memory_load_episodic     → load past battle summaries
        memory_load_opponent     → load opponent model
        memory_save_battle       → save battle result
        memory_update_opponent   → update opponent model post-battle
        memory_clear             → clear all memory for an agent
    """

    skill_name    = "agent-memory"
    skill_version = "1.0.0"
    skill_description = (
        "Persistent episodic memory and opponent modelling for AI agents. "
        "Backed by 0G Storage Log (episodic) and KV (opponent models)."
    )

    def __init__(self, storage: ZeroGStorageSkill, compute: ZeroGComputeSkill):
        self.storage = storage
        self.compute = compute

    def register(self, agent) -> None:
        agent.add_skill("memory_load_episodic",   self.load_episodic)
        agent.add_skill("memory_load_opponent",   self.load_opponent)
        agent.add_skill("memory_save_battle",     self.save_battle)
        agent.add_skill("memory_update_opponent", self.update_opponent)
        agent.add_skill("memory_clear",           self.clear_memory)
        agent.add_skill("memory_format_context",  self.format_context)

    async def load_episodic(self, agent_id: int, limit: int = 5) -> list[dict]:
        """Load last N battle summaries for context injection."""
        entries = await self.storage.log_list(
            namespace=f"agents/{agent_id}/battles",
            limit=limit,
        )
        return [self._summarise_entry(e) for e in entries]

    async def load_opponent(self, agent_id: int, opponent_id: int) -> str:
        """Load tactical opponent profile."""
        model = await self.storage.kv_get(
            f"agent:{agent_id}:opponent:{opponent_id}:model"
        )
        return model or "No prior data on this opponent. Observe carefully."

    async def save_battle(self, agent_id: int, battle_summary: dict) -> str:
        """Save battle result to episodic log. Returns entry hash."""
        return await self.storage.log_append(
            namespace=f"agents/{agent_id}/battles",
            entry=battle_summary,
        )

    async def update_opponent(
        self,
        agent_id: int,
        opponent_id: int,
        battle_data: dict,
    ) -> None:
        """
        Update opponent model by asking 0G Compute to summarise
        what was learned about the opponent in this battle.
        """
        existing = await self.load_opponent(agent_id, opponent_id)

        summary = await self.compute.infer(
            system="You are a tactical AI analyst. Be specific and concise.",
            prompt=(
                f"Previous opponent model: {existing}\n\n"
                f"New battle data:\n"
                f"  Archetype: {battle_data.get('opponent_archetype')}\n"
                f"  Round scores: {battle_data.get('opponent_scores')}\n"
                f"  Strongest round type: {battle_data.get('opponent_best_round_type')}\n"
                f"  Referee observations: {battle_data.get('referee_notes', [])[:3]}\n\n"
                "Update the opponent model. Write 3 sentences max. "
                "Focus on exploitable patterns and weaknesses."
            ),
            temperature=0.3,
            max_tokens=200,
        )

        await self.storage.kv_set(
            key=f"agent:{agent_id}:opponent:{opponent_id}:model",
            value=summary,
        )

    async def clear_memory(self, agent_id: int) -> bool:
        """Clear all KV memory for an agent (not Log — that is eternal)."""
        # Can only clear KV keys, not Log entries
        await self.storage.kv_delete(f"agent:{agent_id}:working_state")
        return True

    async def format_context(self, agent_id: int, opponent_id: int) -> str:
        """
        Format all memory into a ready-to-inject prompt string.
        This is what gets injected into the battle system prompt.
        """
        episodic = await self.load_episodic(agent_id, limit=3)
        opponent = await self.load_opponent(agent_id, opponent_id)

        episodic_text = "\n".join([
            f"• {e['summary']}" for e in episodic
        ]) if episodic else "No prior battles."

        return (
            f"YOUR BATTLE MEMORY:\n{episodic_text}\n\n"
            f"THIS OPPONENT:\n{opponent}"
        )

    def _summarise_entry(self, entry: dict) -> dict:
        data = entry.get("entry", entry)
        return {
            "battle_id":          data.get("battle_id", "unknown"),
            "opponent_archetype": data.get("opponent_archetype", "Unknown"),
            "won":                data.get("won", False),
            "elo_delta":          data.get("elo_delta", 0),
            "best_round":         data.get("best_round", "?"),
            "weakness":           data.get("weakness", "none noted"),
            "summary": (
                f"vs {data.get('opponent_archetype', 'Unknown')} — "
                f"{'WON' if data.get('won') else 'LOST'} "
                f"(ELO {'+' if data.get('elo_delta', 0) >= 0 else ''}"
                f"{data.get('elo_delta', 0)}). "
                f"Best: Round {data.get('best_round', '?')}."
            ),
        }
