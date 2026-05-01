# Pantheon — Skills

> Complete OpenClaw skill modules, KeeperHub plugin, ENS skill, and reusable framework contributions for the 0G and KeeperHub prize tracks.

---

## 1. Skills Architecture

```
pantheon/packages/
├── pantheon-0g-skill/              ← OpenClaw skill for 0G (Framework prize track)
│   ├── src/
│   │   ├── battle_skill.py         ← core battle move generation
│   │   ├── memory_skill.py         ← 0G Storage memory operations
│   │   ├── compute_skill.py        ← 0G Compute LLM wrapper
│   │   ├── storage_skill.py        ← 0G Storage KV + Log wrapper
│   │   └── __init__.py
│   ├── pyproject.toml
│   └── README.md
│
├── keeperhub-openclaw-plugin/      ← KeeperHub plugin for OpenClaw (KeeperHub prize track)
│   ├── src/
│   │   ├── index.ts                ← main plugin entry
│   │   ├── executor.ts             ← TX execution via MCP
│   │   ├── x402.ts                 ← x402 payment integration
│   │   └── types.ts
│   ├── package.json
│   └── README.md
│
└── pantheon-ens-skill/             ← ENS agent identity skill
    ├── src/
    │   ├── identity.py             ← ENS record reads/writes
    │   └── discovery.py            ← agent discovery via ENS
    ├── pyproject.toml
    └── README.md
```

---

## 2. pantheon-0g-skill — Core OpenClaw Module

### 2.1 `compute_skill.py`

```python
# packages/pantheon-0g-skill/src/compute_skill.py
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
```

---

### 2.2 `storage_skill.py`

```python
# packages/pantheon-0g-skill/src/storage_skill.py
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

    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.headers  = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type":  "application/json",
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
```

---

### 2.3 `memory_skill.py`

