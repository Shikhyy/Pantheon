# Pantheon — App Flow

> Complete user journey, screen transitions, state changes, and data flows.

---

## 1. High-Level App Map

```
                        ┌─────────────────────────────────────────┐
                        │           LANDING PAGE                   │
                        │   Temple hero → anime story → stats      │
                        └──────────┬──────────────────────────────┘
                                   │ Connect Wallet
                        ┌──────────▼──────────────────────────────┐
                        │           THE AGORA                      │
                        │   Agent grid, filter, challenge          │
                        └──┬──────────┬───────────────┬───────────┘
                           │          │               │
               ┌───────────▼───┐ ┌────▼──────┐ ┌────▼──────────┐
               │  GOD-FORGE    │ │ COLOSSEUM │ │ HALL OF       │
               │  Create agent │ │ Live battle│ │ LEGENDS       │
               └───────────┬───┘ └────┬──────┘ └───────────────┘
                           │          │
               ┌───────────▼───┐ ┌────▼──────────────────────────┐
               │  MY PANTHEON  │ │  BATTLE RESULT                 │
               │  Dashboard    │ │  Settlement, ELO, prizes       │
               └───────────────┘ └───────────────────────────────┘
```

---

## 2. Screen-by-Screen Flow

### 2.1 Landing Page

**Route:** `/`

**Entry:** First visit, no wallet required.

**What the user sees:**
1. Three.js temple scene loads (R3F canvas). Camera starts at Z=28, slow orbit.
2. Animated night sky, torch flames, hero agent medallion floating.
3. GSAP ScrollTrigger activates — scrolling pulls camera toward temple (Z: 28 → 8).
4. As camera moves, HTML overlay sections reveal via IntersectionObserver + Framer Motion.

**Scroll sections (Wild Athens editorial style):**
```
SECTION I   — Hero headline + CTA buttons + live stats counter
SECTION II  — Anime story panel: Prologue (Prometheus)
SECTION III — Anime story panel: Act I (Temple of 0G, agent birth)
SECTION IV  — Anime story panel: Act II (Colosseum battle)
SECTION V   — Anime story panel: Apotheosis (champion ascends)
SECTION VI  — Roman numeral "The Ways": Forge / Fight / Breed / Ascend
SECTION VII — Hall of Legends preview (top 4 agents)
SECTION VIII — Tech stack attribution (0G · ENS · AXL · Uniswap · KeeperHub)
FOOTER
```

**Marquee ticker:** Continuous horizontal scroll — "Forge your god · Enter the arena · Breed legends · Wager on fate · Claim apotheosis · Built on 0G · ENS · AXL..."

**Audio:** Temple wind loop fades in, torch crackle positional.

**CTAs:**
- "Summon Your God" → `/forge`
- "Watch the Origin" → Scrolls to anime story section
- Nav links → respective routes

**State changes:**
- `Zustand.cameraPhase` updates as scroll position changes
- `Zustand.torchIntensity` pulses as a sine wave

---

### 2.2 Wallet Connect

**Trigger:** Any CTA that requires wallet (God-Forge, challenge, wagering).

**Flow:**
```
User clicks "Connect Wallet"
        │
        ▼
RainbowKit modal opens
        │
        ▼
User selects wallet (MetaMask, WalletConnect, Coinbase)
        │
        ▼
Wagmi detects chain → if not 0G testnet (chainId: 16600):
  prompt network switch
        │
        ▼
Wallet connected → ENS reverse lookup for display name
        │
        ▼
Zustand.address set, Zustand.ensName set (if found)
        │
        ▼
Nav shows truncated address or ENS name
```

**State changes:**
- `useAccount` hook (wagmi) populates address
- React Query: `useEnsName(address)` cached 60s

---

### 2.3 God-Forge — Agent Creation

**Route:** `/forge`

**Step 1 — Choose Archetype**
```
4 archetype cards displayed in 2×2 grid
  Strategist | Oracle
  Berserker  | Diplomat

User hovers → card glows, others dim (Framer opacity 0.4)
User clicks  → selection ring animates in (Theatre.js sequence)
             → Zustand.forgeState.archetype set
             → "Next" button activates
```

**Step 2 — Name Your God**
```
Text input renders
User types → debounce 400ms
           → ENS availability check fires:
             GET /api/ens/check?name={input}
             └─ calls ensjs.getOwner("input.pantheon.eth")
           → 3 states: typing (dots), checking (spinner), available (✓), taken (✗)

On available:
  Name inscription animates letter-by-letter (GSAP stagger)
  Shows "achilles.pantheon.eth" in Cinzel font
  Howler: ens-carve.mp3 fires per letter

Zustand.forgeState.name set on valid available name
```

**Step 3 — Write Directive**
```
Textarea for 2–3 sentence system prompt
  Character counter styled as amphora fill SVG
  3 preset buttons (inject template via GSAP typewriter)

Preview card shows agent will appear in Agora

User clicks "Forge" → ForgeSequence begins:
```

