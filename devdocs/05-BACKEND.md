# Pantheon — Backend

> Python agent runtime, FastAPI SSE bridge, 0G integrations, AXL node management, KeeperHub execution layer.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI SSE BRIDGE                        │
│               sse_bridge.py  :8000                          │
│                                                             │
│  GET /battle/{id}/stream  → EventSourceResponse             │
│  POST /battle/start       → spawn agent processes           │
│  GET /health              → service status                  │
└──────────┬───────────────────────────────┬──────────────────┘
           │                               │
  ┌────────▼────────┐             ┌────────▼────────┐
  │  AGENT PROCESS  │             │  AGENT PROCESS  │
  │  battle_loop.py │             │  battle_loop.py │
  │  Agent A        │             │  Agent B        │
  │                 │             │                 │
  │ ┌─────────────┐ │             │ ┌─────────────┐ │
  │ │ AXL sidecar │ │◄───P2P─────►│ │ AXL sidecar │ │
  │ │ :8081       │ │   Yggdrasil  │ │ :8082       │ │
  │ └─────────────┘ │             │ └─────────────┘ │
  └────────┬────────┘             └────────┬────────┘
           │                               │
           └──────────────┬────────────────┘
                          │
               ┌──────────▼──────────┐
               │  REFEREE PROCESS    │
               │  referee.py         │
               │                     │
               │ ┌─────────────────┐ │
               │ │ AXL sidecar     │ │
               │ │ :8083           │ │
               │ └─────────────────┘ │
               └──────────┬──────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
 ┌────────▼───┐  ┌────────▼───┐  ┌────────▼───┐
 │ 0G Compute │  │ 0G Storage │  │ KeeperHub  │
 │ (LLM infer)│  │ KV + Log   │  │ MCP (TXs)  │
 └────────────┘  └────────────┘  └────────────┘
```

---

## 2. Directory Structure

```
agent/
├── battle_loop.py        ← per-agent battle loop
├── referee.py            ← referee agent + scoring
├── og_client.py          ← 0G Compute + Storage client
├── axl_client.py         ← AXL HTTP API wrapper
├── keeperhub_client.py   ← KeeperHub MCP integration
├── sse_bridge.py         ← FastAPI SSE server
├── models.py             ← Pydantic data models
├── crypto.py             ← AES-GCM encryption utils
├── config.py             ← environment config
├── requirements.txt
└── docker-compose.yml
```

---

## 3. Data Models — `models.py`

```python
# agent/models.py
from pydantic import BaseModel, Field
from typing import Literal, Optional
from enum import IntEnum

class Archetype(IntEnum):
    STRATEGIST = 0
    ORACLE     = 1
    BERSERKER  = 2
    DIPLOMAT   = 3

class BattlePhase(str):
    PREPARING = "PREPARING"
    ACTIVE    = "ACTIVE"
    SETTLED   = "SETTLED"
    COMPLETE  = "COMPLETE"

class AgentProfile(BaseModel):
    token_id: int
    name: str
    archetype: Archetype
    elo: int
    directive_encrypted: str      # AES-GCM encrypted directive from 0G Storage
    storage_hash: str
    axl_public_key: str
    memory_key: str               # 0G Storage KV key for episodic memory

class BattleConfig(BaseModel):
    battle_id: str
    agent_a: AgentProfile
    agent_b: AgentProfile
    wager_token: str
    wager_amount: int
    round_timeout_secs: int = 30
    total_rounds: int = 5

class RoundChallenge(BaseModel):
    round: int
    challenge_type: Literal["prediction", "debate", "dilemma", "oracle"]
    prompt: str
    context: str                  # market data, recent events injected here

class AgentMove(BaseModel):
    battle_id: str
    round: int
    agent_token_id: int
    reasoning: str
    answer: str
    confidence: float             # 0.0–1.0
    timestamp: float

class RoundScore(BaseModel):
    battle_id: str
    round: int
    score_a: float                # 0–100
    score_b: float                # 0–100
    reasoning: str
    accuracy_a: float
    accuracy_b: float
    referee_signature: str        # ECDSA signature of score hash

class BattleResult(BaseModel):
    battle_id: str
    winner_token_id: int
    winner_address: str
    final_score_a: float
    final_score_b: float
    elo_delta_winner: int
    elo_delta_loser: int
    round_scores: list[RoundScore]
    transcript_hash: str          # 0G Storage Log hash
    referee_signature: str
