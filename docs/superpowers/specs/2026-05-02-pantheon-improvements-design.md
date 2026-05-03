# Pantheon Improvements - Design Specification

**Date:** 2026-05-02
**Project:** Pantheon - On-chain AI Agent Battle League
**Based on:** 2026-05-01-greek-3d-odyssey-design.md

## 1. Overview

Continue improving the Pantheon app by:
1. Fixing the broken landing page layout (ScrollTrigger issues)
2. Adding a unique Landing Portal (Parthenon Gate) distinct from Dashboard's Temple of Zeus
3. Adding horizontal parallax effect to landing page for 3D depth illusion
4. Polishing blockchain integration UI (ENS, Uniswap, Gensyn, AXL)
5. Enhancing navigation with Greek theming while preserving original logo
6. Improving page content across all routes

## 2. Landing Portal - "Parthenon Gate"

### 2.1 Concept
A majestic **Parthenon-style entrance** viewed from a distance — grand Doric columns receding into misty Athenian dawn. Unlike Temple of Zeus (close-up statue + columns), this is a **wide shot** of the entire temple front, partially veiled in atmospheric fog.

### 2.2 Visual Elements
- **Doric Colonnade:** 8 columns across, wide shot. Marble with gold capitals. Subtle shimmer animation on flutes.
- **Atmospheric Mist:** Ground fog + low-lying clouds. Obscures the base of columns. Creates depth and mystery.
- **Golden Glow:** Warm light emanating from between columns. Suggests something powerful within. Blooms in post-processing.
- **Dawn Sky:** Slightly lighter than other scenes — deep indigo fading to warm gold at horizon. Constellation of Athena visible.

### 2.3 Camera Position
- **Position:** `[0, 4, 18]` — further back than other scenes
- **LookAt:** `[0, 3, 0]` — centered on the pediment
- **Fog:** Exponential, density 0.025 — more atmospheric than other scenes
- **Lighting:** Warm directional from upper-left (dawn simulation)

### 2.4 Comparison: Landing vs Dashboard
| Element | Landing - Parthenon Gate | Dashboard - Temple of Zeus |
|---------|------------------------|--------------------------|
| Shot | Wide, temple from afar | Close-up, statue + 2 columns |
| Mood | Mysterious, inviting, grand | Intimate, personal, detailed |
| Fog | Heavy, atmospheric | Minimal |
| Camera | Static, slight slow-drift | Can orbit slightly |
| Transition IN | Fade from white mist | Fly through columns |

## 3. Horizontal Parallax on Landing

### 3.1 Concept
Create 3D depth illusion by moving layers at different speeds on mouse/touch horizontal input. Keep vertical scroll for storytelling.

### 3.2 Parallax Layer Structure
| Layer | Speed | Elements |
|-------|-------|----------|
| Background (Slowest, 0.2x) | 0.2x | Parthenon columns, dawn sky, distant mountains |
| Midground (Medium, 0.5x) | 0.5x | Athena constellation, golden glow, atmospheric particles |
| Foreground (Fastest, 0.8x) | 0.8x | Torch flames, dust motes, UI elements |

### 3.3 Implementation
```typescript
// Parallax calculation based on mouse position
const parallaxX = (mouseX / windowWidth - 0.5) * 200
bgLayer.position.x = parallaxX * 0.2
mgLayer.position.x = parallaxX * 0.5
fgLayer.position.x = parallaxX * 0.8
```

### 3.4 Interaction Model
- **Input:** Mouse drag (desktop) or touch swipe (mobile) horizontally
- **Range:** ±200px from center creates full parallax range
- **Vertical scroll:** Still drives GSAP ScrollTrigger for story panels
- **3D Canvas:** Camera doesn't move for parallax — layers within the 3D scene shift on X-axis using `group.position.x`. Camera flythrough transitions (via CameraFlythrough component) still work for navigating between sections.

## 4. ScrollTrigger Fixes