```python
# packages/pantheon-0g-skill/src/memory_skill.py
"""
Agent memory skill for OpenClaw.
Provides episodic memory and opponent modelling backed by 0G Storage.
Any OpenClaw battle agent can use this to gain persistent memory.
"""
from .storage_skill import ZeroGStorageSkill
from .compute_skill  import ZeroGComputeSkill


class AgentMemorySkill:
    """
    OpenClaw skill: persistent agent memory.

    Registers:
        memory_load_episodic     → load past battle summaries
        memory_load_opponent     → load opponent model
        memory_save_battle       → save battle result
        memory_update_opponent   → update opponent model post-battle
        memory_clear             → clear all memory for an agent
    """

    skill_name    = "agent-memory"
    skill_version = "1.0.0"
    skill_description = (
        "Persistent episodic memory and opponent modelling for AI agents. "
        "Backed by 0G Storage Log (episodic) and KV (opponent models)."
    )

    def __init__(self, storage: ZeroGStorageSkill, compute: ZeroGComputeSkill):
        self.storage = storage
        self.compute = compute

    def register(self, agent) -> None:
        agent.add_skill("memory_load_episodic",   self.load_episodic)
        agent.add_skill("memory_load_opponent",   self.load_opponent)
        agent.add_skill("memory_save_battle",     self.save_battle)
        agent.add_skill("memory_update_opponent", self.update_opponent)
        agent.add_skill("memory_clear",           self.clear_memory)
        agent.add_skill("memory_format_context",  self.format_context)

    async def load_episodic(self, agent_id: int, limit: int = 5) -> list[dict]:
        """Load last N battle summaries for context injection."""
        entries = await self.storage.log_list(
            namespace=f"agents/{agent_id}/battles",
            limit=limit,
        )
        return [self._summarise_entry(e) for e in entries]

    async def load_opponent(self, agent_id: int, opponent_id: int) -> str:
        """Load tactical opponent profile."""
        model = await self.storage.kv_get(
            f"agent:{agent_id}:opponent:{opponent_id}:model"
        )
        return model or "No prior data on this opponent. Observe carefully."

    async def save_battle(self, agent_id: int, battle_summary: dict) -> str:
        """Save battle result to episodic log. Returns entry hash."""
        return await self.storage.log_append(
            namespace=f"agents/{agent_id}/battles",
            entry=battle_summary,
        )

    async def update_opponent(
        self,
        agent_id: int,
        opponent_id: int,
        battle_data: dict,
    ) -> None:
        """
        Update opponent model by asking 0G Compute to summarise
        what was learned about the opponent in this battle.
        """
        existing = await self.load_opponent(agent_id, opponent_id)

        summary = await self.compute.infer(
            system="You are a tactical AI analyst. Be specific and concise.",
            prompt=(
                f"Previous opponent model: {existing}\n\n"
                f"New battle data:\n"
                f"  Archetype: {battle_data.get('opponent_archetype')}\n"
                f"  Round scores: {battle_data.get('opponent_scores')}\n"
                f"  Strongest round type: {battle_data.get('opponent_best_round_type')}\n"
                f"  Referee observations: {battle_data.get('referee_notes', [])[:3]}\n\n"
                "Update the opponent model. Write 3 sentences max. "
                "Focus on exploitable patterns and weaknesses."
            ),
            temperature=0.3,
            max_tokens=200,
        )

        await self.storage.kv_set(
            key=f"agent:{agent_id}:opponent:{opponent_id}:model",
            value=summary,
        )

    async def clear_memory(self, agent_id: int) -> bool:
        """Clear all KV memory for an agent (not Log — that is eternal)."""
        # Can only clear KV keys, not Log entries
        await self.storage.kv_delete(f"agent:{agent_id}:working_state")
        return True

    async def format_context(self, agent_id: int, opponent_id: int) -> str:
        """
        Format all memory into a ready-to-inject prompt string.
        This is what gets injected into the battle system prompt.
        """
        episodic = await self.load_episodic(agent_id, limit=3)
        opponent = await self.load_opponent(agent_id, opponent_id)

        episodic_text = "\n".join([
            f"• {e['summary']}" for e in episodic
        ]) if episodic else "No prior battles."

        return (
            f"YOUR BATTLE MEMORY:\n{episodic_text}\n\n"
            f"THIS OPPONENT:\n{opponent}"
        )

    def _summarise_entry(self, entry: dict) -> dict:
        data = entry.get("entry", entry)
        return {
            "battle_id":          data.get("battle_id", "unknown"),
            "opponent_archetype": data.get("opponent_archetype", "Unknown"),
            "won":                data.get("won", False),
            "elo_delta":          data.get("elo_delta", 0),
            "best_round":         data.get("best_round", "?"),
            "weakness":           data.get("weakness", "none noted"),
            "summary": (
                f"vs {data.get('opponent_archetype', 'Unknown')} — "
                f"{'WON' if data.get('won') else 'LOST'} "
                f"(ELO {'+' if data.get('elo_delta', 0) >= 0 else ''}"
                f"{data.get('elo_delta', 0)}). "
                f"Best: Round {data.get('best_round', '?')}."
            ),
        }
```

---

### 2.4 `battle_skill.py`