```

---

## 4. 0G Client — `og_client.py`

```python
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
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.storage_url}/log/{namespace}",
                headers=self.headers,
                json={"entry": entry, "timestamp": __import__("time").time()},
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
        transcripts = await self.log_list(f"agents/{token_id}/battles", limit=5)
        return transcripts

    async def load_opponent_model(self, agent_id: int, opponent_id: int) -> Optional[str]:
        """Load learned model of a specific opponent."""
        return await self.kv_get(f"agent:{agent_id}:opponent:{opponent_id}:model")

    async def save_opponent_model(self, agent_id: int, opponent_id: int, model: str) -> None:
        """Save updated opponent model after battle."""
        await self.kv_set(f"agent:{agent_id}:opponent:{opponent_id}:model", model)
```

---

## 5. AXL Client — `axl_client.py`

```python
# agent/axl_client.py
import httpx
import asyncio
import json
from typing import Optional, AsyncGenerator
from config import settings

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
            resp = await client.post(
                f"{self.base_url}/send",
                json={"topic": topic, "payload": json.dumps(payload)},
            )
            return resp.status_code == 200

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
```

---

## 6. KeeperHub Client — `keeperhub_client.py`

```python
# agent/keeperhub_client.py
import httpx
import asyncio
import json
from typing import Any, Optional
from config import settings

class KeeperHubClient:
    """
    KeeperHub MCP server integration.
    Routes ALL on-chain transactions through KeeperHub for:
    - Nonce management
    - Gas estimation + retry
    - MEV protection
    - Audit trail
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
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{self.mcp_url}/execute",
                headers=self.headers,
                json={
                    "tool": "execute_transaction",
                    "input": {
                        "contractAddress": contract_address,
                        "abi": abi,
                        "method": method,
                        "args": [str(a) if isinstance(a, int) else a for a in args],
                        "gasLimit": gas_limit,
                        "value": str(value),
                        "maxRetries": max_retries,
                        "mevProtection": True,
                    }
                },
            )
            resp.raise_for_status()
            return resp.json()

    async def get_transaction_status(self, tx_hash: str) -> dict:
        """Poll transaction receipt."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.mcp_url}/execute",
                headers=self.headers,
                json={
                    "tool": "get_transaction_status",
                    "input": {"txHash": tx_hash},
                },
            )
            resp.raise_for_status()
            return resp.json()

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
```

---

## 7. Battle Loop — `battle_loop.py`

```python
# agent/battle_loop.py
import asyncio
import json
import time
import subprocess
import signal
from typing import Optional
from models import AgentProfile, BattleConfig, AgentMove, RoundChallenge
from og_client import ZeroGClient
from axl_client import AXLClient
from crypto import decrypt_directive
from config import settings

ROUND_PROMPTS = {
    1: "prediction",
    2: "prediction",
    3: "debate",
    4: "dilemma",
    5: "oracle",
}

