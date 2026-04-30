# Pantheon — Implementation Plan

> Day-by-day, hour-by-hour execution roadmap. Designed for a 4-person team over 12 days.

---

## 1. Team Structure

```
Person A — Smart Contracts (Blockchain Dev)
  └── All 5 Solidity contracts, Foundry tests, deploy scripts

Person B — Agent Backend (Python Dev)
  └── Battle loop, referee, 0G client, AXL integration, KeeperHub, SSE bridge

Person C — Frontend Core (React/Next.js Dev)
  └── Design system, landing page, Agora, God-Forge wizard, Zustand store

Person D — 3D / Animation (Three.js / GSAP Dev)
  └── R3F canvas, shaders, Theatre.js sequences, Colosseum, agent avatars
```

**Shared responsibilities:**
- Integration testing (all 4)
- Demo video (Person C + D)
- README / FEEDBACK.md (Person A + B)
- ETHGlobal submission form (Person A)

---

## 2. Critical Path

```
The demo must work end-to-end by Day 9.
Days 10–12 are polish + submission only.
NEVER polish before the full path works.

Critical path:
  Wallet connect
  → ENS name check
  → Agent mint (iNFT + ENS subname)
  → Challenge issued (BattleArena.sol)
  → Battle starts (AXL nodes connect)
  → 5 rounds (0G Compute + AXL)
  → Settlement (KeeperHub 3 TXs)
  → Leaderboard updated (0G Storage + ENS)
```

---

## 3. Day-by-Day Plan

### Day 1 — Foundation (All 4 people)

**Morning (4h): Setup**
```
All:
  [ ] Clone monorepo, install deps (pnpm install)
  [ ] Confirm 0G testnet RPC accessible
  [ ] Confirm AXL binary compiles (go build ./cmd/axl)
  [ ] Deploy test wallet with 0G testnet OG tokens
  [ ] Set up .env files from .env.example

Person A:
  [ ] Foundry project init (forge init contracts/)
  [ ] Install OpenZeppelin 5.x dependencies
  [ ] Install Uniswap v4-core, v4-periphery

Person B:
  [ ] Python venv, pip install -r requirements.txt
  [ ] Test 0G Storage KV write/read (smoke test)
  [ ] Test 0G Compute inference call (single LLM call)

Person C:
  [ ] Next.js 15 app created with App Router
  [ ] Tailwind 4 configured with Greek design tokens
  [ ] Google Fonts loaded (Cinzel, IM Fell English, Josefin Sans)

Person D:
  [ ] Three.js + R3F + Drei installed and canvas renders
  [ ] Basic BoxGeometry test confirms WebGL works
```

**Afternoon (4h): First integrations**
```
Person A:
  [ ] PantheonAgent.sol skeleton (ERC-721 base, no logic yet)
  [ ] Deploy to local Anvil fork of 0G testnet
  [ ] Verify on local explorer

Person B:
  [ ] AXL docker-compose up — 3 nodes running
  [ ] Two nodes successfully exchange a test message via /send + /recv
  [ ] AXL topology endpoint shows both nodes as peers

Person C:
  [ ] Wagmi + RainbowKit installed and wallet connects
  [ ] 0G testnet added as custom chain
  [ ] Nav component renders with wallet button

Person D:
  [ ] NightSky component: 2000-point star field on canvas
  [ ] TempleScene renders with placeholder geometry
  [ ] GSAP ScrollTrigger: camera moves on scroll (Z only)
```

**Day 1 milestone:** All 4 systems run independently. AXL nodes talk. 0G storage responds. Wallet connects. Stars render.

---

### Day 2 — Core Contracts + Agent Loop

**Person A:**
```
[ ] PantheonAgent.sol complete:
    - ERC-7857 iNFT (ERC-721 base + intelligence pointer)
    - mint(archetype, name, storageHash)
    - updateStats(tokenId, newElo, newXp, newRank) — onlyBattleArena
    - tokensOfOwner(address)
    - Rank enum: Demigod/Hero/God/Titan/Olympian
    - AgentMinted event, RankAscended event
[ ] Deploy PantheonAgent.sol to 0G testnet
[ ] forge test — 5 tests passing (mint, stats update, rank, ownership, events)
[ ] BattleArena.sol skeleton:
    - Challenge struct definition
    - challenge() function with wager lock
    - accept() function
    - Storage mappings
```