### 4.1 Problem
- **Hero section invisible on load:** `start: 'top 80%'` means hero never triggers (it's at top of page)
- **Content flashes:** Elements start at opacity 0 and never animate in if already visible
- **Stat counters broken:** Counters start at 0 but never trigger if already in view
- **Reveal sections inconsistent:** Some sections never become visible

### 4.2 Fixes
**Hero Section:**
- Animate immediately on page load, no ScrollTrigger
- 1.2s duration with `power3.out` easing for cinematic feel

**Story Panels:**
- Use `toggleActions: 'play none none reverse'` so they re-animate if user scrolls up
- Start at 85% viewport

**Stat Counters:**
- Check visibility on load
- Animate immediately if visible, otherwise use ScrollTrigger with 90% threshold

**The Ways Cards:**
- Stagger animation with 0.1s delay between cards
- Use `stagger: 0.1` in GSAP config

### 4.3 Viewport Safety
Add a safety check to ensure all content becomes visible eventually:
```typescript
setTimeout(() => {
  document.querySelectorAll('.reveal-section').forEach(el => {
    if (el.style.opacity === '0') {
      el.style.opacity = '1'
      el.style.transform = 'none'
    }
  })
}, 2000)
```

## 5. Blockchain Integration UI

### 5.1 ENS Names Display
Replace wallet addresses with ENS names:
- **Legends Page:** Show `agent.ensName` under agent name. Fallback to shortened address. Gold color for ENS, muted for address.
- **Agent Cards:** Display ENS name with Greek key pattern border. Click to copy full address. Hover shows address tooltip.
- **Forge Page:** During minting, show ENS name input. Suggest Greek deity names. Register on-chain via ENS registry.

### 5.2 Uniswap Wager UI (Agora)
```
┌─────────────────────────────┐
│  WAGER POOL                │
│  128 ETH in pool           │
├─────────────────────────────┤
│  EXCHANGE RATE             │
│  1 ETH = 2,450 USDC       │
│  via Uniswap v4           │
├─────────────────────────────┤
│  YOUR POSITION             │
│  Betting on Athen-ai (1.2 ETH) │
│  [████████████░░] 60%    │
└─────────────────────────────┘
```

### 5.3 Gensyn Verification Display
| Status | Display | Color |
|--------|---------|-------|
| Verified | `Gensyn AXL ✓` + Battle # + proof hash | `olivine` (#9AAA60) |
| Pending | `Gensyn AXL ⏳` + "Verifying battle #..." | `sky` (#85D3F2) |
| Failed | `Gensyn AXL ✗` + "Verification failed" | `hadria` (#8B3A3A) |

Show verification status in battle results. Link to Gensyn explorer for full proof.

### 5.4 AXL Swarm Status
Show in footer or settings panel:
- **Green:** Healthy (Nodes: 12+, Latency: <50ms, Compute: >80%)
- **Yellow:** Degraded (Nodes: 5-12, Latency: 50-100ms)
- **Red:** Disconnected (Nodes: <5 or unreachable)

## 6. Navigation Enhancements

### 6.1 Design
**Preserved:**
- Simple "PANTHEON" text logo (Cinzel Decorative, Gold #C9A84C, letter-spacing 0.2em)

**Enhanced:**
- Glass morphism background (`backdrop-blur` with semi-transparent marble)
- Active state: Greek key gradient underline (not plain line)
- Nav format: "Roman · LABEL" (e.g., "I · TEMPLE")
- Roman numeral badges on links (matches story panel style)

### 6.2 Mobile Navigation
- Hamburger menu (three lines)
- Slide-out panel with links
- Greek-themed overlay
- Touch-friendly (larger tap targets)

### 6.3 Camera Transition Indicator
When clicking a nav link, show brief indicator:
```
ENTERING
TEMPLE OF ZEUS
[======>    ] Camera transitioning...
```

## 7. Page Content Polish

### 7.1 Dashboard (Temple of Zeus)
- **My Agents:** Grid of agent cards with marble borders. Show ENS name, ELO rating, win/loss record. Gold border for top agent.
- **Quick Actions:** Large Greek-styled buttons: "Forge New Agent", "Enter Agora", "View Legends". Each with SVG icon + description.
- **Recent Battles:** Timeline view with Greek key dividers. Show opponent, result, ELO change. Green (`olivine`) for win, red (`hadria`) for loss.

### 7.2 The Ways (Landing Page)
The four paths presented on the landing page:
1. **Forge** (`/forge`) - Mint an AI god. Choose archetype, claim ENS name, write directive.
2. **Fight** (`/agora`) - Challenge rivals in 5 rounds of AI intellect.
3. **Breed** (`/forge/breeding`) - Combine two legends. Offspring inherit traits via 0G Compute.
4. **Ascend** (`/legends`) - Rise through ranks. Demigod to Olympian.

Each has SVG icon, Roman numeral, title, and description. Cards use `stone-card shimmer-line` styling.

### 7.2 Forge (Hephaestus Forge)
**Mint New Agent:**
1. Choose Archetype (Strategist, Oracle, Berserker, Diplomat) with SVG icons
2. ENS Name input with availability check
3. Write Directive (stored on 0G)
4. Forge button with gold styling

**Breed Agents:**
- Parent A + Parent B selection
- Offspring preview with blended traits
- "Computed via 0G Compute" indicator

### 7.3 Agora (Market Archway)
- **Betting Interface:** Two buttons (`sky` #85D3F2 for agent A, `hadria` #8B3A3A for agent B)
- **Wager Pool:** Show total pool, exchange rate via Uniswap v4
- **Battle List:** Scrollable upcoming battles with wager pools

### 7.4 Battle (Colosseum Gate)
- **Live Battle View:** Two agent avatars facing off. Round indicators (I-V). Whisper stream with color-coded scores.
- **Verification Badge:** Gensyn AXL verification status with link to proof.
- **Battle History:** Scrollable list of past battles with winner, score, verification status.

### 7.5 Legends (Hall of Gods)
- **Leaderboard:** Ranked list with ENS names displayed
- **Agent Cards:** ELO rating, win/loss record, rank badges
- **Filters:** Sort by ELO, wins, recent activity

## 8. Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Gold | Primary accent | `#C9A84C` | Buttons, active states, ELO ratings |
| Sky | Oracle/Strategist | `#85D3F2` | Oracle archetype, information |
| Olivine | Success/Green | `#9AAA60` | Win indicators, verification success |
| Hadria | Danger/Red | `#8B3A3A` | Berserker archetype, loss indicators |
| Sand | Primary text | `#D9A78B` | Body text, primary accent |
| Parch | Light text | `#F2E0D5` | Headings, light text |
| Nox | Background | `#07050F` | Page background |
| Deep | Card background | `#0E0A1A` | Card backgrounds |
| Stone | Borders | `#2A1E14` | Borders, dividers |
| Marble | Light surface | `#EDE8DC` | Light surfaces |

## 9. Acceptance Criteria

### Visual
- [ ] Landing page has unique Parthenon Gate portal (wide shot, misty)
- [ ] Horizontal parallax works on mouse/touch drag (3 layers at different speeds)
- [ ] Navigation preserves "PANTHEON" text logo with enhanced Greek theming
- [ ] SVG icons replace emojis throughout
- [ ] Color palette consistently applied (gold, sky, olivine, hadria)
- [ ] ENS names displayed instead of addresses where available

### Functionality
- [ ] Hero section visible immediately on page load (no ScrollTrigger)
- [ ] All story panels animate in correctly on vertical scroll
- [ ] Stat counters animate (immediately if visible, else on scroll)
- [ ] Gensyn verification status displayed in battle results
- [ ] Uniswap wager UI shows pool, rate, and user position
- [ ] AXL swarm status indicator visible

### Polish
- [ ] No broken layouts or missing sections
- [ ] Smooth animations and transitions throughout
- [ ] Greek aesthetic consistent across all pages
- [ ] Mobile responsive (hamburger menu, touch-friendly)
- [ ] Performance maintains 60fps on modern hardware
