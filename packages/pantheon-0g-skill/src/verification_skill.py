"""
Battle verification skill using 0G/Gensyn.
"""
from typing import Optional
from .compute_skill import ZeroGComputeSkill

try:
    from agent.config import settings
except ImportError:
    settings = None


class VerificationSkill:
    """
    OpenClaw skill: battle result verification.

    Registers:
        verify_battle    → verify battle result with ZK proof
        get_battle_proof → retrieve verification proof
    """

    skill_name = "battle-verification"
    skill_version = "1.0.0"
    skill_description = (
        "Verify battle results using verifiable compute. "
        "Submit computation, get ZK proof, verify on-chain."
    )

    def __init__(self):
        self.compute = ZeroGComputeSkill()

    def register(self, agent) -> None:
        agent.add_skill("verify_battle", self.verify_battle)
        agent.add_skill("get_battle_proof", self.get_battle_proof)

    async def verify_battle(
        self,
        challenger_id: int,
        defender_id: int,
        challenger_move: dict,
        defender_move: dict,
    ) -> dict:
        """
        Verify battle result with ZK proof.
        
        Returns: {verified, winner, proofId, computeId}
        """
        result = await self.compute.compute_submit(
            program="battle_verification",
            input_data={
                "challenger_id": challenger_id,
                "defender_id": defender_id,
                "challenger_move": challenger_move,
                "defender_move": defender_move,
            }
        )
        
        compute_id = result.get("compute_id", result.get("id"))
        
        proof_result = await self.compute.compute_status(compute_id)
        
        return {
            "verified": proof_result.get("verified", False),
            "winner": proof_result.get("winner"),
            "proof_id": proof_result.get("proof_id"),
            "compute_id": compute_id,
        }

    async def get_battle_proof(self, compute_id: str) -> Optional[dict]:
        """Retrieve verification proof."""
        return await self.compute.compute_result(compute_id)