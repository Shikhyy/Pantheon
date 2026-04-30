# Pantheon — Product Requirements Document

> *"Where mortal code becomes immortal legend."*
> ETHGlobal OpenAgents 2026

---

## 1. Product Overview

### 1.1 Vision

Pantheon is a fully on-chain AI agent battle league set in the mythology of ancient Greece. It is simultaneously a Web3 game, an AI agent framework demonstration, and a DeFi primitive — all wrapped in a cinematic, AAA-quality frontend experience that judges and users will not forget.

### 1.2 Mission

To build the most technically ambitious and visually spectacular project at ETHGlobal OpenAgents 2026, winning across all five sponsor prize tracks by ensuring every technology is load-bearing — not cosmetically bolted on.

### 1.3 One-Line Pitch

Pokémon meets ancient Athens meets autonomous AI — your agent is the god, the arena is on-chain, and every deed is eternal.

---

## 2. Problem Statement

### 2.1 The Gap

Autonomous AI agents on blockchain exist today as developer tools with no compelling consumer interface. Users have no reason to care about agent capabilities unless they can see them compete, evolve, and generate real economic stakes.

### 2.2 The Opportunity

By wrapping agent capabilities in a game loop — forge, fight, breed, wager, ascend — Pantheon creates a context where every technical capability (P2P communication, on-chain identity, decentralised inference, trustless settlement) is felt by the user as gameplay, not infrastructure.

### 2.3 Why Now

ETHGlobal OpenAgents 2026 prizes specifically reward projects that make agents useful and exciting. The five sponsor tracks (0G, Gensyn AXL, ENS, Uniswap, KeeperHub) have never been unified into a single coherent product. Pantheon is that product.

---

## 3. Goals & Success Metrics

### 3.1 Hackathon Goals

| Goal | Metric | Target |
|------|--------|--------|
| Win 0G framework prize | Judge evaluation | $7,500 |
| Win 0G iNFT prize | Judge evaluation | $7,500 |
| Win Gensyn AXL prize | Judge evaluation | $5,000 |
| Win ENS AI identity prize | Judge evaluation | $2,500 |
| Win ENS creative prize | Judge evaluation | $2,500 |
| Win KeeperHub Focus 1 | Judge evaluation | $4,500 |
| Win KeeperHub Focus 2 | Judge evaluation | $4,500 |
| Win KeeperHub Feedback | FEEDBACK.md quality | $500 |
| Win Uniswap integration | Judge evaluation | $5,000 |
| **Total** | | **$39,500** |

### 3.2 Product Goals

- End-to-end working product: land → forge → challenge → battle → settle → leaderboard
- Live demo accessible on Vercel at submission
- All contract addresses deployed on 0G testnet
- Sub-3-second page load on landing
- 60fps animations on desktop hardware

### 3.3 Post-Hackathon Goals (v2)

- Mainnet deployment on 0G Chain
- Season 1 launch with 100+ agents
- Community breeding tournament
- SDK/API for third-party agent integrations

---

## 4. Users & Personas

### 4.1 The Summoner (Primary)

**Who:** Web3-native developer or power user who wants to put their AI agent building skills on-chain.

**Goal:** Mint an agent with a custom directive, compete, earn rewards.

**Pain Point:** No existing platform lets them meaningfully test AI agent capabilities in a competitive, economic context.

**Journey:** Discovers Pantheon via ETHGlobal → connects wallet → creates agent in God-Forge → challenges rival → wins → climbs leaderboard.

### 4.2 The Spectator (Secondary)

**Who:** DeFi user or onlooker interested in prediction markets and wagering.

**Goal:** Watch live battles, wager on outcomes, earn from correct predictions.

**Pain Point:** Existing prediction markets have no entertainment layer.

**Journey:** Arrives at Colosseum page → watches live battle → deposits tokens via Uniswap pool → collects winnings.

### 4.3 The Breeder (Tertiary)

**Who:** NFT collector and game theorist interested in genetic trait systems.

**Goal:** Build a dynasty of high-ELO agents through strategic breeding.

**Pain Point:** NFT "breeding" mechanics are usually cosmetic. Here traits affect battle performance.

**Journey:** Accumulates two high-ELO agents → visits God-Forge breeding tab → mints offspring → monitors performance across seasons.

### 4.4 The Judge (Special)

**Who:** ETHGlobal and sponsor track judges.

**Goal:** Evaluate technical depth and innovation per track.

**Need:** Clear, demonstrable integration of their specific technology in a non-trivial way.

**Journey:** Watches 3-minute demo → reads per-track integration writeup → awards prize.

---

## 5. Core Features

### 5.1 P0 — Must Ship (Demo-Critical)

| Feature | Description |
|---------|-------------|
| **God-Forge** | 3-step agent creation wizard. Archetype selection, ENS name registration, directive encryption and 0G Storage write, iNFT mint on 0G Chain. |
| **The Agora** | Agent marketplace. Grid of stone-tablet agent cards with ENS names, ELO, stats. Challenge issuance flow. |
| **Live Battle (Colosseum)** | Real-time battle view. AXL message feed via SSE. Health bars, wager pool bar, oracle commentary. |
| **Battle Settlement** | KeeperHub-executed TX bundle: ELO update, Uniswap v4 hook prize distribution, ENS text record update. |
| **Hall of Legends** | Leaderboard from 0G Storage + ENS. Top 4 agents with ranks, ELO, lineage. |
| **Wallet Connect** | RainbowKit wallet connection, ENS resolution, chain switching to 0G testnet. |

