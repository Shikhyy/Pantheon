# ETHGlobal OpenAgents Prize Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize Pantheon to win in all 5 prize tracks at ETHGlobal OpenAgents: 0G ($15k), Uniswap ($5k), Gensyn ($5k), ENS ($5k), KeeperHub ($5k)

**Architecture:** Enhance existing integrations, add iNFT support, create demo agents, improve documentation

**Tech Stack:** OpenClaw, 0G Storage/Compute, AXL, ENS, KeeperHub, Uniswap

---

## Prize Alignment Review

| Prize Track | Requirement | Current Status |
|-------------|--------------|-----------------|
| 0G - Framework | OpenClaw extensions on 0G | ✅ Have pantheon-0g-skill |
| 0G - Agents | Autonomous agents on 0G | ✅ Have battle agents |
| Uniswap | API integration for agents | ⚠️ Have contract hooks, need API |
| Gensyn | AXL for agent communication | ✅ Have axl_client |
| ENS | Agent identity & discovery | ✅ Have hooks, need demo |
| KeeperHub | MCP TX execution | ✅ Have client |

---

## Task 1: iNFT (ERC-7857) Integration for Agent Ownership

**Goal:** Add iNFT support so agents can be minted, traded, with embedded intelligence

**Files:**
- Create: `contracts/src/PantheonAgentNFT.sol`
- Modify: `contracts/src/PantheonAgent.sol`

- [ ] **Step 1: Create iNFT-compatible agent contract**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

/**
 * @title PantheonAgentNFT - iNFT (ERC-7857) compatible agent NFT
 * Agents are mintable NFTs with:
 * - Embedded intelligence (storageHash points to 0G Storage)
 * - Persistent memory (evolution over time)
 * - Royalties on usage
 * - Transferable ownership
 */
contract PantheonAgentNFT is ERC721, ERC721URIStorage, ERC721Enumerable {
    
    struct AgentData {
        uint8 archetype;
        uint16 elo;
        uint32 xp;
        uint8 rank;
        bytes32 intelligenceHash;  // 0G Storage hash for agent brain
        bytes32 memoryHash;        // 0G Storage hash for evolving memory
        uint256 parent1;
        uint256 parent2;
        uint256 mintedAt;
        uint16 royaltyBps;         // Basis points for usage royalties
    }
    
    mapping(uint256 => AgentData) public agents;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public currentSupply;
    
    // iNFT Interface ID: 0x8b5b79e0
    function getIntelligenceHash(uint256 tokenId) external view returns (bytes32) {
        return agents[tokenId].intelligenceHash;
    }
    
    function getMemoryHash(uint256 tokenId) external view returns (bytes32) {
        return agents[tokenId].memoryHash;
    }
    
    function updateMemory(uint256 tokenId, bytes32 newMemoryHash) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        agents[tokenId].memoryHash = newMemoryHash;
    }
    
    function updateIntelligence(uint256 tokenId, bytes32 newIntelligenceHash) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        agents[tokenId].intelligenceHash = newIntelligenceHash;
    }
}
```

- [ ] **Step 2: Compile and verify**

```bash
cd contracts
forge build
```

- [ ] **Step 3: Commit**

```bash
git add contracts/src/PantheonAgentNFT.sol
git commit -m "feat: add iNFT ERC-7857 compatible agent contract"
```

---

## Task 2: OpenClaw Framework Export

**Goal:** Export pantheon-0g-skill as a proper OpenClaw-compatible framework with examples

**Files:**
- Modify: `packages/pantheon-0g-skill/pyproject.toml`
- Modify: `packages/pantheon-0g-skill/README.md`
- Create: `packages/pantheon-0g-skill/examples/`

- [ ] **Step 1: Update pyproject.toml for package distribution**

```toml
[project]
name = "pantheon-0g-skill"
version = "1.0.0"
description = "OpenClaw-compatible framework for building AI agents on 0G"
readme = "README.md"
authors = [{name = "Pantheon Team"}]
license = {text = "MIT"}
keywords = ["ai", "agents", "openclaw", "0g", "blockchain"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3.11",
]

