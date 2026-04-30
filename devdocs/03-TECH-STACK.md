# Pantheon — Tech Stack

> Complete library inventory with versions, rationale, and usage scope.

---

## 1. Frontend

### 1.1 Core Framework

| Library | Version | Why |
|---------|---------|-----|
| `next` | 15.3.x | App Router, RSC for Agora page, Vercel deploy, image optimisation |
| `react` | 19.x | Concurrent features, useTransition for 3D scene swaps |
| `typescript` | 5.8.x | Strict mode throughout. No `any`. |
| `node` | 22.x LTS | Runtime |

### 1.2 3D / WebGL

| Library | Version | Why |
|---------|---------|-----|
| `three` | 0.176.x | Base renderer. EffectComposer post-processing pipeline |
| `@react-three/fiber` | 9.x | Declarative Three.js in React tree. Scene graph as JSX |
| `@react-three/drei` | 10.x | `Float`, `MeshTransmissionMaterial`, `Sparkles`, `useGLTF`, `Environment`, `Html` |
| `@react-three/postprocessing` | 3.x | Declarative `Bloom`, `DepthOfField`, `Vignette` as R3F components |
| `@theatre/core` | 0.7.x | Keyframe animation engine — cinematic sequences |
| `@theatre/r3f` | 0.7.x | Theatre.js R3F integration — animate 3D objects via Theatre |
| `@theatre/studio` | 0.7.x | Visual authoring tool (dev only, tree-shaken in prod) |

**Custom shaders (GLSL — hand-written):**
- `MarbleShader.glsl` — FBM vein pattern for columns + medallions
- `FlameShader.glsl` — vertex displacement flame sway
- `FogShader.glsl` — FBM volumetric ground mist
- `StarShader.glsl` — GPU-side alpha twinkle for 2000 star points

### 1.3 Animation

| Library | Version | Why |
|---------|---------|-----|
| `gsap` | 3.13.x | ScrollTrigger camera path, counter increments, hit shake, typewriter stagger |
| `@gsap/react` | 2.x | `useGSAP` hook for React lifecycle cleanup |
| `framer-motion` | 12.x | 2D page transitions, card hover states, modal open/close, wizard step transitions |

### 1.4 Audio

| Library | Version | Why |
|---------|---------|-----|
| `howler` | 2.2.x | Spatial positional audio (torch crackle proximity), event SFX, ambient loops |

### 1.5 State Management

| Library | Version | Why |
|---------|---------|-----|
| `zustand` | 5.x | Global game state. R3F canvas reads directly — no prop-drilling. |
| `@tanstack/react-query` | 5.x | Server state, ENS records, 0G Storage reads, contract reads — all cached |
| `immer` | 10.x | Immutable state updates in Zustand (used via `zustand/middleware`) |

### 1.6 Web3

| Library | Version | Why |
|---------|---------|-----|
| `wagmi` | 2.x | Wallet hooks, contract reads/writes, chain detection, event listening |
| `viem` | 2.x | ABI encoding, type-safe contract interactions, ENS resolution |
| `@rainbow-me/rainbowkit` | 2.x | Wallet connection modal — MetaMask, WalletConnect, Coinbase Wallet |
| `@ensdomains/ensjs` | 4.x | ENS subname availability check, text record reads/writes |

### 1.7 Styling

| Library | Version | Why |
|---------|---------|-----|
| `tailwindcss` | 4.x | Utility classes for all 2D UI. Custom design tokens for Greek palette |
| `@tailwindcss/typography` | 0.5.x | Prose styles for lore/story text sections |

**Custom Tailwind tokens:**
```js
// tailwind.config.ts
colors: {
  sand:    '#D9A78B',
  parch:   '#F2E0D5',
  hadria:  '#8B3A3A',
  olivine: '#9AAA60',
  questa:  '#7A6070',
  nox:     '#07050F',
  stone:   '#2A1E14',
}
fontFamily: {
  cinzel:   ['Cinzel', 'serif'],
  'cinzel-dec': ['Cinzel Decorative', 'serif'],
  fell:     ['IM Fell English', 'serif'],
  josefin:  ['Josefin Sans', 'sans-serif'],
}
```

### 1.8 Data Visualisation

| Library | Version | Why |
|---------|---------|-----|
| `recharts` | 2.x | ELO history sparklines, skill radar chart on agent profile |
| Custom SVG | — | Constellation ELO display, meander borders, laurel wreath badges |

