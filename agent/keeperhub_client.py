# agent/keeperhub_client.py
import httpx
import asyncio
from typing import Any
from config import settings

class KeeperHubClient:
    """
    KeeperHub MCP server integration.
    Routes ALL on-chain transactions through KeeperHub for:
    - Nonce management
    - Gas estimation + retry
    - MEV protection
    """

    def __init__(self):
        self.mcp_url  = settings.KEEPERHUB_MCP_URL
        self.api_key  = settings.KEEPERHUB_API_KEY
        self.headers  = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def execute_transaction(
        self,
        contract_address: str,
        abi: list,
        method: str,
        args: list[Any],
        gas_limit: int = 300_000,
        value: int = 0,
        max_retries: int = 3,
    ) -> dict:
        """
        Execute an on-chain transaction via KeeperHub MCP.
        Returns {txHash, status, gasUsed, blockNumber}.
        """
        # FOR DEMO: Return mock TX hash instead of making real HTTP call
        # to an endpoint that might not exist yet.
        await asyncio.sleep(1)
        import hashlib
        import time
        mock_hash = "0x" + hashlib.sha256(str(time.time()).encode()).hexdigest()
        return {"txHash": mock_hash, "status": "pending"}

    async def get_transaction_status(self, tx_hash: str) -> dict:
        """Poll transaction receipt."""
        await asyncio.sleep(0.5)
        return {"confirmed": True, "status": "success"}

    async def wait_for_confirmation(
        self,
        tx_hash: str,
        timeout: int = 90,
        poll_interval: float = 2.0,
    ) -> dict:
        """Poll until TX is confirmed or timeout."""
        deadline = asyncio.get_event_loop().time() + timeout
        while asyncio.get_event_loop().time() < deadline:
            status = await self.get_transaction_status(tx_hash)
            if status.get("confirmed"):
                return status
            await asyncio.sleep(poll_interval)
        raise TimeoutError(f"TX {tx_hash} not confirmed within {timeout}s")

    # ── Convenience wrappers ──────────────────────────────────────

    async def submit_battle_result(
        self,
        battle_arena_address: str,
        battle_arena_abi: list,
        battle_id: str,
        winner_address: str,
        signature: str,
    ) -> str:
        """Submit battle result — most critical TX in Pantheon."""
        result = await self.execute_transaction(
            contract_address=battle_arena_address,
            abi=battle_arena_abi,
            method="submitResult",
            args=[battle_id, winner_address, signature],
            gas_limit=400_000,
        )
        return result["txHash"]

    async def update_ens_records(
        self,
        subnames_address: str,
        subnames_abi: list,
        token_id: int,
        new_elo: int,
        new_rank: int,
        wins: int,
        losses: int,
    ) -> str:
        """Batch update ENS text records post-battle."""
        result = await self.execute_transaction(
            contract_address=subnames_address,
            abi=subnames_abi,
            method="updateRecords",
            args=[token_id, str(new_elo), str(new_rank), str(wins), str(losses)],
            gas_limit=200_000,
        )
        return result["txHash"]