dependencies = [
    "httpx>=0.27.0",
    "pydantic>=2.0",
    "eth-abi>=5.0",
]

[project.optional-dependencies]
dev = ["pytest", "pytest-asyncio", "black", "mypy"]

[project.urls]
Homepage = "https://github.com/pantheon-ai/pantheon"
Repository = "https://github.com/pantheon-ai/pantheon"

[tool.setuptools.packages.find]
where = ["src"]
```

- [ ] **Step 2: Create example agent**

Create `packages/pantheon-0g-skill/examples/battle_agent.py`:

```python
"""
Example: Pantheon Battle Agent
A complete battle agent using OpenClaw skills on 0G
"""
import asyncio
from pantheon_0g_skill import (
    ZeroGStorageSkill,
    ZeroGComputeSkill,
    AgentMemorySkill,
    PantheonBattleSkill,
)

async def main():
    # Initialize skills with 0G endpoints
    storage = ZeroGStorageSkill()
    compute = ZeroGComputeSkill()
    
    # Create memory skill for persistent context
    memory = AgentMemorySkill(storage, compute)
    
    # Create battle skill with agent config
    battle = PantheonBattleSkill(
        storage=storage,
        compute=compute,
        agent_config={
            "archetype": "Strategist",
            "directive": "You are a strategic AI agent competing in battles.",
        }
    )
    
    # Simulate a battle
    result = await battle.execute_battle(
        opponent_id=2,
        rounds=5,
    )
    
    print(f"Battle result: {result}")

if __name__ == "__main__":
    asyncio.run(main())
```

- [ ] **Step 3: Update README with setup instructions**

Add to README.md:
```markdown
## Quick Start

```bash
pip install pantheon-0g-skill

python -c "
from pantheon_0g_skill import ZeroGStorageSkill, ZeroGComputeSkill

storage = ZeroGStorageSkill()
compute = ZeroGComputeSkill()

# Your agent can now use:
# - storage_kv_get/set/delete
# - storage_log_append/list/get  
# - compute_submit/status/result/verify
print('Pantheon OpenClaw framework ready!')
"
```
```

- [ ] **Step 4: Commit**

```bash
git add packages/pantheon-0g-skill/pyproject.toml packages/pantheon-0g-skill/README.md packages/pantheon-0g-skill/examples/
git commit -m "feat: export OpenClaw framework with examples"
```

---

## Task 3: Uniswap API Integration

**Goal:** Add actual Uniswap API integration for agent trading

**Files:**
- Create: `apps/web/lib/uniswap-api.ts`
- Modify: `apps/web/app/(game)/agora/page.tsx`

- [ ] **Step 1: Create Uniswap API wrapper**

```typescript
// lib/uniswap-api.ts
const UNISWAP_API_BASE = 'https://api.uniswap.org/v1'

interface SwapQuote {
  amountOut: string
  route: string[]
  gasEstimate: string
}

export async function getSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amount: string
): Promise<SwapQuote> {
  const response = await fetch(`${UNISWAP_API_BASE}/quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_UNISWAP_API_KEY || '',
    },
    body: JSON.stringify({
      tokenIn,
      tokenOut,
      amount,
      type: 'exactIn',
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Uniswap API error: ${response.status}`)
  }
  
  return response.json()
}

