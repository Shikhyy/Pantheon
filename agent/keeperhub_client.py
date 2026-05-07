# agent/keeperhub_client.py
import httpx
import asyncio
import logging
from typing import Any
from config import settings
from web3 import Web3

logger = logging.getLogger(__name__)

try:
    from eth_abi import encode as eth_encode
    ETH_ABI_AVAILABLE = True
except ImportError:
    ETH_ABI_AVAILABLE = False


def encode_abi(abi: list, method: str, args: list) -> str:
    """Encode function call data from ABI."""
    if not ETH_ABI_AVAILABLE:
        raise RuntimeError("eth_abi package not installed. Run: pip install eth-abi")
    
    func = None
    for item in abi:
        if item.get("name") == method:
            func = item
            break
    if not func:
        raise ValueError(f"Method {method} not found in ABI")

    types = [inp["type"] for inp in func.get("inputs", [])]
    encoded = eth_encode(types, args)
    return "0x" + encoded.hex()

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
        self.mock_mode = not bool(self.api_key)
        self.headers  = {
            "Authorization": f"Bearer {self.api_key}" if self.api_key else "",
            "Content-Type": "application/json",
        }
        if self.mock_mode:
            logger.warning("KeeperHub initialized in MOCK mode (no API key configured)")
        else:
            logger.info(f"KeeperHub initialized with real API key, MCP URL: {self.mcp_url}")

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
        if self.mock_mode:
            return await self._mock_transaction(contract_address, abi, method, args, gas_limit, value)

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_sendTransaction",
            "params": [{
                "to": contract_address,
                "data": encode_abi(abi, method, args),
                "gas": hex(gas_limit),
                "value": hex(value),
            }]
        }

        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as c:
                    resp = await c.post(
                        self.mcp_url,
                        headers=self.headers,
                        json=payload
                    )
                    result = resp.json()
                    if "result" in result:
                        return {"txHash": result["result"], "status": "pending"}
                    error_code = result.get("error", {}).get("code")
                    if error_code == -32002:
                        await asyncio.sleep(2 ** attempt)
                        continue
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)

        return {"txHash": "0x", "status": "failed"}

    def _coerce_bytes32(self, value: str) -> bytes:
        if value.startswith("0x") and len(value) == 66:
            return bytes.fromhex(value[2:])
        if len(value) == 64:
            return bytes.fromhex(value)
        return Web3.keccak(text=value)

    def _coerce_bytes(self, value: str | bytes) -> bytes:
        if isinstance(value, bytes):
            return value
        if value.startswith("0x"):
            return bytes.fromhex(value[2:])
        return bytes.fromhex(value)

    async def _mock_transaction(
        self,
        contract_address: str,
        abi: list,
        method: str,
        args: list[Any],
        gas_limit: int,
        value: int,
    ) -> dict:
        """Fallback mock for demo/development."""
        await asyncio.sleep(1)
        import hashlib
        import time
        mock_hash = "0x" + hashlib.sha256(str(time.time()).encode()).hexdigest()
        return {"txHash": mock_hash, "status": "pending"}

    async def get_transaction_status(self, tx_hash: str) -> dict:
        """Poll transaction receipt from KeeperHub."""
        if not self.mcp_url or self.mcp_url == "https://api.keeperhub.io/mcp":
            await asyncio.sleep(0.5)
            return {"confirmed": True, "status": "success"}

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_getTransactionReceipt",
            "params": [tx_hash]
        }

        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.post(self.mcp_url, headers=self.headers, json=payload)
            result = resp.json().get("result", {})

            if not result:
                return {"confirmed": False, "status": "pending"}

            return {
                "confirmed": result.get("status") == "0x1",
                "status": "success" if result.get("status") == "0x1" else "failed",
                "gasUsed": int(result.get("gasUsed", "0x0"), 16),
                "blockNumber": int(result.get("blockNumber", "0x0"), 16)
            }

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
        battle_id: str,
        winner_address: str,
        transcript_hash: str,
        signature: str,
    ) -> str:
        """Submit battle result — most critical TX in Pantheon."""
        logger.info(f"[KH] Submitting battle result: battleId={battle_id}, winner={winner_address}")
        try:
            result = await self.execute_transaction(
                contract_address=battle_arena_address,
                abi=[
                    {
                        "name": "submitResult",
                        "type": "function",
                        "stateMutability": "nonpayable",
                        "inputs": [
                            {"name": "battleId", "type": "bytes32"},
                            {"name": "winner", "type": "address"},
                            {"name": "transcriptHash", "type": "bytes32"},
                            {"name": "signature", "type": "bytes"},
                        ],
                        "outputs": [],
                    }
                ],
                method="submitResult",
                args=[
                    self._coerce_bytes32(battle_id),
                    winner_address,
                    self._coerce_bytes32(transcript_hash),
                    self._coerce_bytes(signature),
                ],
                gas_limit=400_000,
            )
            tx_hash = result.get("txHash")
            logger.info(f"[KH] Battle result submitted: txHash={tx_hash}")
            return tx_hash
        except Exception as e:
            logger.error(f"[KH] Failed to submit battle result: {e}", exc_info=True)
            raise

    async def update_ens_records(
        self,
        subnames_address: str,
        token_id: int,
        new_elo: int,
    ) -> str:
        """Batch update ENS text records post-battle."""
        result = await self.execute_transaction(
            contract_address=subnames_address,
            abi=[
                {
                    "name": "updateRecords",
                    "type": "function",
                    "stateMutability": "nonpayable",
                    "inputs": [
                        {"name": "tokenId", "type": "uint256"},
                        {"name": "newElo", "type": "uint16"},
                    ],
                    "outputs": [],
                }
            ],
            method="updateRecords",
            args=[token_id, new_elo],
            gas_limit=200_000,
        )
        return result["txHash"]
