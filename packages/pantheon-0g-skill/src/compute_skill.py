"""
0G Compute skill for verifiable battle computation.
"""
import httpx
import json
from typing import Any, Optional
from dataclasses import dataclass

try:
    from agent.config import settings
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False


@dataclass
class ComputeConfig:
    """Configuration for 0G Compute skill."""
    base_url: str = "https://compute-testnet.0g.ai"
    api_key: str = ""


class ZeroGComputeSkill:
    """
    OpenClaw skill: verifiable compute via 0G Compute.

    Registers:
        compute_submit    → submit computation for verification
        compute_status    → check computation status
        compute_result    → retrieve computation result
        compute_verify   → verify proof on-chain
    """

    skill_name = "0g-compute"
    skill_version = "1.0.0"
    skill_description = (
        "Verifiable compute via 0G. Submit computations, get proofs, "
        "verify on-chain for battle verification."
    )

    def __init__(self, base_url: str = None):
        if CONFIG_AVAILABLE:
            self.base_url = base_url or settings.OG_COMPUTE_URL or "https://compute-testnet.0g.ai"
        else:
            self.base_url = base_url or "https://compute-testnet.0g.ai"

    def register(self, agent) -> None:
        agent.add_skill("compute_submit", self.compute_submit)
        agent.add_skill("compute_status", self.compute_status)
        agent.add_skill("compute_result", self.compute_result)
        agent.add_skill("compute_verify", self.compute_verify)

    async def compute_submit(self, program: str, input_data: Any) -> dict:
        """
        Submit a computation for verifiable execution.
        Returns {computeId, status, proof}.
        """
        payload = {
            "program": program,
            "input": input_data,
            "verifiable": True,
        }
        async with httpx.AsyncClient(timeout=60.0) as c:
            resp = await c.post(
                f"{self.base_url}/compute/submit",
                json=payload
            )
            resp.raise_for_status()
            return resp.json()

    async def compute_status(self, compute_id: str) -> dict:
        """Check status of a computation."""
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.get(f"{self.base_url}/compute/{compute_id}/status")
            resp.raise_for_status()
            return resp.json()

    async def compute_result(self, compute_id: str) -> Optional[dict]:
        """Retrieve computation result."""
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.get(f"{self.base_url}/compute/{compute_id}/result")
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()

    async def compute_verify(self, compute_id: str, proof: str) -> bool:
        """
        Verify proof on-chain.
        Returns True if verified.
        """
        payload = {
            "compute_id": compute_id,
            "proof": proof,
        }
        async with httpx.AsyncClient(timeout=30.0) as c:
            resp = await c.post(
                f"{self.base_url}/compute/verify",
                json=payload
            )
            return resp.status_code == 200