"""
0G Compute skill for OpenClaw.
Wraps 0G Compute API as an OpenClaw-compatible skill.
Any OpenClaw agent can import this to get LLM inference on 0G.
"""
import httpx
from typing import Optional
from dataclasses import dataclass


@dataclass
class ComputeConfig:
    base_url: str
    api_key: str
    default_model: str = "qwen3"
    default_max_tokens: int = 800
    default_temperature: float = 0.7
    timeout: float = 30.0


class ZeroGComputeSkill:
    """
    OpenClaw skill: LLM inference via 0G Compute.

    Registration:
        agent.register_skill("llm_infer", ZeroGComputeSkill(config).infer)
        agent.register_skill("llm_chat",  ZeroGComputeSkill(config).chat)

    Usage in agent:
        response = await agent.use_skill("llm_infer", prompt="What is 2+2?")
    """

    skill_name    = "0g-compute"
    skill_version = "1.0.0"
    skill_description = (
        "LLM inference via 0G Compute. Supports qwen3, GLM-5. "
        "Exposes: infer (single prompt), chat (multi-turn), batch (parallel calls)."
    )

    def __init__(self, config: ComputeConfig):
        self.config = config

    def register(self, agent) -> None:
        """Register all compute skills with an OpenClaw agent."""
        agent.add_skill("llm_infer",    self.infer)
        agent.add_skill("llm_chat",     self.chat)
        agent.add_skill("llm_batch",    self.batch)
        agent.add_skill("llm_blend",    self.blend)

    async def infer(
        self,
        prompt: str,
        system: str = "You are a helpful AI assistant.",
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Single-turn LLM inference."""
        return await self._call(
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": prompt},
            ],
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    async def chat(
        self,
        messages: list[dict],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """Multi-turn chat completion."""
        return await self._call(
            messages=messages,
            model=model,
            temperature=temperature,
        )

    async def batch(
        self,
        prompts: list[str],
        system: str = "You are a helpful AI assistant.",
        model: Optional[str] = None,
    ) -> list[str]:
        """Parallel batch inference — runs all prompts concurrently."""
        import asyncio
        tasks = [self.infer(p, system=system, model=model) for p in prompts]
        return await asyncio.gather(*tasks)

    async def blend(
        self,
        text_a: str,
        text_b: str,
        weight_a: float = 0.6,
        style: str = "personality",
    ) -> str:
        """
        Blend two texts at a given weight ratio.
        Used for agent directive blending in breeding.

        style options: personality, strategy, creative
        """
        style_instructions = {
            "personality": "Create a new personality that blends these two in the given ratio.",
            "strategy":    "Synthesise a new strategy combining elements of both approaches.",
            "creative":    "Create something genuinely new inspired by both sources.",
        }

        return await self.infer(
            prompt=(
                f"TEXT A ({int(weight_a * 100)}% influence): {text_a}\n\n"
                f"TEXT B ({int((1-weight_a) * 100)}% influence): {text_b}\n\n"
                f"{style_instructions.get(style, style_instructions['personality'])}\n"
                "Respond with ONLY the blended result. No explanation."
            ),
            temperature=0.65,
            max_tokens=200,
        )

    async def _call(
        self,
        messages: list[dict],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            resp = await client.post(
                f"{self.config.base_url}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.config.api_key}",
                    "Content-Type":  "application/json",
                },
                json={
                    "model":       model       or self.config.default_model,
                    "messages":    messages,
                    "temperature": temperature or self.config.default_temperature,
                    "max_tokens":  max_tokens  or self.config.default_max_tokens,
                },
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