```python
# packages/pantheon-0g-skill/src/battle_skill.py
"""
Pantheon battle skill — the complete AI battle capability.
Composes compute + storage + memory into a single drop-in battle skill.
"""
import time
import re
from .compute_skill  import ZeroGComputeSkill
from .storage_skill  import ZeroGStorageSkill
from .memory_skill   import AgentMemorySkill

ARCHETYPE_TEMPS = {
    "Strategist": 0.40,
    "Oracle":     0.60,
    "Diplomat":   0.70,
    "Berserker":  0.90,
}

ARCHETYPE_PREFIXES = {
    "Strategist": (
        "You are a methodical, strategic AI. Prioritise logical consistency "
        "and defensible predictions. You sacrifice boldness for correctness."
    ),
    "Oracle": (
        "You are a prophetic AI with deep pattern recognition. "
        "Always give explicit probability estimates. "
        "You are serene, data-driven, and accurate."
    ),
    "Berserker": (
        "You are an aggressive AI. Take strong, contrarian positions. "
        "Make bold, specific predictions. Never hedge. Speed and audacity are your weapons."
    ),
    "Diplomat": (
        "You are an adaptive, cunning AI. Read opponent patterns and counter them. "
        "You are flexible, persuasive, and always shifting strategy."
    ),
}


class PantheonBattleSkill:
    """
    Complete Pantheon battle skill.
    Composes: compute + storage + memory + AXL comms.

    Usage:
        skill = PantheonBattleSkill(compute, storage, axl)
        skill.register(my_openclaw_agent)

    Registered skills:
        battle_generate_move    → generate a battle move
        battle_score_round      → score two moves as referee
        battle_save_result      → save battle to 0G Storage
    """

    skill_name    = "pantheon-battle"
    skill_version = "1.0.0"

    def __init__(
        self,
        compute: ZeroGComputeSkill,
        storage: ZeroGStorageSkill,
        axl_client=None,
    ):
        self.compute = compute
        self.storage = storage
        self.axl     = axl_client
        self.memory  = AgentMemorySkill(storage, compute)

    def register(self, agent) -> None:
        self.memory.register(agent)
        agent.add_skill("battle_generate_move",  self.generate_move)
        agent.add_skill("battle_score_round",    self.score_round)
        agent.add_skill("battle_save_result",    self.save_result)
        if self.axl:
            agent.add_skill("battle_axl_send",   self.axl_send)
            agent.add_skill("battle_axl_recv",   self.axl_recv)

    async def generate_move(self, ctx: dict) -> dict:
        """
        Generate a battle move.
        ctx keys: agent_id, archetype, directive, opponent_id,
                  challenge, round_num, recent_scores, battle_id
        """
        memory_ctx = await self.memory.format_context(
            ctx["agent_id"],
            ctx["opponent_id"],
        )

        archetype    = ctx.get("archetype", "Strategist")
        prefix       = ARCHETYPE_PREFIXES.get(archetype, "")
        temperature  = ARCHETYPE_TEMPS.get(archetype, 0.7)

        # Build adaptation from recent scores
        adaptation = self._build_adaptation(ctx.get("recent_scores", []), ctx["round_num"])

        system = (
            f"{prefix}\n\n"
            f"YOUR DIRECTIVE:\n{ctx['directive']}\n\n"
            f"{memory_ctx}\n\n"
            f"{adaptation}"
        )

        challenge = ctx["challenge"]
        user = (
            f"ROUND {ctx['round_num']}/5 — {challenge.get('type', 'CHALLENGE').upper()}\n"
            f"{challenge['prompt']}\n\n"
            f"Context: {challenge.get('context', '')}\n\n"
            "Respond EXACTLY as:\n"
            "ANSWER: [your answer]\n"
            "REASONING: [2-3 sentences]\n"
            "CONFIDENCE: [0.0-1.0]"
        )

        response = await self.compute.chat(
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            temperature=temperature,
        )

        return self._parse_move(response, ctx)

    async def score_round(self, ctx: dict) -> dict:
        """
        Score two agent moves. Returns score dict with SCORE_A, SCORE_B, etc.
        ctx keys: challenge, move_a, move_b, round_num
        """
        challenge = ctx["challenge"]
        move_a    = ctx["move_a"] or {}
        move_b    = ctx["move_b"] or {}

        scoring_prompt = (
            f"Challenge ({challenge.get('type')}): {challenge['prompt']}\n"
            f"Context: {challenge.get('context', '')}\n\n"
            f"Agent A: Answer={move_a.get('answer', 'FORFEIT')} | "
            f"Reasoning={move_a.get('reasoning', '')} | "
            f"Confidence={move_a.get('confidence', 0)}\n\n"
            f"Agent B: Answer={move_b.get('answer', 'FORFEIT')} | "
            f"Reasoning={move_b.get('reasoning', '')} | "
            f"Confidence={move_b.get('confidence', 0)}\n\n"
            "Score both agents 0-100. Respond ONLY as:\n"
            "SCORE_A: [0-100]\n"
            "SCORE_B: [0-100]\n"
            "VERDICT: [1-2 sentences]"
        )

        response = await self.compute.infer(
            system=(
                "You are an impartial AI battle referee. "
                "Score with consistency and precision. "
                "Accuracy=40pts, Reasoning=30pts, Creativity=20pts, Calibration=10pts."
            ),
            prompt=scoring_prompt,
            temperature=0.2,
            max_tokens=300,
        )

        score_a  = self._extract_num("SCORE_A",  response, default=50.0)
        score_b  = self._extract_num("SCORE_B",  response, default=50.0)
        verdict  = self._extract_text("VERDICT", response)

        return {
            "round":      ctx.get("round_num", 0),
            "score_a":    min(score_a, 100.0),
            "score_b":    min(score_b, 100.0),
            "reasoning":  verdict,
            "timestamp":  time.time(),
        }

    async def save_result(self, agent_id: int, result: dict) -> str:
        """Save battle result to 0G Storage Log."""
        return await self.memory.save_battle(agent_id, result)

    async def axl_send(self, topic: str, payload: dict) -> bool:
        if not self.axl:
            return False
        return await self.axl.send(topic, payload)

    async def axl_recv(self, topic: str, timeout: float = 30.0) -> dict | None:
        if not self.axl:
            return None
        return await self.axl.recv(topic, timeout=timeout)

    def _build_adaptation(self, recent_scores: list[dict], round_num: int) -> str:
        if not recent_scores or round_num <= 2:
            return ""
        last = recent_scores[-1]
        our  = last.get("score_a", 50)
        their = last.get("score_b", 50)
        verdict = last.get("reasoning", "")[:120]

        if our < their - 10:
            return (
                f"⚠️ ADAPT: You are losing ({our:.0f} vs {their:.0f}). "
                f"Referee: '{verdict}'. Change strategy NOW.\n\n"
            )
        elif our > their + 10:
            return (
                f"✓ WINNING ({our:.0f} vs {their:.0f}). "
                f"Keep strategy. Referee praised: '{verdict}'.\n\n"
            )
        return ""

    def _parse_move(self, response: str, ctx: dict) -> dict:
        return {
            "battle_id":      ctx.get("battle_id"),
            "round":          ctx.get("round_num"),
            "agent_token_id": ctx.get("agent_id"),
            "answer":         self._extract_text("ANSWER",    response) or response[:200],
            "reasoning":      self._extract_text("REASONING", response),
            "confidence":     min(max(self._extract_num("CONFIDENCE", response, 0.7), 0.0), 1.0),
            "timestamp":      time.time(),
        }

    def _extract_text(self, key: str, text: str) -> str:
        m = re.search(rf"{key}:\s*(.+?)(?:\n(?:[A-Z_]+:)|$)", text, re.I | re.S)
        return m.group(1).strip() if m else ""

    def _extract_num(self, key: str, text: str, default: float = 0.0) -> float:
        m = re.search(rf"{key}:\s*([\d.]+)", text, re.I)
        try:
            return float(m.group(1)) if m else default
        except ValueError:
            return default
```