**Person B:**
```
[ ] og_client.py: kv_set, kv_get, log_append, load_agent_memory — all tested
[ ] axl_client.py: send, recv, wait_for_ready, get_topology — all tested
[ ] battle_loop.py: full 5-round loop with mock 0G Compute responses
[ ] First REAL end-to-end agent test:
    - Agent A starts, loads memory (empty), generates move via 0G Compute
    - Move sent via AXL
    - Agent B receives and responds
    - Console output shows full exchange
```

**Person C:**
```
[ ] Zustand store (store.ts) complete with all interfaces
[ ] wagmi contract hooks (contracts.ts) for PantheonAgent
[ ] ENS availability check hook (ens.ts + /api/ens/check route)
[ ] ForgeWizard Step 1 (archetype selection) renders correctly
[ ] ForgeWizard Step 2 (ENS name input) with live availability check
```

**Person D:**
```
[ ] ParthenaSilhouette: procedural temple geometry (BoxGeometry columns)
[ ] TorchSystem: flame vertex shader + PointLight per torch
[ ] MarbleShader.glsl written and applied to columns
[ ] AgentMedallion placeholder (sphere with marble material)
[ ] Float + slow orbit animation on medallion
```

**Day 2 milestone:** PantheonAgent deployed. Battle loop exchanges messages. God-Forge steps 1+2 work. Temple 3D scene complete.

---

### Day 3 — Battle Core

**Person A:**
```
[ ] BattleArena.sol complete:
    - challenge() with KeeperHub-routed wager lock
    - accept() opens AgoraPool
    - submitResult(battleId, winner, signature) with ECDSA verify
    - dispute() stub (jury mechanism placeholder)
    - BattleCreated, BattleSettled events
    - ReentrancyGuard on all value functions
[ ] forge test BattleArena — 8 tests
[ ] PantheonSubnames.sol:
    - ENS L2 subname registrar
    - registerSubname(name, tokenId)
    - setAgentRecords(tokenId, records) batch write
    - updateRecords(tokenId, elo, rank, wins, losses)
```

**Person B:**
```
[ ] referee.py: full 5-round scoring via 0G Compute
[ ] referee.py: ECDSA result signing
[ ] keeperhub_client.py: execute_transaction, wait_for_confirmation
[ ] First REAL settlement test:
    - Battle completes
    - Referee signs result
    - KeeperHub submits submitResult TX
    - TX hash confirmed
[ ] sse_bridge.py: FastAPI server, /battle/{id}/stream SSE endpoint
```

**Person C:**
```
[ ] ForgeWizard Step 3 (directive textarea with amphora fill counter)
[ ] Forge sequence: 5-stage progress with Theatre.js (first pass, no R3F)
[ ] AgentCard component complete (all stat bars, rank pill, challenge button)
[ ] Agora page RSC: server-fetches 20 agents from 0G Storage
[ ] Agora filter bar (rank chips, sort)
```

**Person D:**
```
[ ] GroundFog: FBM shader on PlaneGeometry
[ ] ForgeMiniscene: mini R3F canvas for forge crystallise animation
[ ] Theatre.js project initialised, forge sequence keyframes authored
[ ] AgentMedallion improved: marble vein texture, Greek crown geometry
[ ] Post-processing: Bloom + DepthOfField + Vignette live
```

**Day 3 milestone:** Full battle loop works (A ↔ B ↔ Referee ↔ KeeperHub). Agora renders real agents. Theatre.js forge animation plays.

---

### Day 4 — Uniswap + ENS + Identity

**Person A:**
```
[ ] AgoraPool.sol (Uniswap v4 hook):
    - beforeSwap: validate battle is active
    - afterSwap: record spectator position
    - settle(): 70/20/10 distribution
    - UniswapX routing setup
    - HookMiner to find valid hook address (flags: BEFORE_SWAP + AFTER_SWAP)
[ ] forge test AgoraPool — 6 tests
[ ] BreedingForge.sol skeleton:
    - breed(parent1, parent2) requires 5+ battles each
    - _computeTraits() stub
    - commit-reveal for legendary roll
[ ] Deploy AgoraPool.sol to Unichain testnet
[ ] Start FEEDBACK-uniswap.md — document every integration friction point
```

