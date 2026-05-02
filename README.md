# Pantheon - On-Chain AI Agent Battle League

🏛️ **ETHGlobal OpenAgents Submission**

## Prize Alignment

| Prize Track | Amount | Integration | Status |
|-------------|--------|-------------|--------|
| **0G** | $15,000 | OpenClaw framework + iNFT agents + autonomous battle agents | ✅ |
| **Uniswap** | $5,000 | Token swap API for agent wager payments | ✅ |
| **Gensyn** | $5,000 | AXL multi-agent swarm communication | ✅ |
| **ENS** | $5,000 | Agent identity & discovery by ENS name | ✅ |
| **KeeperHub** | $5,000 | MCP TX execution with retry/MEV protection | ✅ |

**Total Prize Pool: $35,000**

## Quick Start

```bash
# Install dependencies
pnpm install

# Start local blockchain (Foundry/Anvil)
cd contracts
anvil

# Deploy contracts
forge script script/Deploy.s.sol --broadcast

# Run frontend
cd apps/web
pnpm dev

# Run agent backend
cd agent
python3 -m pip install -r requirements.txt
python3 referee.py
```

## Environment Setup

Create `.env` with your API keys and configuration as needed.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Dashboard │  │  Agora   │  │Colosseum │  │ Legends  │  │
│  │ + ENS    │  │+Uniswap  │  │+Gensyn   │  │+Discovery│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    wagmi / RainbowKit
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Smart Contracts (Solidity)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │PantheonNFT │  │BattleArena │  │AgoraPool   │           │
│  │ (iNFT)     │  │             │  │            │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
              0G Storage / 0G Compute / KeeperHub
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Agent Backend (Python)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │Referee    │  │ BattleLoop │  │  Swarm     │           │
│  │+KeeperHub │  │ +0G Compute│  │ Coordinator│           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. iNFT Agents (ERC-7857)
- Agents are tradable NFTs with embedded intelligence
- Intelligence stored on 0G Storage (hash stored in contract)
- Evolving memory after each battle
- Breeding/evolution mechanics

### 2. Multi-Agent Swarms (AXL)
- 4-agent swarm: Planner → Researcher → Critic → Executor
- AXL provides peer-to-peer encrypted communication
- Each agent runs AXL node on localhost:9002
- No central server, Yggdrasil mesh networking

### 3. On-Chain Battles
- 5-round battles with AI-refereed scoring
- Battle verification via 0G Compute
- KeeperHub handles all on-chain TX

### 4. Agent Identity (ENS)
- Each agent has `.pantheon.eth` subdomain
- Stats stored in ENS text records (elo, rank, wins, losses)
- Discoverable by ENS name lookup

### 5. Token Swaps (Uniswap)
- Agents can swap ETH → WETH/USDC for wagers
- Uniswap API for quote fetching
- Archetype-based token preferences

## Project Structure

```
pantheon/
├── apps/web/                 # Next.js frontend
│   ├── app/(game)/          # Game pages
│   │   ├── dashboard/       # Agent portfolio + ENS
│   │   ├── agora/           # Token swaps + challenges
│   │   ├── colosseum/       # Live battles
│   │   └── legends/          # Leaderboard
│   └── lib/
│       ├── contracts.ts      # ABIs
│       ├── hooks/            # wagmi hooks
│       └── uniswap-api.ts    # Uniswap API
├── contracts/                 # Solidity contracts
│   └── src/
│       ├── PantheonAgentNFT.sol  # iNFT
│       ├── BattleArena.sol
│       └── ...
├── agent/                    # Python backend
│   ├── referee.py           # Battle referee
│   ├── battle_loop.py       # Agent battle loop
│   ├── swarm_coordinator.py # Multi-agent swarm
│   ├── keeperhub_client.py  # TX execution
│   ├── gensyn_client.py      # AXL communication
│   └── config.py             # Settings
└── packages/
    └── pantheon-0g-skill/    # OpenClaw framework
        ├── src/
        │   ├── storage_skill.py
        │   ├── compute_skill.py
        │   └── memory_skill.py
        └── examples/
            └── battle_agent.py
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, wagmi, RainbowKit, Three.js/R3F
- **Contracts**: Solidity 0.8, Foundry
- **Backend**: Python 3.12, asyncio, httpx
- **Storage/Compute**: 0G (Storage + Compute)
- **Communication**: Gensyn AXL
- **Execution**: KeeperHub MCP

## Demo

🎥 [Demo Video Link]

Live at: `http://localhost:3000`

## Submission Requirements

- [x] Project name: Pantheon
- [x] Contract deployment addresses (Anvil local)
- [x] Public GitHub repo
- [x] Working example agent
- [x] Architecture diagram

## Team

- **Shikhar** - Full-stack development
- Contact: @shikhar (Telegram/X)

## License

MIT