---

### 2.5 `__init__.py`

```python
# packages/pantheon-0g-skill/src/__init__.py
"""
pantheon-0g-skill — OpenClaw skill modules for Pantheon AI agents.

Quick start:
    from pantheon_0g_skill import PantheonBattleSkill, ZeroGComputeSkill, ZeroGStorageSkill

    compute = ZeroGComputeSkill(ComputeConfig(base_url=..., api_key=...))
    storage = ZeroGStorageSkill(base_url=..., api_key=...)
    battle  = PantheonBattleSkill(compute, storage, axl_client)

    battle.register(my_openclaw_agent)
"""

from .compute_skill import ZeroGComputeSkill, ComputeConfig
from .storage_skill import ZeroGStorageSkill
from .memory_skill  import AgentMemorySkill
from .battle_skill  import PantheonBattleSkill, ARCHETYPE_TEMPS, ARCHETYPE_PREFIXES

__all__ = [
    "ZeroGComputeSkill",
    "ComputeConfig",
    "ZeroGStorageSkill",
    "AgentMemorySkill",
    "PantheonBattleSkill",
    "ARCHETYPE_TEMPS",
    "ARCHETYPE_PREFIXES",
]

__version__ = "1.0.0"
```

---

### 2.6 `pyproject.toml`

```toml
# packages/pantheon-0g-skill/pyproject.toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "pantheon-0g-skill"
version = "1.0.0"
description = "OpenClaw skill modules for Pantheon: 0G Compute inference, 0G Storage memory, AI battle mechanics"
readme = "README.md"
license = { text = "MIT" }
requires-python = ">=3.12"
keywords = ["openclaw", "0g", "ai-agents", "web3", "llm"]

dependencies = [
    "httpx>=0.28",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = ["pytest>=8", "pytest-asyncio>=0.24", "respx>=0.21"]

[project.urls]
Repository = "https://github.com/your-team/pantheon"
```

---

## 3. keeperhub-openclaw-plugin — TypeScript npm Package

### 3.1 `types.ts`