**Forge Sequence (Theatre.js timeline):**
```
Stage 1: Encrypting soul          (icon: lock → spin)
  └─ AES-GCM encrypt directive with user's public key
  └─ POST to 0G Storage KV

Stage 2: Writing to 0G Storage    (icon: cloud-upload → progress)
  └─ 0G Storage write confirms
  └─ storageHash received

Stage 3: Minting iNFT             (icon: hexagon → crystallise)
  └─ KeeperHub MCP: PantheonAgent.mint(archetype, name, storageHash)
  └─ TX hash displayed live as it lands
  └─ Howler: forge-ignite.mp3

Stage 4: Registering ENS          (icon: chain-link → connect)
  └─ KeeperHub: PantheonSubnames.registerSubname(name, tokenId)
  └─ ENS text records batch-written
  └─ Howler: ens-carve.mp3 (slower, ceremonial)

Stage 5: Awakening                (icon: spark → burst)
  └─ R3F ForgeMiniscene: molten droplet → crystallise → rise animation
  └─ Agent card floats up from forge

Success state:
  Agent card displayed with ENS name, archetype crest, ELO 1200
  "Share" button generates OG image
  "Enter the Agora" CTA → /agora
```

---

### 2.4 The Agora — Agent Marketplace

**Route:** `/agora`

**Data loading (React Query + RSC):**
```
Server Component fetches:
  - Top 20 agents by ELO from 0G Storage
  - Each agent's ENS text records (name, elo, rank, archetype, wins, losses)
  - Cached 30s, background refetch

Client hydration:
  - Real-time ELO updates via SSE subscription
  - User's own agents highlighted (address match)
```

**Filter bar:**
```
Filter chips: All · Olympians · Titans · Gods · Heroes · Demigods
Sort: ELO (default) · Win Rate · Battle Count · Newest
Toggle: "My agents only"
```

**Agent card interactions:**
```
Hover:
  - Card border brightens (Framer)
  - Top gold shimmer line fades in
  - Cursor: pointer

Click card body → Agent Profile modal opens:
  - Full stat block (ELO history sparkline, skill radar chart)
  - Battle history (last 5 battles from 0G Log)
  - Lineage tree (if bred)
  - Strategy fingerprint hash
  - "Issue Challenge" button

Click "Issue Challenge" →
  Challenge modal opens inline:
    - Wager amount input
    - Token selector (any ERC-20)
    - Defender info shown
    - "Lock Wager" button
    └─ KeeperHub: BattleArena.challenge(defenderTokenId, wagerToken, wagerAmount)
    └─ Challenge created on-chain
    └─ Toast notification: "Challenge issued. Defender has 24h to accept."
```

---

### 2.5 The Colosseum — Live Battle

**Route:** `/colosseum/[battleId]`

**Entry paths:**
- From challenge accepted notification
- From "Watch Live" on active battle card
- Direct URL

**Page structure (CSS 3D parallax arena):**
```
Layer Z=-600px:  Stone arch silhouettes (static SVG)
Layer Z=-300px:  Crowd particle system (bobbing dots)
Layer Z=0px:     Arena floor + VS divider line
Layer Z=+80px:   Agent avatar panels (left + right)
Layer Z=+160px:  UI overlays (health bars, stats, log)

Mouse move → CSS custom properties --rx, --ry update
Each layer shifts at different multiplier → parallax depth
```

**Battle state machine:**
```
PENDING     → Waiting for defender to accept
PREPARING   → Both AXL nodes connecting
ROUND_1..5  → Active battle round
  ├─ Agent A: 0G Compute → AXL send move
  ├─ Agent B: 0G Compute → AXL send move
  └─ Referee: score round → AXL broadcast
DISPUTE     → Optional jury phase (1h window)
SETTLED     → KeeperHub fires 3 TXs
COMPLETE    → Result displayed
```

**Live data flow:**
```
SSE bridge (FastAPI) subscribes to:
  0G Storage KV: battle:{id}:state
  AXL /recv: battle:{id} topic messages

SSE events → DivinWhisperLog component:
  type: "axl_message" → new whisper entry slides in
  type: "round_score" → HealthBar GSAP tween fires
  type: "round_start" → round counter increments
  type: "battle_end"  → victory sequence triggers

EventSource in React:
  useEffect(() => {
    const es = new EventSource(`/api/battle/${battleId}/stream`)
    es.onmessage = (e) => useGameStore.getState().addBattleEvent(JSON.parse(e.data))
    return () => es.close()
  }, [battleId])
```

**Victory sequence (Theatre.js):**
```
Keyframe 0ms:    Referee final verdict arrives
Keyframe 80ms:   Camera shake (translateX oscillation)
Keyframe 160ms:  LightningStrike SVG path draw (stroke-dashoffset 400→0)
Keyframe 240ms:  White flash overlay opacity 0→1→0
Keyframe 320ms:  Winner side: golden particle burst (R3F Sparkles)
Keyframe 400ms:  Loser side: fade to grayscale (CSS filter transition)
Keyframe 600ms:  Scoreboard modal slides up
Keyframe 800ms:  ELO delta numbers float up and fade (±number animations)
Keyframe 1200ms: KeeperHub TX badge appears per settlement TX
Keyframe 2000ms: "View on Explorer" link live with TX hashes
```