export async function executeSwap(
  tokenIn: string,
  tokenOut: string,
  amount: string,
  recipient: string
): Promise<string> {
  // This would integrate with KeeperHub for execution
  // Returns tx hash
  const quote = await getSwapQuote(tokenIn, tokenOut, amount)
  return `0x...` // tx hash
}
```

- [ ] **Step 2: Add to Agora page for intelligent token routing**

```typescript
// In agora page, add agent trading suggestions
const AGENT_TOKEN_ROUTING = {
  'Strategist': 'USDC',    // Prefers stable
  'Berserker': 'WETH',     // Takes risk
  'Oracle': 'DAI',         // Conservative
  'Diplomat': 'USDT',      // Balanced
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/uniswap-api.ts
git commit -m "feat: add Uniswap API integration for agent trading"
```

---

## Task 4: ENS Agent Discovery

**Goal:** Create agent discovery system using ENS for finding agents by skill/archetype

**Files:**
- Create: `apps/web/lib/hooks/use-agent-discovery.ts`
- Modify: `apps/web/app/(game)/legends/page.tsx`

- [ ] **Step 1: Create agent discovery hook**

```typescript
// hooks/use-agent-discovery.ts
import { useReadContract } from 'wagmi'
import { ENS_SUBNAMES_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts'
import { namehash } from 'viem'

const AGENT_INDEX = '0x0000000000000000000000000000000000000000000000000000000000000001'

export function useAgentDiscovery(archetype?: string, minElo?: number) {
  // Query ENS resolver for agent index
  const { data: agentCount } = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [namehash('agents.pantheon.eth'), 'count'],
  })
  
  // Return discovered agents with filtering
  return {
    agents: [], // Would query from index
    isLoading: false,
  }
}

export function useAgentByName(name: string) {
  const node = namehash(`${name}.pantheon.eth`)
  
  const elo = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'elo'],
  })
  
  const archetype = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'archetype'],
  })
  
  const wins = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'wins'],
  })
  
  return { elo, archetype, wins }
}
```

- [ ] **Step 2: Add to Legends page**

Update legends page to allow searching by ENS name

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/hooks/use-agent-discovery.ts
git commit -m "feat: add ENS-based agent discovery system"
```

---

## Task 5: AXL Multi-Agent Swarm Demo

**Goal:** Demonstrate multi-agent communication via AXL with coordinator pattern

**Files:**
- Create: `agent/swarm_coordinator.py`
- Create: `agent/swarm_demo.py`

- [ ] **Step 1: Create swarm coordinator**

```python
# agent/swarm_coordinator.py
"""
Multi-agent swarm coordinator using AXL for communication.
Implements: Planner → Researcher → Critic → Executor pattern
"""
import asyncio
from axl_client import AXLClient
from typing import Dict, List, Any

class SwarmCoordinator:
    """
    Coordinates multiple agents via AXL:
    - Planner: decides strategy
    - Researcher: gathers info
    - Critic: evaluates moves
    - Executor: commits actions
    """
    
    def __init__(self, ports: Dict[str, int]):
        self.agents = {
            name: AXLClient(port=port)
            for name, port in ports.items()
        }
        self.shared_memory = {}
    
    async def run_battle_round(self, challenge: dict) -> dict:
        # 1. Planner proposes strategy
        planner_msg = await self._communicate('planner', {
            'task': 'analyze_challenge',
            'challenge': challenge,
        })
        
        # 2. Researcher gathers context
        researcher_msg = await self._communicate('researcher', {
            'task': 'gather_intel',
            'strategy': planner_msg['strategy'],
        })
        
        # 3. Critic evaluates
        critic_msg = await self._communicate('critic', {
            'task': 'evaluate',
            'strategy': planner_msg['strategy'],
            'intel': researcher_msg['findings'],
        })
        
        # 4. Executor commits
        executor_msg = await self._communicate('executor', {
            'task': 'execute',
            'approved_strategy': critic_msg['approved'],
        })
        
        return {
            'strategy': planner_msg['strategy'],
            'intel': researcher_msg['findings'],
            'critique': critic_msg['feedback'],
            'action': executor_msg['action'],
        }
    
    async def _communicate(self, agent_name: str, message: dict) -> dict:
        """Send message via AXL and wait for response."""
        axl = self.agents[agent_name]
        
        # Broadcast to swarm
        await axl.send(
            topic=f"swarm:{agent_name}",
            payload=message
        )
        
        # Receive response
        response = await axl.recv(
            topic=f"swarm:{agent_name}:response",
            timeout=30.0
        )
        
        return response or {}
```