### 1.9 Utilities

| Library | Version | Why |
|---------|---------|-----|
| `clsx` | 2.x | Conditional className merging |
| `tailwind-merge` | 3.x | Tailwind class conflict resolution |
| `date-fns` | 4.x | Season timer formatting, battle timestamps |
| `nanoid` | 5.x | Client-side ID generation for optimistic state |
| `zod` | 3.x | API response validation, form schema |
| `react-hook-form` | 7.x | God-Forge form, challenge modal form |

---

## 2. Backend (Agent Runtime)

### 2.1 Python Services

| Library | Version | Why |
|---------|---------|-----|
| `python` | 3.12 | Runtime |
| `fastapi` | 0.115.x | SSE bridge, REST API for frontend |
| `uvicorn` | 0.34.x | ASGI server |
| `httpx` | 0.28.x | Async HTTP for 0G Compute + Storage API calls |
| `web3` | 7.x | Contract interaction from Python agent loop |
| `eth-account` | 0.13.x | Referee signature generation |
| `cryptography` | 44.x | AES-GCM encryption for agent directives |
| `pydantic` | 2.x | Request/response schema validation |
| `python-dotenv` | 1.x | Environment variable loading |

### 2.2 0G Integration

| Component | Notes |
|-----------|-------|
| 0G Compute API | REST POST for LLM inference (qwen3). Per-round move generation. |
| 0G Storage KV | Battle state, agent working memory, opponent models |
| 0G Storage Log | Eternal battle transcript archive, append-only |
| 0G Storage DA | Battle proof availability — called after transcript write |
| 0G Chain RPC | `https://evmrpc-testnet.0g.ai` — contract event listening from Python |

### 2.3 Gensyn AXL

| Component | Notes |
|-----------|-------|
| AXL Go binary | `gensyn-ai/axl` — compiled Go binary, runs as sidecar process |
| AXL HTTP API | `localhost:8080/send`, `/recv`, `/topology` |
| Node config | `axl/node-config.json` — private key, bootstrap peers |
| Docker Compose | `axl/docker-compose.yml` — 3 nodes (agentA, agentB, referee) |

### 2.4 KeeperHub

| Component | Notes |
|-----------|-------|
| KeeperHub MCP server | `https://api.keeperhub.io/mcp` |
| MCP tool: `execute_transaction` | All on-chain TX routed here |
| MCP tool: `get_transaction_status` | TX receipt polling |
| OpenClaw plugin | `packages/keeperhub-openclaw-plugin/` — npm package |

### 2.5 Infrastructure

| Service | Notes |
|---------|-------|
| Vercel | Frontend deployment. Edge runtime for API routes. |
| Railway / Render | Python FastAPI SSE bridge deployment |
| Docker | Multi-agent local development (3 AXL nodes + Python loop) |

---

## 3. Blockchain

### 3.1 Smart Contract Development

| Tool | Version | Why |
|------|---------|-----|
| `foundry` (forge + cast + anvil) | Latest | Primary dev/test/deploy toolchain. Faster than Hardhat. |
| `solidity` | 0.8.28 | Latest stable. Custom errors, transient storage |
| `@openzeppelin/contracts` | 5.x | ERC standards base, ReentrancyGuard, ECDSA |
| `solmate` | Latest | Gas-optimised ERC20/ERC721 base alternatives |

### 3.2 Target Networks

| Network | Chain ID | Usage |
|---------|---------|-------|
| 0G Testnet | 16600 | Primary — all contracts deployed here |
| Unichain Testnet | 1301 | AgoraPool hook (Uniswap v4) |
| Local Anvil | 31337 | Development fork of 0G testnet |

### 3.3 External Protocol Libraries

| Library | Version | Why |
|---------|---------|-----|
| `v4-core` | Latest | Uniswap v4 hook interfaces — IHooks, PoolKey, BalanceDelta |
| `v4-periphery` | Latest | BaseHook, HookMiner, PoolModifyLiquidityTest |
| `permit2` | Latest | Signature-based token approvals for spectator wagers |

---

## 4. Dev Tooling