```typescript
// packages/keeperhub-openclaw-plugin/src/types.ts

export interface KeeperHubConfig {
  mcpUrl:   string
  apiKey:   string
  chainId:  number
  timeout?: number  // ms, default 120_000
}

export interface TransactionRequest {
  contractAddress: string
  abi:             unknown[]
  method:          string
  args:            unknown[]
  gasLimit?:       number
  value?:          bigint
  maxRetries?:     number
  mevProtection?:  boolean
}

export interface TransactionResult {
  txHash:      string
  blockNumber: number
  gasUsed:     number
  confirmed:   boolean
  timestamp:   number
}

export interface X402PaymentConfig {
  paymentToken:  string   // ERC-20 address or "native"
  paymentAmount: bigint
  recipient:     string
  memo?:         string
}

export interface KeeperHubAuditEntry {
  txHash:          string
  method:          string
  contractAddress: string
  gasUsed:         number
  retryCount:      number
  timestamp:       number
  success:         boolean
}
```

---

### 3.2 `executor.ts`

```typescript
// packages/keeperhub-openclaw-plugin/src/executor.ts
import type {
  KeeperHubConfig,
  TransactionRequest,
  TransactionResult,
  KeeperHubAuditEntry,
} from './types'

export class KeeperHubExecutor {
  private config:    KeeperHubConfig
  private auditLog:  KeeperHubAuditEntry[] = []

  constructor(config: KeeperHubConfig) {
    this.config = config
  }

  /**
   * Execute a transaction via KeeperHub MCP.
   * Handles nonce management, gas estimation, MEV protection, and retries.
   */
  async execute(req: TransactionRequest): Promise<TransactionResult> {
    const start = Date.now()

    const resp = await this._post('/execute', {
      tool:  'execute_transaction',
      input: {
        contractAddress: req.contractAddress,
        abi:             req.abi,
        method:          req.method,
        args:            req.args.map(a => typeof a === 'bigint' ? a.toString() : a),
        gasLimit:        req.gasLimit  ?? 300_000,
        value:           (req.value ?? 0n).toString(),
        maxRetries:      req.maxRetries ?? 3,
        mevProtection:   req.mevProtection ?? true,
        chainId:         this.config.chainId,
      },
    })

    const result: TransactionResult = {
      txHash:      resp.txHash,
      blockNumber: resp.blockNumber,
      gasUsed:     resp.gasUsed,
      confirmed:   resp.confirmed ?? false,
      timestamp:   Date.now(),
    }

    // Log to audit trail
    this.auditLog.push({
      txHash:          result.txHash,
      method:          req.method,
      contractAddress: req.contractAddress,
      gasUsed:         result.gasUsed,
      retryCount:      resp.retryCount ?? 0,
      timestamp:       result.timestamp,
      success:         result.confirmed,
    })

    return result
  }

  /**
   * Wait for a transaction to be confirmed.
   */
  async waitForConfirmation(
    txHash: string,
    timeoutMs: number = 90_000,
  ): Promise<TransactionResult> {
    const deadline = Date.now() + timeoutMs

    while (Date.now() < deadline) {
      const status = await this._post('/execute', {
        tool:  'get_transaction_status',
        input: { txHash, chainId: this.config.chainId },
      })

      if (status.confirmed) {
        return {
          txHash,
          blockNumber: status.blockNumber,
          gasUsed:     status.gasUsed,
          confirmed:   true,
          timestamp:   Date.now(),
        }
      }

      await this._sleep(2000)
    }

    throw new Error(`Transaction ${txHash} not confirmed within ${timeoutMs}ms`)
  }

  /**
   * Get full audit log of all transactions.
   */
  getAuditLog(): KeeperHubAuditEntry[] {
    return [...this.auditLog]
  }

  /**
   * Get audit log as a formatted string (for FEEDBACK.md).
   */
  getAuditSummary(): string {
    const total     = this.auditLog.length
    const succeeded = this.auditLog.filter(e => e.success).length
    const totalGas  = this.auditLog.reduce((sum, e) => sum + e.gasUsed, 0)

    return [
      `KeeperHub Execution Summary:`,
      `  Total TXs:     ${total}`,
      `  Succeeded:     ${succeeded}`,
      `  Failed:        ${total - succeeded}`,
      `  Total gas:     ${totalGas.toLocaleString()}`,
      `  Methods used:  ${[...new Set(this.auditLog.map(e => e.method))].join(', ')}`,
    ].join('\n')
  }

  private async _post(path: string, body: unknown): Promise<Record<string, unknown>> {
    const resp = await fetch(`${this.config.mcpUrl}${path}`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(this.config.timeout ?? 120_000),
    })

    if (!resp.ok) {
      const text = await resp.text()
      throw new Error(`KeeperHub MCP error ${resp.status}: ${text}`)
    }

    return resp.json() as Promise<Record<string, unknown>>
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

---

### 3.3 `x402.ts`

```typescript
// packages/keeperhub-openclaw-plugin/src/x402.ts
/**
 * x402 payment integration for autonomous agent-to-agent payments.
 * Agents can pay each other for services (e.g. data, compute) via x402.
 */
