"""
0G Router skill for server-side OpenAI-compatible inference.
"""
import os
import httpx
from typing import Any


class ZeroGRouterSkill:
    """OpenClaw skill for 0G Compute Router inference.

    This is the documented path for server-side apps: one API key, one
    OpenAI-compatible endpoint, automatic routing and failover.
    """

    skill_name = "0g-router"
    skill_version = "1.0.0"
    skill_description = (
        "Server-side inference via the 0G Compute Router. "
        "Uses the OpenAI-compatible chat completions API."
    )

    def __init__(self, base_url: str = None, api_key: str = None):
        self.base_url = (base_url or os.getenv(
            "OG_COMPUTE_ROUTER_URL",
            "https://router-api-testnet.integratenetwork.work/v1",
        )).rstrip("/")
        self.api_key = api_key or os.getenv("OG_COMPUTE_API_KEY", "")
        self.model = os.getenv("OG_COMPUTE_MODEL", "qwen3")
        self.headers = {"Content-Type": "application/json"}
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"

    def register(self, agent) -> None:
        agent.add_skill("router_infer", self.infer)

    async def infer(
        self,
        system_prompt: str,
        user_message: str,
        model: str = None,
        max_tokens: int = 800,
        temperature: float = 0.7,
    ) -> str:
        payload: dict[str, Any] = {
            "model": model or self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]