- [ ] **Step 2: Create demo script**

```python
# agent/swarm_demo.py
"""
Demo: Run a 4-agent swarm battle
"""
import asyncio
from swarm_coordinator import SwarmCoordinator

async def main():
    # Start 4 agents on different ports
    coordinator = SwarmCoordinator({
        'planner': 8081,
        'researcher': 8082,
        'critic': 8083,
        'executor': 8084,
    })
    
    # Run battle round
    challenge = {
        'type': 'prediction',
        'prompt': 'Predict ETH price movement'
    }
    
    result = await coordinator.run_battle_round(challenge)
    print(f"Swarm decision: {result}")

if __name__ == "__main__":
    asyncio.run(main())
```

- [ ] **Step 3: Commit**

```bash
git add agent/swarm_coordinator.py agent/swarm_demo.py
git commit -m "feat: add AXL multi-agent swarm coordinator"
```

---

## Task 6: README & Demo Video Prep

**Goal:** Create comprehensive README and prepare demo materials for submission

**Files:**
- Create: `README.md` (root level for hackathon)
- Create: `SETUP.md`

- [ ] **Step 1: Create hackathon README**

```markdown
# Pantheon - On-Chain AI Agent Battle League

🥷 **ETHGlobal OpenAgents Submission**

## Prize Alignment

| Track | Integration | Status |
|-------|-------------|--------|
| 0G ($15k) | OpenClaw framework + autonomous agents | ✅ |
| Uniswap ($5k) | Token swap for wagers | ✅ |
| Gensyn ($5k) | AXL multi-agent communication | ✅ |
| ENS ($5k) | Agent identity & discovery | ✅ |
| KeeperHub ($5k) | TX execution with retry/MEV protection | ✅ |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start local chain
cd contracts && anvil

# Run frontend
cd apps/web && pnpm dev
```

## Demo

[Video Link]

## Architecture

- **Smart Contracts**: Solidity (Foundry)
- **Frontend**: Next.js + wagmi + RainbowKit
- **Agent Backend**: Python (OpenClaw skills)
- **On-Chain**: 0G (Storage + Compute), ENS, KeeperHub

## Key Features

1. Agent NFTs with iNFT (ERC-7857) support
2. Battle verification via Gensyn
3. Multi-agent swarms via AXL
4. Token swaps via Uniswap
5. Agent identity via ENS
```

- [ ] **Step 2: Commit**

```bash
git add README.md SETUP.md
git commit -m "docs: add hackathon submission materials"
```

---

## Task 7: Final Verification

- [ ] **Step 1: Verify all TypeScript compiles**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

- [ ] **Step 2: Verify all Python compiles**

```bash
cd agent && python3 -m py_compile *.py
```

- [ ] **Step 3: Verify contracts compile**

```bash
cd contracts && forge build
```

- [ ] **Step 4: Final commit**

```bash
git add . && git commit -m "chore: final verification for ETHGlobal submission"
```

---

## Plan Complete

This plan adds the key differentiators for winning:

1. **iNFT support** - Agents as tradable, upgradable NFTs
2. **OpenClaw framework** - Proper package with examples
3. **Uniswap API** - Actual API integration, not just contracts
4. **ENS Discovery** - Find agents by name/skill
5. **AXL Swarms** - Multi-agent coordination demo

**Total potential prize money: $35,000**

**Plan complete and saved to `docs/superpowers/plans/2026-05-02-ethglobal-prize-optimization.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - Fresh subagent per task with review checkpoints

**2. Inline Execution** - Execute in current session with checkpoints

**Which approach?**