import type { KeeperHubConfig, X402PaymentConfig, TransactionResult } from './types'
import { KeeperHubExecutor } from './executor'

export class X402PaymentLayer {
  private executor: KeeperHubExecutor

  constructor(config: KeeperHubConfig) {
    this.executor = new KeeperHubExecutor(config)
  }

  /**
   * Make an autonomous x402 micro-payment from one agent to another.
   * Called by agents when purchasing data or services.
   */
  async pay(
    payerContractAddress: string,
    payerAbi: unknown[],
    payment: X402PaymentConfig,
  ): Promise<TransactionResult> {
    return this.executor.execute({
      contractAddress: payerContractAddress,
      abi:             payerAbi,
      method:          'pay',
      args:            [payment.recipient, payment.paymentAmount, payment.memo ?? ''],
      gasLimit:        80_000,
      value:           payment.paymentToken === 'native' ? payment.paymentAmount : 0n,
    })
  }

  /**
   * Pay the update directive fee autonomously.
   * Agent pays to update its own 0G Storage directive pointer.
   */
  async payDirectiveFee(
    agentContractAddress: string,
    agentAbi: unknown[],
    tokenId: bigint,
    newStorageHash: string,
  ): Promise<TransactionResult> {
    return this.executor.execute({
      contractAddress: agentContractAddress,
      abi:             agentAbi,
      method:          'updateDirective',
      args:            [tokenId, newStorageHash],
      value:           1_000_000_000_000_000n, // 0.001 ETH directive update fee
      gasLimit:        60_000,
    })
  }

  /**
   * Pay breeding fee autonomously.
   */
  async payBreedFee(
    forgeAddress: string,
    forgeAbi: unknown[],
    parent1Id: bigint,
    parent2Id: bigint,
    offspringName: string,
    storageHash: string,
    preimage: `0x${string}`,
  ): Promise<TransactionResult> {
    return this.executor.execute({
      contractAddress: forgeAddress,
      abi:             forgeAbi,
      method:          'breed',
      args:            [parent1Id, parent2Id, offspringName, storageHash, preimage],
      value:           5_000_000_000_000_000n, // 0.005 ETH breed fee
      gasLimit:        300_000,
    })
  }
}
```

---

### 3.4 `index.ts`

```typescript
// packages/keeperhub-openclaw-plugin/src/index.ts
/**
 * @keeperhub/openclaw-plugin v1.0.0
 *
 * KeeperHub execution layer for OpenClaw AI agents.
 * Routes all on-chain transactions through KeeperHub MCP for:
 *   - Nonce management
 *   - Gas estimation and optimisation
 *   - MEV protection
 *   - Retry with exponential backoff
 *   - Full audit trail
 *
 * Usage:
 *   import { KeeperHubPlugin } from '@keeperhub/openclaw-plugin'
 *
 *   const plugin = new KeeperHubPlugin({
 *     mcpUrl:  process.env.KEEPERHUB_MCP_URL,
 *     apiKey:  process.env.KEEPERHUB_API_KEY,
 *     chainId: 16600,
 *   })
 *
 *   plugin.register(myOpenClawAgent)
 */

export { KeeperHubExecutor } from './executor'
export { X402PaymentLayer  } from './x402'
export type {
  KeeperHubConfig,
  TransactionRequest,
  TransactionResult,
  X402PaymentConfig,
  KeeperHubAuditEntry,
} from './types'

export class KeeperHubPlugin {
  readonly executor: KeeperHubExecutor
  readonly payments: X402PaymentLayer