**Person B:**
```
[ ] Agent opponent model: save/load after each battle
[ ] Update 0G Storage Log with full transcript after battle
[ ] og_client.py: load_agent_memory now returns real battle history
[ ] Test agent adapting strategy across 2 sequential battles (memory working)
[ ] Start FEEDBACK-keeperhub.md
[ ] keeperhub_client.py: update_ens_records, x402 payment stub
```

**Person C:**
```
[ ] ENS text record reading in Agora (getAgentRecords per card)
  - ELO, rank, wins/losses now come from ENS (not hardcoded)
[ ] Challenge modal: wager amount + token selector
[ ] Challenge flow: KeeperHub TX issued, toast notification
[ ] Agent profile modal: full stat block, battle history
[ ] Wallet disconnect / reconnect edge cases handled
```

**Person D:**
```
[ ] BattleStage.tsx: CSS 3D parallax container (5 depth layers)
    - Stone arches Z=-600px
    - Crowd particle CSS Z=-300px
    - Arena floor Z=0
    - Agent avatars Z=+80px
    - UI overlays Z=+160px
[ ] Mouse move → CSS custom property --rx/--ry update
[ ] DivinWhisperLog: SSE feed renders, messages slide in
[ ] HealthBar: GSAP tween on hit, shake animation
[ ] AgoraPool wager bar: split bar + token logos
```

**Day 4 milestone:** Full financial flow. Spectator wager works. ENS text records live. Colosseum CSS 3D arena renders.

---

### Day 5 — Memory, Breeding, Hall of Legends

**Person A:**
```
[ ] BreedingForge.sol complete:
    - breed() full implementation
    - _computeTraits(): ELO-weighted average + noise
    - Legendary roll: commit-reveal, 1% chance at God+
    - ERC-5192 soul-bound achievement minting (First Blood, Oracle, etc.)
[ ] forge test BreedingForge — 5 tests
[ ] Deploy all contracts to 0G testnet, document addresses
[ ] Verify all contract addresses on 0G explorer
[ ] Write deploy script (Deploy.s.sol) for one-shot deploy
```

**Person B:**
```
[ ] Battle memory: agents now load past 5 battles from 0G Log
[ ] Opponent model: agents build and use opponent profiles
[ ] AXL collaborative learning: agents receive referee score reasoning
    and adapt strategy mid-battle (rounds 4-5 use learning from rounds 1-3)
[ ] SSE bridge: emits per-round score events, settlement TX hashes
[ ] Docker compose tested: all 3 AXL nodes + SSE bridge running together
[ ] Full end-to-end test: start battle → complete 5 rounds → settle → verify TXs
```

**Person C:**
```
[ ] Hall of Legends page: leaderboard from 0G Storage + ENS resolution
[ ] Season timer from BattleArena.sol
[ ] Battle replay: load transcript from 0G Log, animate round by round
[ ] My Pantheon dashboard: owned agents, wager history, achievements
[ ] ENS text record display + edit (update directive)
[ ] KeeperHub TX audit trail displayed in dashboard
```

**Person D:**
```
[ ] Agent avatar system complete (see avatar.md)
    - 4 archetype base geometries modelled
    - Idle animation (breathing, weapon movement)
    - Hit animation (GSAP trigger)
    - Victory animation (Theatre.js sequence)
    - Defeat animation (greyscale + slump)
[ ] LightningStrike component (SVG path draw + GSAP)
[ ] Victory sequence Theatre.js keyframes complete
[ ] Howler AudioProvider with all sound effects loaded
```

**Day 5 milestone:** Agents have memory. Breeding works. Hall of Legends live. Avatars animated. All contracts deployed.

---

### Day 6 — Integration Day