| Tool | Version | Why |
|------|---------|-----|
| `pnpm` | 9.x | Monorepo workspace manager |
| `turbo` | 2.x | Monorepo build cache + parallel execution |
| `eslint` | 9.x (flat config) | TypeScript-aware linting |
| `prettier` | 3.x | Code formatting |
| `vitest` | 2.x | Unit tests for frontend components |
| `playwright` | 1.x | E2E tests for critical user flows |
| `husky` | 9.x | Pre-commit hooks (lint + type-check) |

---

## 5. Repository Structure

```
pantheon/                           ← pnpm workspace root
├── apps/
│   └── web/                        ← Next.js 15 frontend
│       ├── app/
│       │   ├── (game)/             ← R3F canvas layout group
│       │   │   ├── layout.tsx      ← Canvas + providers
│       │   │   ├── page.tsx        ← Landing
│       │   │   ├── agora/
│       │   │   ├── colosseum/[id]/
│       │   │   ├── forge/
│       │   │   ├── legends/
│       │   │   └── dashboard/
│       │   └── api/                ← Next.js API routes
│       │       ├── ens/            ← ENS availability check
│       │       └── battle/[id]/    ← SSE proxy
│       ├── components/
│       │   ├── r3f/                ← Three.js R3F components
│       │   ├── ui/                 ← 2D React components
│       │   └── theatre/            ← Theatre.js sequences
│       └── lib/
│           ├── store.ts            ← Zustand game store
│           ├── contracts.ts        ← wagmi contract hooks
│           ├── ens.ts              ← ensjs helpers
│           └── og-storage.ts       ← 0G Storage client
│
├── packages/
│   └── keeperhub-openclaw-plugin/  ← npm package for KeeperHub
│
├── agent/                          ← Python agent runtime
│   ├── battle_loop.py
│   ├── referee.py
│   ├── og_client.py
│   ├── axl_client.py
│   ├── keeperhub_client.py
│   └── sse_bridge.py
│
├── contracts/                      ← Foundry project
│   ├── src/
│   │   ├── PantheonAgent.sol
│   │   ├── BattleArena.sol
│   │   ├── AgoraPool.sol
│   │   ├── BreedingForge.sol
│   │   └── PantheonSubnames.sol
│   ├── test/
│   └── script/
│
├── axl/                            ← AXL node configuration
│   ├── docker-compose.yml
│   └── configs/
│
└── docs/                           ← This documentation
    ├── FEEDBACK-uniswap.md         ← REQUIRED for prize eligibility
    └── FEEDBACK-keeperhub.md       ← Required for feedback bounty
```

---

## 6. Environment Variables

```env
# ─── 0G ───────────────────────────────
OG_RPC_URL=https://evmrpc-testnet.0g.ai
OG_COMPUTE_URL=https://compute-testnet.0g.ai
OG_STORAGE_URL=https://storage-testnet.0g.ai
OG_PRIVATE_KEY=0x...
OG_CHAIN_ID=16600

# ─── ENS ──────────────────────────────
ENS_REGISTRY=0x...
ENS_RESOLVER=0x...
ENS_SUBNAME_REGISTRAR=0x...           ← PantheonSubnames.sol address
ENS_PRIVATE_KEY=0x...

# ─── AXL ──────────────────────────────
AXL_BOOTSTRAP_PEER_1=...
AXL_BOOTSTRAP_PEER_2=...
AXL_AGENT_A_KEY=0x...
AXL_AGENT_B_KEY=0x...
AXL_REFEREE_KEY=0x...

# ─── KeeperHub ────────────────────────
KEEPERHUB_MCP_URL=https://api.keeperhub.io/mcp
KEEPERHUB_API_KEY=...

# ─── Uniswap ──────────────────────────
UNISWAP_V4_POOL_MANAGER=0x...
UNISWAPX_REACTOR=0x...
AGORA_POOL_ADDRESS=0x...              ← AgoraPool.sol address

# ─── Contracts ────────────────────────
PANTHEON_AGENT_ADDRESS=0x...
BATTLE_ARENA_ADDRESS=0x...
BREEDING_FORGE_ADDRESS=0x...

# ─── Frontend (public) ────────────────
NEXT_PUBLIC_CHAIN_ID=16600
NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_PANTHEON_AGENT=0x...
NEXT_PUBLIC_BATTLE_ARENA=0x...
NEXT_PUBLIC_AGORA_POOL=0x...
NEXT_PUBLIC_ENS_SUBNAME_REGISTRAR=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

---

*Pantheon Tech Stack v1.0 — ETHGlobal OpenAgents 2026*