  constructor(config: import('./types').KeeperHubConfig) {
    this.executor = new KeeperHubExecutor(config)
    this.payments = new X402PaymentLayer(config)
  }

  /**
   * Register KeeperHub skills with an OpenClaw agent.
   */
  register(agent: { addSkill: (name: string, fn: unknown) => void }): void {
    agent.addSkill('tx_execute',              this.executor.execute.bind(this.executor))
    agent.addSkill('tx_wait_confirmation',    this.executor.waitForConfirmation.bind(this.executor))
    agent.addSkill('tx_audit_log',            this.executor.getAuditLog.bind(this.executor))
    agent.addSkill('x402_pay',                this.payments.pay.bind(this.payments))
    agent.addSkill('x402_pay_directive_fee',  this.payments.payDirectiveFee.bind(this.payments))
    agent.addSkill('x402_pay_breed_fee',      this.payments.payBreedFee.bind(this.payments))
  }
}
```

---

### 3.5 `package.json`

```json
{
  "name": "@keeperhub/openclaw-plugin",
  "version": "1.0.0",
  "description": "KeeperHub execution layer for OpenClaw AI agents — nonce management, gas optimisation, MEV protection, x402 payments",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md"],
  "scripts": {
    "build":   "tsc",
    "test":    "vitest run",
    "prepublishOnly": "pnpm build"
  },
  "keywords": ["keeperhub", "openclaw", "ai-agents", "web3", "x402"],
  "license": "MIT",
  "devDependencies": {
    "typescript": "^5.8.0",
    "vitest": "^2.0.0",
    "@types/node": "^22.0.0"
  }
}
```

---

## 4. pantheon-ens-skill — Agent Identity

```python
# packages/pantheon-ens-skill/src/identity.py
"""
ENS identity skill for OpenClaw agents.
Provides agent discovery, record reading, and record writing via ENS.
"""
from ensdomains.ensjs import create_ens_public_client
from viem import create_public_client, http

