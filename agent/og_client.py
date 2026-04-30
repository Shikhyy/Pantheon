# agent/og_client.py
import httpx
import json
from typing import Any, Optional
from config import settings

class ZeroGClient:
    """Client for 0G Compute (LLM inference) and 0G Storage (KV + Log)."""

    def __init__(self):
        self.compute_url = settings.OG_COMPUTE_URL
        self.storage_url = settings.OG_STORAGE_URL
        self.headers = {
            "Authorization": f"Bearer {settings.OG_PRIVATE_KEY}",
            "Content-Type": "application/json",
        }

    # ── Compute ───────────────────────────────────────────────────

    async def infer(
        self,
        system_prompt: str,
        user_message: str,
        model: str = "qwen3",
        max_tokens: int = 800,
        temperature: float = 0.7,
    ) -> str:
        """Call 0G Compute for LLM inference. Returns agent move text."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self.compute_url}/v1/chat/completions",
                headers=self.headers,
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": user_message},
                    ],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    # ── Storage KV ────────────────────────────────────────────────

    async def kv_set(self, key: str, value: Any) -> bool:
        """Write to 0G Storage KV. Returns success."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.put(
                f"{self.storage_url}/kv/{key}",
                headers=self.headers,
                json={"value": json.dumps(value)},
            )
            return resp.status_code == 200

    async def kv_get(self, key: str) -> Optional[Any]:
        """Read from 0G Storage KV. Returns None if not found."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.storage_url}/kv/{key}",
                headers=self.headers,
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            data = resp.json()
            return json.loads(data["value"])

    # ── Storage Log ───────────────────────────────────────────────

    async def log_append(self, namespace: str, entry: dict) -> str:
        """Append to 0G Storage Log. Returns entry hash."""
        import time
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.storage_url}/log/{namespace}",
                headers=self.headers,
                json={"entry": entry, "timestamp": time.time()},
            )
            resp.raise_for_status()
            return resp.json()["hash"]

    async def log_list(self, namespace: str, limit: int = 5) -> list[dict]:
        """List recent entries from 0G Storage Log."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.storage_url}/log/{namespace}?limit={limit}&order=desc",
                headers=self.headers,
            )
            resp.raise_for_status()
            return resp.json()["entries"]

    async def load_agent_memory(self, token_id: int) -> list[dict]:
        """Load last 5 battle transcripts for episodic memory injection."""
        try:
            transcripts = await self.log_list(f"agents/{token_id}/battles", limit=5)
            return transcripts
        except Exception:
            return []

    async def load_opponent_model(self, agent_id: int, opponent_id: int) -> Optional[str]:
        """Load learned model of a specific opponent."""
        try:
            return await self.kv_get(f"agent:{agent_id}:opponent:{opponent_id}:model")
        except Exception:
            return None

    async def save_opponent_model(self, agent_id: int, opponent_id: int, model: str) -> None:
        """Save updated opponent model after battle."""
        await self.kv_set(f"agent:{agent_id}:opponent:{opponent_id}:model", model)
