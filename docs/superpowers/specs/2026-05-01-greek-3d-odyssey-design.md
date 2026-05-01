# Greek 3D Odyssey - Design Specification

**Date:** 2026-05-01
**Project:** Pantheon - On-chain AI Agent Battle League

## 1. Overview

Transform the Pantheon web application into an immersive 3D Greek odyssey with interactive camera transitions between pages. Each navigation section gets a themed Greek entrance with cohesive visual language.

## 2. Color Palette - Classic Athens

| Element | Color | Hex |
|---------|-------|-----|
| Marble White | Primary surfaces | `#F5F5F0` |
| Olympic Gold | Accents, borders, icons | `#D4AF37` |
| Aegean Blue | Night sky, UI accents | `#1a3a5c` |
| Terracotta | Warm elements, buttons | `#C45C26` |
| Deep Shadow | Backgrounds | `#0a0a0f` |
| Mist Gray | Fog, atmosphere | `#8a8a8a` |

## 3. Architecture

### 3.1 Unified 3D Environment
- Single Canvas context persists across page navigation
- GSAP-powered camera transitions between section "portals"
- Shared atmospheric elements (sky, fog, lighting) maintain continuity
- Zustand store manages camera position, active section, transition state

### 3.2 Section Portals
Each page gets a themed entrance:

| Page | Portal Theme | Geometry |
|------|--------------|----------|
| Dashboard | Temple of Zeus | Massive columns, statue backdrop |
| Agora (Betting) | Market Archway | Stone arches, merchant statues |
| Legends | Hall of Gods | Golden columns, deity statues |
| Forge | Hephaestus Forge | Lava/ember backdrop, anvils |
| Battle | Colosseum Gate | Roman-style entrance, crowd shadows |

### 3.3 Components Structure

```
components/r3f/
├── scenes/
│   ├── OdysseyScene.tsx      # Main 3D environment orchestrator
│   ├── PortalGate.tsx        # Reusable portal entrance component
│   ├── TempleOfZeus.tsx      # Dashboard portal
│   ├── MarketArchway.tsx     # Agora portal
│   ├── HallOfGods.tsx        # Legends portal
│   ├── HephaestusForge.tsx   # Forge portal
│   └── ColosseumGate.tsx     # Battle portal
├── environment/
│   ├── GreekSky.tsx          # Starfield with constellations
│   ├── MarbleMaterial.tsx   # Reusable PBR marble
│   ├── TorchLight.tsx        # Animated torch system
│   ├── GodStatues.tsx        # Greek god silhouettes
│   ├── ParticleSystem.tsx    # Embers, dust motes
│   └── GreekFountain.tsx     # Animated water feature
├── effects/
│   ├── GoldenGlow.tsx        # Gold accent post-processing
│   ├── AtmosphericFog.tsx    # Ground fog with depth
│   └── VignetteGodRay.tsx    # God rays from torch/columns
└── transitions/
    ├── CameraFlythrough.tsx # GSAP camera animation
    └── PortalTransition.tsx  # Page transition effect
```

## 4. Visual Design

### 4.1 Materials

**Marble Material (PBR)**
- Base color: `#F5F5F0`
- Roughness: 0.3
- Metalness: 0.0
- Normal map: Procedural Greek veining pattern
- Ambient occlusion in crevices

**Gold Accent Material**
- Base color: `#D4AF37`
- Roughness: 0.2
- Metalness: 0.9
- Emissive: 0.2 intensity for glow

**Terracotta Material**
- Base color: `#C45C26`
- Roughness: 0.7
- Subtle color variation

### 4.2 Lighting

**Primary:**
- Ambient: `#1a3a5c` at 0.3 intensity (Aegean night)
- Directional (moon): `#9090ff` from top-right

**Accent:**
- Point lights (torches): `#ff6622` with flicker animation
- Spot lights on statues: `#ffd700` from above
- Rim lighting on columns: `#d4af37` at 0.1

### 4.3 Post-Processing

- Bloom: threshold 0.8, intensity 0.5 (torch glow)
- Vignette: offset 0.3, darkness 0.6
- Color grading: slight blue tint in shadows

### 4.4 Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Torch flicker | Intensity 0.8-1.2, position sway | 0.5s loop | Sine |
| Camera flythrough | Position/rotation spline | 2s | Power2.inOut |
| Column shimmer | Gold edge pulse | 3s loop | Sine |
| Water fountain | Vertex wave | Continuous | Linear |
| Dust particles | Float upward, random path | 8s loop | Linear |
| Ember particles | Rise, fade, respawn | 4s loop | Linear |
| Portal glow | Emissive intensity pulse | 2s loop | Sine |

## 5. Functionality

### 5.1 Navigation Flow

```
User clicks nav link
  → Trigger GSAP timeline
  → Camera flies through current portal (exit)
  → Crossfade to new section background
  → Camera flies into new portal (enter)
  → Page content fades in
```

### 5.2 Portal Activation
- Each portal has "open" and "closed" states
- Active portal: columns slightly separated, golden glow inside
- Inactive: columns closed, dim lighting
- Camera targets the open gateway

### 5.3 Responsive Behavior
- Desktop: Full 3D experience, camera flythroughs
- Tablet: Simplified portals, touch pan
- Mobile: Static 3D backgrounds, swipe transitions

### 5.4 Performance
- Lazy load non-active portal geometries
- LOD system for distant columns
- Instance mesh for repeated elements (columns, statues)
- Frustum culling enabled

## 6. UI Integration

### 6.1 Navigation Component
- Greek-styled nav bar: marble texture, gold borders
- Active item: glowing Greek key pattern
- Hover: terracotta highlight

### 6.2 Content Overlays
- 3D scene behind all page content
- Content panels: semi-transparent dark with gold borders
- Greek key pattern borders on cards

### 6.3 Typography
- Headings: Greek-style serif (use Playfair Display or similar)
- Body: Clean sans-serif for readability
- Accent text: Gold color

## 7. Acceptance Criteria

### Visual
- [ ] All 5 portal types rendered with distinct Greek architecture
- [ ] Color palette consistently applied (marble white, gold, blue, terracotta)
- [ ] Torch lighting creates atmospheric glow
- [ ] Night sky with visible stars/constellations
- [ ] Marble materials show subtle veining
- [ ] Particle effects (embers, dust) visible
- [ ] Post-processing creates cinematic feel

### Functionality
- [ ] Camera smoothly transitions between sections
- [ ] Navigation triggers flythrough animation
- [ ] Active portal visually highlighted
- [ ] Page content displays over 3D background
- [ ] Performance maintains 60fps on modern hardware

### Polish
- [ ] Animations feel smooth and deliberate
- [ ] Gold accents glow subtly
- [ ] No visual glitches during transitions
- [ ] Consistent Greek aesthetic across all pages