**Wager Pool (AgoraPool):**
```
Before battle:   "Wagering opens in: [countdown]"
During battle:   Split bar shows Fighter A% / Fighter B%
                 Token logos stream into bar on new deposit
                 "Bet on Athena-III" / "Bet on Ares-VII" buttons
After battle:    "Claiming prizes..." → KeeperHub settlement
                 Spectator P&L shown per address
```

---

### 2.6 Battle Settlement Flow

```
Referee agent signs verdict: { winner, scores, battleId }
        │
        ▼
KeeperHub MCP receives: BattleArena.submitResult(battleId, winner, signedVerdict)
        │
  ┌─────┼─────────────────────────────┐
  │     │                             │
  ▼     ▼                             ▼
TX 1:  TX 2:                        TX 3:
ELO    Uniswap v4 AgoraPool.settle() iNFT XP update
update ├─ 70% → winning spectators   PantheonAgent.updateStats()
on 0G  ├─ 20% → winner owner        └─ rank upgrade if threshold
+ENS   └─ 10% → treasury
text
record
update
        │
        ▼
All 3 TX hashes broadcast via SSE to frontend
        │
        ▼
Battle transcript appended to 0G Storage Log: battles/{battleId}/transcript
Battle proof written to 0G DA layer
        │
        ▼
Leaderboard updates (React Query invalidation)
ENS text records readable immediately by any resolver
```

---

### 2.7 Hall of Legends

**Route:** `/legends`

**Data:**
```
Leaderboard: 0G Storage KV "season:{id}:leaderboard"
  + ENS text record resolution per agent
  + Season timer from smart contract

Replay browser: 0G Storage Log namespace "battles/"
  + List all battles, paginated
```

**Interactions:**
```
Click agent row → agent profile modal
Click "View Replay" → load transcript from 0G Log
                    → animate battle playback (round by round)
Season champion panel → zeus.pantheon.eth ENS card
                      → laurel wreath NFT displayed
```

---

### 2.8 My Pantheon — Dashboard

**Route:** `/dashboard`

**Sections:**
```
My Agents        → owned iNFTs, manage directives, pending challenges
Wager History    → all spectator bets, P&L, pending settlements
Achievements     → soul-bound badges (ERC-5192), progress to locked ones
ENS Profile      → all text records per agent, edit button
KeeperHub Log    → TX history routed through KeeperHub (audit trail)
```

---

## 3. Navigation State Machine

```
Initial:
  wallet = null
  page = "landing"

After connect:
  wallet = "0x..."
  can access all pages

Route transitions (Framer Motion AnimatePresence):
  All transitions: new page slides up from below (marble slab rise)
  Duration: 400ms, ease-out-quart
  R3F canvas: persists across all transitions (never unmounted)
  Scene swaps: Zustand.cameraPhase drives which 3D content renders
```

---

## 4. Real-Time Data Architecture

```
                    ┌─────────────────┐
                    │  0G Storage KV  │
                    │  battle state   │
                    └────────┬────────┘
                             │ poll/subscribe
                    ┌────────▼────────┐
                    │  FastAPI SSE    │
                    │  Bridge         │
                    │  /api/battle/   │
                    │  {id}/stream    │
                    └────────┬────────┘
                             │ EventSource
                    ┌────────▼────────┐
                    │  Zustand store  │
                    │  battleLog[]    │
                    │  roundScores[]  │
                    └────────┬────────┘
                             │ re-render
              ┌──────────────┴──────────────────┐
              │                                  │
     ┌────────▼────────┐               ┌────────▼────────┐
     │ DivinWhisperLog │               │  HealthBar       │
     │ (AXL messages)  │               │  (GSAP tween)    │
     └─────────────────┘               └─────────────────┘
```

---

## 5. Error States

| Error | User-Facing Message | Recovery |
|-------|---------------------|----------|
| Wallet not connected | "Connect your wallet to enter the Temple" | Show connect button |
| Wrong network | "Switch to 0G Testnet to continue" | One-click network switch |
| ENS name taken | "This name has been claimed by another god" | Show alternatives |
| Battle TX failed | "The forge failed. KeeperHub is retrying..." | Auto-retry shown |
| SSE disconnected | Subtle reconnecting indicator in Whisper Log | Auto-reconnect |
| AXL node offline | "The Hermes Mesh is unreachable. Battle will timeout." | Dispute mechanism |
| 0G Storage timeout | "The Akashic Ledger is slow. Retrying..." | Cached fallback |

---

*Pantheon App Flow v1.0 — ETHGlobal OpenAgents 2026*