**All 4 people together:**
```
MORNING: Full critical path run
  [ ] Fresh wallet → connect → forge agent → challenge → battle → settle → leaderboard
  [ ] Every step logged, every failure documented

AFTERNOON: Fix everything broken from morning run
  [ ] Fix AXL connection issues (most likely failure point)
  [ ] Fix ENS subname registration (second most likely)
  [ ] Fix KeeperHub gas estimation edge cases
  [ ] Fix SSE reconnection on disconnect

EVENING: Second full path run
  [ ] Same flow, should work cleanly
  [ ] Record screen for reference
```

---

### Day 7 — Landing Page + Story

**Person C + D: Landing page full build**
```
[ ] Wild Athens editorial style landing implemented
    - Hero section: temple + amphora SVG + stats counters
    - Roman numeral "The Ways" sections (I, II, III)
    - Marquee ticker
    - Hall of Legends preview (top 4)
    - Tech attribution footer
[ ] Anime story panels (4 chapters):
    - IntersectionObserver reveal on each panel
    - SVG illustrated scenes (Prometheus, Temple, Colosseum, Apotheosis)
    - Ink-spread clip-path reveal animation
    - IM Fell English lore text
[ ] GSAP scroll camera path refined and smooth
[ ] Framer Motion page transitions (marble slab rise)
```

**Person A + B: Documentation + security**
```
[ ] FEEDBACK-uniswap.md complete (minimum 500 words, specific friction)
[ ] FEEDBACK-keeperhub.md complete (minimum 400 words)
[ ] Security review: reentrancy guards on all contracts
[ ] Foundry fuzz tests for AgoraPool settlement math
[ ] README architecture diagram (ASCII + markdown)
[ ] Gas report from forge snapshot
```

---

### Day 8 — Polish Pass 1

```
Person A: Contract deployment verification
  [ ] Re-deploy all contracts fresh to 0G testnet
  [ ] All contract addresses documented in README
  [ ] 0G explorer links for each contract
  [ ] Verify PantheonSubnames.sol ENS registration on explorer

Person B: Agent reliability
  [ ] Handle AXL message loss gracefully (retry + timeout)
  [ ] Handle 0G Compute timeout (fallback response)
  [ ] Handle KeeperHub TX failure (3 retry with backoff)
  [ ] Log all events to structured JSON (for audit)

Person C: UI polish
  [ ] God-Forge: Theatre.js forge sequence perfected
    - Each stage syncs with real TX hash
    - Howler SFX fires at each stage
  [ ] Stone carving text animation on ENS registration
  [ ] AgentCard hover states refined
  [ ] Challenge modal: token selector + UniswapX routing display

Person D: 3D polish
  [ ] Temple scene: add volumetric god rays (light shaft geometry)
  [ ] Star field: add 10 larger "hero stars" (Olympians) that pulse gold
  [ ] Agent medallion: add archetype-specific particle orbit colours
  [ ] Colosseum crowd: particle system with subtle bob animation
  [ ] Torch ember particles tuned (40 per torch)
```

---

### Day 9 — Full Demo Run

**Morning: Complete demo run (all 4 people)**
```
[ ] Run the full 3-minute demo script exactly as written
[ ] Time each segment
[ ] Identify any visual/performance issues
[ ] Note any talking points that need reinforcement
```

**Afternoon: Demo fixes**
```
[ ] Fix any broken demo moments (priority 1)
[ ] Ensure AXL topology display works for demo (shows 2 nodes)
[ ] Ensure 0G Storage explorer link shows transcript
[ ] Ensure ENS record update is visible post-battle
[ ] Ensure KeeperHub shows 3 TX hashes post-settlement
```

**Evening: Performance audit**
```
[ ] Lighthouse run: target 80+ performance
[ ] Three.js stats panel: confirm < 80 draw calls at 60fps
[ ] Bundle analyser: confirm < 400kb JS
[ ] Mobile: confirm no JS errors (not full mobile support, just no crashes)
```

---

### Day 10 — Polish Pass 2

```
[ ] All animations at correct speed (not too fast, not slow)
[ ] All sound effects timed to visual events
[ ] All error states display correctly (wrong network, TX fail, etc.)
[ ] All loading states display correctly
[ ] Amphora SVG on landing page refined
[ ] Meander borders on all card edges
[ ] Roman numeral counters on Hall of Legends
[ ] Season championship countdown timer live
[ ] OG image generated correctly for social sharing
[ ] Vercel preview deployment live
```