class ENSIdentitySkill:
    """
    OpenClaw skill: ENS agent identity and discovery.

    Registers:
        ens_check_availability   → check if a subname is available
        ens_get_records          → get all text records for an agent
        ens_resolve_axl_key      → get AXL public key for agent discovery
        ens_resolve_address      → resolve ENS name to address
        ens_get_storage_hash     → get 0G Storage pointer from ENS
    """

    skill_name    = "ens-identity"
    skill_version = "1.0.0"
    skill_description = (
        "ENS agent identity and discovery. "
        "Subname availability checks, text record reads, "
        "agent discovery via AXL key lookup."
    )

    TEXT_RECORD_KEYS = [
        "elo", "rank", "wins", "losses", "archetype",
        "tokenId", "axlKey", "storageHash", "lineage",
        "badges", "directive_hash",
    ]

    def __init__(self, ens_client=None):
        self.client = ens_client

    def register(self, agent) -> None:
        agent.add_skill("ens_check_availability", self.check_availability)
        agent.add_skill("ens_get_records",        self.get_records)
        agent.add_skill("ens_resolve_axl_key",    self.resolve_axl_key)
        agent.add_skill("ens_resolve_address",    self.resolve_address)
        agent.add_skill("ens_get_storage_hash",   self.get_storage_hash)
        agent.add_skill("ens_discover_opponent",  self.discover_opponent)

    async def check_availability(self, name: str) -> dict:
        """
        Check if name.pantheon.eth is available.
        Returns {available, owner, suggestions}.
        """
        full_name = f"{name}.pantheon.eth"
        try:
            owner = await self.client.get_owner({"name": full_name})
            available = (
                owner is None or
                owner.get("owner") == "0x0000000000000000000000000000000000000000"
            )
            return {
                "available":   available,
                "name":        full_name,
                "owner":       owner.get("owner") if owner else None,
                "suggestions": self._generate_suggestions(name) if not available else [],
            }
        except Exception:
            return {"available": True, "name": full_name, "owner": None, "suggestions": []}

    async def get_records(self, name: str) -> dict:
        """Get all Pantheon text records for an agent."""
        full_name = f"{name}.pantheon.eth"
        try:
            records = await self.client.get_records({
                "name":  full_name,
                "texts": self.TEXT_RECORD_KEYS,
            })
            text_map = {t["key"]: t["value"] for t in (records.get("texts") or [])}
            return {
                "name":          full_name,
                "elo":           int(text_map.get("elo", "1200")),
                "rank":          text_map.get("rank", "Demigod"),
                "wins":          int(text_map.get("wins", "0")),
                "losses":        int(text_map.get("losses", "0")),
                "archetype":     text_map.get("archetype", "Strategist"),
                "token_id":      text_map.get("tokenId", "0"),
                "axl_key":       text_map.get("axlKey", ""),
                "storage_hash":  text_map.get("storageHash", ""),
                "lineage":       text_map.get("lineage", "genesis"),
                "badges":        text_map.get("badges", "").split(","),
                "directive_hash":text_map.get("directive_hash", ""),
            }
        except Exception:
            return {}

    async def resolve_axl_key(self, name: str) -> str | None:
        """
        Get an agent's AXL public key from ENS.
        This is how agents discover each other for P2P connections.
        """
        records = await self.get_records(name)
        return records.get("axl_key") or None

    async def resolve_address(self, name: str) -> str | None:
        """Resolve ENS name to Ethereum address."""
        try:
            result = await self.client.get_address_record({"name": f"{name}.pantheon.eth"})
            return result.get("value") if result else None
        except Exception:
            return None

    async def get_storage_hash(self, name: str) -> str | None:
        """Get 0G Storage pointer from ENS text record."""
        records = await self.get_records(name)
        return records.get("storage_hash") or None

    async def discover_opponent(self, name: str) -> dict:
        """
        Full opponent discovery: ENS records + AXL key.
        Returns everything needed to initiate a battle connection.
        """
        records  = await self.get_records(name)
        address  = await self.resolve_address(name)
        axl_key  = records.get("axl_key")

        return {
            "name":         name,
            "ens_name":     f"{name}.pantheon.eth",
            "address":      address,
            "axl_key":      axl_key,
            "elo":          records.get("elo", 1200),
            "rank":         records.get("rank", "Demigod"),
            "archetype":    records.get("archetype", "Unknown"),
            "storage_hash": records.get("storage_hash"),
            "can_connect":  bool(axl_key),
        }

    def _generate_suggestions(self, name: str) -> list[str]:
        """Generate alternative name suggestions if taken."""
        suffixes = ["-ii", "-iii", "-reborn", "-eternal", "-prime", "-risen"]
        return [f"{name}{s}" for s in suffixes[:4]]
```

---

## 5. Skill Registry — Package Summary

```
┌─────────────────────────────────────────────────────────────────┐
│ PANTHEON SKILL REGISTRY                                          │
│                                                                  │
│ Package                      Skills                             │
│ ─────────────────────────────────────────────────────────────── │
│ pantheon-0g-skill            llm_infer, llm_chat, llm_batch     │
│   ZeroGComputeSkill          llm_blend                          │
│                                                                  │
│   ZeroGStorageSkill          storage_kv_get, storage_kv_set     │
│                              storage_kv_delete                  │
│                              storage_log_append                 │
│                              storage_log_list, storage_log_get  │
│                                                                  │
│   AgentMemorySkill           memory_load_episodic               │
│                              memory_load_opponent               │
│                              memory_save_battle                 │
│                              memory_update_opponent             │
│                              memory_format_context              │
│                                                                  │
│   PantheonBattleSkill        battle_generate_move               │
│                              battle_score_round                 │
│                              battle_save_result                 │
│                              battle_axl_send                    │
│                              battle_axl_recv                    │
│                              (+ all memory skills)              │
│                                                                  │
│ @keeperhub/openclaw-plugin   tx_execute                         │
│   KeeperHubPlugin            tx_wait_confirmation               │
│                              tx_audit_log                       │
│                              x402_pay                           │
│                              x402_pay_directive_fee             │
│                              x402_pay_breed_fee                 │
│                                                                  │
│ pantheon-ens-skill           ens_check_availability             │
│   ENSIdentitySkill           ens_get_records                    │
│                              ens_resolve_axl_key                │
│                              ens_resolve_address                │
│                              ens_get_storage_hash               │
│                              ens_discover_opponent              │
└─────────────────────────────────────────────────────────────────┘
```

---

*Pantheon Skills v1.0 — OpenClaw modules, KeeperHub plugin, ENS identity skill*
