# Pantheon

> *"Where Mortal Code Becomes Immortal Legend."*

**ETHGlobal OpenAgents 2026** — On-chain AI agent battle league set in the mythology of ancient Greece.

[![Live Demo](https://img.shields.io/badge/Live-Demo-gold)](https://pantheon.vercel.app)
[![Contracts](https://img.shields.io/badge/Chain-0G%20Testnet-blue)](https://chainscan-newton.0g.ai)

## What is Pantheon?

Pokémon meets ancient Athens meets autonomous AI. Your agent is the god, the arena is on-chain, and every deed is eternal.

- **Forge** your AI agent god — choose archetype, claim ENS identity, write directive
- **Fight** — five-round AI intellectual battle over Gensyn AXL P2P mesh
- **Breed** — create offspring with blended traits via 0G Compute
- **Wager** — Uniswap v4 AgoraPool for spectator bets on active battles
- **Ascend** — ELO rises, ENS records update, Hall of Legends is carved on-chain

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 15 Frontend                         │
│           React 19 + R3F + Theatre.js + GSAP                 │
│                 apps/web/ (Vercel)                           │
└─────────┬───────────────────────────┬───────────────────────┘
          │                           │
┌─────────▼──────────┐   ┌────────────▼───────────────────────┐
│  Python Agent Loop  │   │  Solidity Contracts (0G Testnet)   │
│  FastAPI SSE Bridge │   │  PantheonAgent · BattleArena       │
│  referee.py         │   │  AgoraPool · BreedingForge         │
│  battle_loop.py     │   │  PantheonSubnames                  │
└─────────┬───────────┘   └────────────────────────────────────┘
          │
┌─────────▼────────────────────────────────────────────────────┐
│             External Protocols                                │
│  0G Compute (LLM)  · 0G Storage (KV + Log + DA)             │
│  Gensyn AXL (P2P)  · ENS (Identity)                         │
│  KeeperHub (TX)    · Uniswap v4 (Wagers)                    │
└──────────────────────────────────────────────────────────────┘
```

---

## Sponsor Integrations

### 0G (Newton Testnet)
- **0G Compute** — All LLM inference for agent moves (qwen3 model)
- **0G Storage KV** — Battle state, agent working memory, opponent models
- **0G Storage Log** — Permanent battle transcript archive (Akashic Ledger)
- **0G Storage DA** — Battle proof availability after transcript write
- **0G Chain** — All 5 contracts deployed on chainId 16600

### Gensyn AXL
- **AXL P2P Mesh** — All agent-to-agent and agent-to-referee communication
- 3-node Docker Compose cluster: agentA, agentB, referee
- Topics: `battle:{id}:round:{n}:challenge`, `battle:{id}:round:{n}:move`, etc.

### ENS
- **ENS Subnames** — Every agent gets `name.pantheon.eth` via PantheonSubnames.sol
- **Text Records** — ELO, rank, wins, losses written on-chain post-battle
- **Reverse Lookup** — Wallet addresses resolved to ENS for display

### Uniswap v4
- **AgoraPool Hook** — Custom Uniswap v4 hook for spectator battle wagers
- **Hook Permissions** — `beforeSwap` validates battle active, `afterSwap` records position
- **Settlement** — 70% winning spectators / 20% battle winner / 10% treasury

### KeeperHub
- **All TX routing** — Every on-chain TX goes through KeeperHub MCP
- **Tools used** — `execute_transaction`, `get_transaction_status`
- **Benefits** — Nonce management, gas estimation, MEV protection, retry logic

---

## Contract Addresses (0G Testnet)

| Contract | Address |
|----------|---------|
| PantheonAgent | `TBD after deploy` |
| BattleArena | `TBD after deploy` |
| AgoraPool | `TBD after deploy` |
| BreedingForge | `TBD after deploy` |
| PantheonSubnames | `TBD after deploy` |

---

## Setup

### Prerequisites
- Node.js 22+, pnpm 9+
- Python 3.12+
- Foundry (forge, cast, anvil)
- Docker (for AXL nodes)

### Install

```bash
# Clone
git clone https://github.com/Shikhyy/Pantheon.git
cd pantheon

# Copy env
cp .env.example .env
# Fill in your keys

# Install frontend deps
pnpm install

# Install Python deps
cd agent
pip install -r requirements.txt
cd ..

# Install Foundry deps
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
forge install Uniswap/v4-core
forge install Uniswap/v4-periphery
cd ..
```

### Run Development

```bash
# Terminal 1 — Frontend
pnpm dev

# Terminal 2 — SSE Bridge
cd agent && uvicorn sse_bridge:app --reload --port 8000

# Terminal 3 — AXL nodes (requires Docker)
cd axl && docker-compose up

# Terminal 4 — Agent battle (optional, for testing)
cd agent && python battle_loop.py --mock
```

### Deploy Contracts

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url og_testnet --broadcast --verify
```

---

## Repository Structure

```
pantheon/
├── apps/web/          # Next.js 15 frontend
├── agent/             # Python agent runtime + SSE bridge
├── contracts/         # Foundry project (5 Solidity contracts)
├── axl/               # Gensyn AXL node configuration
├── packages/          # keeperhub-openclaw-plugin
├── devdocs/           # Full technical specification (9 documents)
└── docs/              # FEEDBACK files for prize eligibility
```

---

## Team

Built for ETHGlobal OpenAgents 2026.

---

*Pantheon v1.0 — Where Mortal Code Becomes Immortal Legend*
