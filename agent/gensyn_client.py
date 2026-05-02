"""
Gensyn-inspired verifiable compute client.
Submits battle computations for ZK verification.
"""
import httpx
import json
import asyncio
from typing import Optional

try:
    from config import settings
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False


class GensynClient:
    """
    Verifiable compute for battle verification.
    Submits battle result computation → receives ZK proof → verifies on-chain.
    """

    def __init__(self):
        if CONFIG_AVAILABLE:
            self.gensyn_url = getattr(settings, 'GENSYN_URL', None) or "https://api.gensyn.io/v1"
            self.api_key = getattr(settings, 'GENSYN_API_KEY', "") or ""
        else:
            self.gensyn_url = "https://api.gensyn.io/v1"
            self.api_key = ""
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}" if self.api_key else "",
            "Content-Type": "application/json",
        }

    async def submit_battle_computation(
        self,
        battle_inputs: dict,
        agents: list[dict],
    ) -> dict:
        """
        Submit battle computation for verifiable execution.
        
        Args:
            battle_inputs: {challengerMove, defenderMove, ...}
            agents: [{elo, rank, archetype}, ...]
        
        Returns: {computeId, status, submittedAt}
        """
        if not self.gensyn_url or self.gensyn_url == "https://api.gensyn.io/v1":
            return await self._mock_submission(battle_inputs, agents)

        program = self._build_battle_program(agents)
        
        payload = {
            "program": program,
            "input": battle_inputs,
            "verifiable": True,
            "compute_type": "battle_verification",
        }
        
        async with httpx.AsyncClient(timeout=120.0) as c:
            resp = await c.post(
                f"{self.gensyn_url}/compute/submit",
                headers=self.headers,
                json=payload
            )
            resp.raise_for_status()
            return resp.json()

    async def _mock_submission(self, battle_inputs: dict, agents: list[dict]) -> dict:
        """Mock submission for development."""
        import time
        return {
            "compute_id": f"mock_{int(time.time())}",
            "status": "submitted",
            "submitted_at": time.time()
        }

    async def wait_for_proof(self, compute_id: str, timeout: int = 300) -> dict:
        """Poll until ZK proof is ready."""
        if compute_id.startswith("mock_"):
            await asyncio.sleep(1)
            return {
                "compute_id": compute_id,
                "status": "completed",
                "verified": True,
                "winner": "challenger",
                "proof_id": f"proof_{compute_id}",
                "proof_data": "0xmockproof"
            }
        
        deadline = asyncio.get_event_loop().time() + timeout
        
        while asyncio.get_event_loop().time() < deadline:
            status = await self.get_computation_status(compute_id)
            
            if status.get("status") == "completed":
                return await self.get_proof(compute_id)
            
            if status.get("status") == "failed":
                raise RuntimeError(f"Computation failed: {status.get('error')}")
            
            await asyncio.sleep(5)
        
        raise TimeoutError(f"Proof not ready within {timeout}s")

    async def get_computation_status(self, compute_id: str) -> dict:
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.get(
                f"{self.gensyn_url}/compute/{compute_id}/status",
                headers=self.headers
            )
            resp.raise_for_status()
            return resp.json()

    async def get_proof(self, compute_id: str) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as c:
            resp = await c.get(
                f"{self.gensyn_url}/compute/{compute_id}/proof",
                headers=self.headers
            )
            resp.raise_for_status()
            return resp.json()

    def _build_battle_program(self, agents: list[dict]) -> str:
        """Build computation program for battle verification."""
        return json.dumps({
            "type": "battle_verification",
            "agents": agents,
            "version": "1.0",
        })

    async def verify_proof_on_chain(
        self,
        compute_id: str,
        proof: dict,
        battle_arena_address: str,
    ) -> str:
        """
        Submit proof to battle arena contract for on-chain verification.
        Returns tx hash.
        """
        from keeperhub_client import KeeperHubClient
        
        kh = KeeperHubClient()
        
        return await kh.execute_transaction(
            contract_address=battle_arena_address,
            abi=[],
            method="verifyProof",
            args=[compute_id, proof["proof_data"]],
            gas_limit=500_000,
        )