"""
0G Storage skill for OpenClaw.
Wraps 0G Storage KV and Log as OpenClaw-compatible skills.
"""
import httpx
import json
import time
from typing import Any, Optional


class ZeroGStorageSkill:
    """
    OpenClaw skill: persistent storage via 0G Storage.

    Registers:
        storage_kv_get      → get a value by key
        storage_kv_set      → set a value by key
        storage_kv_delete   → delete a key
        storage_log_append  → append to an immutable log
        storage_log_list    → list recent log entries
        storage_log_get     → get a specific log entry by hash
    """

    skill_name    = "0g-storage"
    skill_version = "1.0.0"
    skill_description = (
        "Persistent on-chain storage via 0G. "
        "KV for mutable state, Log for append-only eternal records."
    )

    def __init__(self, base_url: str = None, api_key: str = None):
        try:
            from agent.config import settings
            self.base_url = base_url or settings.OG_STORAGE_URL or "https://storage-testnet.0g.ai"
            self.api_key = api_key or ""
        except ImportError:
            self.base_url = base_url or "https://storage-testnet.0g.ai"
            self.api_key = api_key or ""
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}" if self.api_key else "",
            "Content-Type": "application/json",
        }

    def register(self, agent) -> None:
        agent.add_skill("storage_kv_get",     self.kv_get)
        agent.add_skill("storage_kv_set",     self.kv_set)
        agent.add_skill("storage_kv_delete",  self.kv_delete)
        agent.add_skill("storage_log_append", self.log_append)
        agent.add_skill("storage_log_list",   self.log_list)
        agent.add_skill("storage_log_get",    self.log_get)

    # ── KV Operations ─────────────────────────────────────────────────────

    async def kv_get(self, key: str) -> Optional[Any]:
        """Get a value from 0G Storage KV. Returns None if not found."""
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.get(f"{self.base_url}/kv/{key}", headers=self.headers)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return json.loads(resp.json().get("value", "null"))

    async def kv_set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> bool:
        """Set a value in 0G Storage KV."""
        payload: dict = {"value": json.dumps(value)}
        if ttl_seconds:
            payload["ttl"] = ttl_seconds
        async with httpx.AsyncClient(timeout=15.0) as c:
            resp = await c.put(
                f"{self.base_url}/kv/{key}",
                headers=self.headers,
                json=payload,
            )
            return resp.status_code == 200

    async def kv_delete(self, key: str) -> bool:
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.delete(f"{self.base_url}/kv/{key}", headers=self.headers)
            return resp.status_code in (200, 204)

    # ── Log Operations ─────────────────────────────────────────────────────

    async def log_append(self, namespace: str, entry: dict) -> str:
        """
        Append an entry to an append-only log namespace.
        Returns the entry hash (permanent identifier).
        """
        payload = {
            "entry":     entry,
            "timestamp": time.time(),
            "namespace": namespace,
        }
        async with httpx.AsyncClient(timeout=15.0) as c:
            resp = await c.post(
                f"{self.base_url}/log/{namespace}",
                headers=self.headers,
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()["hash"]

    async def log_list(
        self,
        namespace: str,
        limit: int = 10,
        offset: int = 0,
        order: str = "desc",
    ) -> list[dict]:
        """List recent entries from a log namespace."""
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.get(
                f"{self.base_url}/log/{namespace}",
                headers=self.headers,
                params={"limit": limit, "offset": offset, "order": order},
            )
            resp.raise_for_status()
            return resp.json().get("entries", [])

    async def log_get(self, namespace: str, entry_hash: str) -> Optional[dict]:
        """Get a specific log entry by its hash."""
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.get(
                f"{self.base_url}/log/{namespace}/{entry_hash}",
                headers=self.headers,
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()
