# agent/axl_client.py
import httpx
import asyncio
import json
from typing import Optional, AsyncGenerator

class AXLClient:
    """
    Wrapper for the Gensyn AXL Go binary HTTP API.
    Each instance talks to one AXL node (localhost:PORT).
    """

    def __init__(self, port: int = 8081):
        self.base_url = f"http://localhost:{port}"
        self._connected = False

    async def wait_for_ready(self, timeout: int = 30) -> bool:
        """Poll /health until AXL node is ready."""
        deadline = asyncio.get_event_loop().time() + timeout
        async with httpx.AsyncClient() as client:
            while asyncio.get_event_loop().time() < deadline:
                try:
                    resp = await client.get(f"{self.base_url}/health", timeout=2.0)
                    if resp.status_code == 200:
                        self._connected = True
                        return True
                except httpx.ConnectError:
                    pass
                await asyncio.sleep(0.5)
        return False

    async def get_topology(self) -> dict:
        """Get peer topology — used to prove P2P in demo."""
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{self.base_url}/topology")
            resp.raise_for_status()
            return resp.json()

    async def send(self, topic: str, payload: dict) -> bool:
        """Broadcast a message to the AXL mesh on a topic."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.post(
                    f"{self.base_url}/send",
                    json={"topic": topic, "payload": json.dumps(payload)},
                )
                return resp.status_code == 200
            except Exception:
                return False

    async def recv(
        self,
        topic: str,
        timeout: float = 30.0
    ) -> Optional[dict]:
        """
        Poll /recv for a message on the topic.
        Returns None on timeout.
        Implements exponential backoff polling.
        """
        deadline = asyncio.get_event_loop().time() + timeout
        delay = 0.1

        async with httpx.AsyncClient(timeout=5.0) as client:
            while asyncio.get_event_loop().time() < deadline:
                try:
                    resp = await client.get(
                        f"{self.base_url}/recv",
                        params={"topic": topic},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        if data.get("payload"):
                            return json.loads(data["payload"])
                    elif resp.status_code == 204:
                        # No message yet
                        pass
                except httpx.TimeoutException:
                    pass
                except httpx.ConnectError:
                    pass

                await asyncio.sleep(min(delay, 1.0))
                delay *= 1.2

        return None  # Timeout

    async def subscribe(self, topic: str) -> AsyncGenerator[dict, None]:
        """Async generator yielding messages from a topic continuously."""
        while True:
            msg = await self.recv(topic, timeout=5.0)
            if msg:
                yield msg
            else:
                await asyncio.sleep(0.2)