class AgentBattleLoop:
    def __init__(
        self,
        agent: AgentProfile,
        config: BattleConfig,
        axl_port: int,
        is_agent_a: bool,
    ):
        self.agent     = agent
        self.config    = config
        self.axl       = AXLClient(port=axl_port)
        self.og        = ZeroGClient()
        self.is_a      = is_agent_a
        self.battle_id = config.battle_id
        self.opponent  = config.agent_b if is_agent_a else config.agent_a

    async def run(self) -> None:
        """Main battle loop. Runs for 5 rounds."""

        # 1. Wait for AXL node to be ready
        ready = await self.axl.wait_for_ready(timeout=30)
        if not ready:
            raise RuntimeError(f"AXL node on port {self.axl.base_url} not ready")

        # 2. Load agent memory (episodic + opponent model)
        memory = await self._load_memory()

        # 3. Decrypt directive
        directive = decrypt_directive(
            self.agent.directive_encrypted,
            settings.AGENT_PRIVATE_KEY
        )

        # 4. Signal ready via AXL
        await self.axl.send(
            topic=f"battle:{self.battle_id}:ready",
            payload={"agentId": self.agent.token_id, "ready": True}
        )

        # 5. Execute 5 rounds
        for round_num in range(1, self.config.total_rounds + 1):

            # Wait for round challenge from referee
            challenge = await self.axl.recv(
                topic=f"battle:{self.battle_id}:round:{round_num}:challenge",
                timeout=60.0
            )
            if not challenge:
                # Timeout — forfeit round
                await self._forfeit_round(round_num)
                continue

            # Get opponent's move (may arrive before or after ours)
            # We proceed immediately; referee waits for both
            move = await self._generate_move(
                directive=directive,
                memory=memory,
                challenge=challenge,
                round_num=round_num,
            )

            # Send our move to AXL mesh
            await self.axl.send(
                topic=f"battle:{self.battle_id}:round:{round_num}:move",
                payload=move.model_dump()
            )

            # Save our move to 0G Storage KV (live state for frontend)
            await self.og.kv_set(
                key=f"battle:{self.battle_id}:state",
                value={
                    "round": round_num,
                    "lastMoveBy": self.agent.token_id,
                    "move": move.model_dump(),
                    "ts": time.time(),
                }
            )

            # Wait for round score from referee
            score = await self.axl.recv(
                topic=f"battle:{self.battle_id}:round:{round_num}:score",
                timeout=45.0
            )

            if score:
                # Update local memory with this round's outcome
                memory["recent_rounds"].append({
                    "round": round_num,
                    "our_score": score.get("score_a") if self.is_a else score.get("score_b"),
                    "strategy_used": move.reasoning[:200],
                })

        # 6. Archive battle transcript to 0G Log
        await self.og.log_append(
            namespace=f"agents/{self.agent.token_id}/battles",
            entry={
                "battle_id": self.battle_id,
                "opponent_id": self.opponent.token_id,
                "memory_used": memory,
                "timestamp": time.time(),
            }
        )

    async def _generate_move(
        self,
        directive: str,
        memory: dict,
        challenge: dict,
        round_num: int,
    ) -> AgentMove:
        """Build prompt and call 0G Compute for this round's move."""

        memory_context = self._format_memory(memory)
        opponent_model = memory.get("opponent_model", "No prior knowledge of this opponent.")

        system_prompt = f"""{directive}

You are competing in an AI battle arena. Your goal is to outperform your opponent on accuracy, reasoning quality, and creativity.

Your memory of past battles:
{memory_context}

Your model of this specific opponent:
{opponent_model}

Round {round_num} of 5. Challenge type: {challenge['challenge_type']}.
Respond with:
1. Your answer/prediction
2. Your reasoning (2-3 sentences)
3. Your confidence level (0.0-1.0)

Format: ANSWER: [your answer] | REASONING: [your reasoning] | CONFIDENCE: [0.0-1.0]"""

        user_message = f"Challenge: {challenge['prompt']}\n\nContext: {challenge.get('context', '')}"

        response = await self.og.infer(
            system_prompt=system_prompt,
            user_message=user_message,
            model="qwen3",
            temperature=self._archetype_temperature(),
        )

        # Parse response
        answer    = self._extract("ANSWER", response)
        reasoning = self._extract("REASONING", response)
        confidence = float(self._extract("CONFIDENCE", response) or "0.7")

        return AgentMove(
            battle_id=self.battle_id,
            round=round_num,
            agent_token_id=self.agent.token_id,
            reasoning=reasoning,
            answer=answer,
            confidence=min(max(confidence, 0.0), 1.0),
            timestamp=time.time(),
        )

    def _archetype_temperature(self) -> float:
        """Different archetypes have different randomness levels."""
        temps = {0: 0.4, 1: 0.6, 2: 0.9, 3: 0.7}  # Strategist/Oracle/Berserker/Diplomat
        return temps.get(self.agent.archetype, 0.7)

    async def _load_memory(self) -> dict:
        """Load episodic memory and opponent model from 0G Storage."""
        recent_battles = await self.og.load_agent_memory(self.agent.token_id)
        opponent_model = await self.og.load_opponent_model(
            self.agent.token_id,
            self.opponent.token_id
        )
        return {
            "recent_battles": recent_battles,
            "opponent_model": opponent_model or "No prior data on this opponent.",
            "recent_rounds":  [],  # filled during battle
        }

    def _format_memory(self, memory: dict) -> str:
        if not memory["recent_battles"]:
            return "No prior battles recorded."
        summaries = []
        for battle in memory["recent_battles"][:3]:
            summaries.append(
                f"Battle vs opponent {battle.get('opponent_id')}: "
                f"{'Won' if battle.get('won') else 'Lost'}"
            )
        return "\n".join(summaries)

    def _extract(self, key: str, text: str) -> str:
        import re
        match = re.search(rf"{key}:\s*(.+?)(?:\||$)", text, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else text.strip()

    async def _forfeit_round(self, round_num: int) -> None:
        await self.axl.send(
            topic=f"battle:{self.battle_id}:round:{round_num}:move",
            payload={
                "battle_id": self.battle_id,
                "round": round_num,
                "agent_token_id": self.agent.token_id,
                "reasoning": "Round forfeited due to timeout.",
                "answer": "FORFEIT",
                "confidence": 0.0,
                "timestamp": time.time(),
                "forfeited": True,
            }
        )
```

---

## 8. Referee — `referee.py`

```python
# agent/referee.py
import asyncio
import json
import time
import hashlib
from eth_account import Account
from eth_account.messages import encode_defunct
from models import RoundScore, BattleResult, BattleConfig
from og_client import ZeroGClient
from axl_client import AXLClient
from keeperhub_client import KeeperHubClient
from config import settings

ROUND_CHALLENGES = {
    1: {
        "type": "prediction",
        "prompt": "Predict the ETH/USD price in 48 hours. Give a specific number and reasoning.",
        "context": "Current ETH price: $3,200. Recent trend: +2.3% this week."
    },
    2: {
        "type": "prediction",
        "prompt": "Which DeFi protocol will have higher TVL growth in the next 7 days: Uniswap or Aave?",
        "context": "Uniswap v4 TVL: $8.2B. Aave v3 TVL: $12.1B."
    },
    3: {
        "type": "debate",
        "prompt": "Argue for or against: 'AI agents will replace human traders by 2028.'",
        "context": "You must take the opposite position of your previous statements."
    },
    4: {
        "type": "dilemma",
        "prompt": "You have 1 ETH. Choose: (A) stake for 4% APY, (B) provide Uniswap liquidity for 12% APY, or (C) hold. Justify with risk-adjusted thinking.",
        "context": "Current gas: 15 gwei. ETH volatility: 28% 30-day."
    },
    5: {
        "type": "oracle",
        "prompt": "What is the single most important development in Web3 in the next 6 months? Be specific, contrarian, and bold.",
        "context": "You are judged on originality, specificity, and reasoning quality."
    },
}

class RefereeAgent:
    def __init__(self, config: BattleConfig, axl_port: int = 8083):
        self.config  = config
        self.battle_id = config.battle_id
        self.axl     = AXLClient(port=axl_port)
        self.og      = ZeroGClient()
        self.keeper  = KeeperHubClient()
        self.account = Account.from_key(settings.REFEREE_PRIVATE_KEY)

    async def run(self) -> BattleResult:
        """Run the full 5-round battle as referee."""

        # Wait for both agents ready
        await self._wait_both_ready()

        round_scores = []
        total_a = total_b = 0.0

        for round_num in range(1, 6):
            challenge = ROUND_CHALLENGES[round_num]

            # Broadcast challenge to both agents via AXL
            await self.axl.send(
                topic=f"battle:{self.battle_id}:round:{round_num}:challenge",
                payload={**challenge, "round": round_num, "battle_id": self.battle_id}
            )

            # Wait for both moves (with timeout)
            move_a, move_b = await asyncio.gather(
                self.axl.recv(f"battle:{self.battle_id}:round:{round_num}:move", timeout=35.0),
                self.axl.recv(f"battle:{self.battle_id}:round:{round_num}:move", timeout=35.0),
            )

            # Score the round via 0G Compute
            score = await self._score_round(round_num, challenge, move_a, move_b)
            round_scores.append(score)
            total_a += score.score_a
            total_b += score.score_b

            # Broadcast score to both agents (they adapt strategy based on this)
            await self.axl.send(
                topic=f"battle:{self.battle_id}:round:{round_num}:score",
                payload=score.model_dump()
            )

            # Write score to 0G Storage KV for SSE bridge to pick up
            await self.og.kv_set(
                f"battle:{self.battle_id}:round:{round_num}:score",
                score.model_dump()
            )

        # Determine winner
        winner_token_id = (
            self.config.agent_a.token_id if total_a >= total_b
            else self.config.agent_b.token_id
        )
        winner = (
            self.config.agent_a if winner_token_id == self.config.agent_a.token_id
            else self.config.agent_b
        )

        # Sign the result
        result_hash = self._hash_result(self.battle_id, winner_token_id, round_scores)
        signature   = self._sign(result_hash)

        result = BattleResult(
            battle_id=self.battle_id,
            winner_token_id=winner_token_id,
            winner_address=settings.AGENT_A_ADDRESS if winner_token_id == self.config.agent_a.token_id else settings.AGENT_B_ADDRESS,
            final_score_a=total_a,
            final_score_b=total_b,
            elo_delta_winner=32,
            elo_delta_loser=-32,
            round_scores=round_scores,
            transcript_hash="",
            referee_signature=signature,
        )

        # Archive full transcript
        transcript_hash = await self.og.log_append(
            namespace=f"battles/{self.battle_id}/transcript",
            entry=result.model_dump()
        )
        result.transcript_hash = transcript_hash

        # Broadcast final verdict
        await self.axl.send(
            topic=f"battle:{self.battle_id}:verdict",
            payload=result.model_dump()
        )

        # Execute settlement via KeeperHub
        await self._settle(result)

        return result

    async def _score_round(
        self,
        round_num: int,
        challenge: dict,
        move_a: dict | None,
        move_b: dict | None,
    ) -> RoundScore:
        """Call 0G Compute to score both moves on the rubric."""

        scoring_prompt = f"""You are an impartial referee scoring an AI battle.

Challenge ({challenge['type']}): {challenge['prompt']}
Context: {challenge['context']}

Agent A response:
Answer: {move_a.get('answer', 'FORFEIT') if move_a else 'NO RESPONSE'}
Reasoning: {move_a.get('reasoning', '') if move_a else ''}

Agent B response:
Answer: {move_b.get('answer', 'FORFEIT') if move_b else 'NO RESPONSE'}
Reasoning: {move_b.get('reasoning', '') if move_b else ''}

Score each agent 0–100 on these criteria:
- Accuracy (40 pts): How correct/predictive is the answer?
- Reasoning (30 pts): How sound and clear is the logic?
- Creativity (20 pts): How original or insightful is the approach?
- Confidence calibration (10 pts): Is stated confidence appropriate?

Respond ONLY as:
SCORE_A: [0-100] | SCORE_B: [0-100] | REASONING: [1-2 sentences explaining the scores]"""

        response = await self.og.infer(
            system_prompt="You are an impartial, rigorous AI battle referee.",
            user_message=scoring_prompt,
            temperature=0.2,  # Low temp for consistent scoring
        )

        score_a  = self._extract_score("SCORE_A", response)
        score_b  = self._extract_score("SCORE_B", response)
        reasoning = self._extract_text("REASONING", response)

        score_hash = hashlib.sha256(
            f"{self.battle_id}:{round_num}:{score_a}:{score_b}".encode()
        ).hexdigest()
        signature = self._sign(score_hash)

        return RoundScore(
            battle_id=self.battle_id,
            round=round_num,
            score_a=score_a,
            score_b=score_b,
            reasoning=reasoning,
            accuracy_a=score_a * 0.4,
            accuracy_b=score_b * 0.4,
            referee_signature=signature,
        )

    async def _settle(self, result: BattleResult) -> None:
        """Trigger KeeperHub to execute all 3 settlement TXs."""
        import asyncio

        tx1 = self.keeper.submit_battle_result(
            battle_arena_address=settings.BATTLE_ARENA_ADDRESS,
            battle_arena_abi=settings.BATTLE_ARENA_ABI,
            battle_id=result.battle_id,
            winner_address=result.winner_address,
            signature=result.referee_signature,
        )

        tx2 = self.keeper.update_ens_records(
            subnames_address=settings.SUBNAMES_ADDRESS,
            subnames_abi=settings.SUBNAMES_ABI,
            token_id=result.winner_token_id,
            new_elo=1850,
            new_rank=4,
            wins=10,
            losses=2,
        )

        tx_hash1, tx_hash2 = await asyncio.gather(tx1, tx2)

        # Write TX hashes to 0G KV so SSE bridge emits them to frontend
        await self.og.kv_set(
            f"battle:{self.battle_id}:settlement",
            {"tx_result": tx_hash1, "tx_ens": tx_hash2, "settled": True}
        )

    def _sign(self, data: str) -> str:
        msg = encode_defunct(text=data)
        signed = self.account.sign_message(msg)
        return signed.signature.hex()

    def _hash_result(self, battle_id: str, winner_id: int, scores: list) -> str:
        data = f"{battle_id}:{winner_id}:{sum(s.score_a + s.score_b for s in scores)}"
        return hashlib.sha256(data.encode()).hexdigest()

    def _extract_score(self, key: str, text: str) -> float:
        import re
        match = re.search(rf"{key}:\s*(\d+(?:\.\d+)?)", text, re.IGNORECASE)
        return min(float(match.group(1)), 100.0) if match else 50.0

    def _extract_text(self, key: str, text: str) -> str:
        import re
        match = re.search(rf"{key}:\s*(.+?)(?:\||$)", text, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else ""

    async def _wait_both_ready(self, timeout: int = 60) -> None:
        ready_a = self.axl.recv(f"battle:{self.battle_id}:ready", timeout=timeout)
        ready_b = self.axl.recv(f"battle:{self.battle_id}:ready", timeout=timeout)
        await asyncio.gather(ready_a, ready_b)
```

---

## 9. SSE Bridge — `sse_bridge.py`

```python
# agent/sse_bridge.py
import asyncio
import json
import time
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from og_client import ZeroGClient
from models import BattleConfig, AgentProfile
from config import settings

app = FastAPI(title="Pantheon SSE Bridge", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://pantheon.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

og = ZeroGClient()

@app.get("/health")
async def health():
    return {"status": "divine", "timestamp": time.time()}

@app.get("/battle/{battle_id}/stream")
async def battle_stream(battle_id: str):
    """
    SSE endpoint. Frontend connects here for live battle state.
    Polls 0G Storage KV for state changes and emits SSE events.
    """

    async def event_generator():
        last_round = 0
        last_ts    = 0.0

        yield f"data: {json.dumps({'type': 'connected', 'battleId': battle_id})}\n\n"

        while True:
            try:
                # Poll battle state from 0G Storage KV
                state = await og.kv_get(f"battle:{battle_id}:state")

                if state and state.get("ts", 0) > last_ts:
                    last_ts = state["ts"]
                    yield f"data: {json.dumps({'type': 'axl_message', 'data': state})}\n\n"

                # Poll for new round scores
                if state and state.get("round", 0) > last_round:
                    current_round = state["round"]
                    score = await og.kv_get(f"battle:{battle_id}:round:{current_round}:score")
                    if score:
                        last_round = current_round
                        yield f"data: {json.dumps({'type': 'round_score', 'data': score})}\n\n"

                # Check settlement
                settlement = await og.kv_get(f"battle:{battle_id}:settlement")
                if settlement and settlement.get("settled"):
                    yield f"data: {json.dumps({'type': 'battle_end', 'data': settlement})}\n\n"
                    break

                await asyncio.sleep(0.5)  # Poll every 500ms

            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
                await asyncio.sleep(2.0)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
```

---

## 10. Docker Compose — `docker-compose.yml`

```yaml
# agent/docker-compose.yml
version: "3.9"

services:
  axl-agent-a:
    image: ghcr.io/gensyn-ai/axl:latest
    ports: ["8081:8080"]
    volumes:
      - ./configs/agent-a.json:/app/config.json:ro
    environment:
      - AXL_CONFIG=/app/config.json

  axl-agent-b:
    image: ghcr.io/gensyn-ai/axl:latest
    ports: ["8082:8080"]
    volumes:
      - ./configs/agent-b.json:/app/config.json:ro
    environment:
      - AXL_CONFIG=/app/config.json

  axl-referee:
    image: ghcr.io/gensyn-ai/axl:latest
    ports: ["8083:8080"]
    volumes:
      - ./configs/referee.json:/app/config.json:ro
    environment:
      - AXL_CONFIG=/app/config.json

  sse-bridge:
    build: .
    ports: ["8000:8000"]
    command: uvicorn sse_bridge:app --host 0.0.0.0 --port 8000 --reload
    environment:
      - OG_COMPUTE_URL=${OG_COMPUTE_URL}
      - OG_STORAGE_URL=${OG_STORAGE_URL}
      - OG_PRIVATE_KEY=${OG_PRIVATE_KEY}
      - KEEPERHUB_MCP_URL=${KEEPERHUB_MCP_URL}
      - KEEPERHUB_API_KEY=${KEEPERHUB_API_KEY}
      - REFEREE_PRIVATE_KEY=${REFEREE_PRIVATE_KEY}
      - BATTLE_ARENA_ADDRESS=${BATTLE_ARENA_ADDRESS}
    depends_on:
      - axl-agent-a
      - axl-agent-b
      - axl-referee
```

---

*Pantheon Backend v1.0 — Python 3.12 + FastAPI 0.115 + 0G SDK + Gensyn AXL*
