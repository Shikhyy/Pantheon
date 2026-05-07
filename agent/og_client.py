# agent/og_client.py
import httpx
import json
from typing import Any, Optional
from config import settings

class ZeroGClient:
    """Client for 0G Compute and 0G Storage.

    By default this uses the documented Router flow for server-side apps
    (OpenAI-compatible, API-key authenticated). If `OG_COMPUTE_MODE=direct`,
    it falls back to the legacy provider endpoint path.
    """

    def __init__(self):
        self.compute_mode = getattr(settings, "OG_COMPUTE_MODE", "auto")
        self.compute_url = settings.OG_COMPUTE_URL
        self.compute_router_url = getattr(settings, "OG_COMPUTE_ROUTER_URL", settings.OG_COMPUTE_URL)
        self.storage_url = settings.OG_STORAGE_URL
        self.compute_headers = {"Content-Type": "application/json"}

        api_key = getattr(settings, "OG_COMPUTE_API_KEY", "")
        use_router = self.compute_mode == "router" or (self.compute_mode == "auto" and bool(api_key))

        if use_router:
            self.compute_url = self.compute_router_url
            if api_key:
                self.compute_headers["Authorization"] = f"Bearer {api_key}"
        else:
            self.compute_headers["Authorization"] = f"Bearer {settings.OG_PRIVATE_KEY}"

        self.storage_headers = {
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
        """Call 0G Compute for LLM inference. Returns agent move text.

        Router mode uses the OpenAI-compatible `/v1/chat/completions` API.
        Direct mode keeps the current provider endpoint behavior for legacy
        compatibility.
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message},
                ],
                "max_tokens": max_tokens,
                "temperature": temperature,
            }

            base_url = self.compute_url.rstrip("/")
            is_router = self.compute_url == self.compute_router_url
            resp = await client.post(
                f"{base_url}/chat/completions" if is_router else f"{base_url}/v1/chat/completions",
                headers=self.compute_headers,
                json=payload,
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
                headers=self.storage_headers,
                json={"value": json.dumps(value)},
            )
            return resp.status_code == 200

    async def kv_get(self, key: str) -> Optional[Any]:
        """Read from 0G Storage KV. Returns None if not found."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.storage_url}/kv/{key}",
                headers=self.storage_headers,
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
                headers=self.storage_headers,
                json={"entry": entry, "timestamp": time.time()},
            )
            resp.raise_for_status()
            return resp.json()["hash"]

    async def log_list(self, namespace: str, limit: int = 5) -> list[dict]:
        """List recent entries from 0G Storage Log."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.storage_url}/log/{namespace}?limit={limit}&order=desc",
                headers=self.storage_headers,
            )
            resp.raise_for_status()
            return resp.json().get("entries", [])

    async def log_get(self, namespace: str, entry_hash: str) -> Optional[dict]:
        """Retrieve one immutable log entry by hash."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.storage_url}/log/{namespace}/{entry_hash}",
                headers=self.storage_headers,
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()

    async def kv_delete(self, key: str) -> bool:
        """Delete a KV key when the storage service supports it."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.delete(
                f"{self.storage_url}/kv/{key}",
                headers=self.storage_headers,
            )
            return resp.status_code in (200, 204)

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