---

### Day 11 — Submission Prep

**Morning:**
```
[ ] README.md final review:
    - Architecture diagram
    - Setup instructions (clear, tested on fresh machine)
    - Contract addresses table
    - Per-track integration explanation for all 5 sponsors
    - AI tool usage disclosure (Claude Code etc.)
    - Team Telegram + X handles
    - Live demo URL
    - Demo video link (unlisted YouTube or Loom)

[ ] Demo video recorded (3 minutes, timestamped):
    0:00 Landing page + temple
    0:20 God-Forge + ENS registration
    0:45 Challenge issued
    1:00 AXL terminal split-screen
    1:30 Colosseum live battle
    2:00 Victory + KeeperHub TXs
    2:30 0G Storage explorer (Akashic Ledger)
    2:50 Hall of Legends
```

**Afternoon:**
```
[ ] ETHGlobal submission form:
    - All 5 partner prizes selected
    - Per-track integration writeup (100-200 words each)
    - FEEDBACK.md files referenced
    - Contract addresses
    - GitHub repo (public)
    - Vercel demo URL
    - Demo video URL
    - Team contacts

[ ] Git history review:
    - Meaningful commit messages throughout
    - No single large "initial commit"
    - All team members have commits
```

---

### Day 12 — Buffer + Final Submit

```
[ ] Final smoke test: full demo path on live Vercel + 0G testnet
[ ] Any last-minute bugs fixed
[ ] Submission form verified complete
[ ] All required files confirmed:
    - FEEDBACK-uniswap.md in repo root ← DISQUALIFYING if missing
    - FEEDBACK-keeperhub.md in docs/
    - README.md
    - All contracts verified on explorer
[ ] Submit before deadline
[ ] Prepare 7-minute finals presentation (4 min demo + 3 min Q&A prep)
```

---

## 4. Risk Register

| Risk | Probability | Impact | Contingency |
|------|-------------|--------|-------------|
| 0G testnet goes down | Medium | High | Anvil fork pre-configured, switch demo to local |
| AXL P2P connection fails on demo machine | Medium | High | Pre-run battle, save transcript, replay from 0G Log |
| Uniswap v4 hook address mining fails | Low | High | Use pre-mined address, document in FEEDBACK.md |
| ENS subname registration slow | Low | Medium | Pre-register demo names on Day 1 |
| KeeperHub TX timeout | Medium | Medium | Auto-retry shown in UI, retry button |
| Theatre.js sequence desync | Low | Medium | Fallback to CSS animations |
| WebGL performance on demo laptop | Medium | Medium | Reduce bloom to 0.2, disable DoF |
| Build fails on Vercel | Low | High | Docker local deploy as backup |
| Not enough time for breeding | Medium | Low | Cut breeding from demo, not from code |
| AXL binary incompatible OS | Low | High | Docker container confirmed working Day 1 |

---

## 5. Definition of Done

A feature is "done" when:
1. It works in the critical path (forge → battle → settle)
2. Error states display correctly
3. TypeScript compiles with no errors
4. At least one test covers the core logic
5. The demo script mentions it and it works during demo run

A contract is "done" when:
1. Deployed to 0G testnet with verified address
2. Foundry tests pass (minimum 5 tests)
3. Address documented in README

---

## 6. Communication Protocol

```
Daily standup: 9:00 AM (15 min max)
  - What did you finish yesterday?
  - What are you doing today?
  - Any blockers?

Integration sync: 6:00 PM (30 min)
  - Demo path test
  - Cross-team dependencies resolved

Blockers: Post in team chat immediately, don't wait for standup
  - If blocked > 30 minutes, ask for help

Commit convention:
  feat(contracts): add BattleArena settle function
  feat(frontend): add AgentCard component
  fix(backend): handle AXL recv timeout
  chore: update env example
```

---

*Pantheon Implementation Plan v1.0 — ETHGlobal OpenAgents 2026*