### 5.2 P1 — Ship if Time Allows

| Feature | Description |
|---------|-------------|
| **iNFT Breeding** | BreedingForge.sol + UI. Two parent agents → offspring via 0G Compute directive blending. |
| **Spectator Wagering** | Uniswap v4 AgoraPool. Any-token deposits via UniswapX routing. Live odds display. |
| **Battle Replay** | Load archived transcript from 0G Storage Log and animate playback. |
| **Achievement Badges** | ERC-5192 soul-bound tokens for milestones. Displayed on agent profile. |
| **Season Tournament** | Top-8 bracket, autonomous smart contract execution. |

### 5.3 P2 — Post-Hackathon

| Feature | Description |
|---------|-------------|
| **Mobile responsive design** | Current target is desktop for demo. |
| **OpenClaw-RL fine-tuning** | Battle logs as training data for model improvement. |
| **Agent API/SDK** | Public API for third-party agents to enter the arena. |
| **Mainnet deployment** | Full 0G mainnet + Unichain mainnet. |

---

## 6. User Stories

```
As a Summoner,
  I want to mint an AI agent with my own personality directive,
  So that I can compete on-chain and prove my agent's intelligence.

As a Summoner,
  I want my agent to have a permanent ENS identity,
  So that it is discoverable and its history is public.

As a Summoner,
  I want to challenge another agent and lock a wager,
  So that victory has real economic stakes.

As a Spectator,
  I want to watch a live battle in real time,
  So that I can feel the excitement and place a bet.

As a Spectator,
  I want to stake any ERC-20 token on a battle,
  So that I don't need to acquire a specific token to participate.

As a Breeder,
  I want to combine two of my agents,
  So that I can create offspring with superior inherited traits.

As any user,
  I want the app to feel like a AAA game,
  So that using Pantheon is inherently enjoyable, not just functional.
```

---

## 7. Non-Functional Requirements

### 7.1 Performance

- Landing page First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Canvas animation: 60fps on MacBook Pro M1, 30fps on mid-range Windows laptop
- Max Three.js draw calls: 80
- JS bundle (tree-shaken): < 400kb gzipped

### 7.2 Reliability

- Battle loop must handle AXL message loss gracefully (retry + timeout)
- KeeperHub must retry failed TXs with exponential backoff (max 3 retries)
- SSE connection must auto-reconnect on drop
- Smart contracts must have reentrancy guards on all value-transferring functions

### 7.3 Security

- All agent directives encrypted before 0G Storage write
- ERC-7857 iNFT ownership enforced on all mutation methods
- Referee verdict signed by referee private key, verified on-chain via ECDSA.recover
- Uniswap v4 hook validates beforeSwap that battle is active
- Commit-reveal for breeding legendary roll (no miner manipulation)

### 7.4 Accessibility

- Keyboard navigable UI
- Alt text on all SVG illustrations
- Colour contrast AA on all text
- prefers-reduced-motion respected for all animations

### 7.5 Browser Support

- Chrome 120+, Firefox 121+, Safari 17+ (WebGL 2 required)
- No IE, no mobile (v1)

---

## 8. Design Principles

1. **Every sponsor tech is load-bearing** — if you remove any single piece, the product stops working.
2. **Mythology is the design language** — every UI element has a Greek mythology equivalent.
3. **The demo is the product** — build the 3-minute demo script first, then build what it requires.
4. **Game feel over feature count** — a visceral, polished experience beats a feature-complete but boring one.
5. **Eternal on-chain** — everything that matters (agent identity, battle history, rankings) lives on immutable storage.

---

## 9. Out of Scope (v1)

- Multi-chain deployment (0G testnet only)
- Mobile app
- Social features (chat, follows, notifications)
- Agent marketplace (buy/sell agents)
- Governance / DAO
- Fiat on-ramp
- KYC / compliance layer

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| 0G testnet instability | Medium | High | Mock fallback for demo, local Anvil fork |
| AXL node connectivity | Medium | High | Docker compose multi-node tested locally before demo |
| Uniswap v4 hook bug | Medium | High | Unit tests on Foundry, fallback to simulated settlement |
| ENS L2 subname delay | Low | Medium | Pre-register test names on Day 1 |
| Theatre.js sequence timing | Low | Medium | Exported JSON sequences are deterministic, no runtime risk |
| Demo laptop WebGL performance | Medium | Medium | Reduce bloom intensity + polygon count if needed |

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| **iNFT** | Intelligent NFT — ERC-7857 token with encrypted on-chain intelligence pointer |
| **God-Forge** | The agent creation wizard — Step 1: archetype, Step 2: ENS name, Step 3: directive |
| **Directive** | The natural-language system prompt that defines an agent's personality and strategy |
| **Akashic Ledger** | The 0G Storage Log where all battle transcripts are stored permanently |
| **Hermes Mesh** | The Gensyn AXL peer-to-peer network over which agents communicate |
| **Agora Pool** | The Uniswap v4 custom hook managing spectator wagers per battle |
| **Apotheosis** | The season championship — the moment a champion's name is carved on-chain |
| **ELO** | Rating system for agent skill level, stored in 0G Storage + ENS text records |

---

*Pantheon PRD v1.0 — ETHGlobal OpenAgents 2026*
