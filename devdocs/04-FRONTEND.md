# Pantheon — Frontend Development Files

> Every component, hook, shader, store, and utility. Production-grade React 19 + Next.js 15 + R3F 9 + Three.js 0.176.

---

## 1. Project Bootstrap

```bash
# Create Next.js 15 app with App Router
pnpm create next-app@latest apps/web \
  --typescript --tailwind --app --turbopack \
  --import-alias "@/*"

# Install all frontend deps
cd apps/web

pnpm add three@0.176 @react-three/fiber@9 @react-three/drei@10 \
  @react-three/postprocessing@3 \
  @theatre/core@0.7 @theatre/r3f@0.7

pnpm add gsap@3.13 @gsap/react@2 \
  framer-motion@12 \
  howler@2.2

pnpm add zustand@5 @tanstack/react-query@5 immer@10

pnpm add wagmi@2 viem@2 @rainbow-me/rainbowkit@2 \
  @ensdomains/ensjs@4

pnpm add recharts@2 clsx@2 tailwind-merge@3 \
  date-fns@4 nanoid@5 zod@3 react-hook-form@7

pnpm add -D @theatre/studio@0.7 \
  @types/three @types/howler \
  vitest@2 @vitejs/plugin-react \
  playwright@1
```

---

## 2. Design Tokens — `tailwind.config.ts`

```typescript
// apps/web/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core palette — from Roman Shades + Athens references
        nox:      '#07050F',  // page background
        deep:     '#0E0A1A',  // card background
        stone:    '#2A1E14',  // border, dividers
        sand:     '#D9A78B',  // primary accent
        parch:    '#F2E0D5',  // primary text
        willa:    '#B8A070',  // secondary accent
        hadria:   '#8B3A3A',  // danger / berserker
        bellona:  '#722020',  // deep red
        olivine:  '#9AAA60',  // success / bred
        questa:   '#7A6070',  // muted purple
        minerva:  '#7A8A9A',  // oracle blue-grey
        sky:      '#85D3F2',  // sky / oracle
        sky2:     '#5FB6D9',  // deeper sky
        gold:     '#C9A84C',  // divine gold
        'gold-b': '#F0C040',  // bright gold
        marble:   '#EDE8DC',  // light marble
      },
      fontFamily: {
        cinzel:      ['"Cinzel"', 'serif'],
        'cinzel-dec':['"Cinzel Decorative"', 'serif'],
        fell:        ['"IM Fell English"', 'serif'],
        josefin:     ['"Josefin Sans"', 'sans-serif'],
      },
      animation: {
        'flame':    'flame 1.1s ease-in-out infinite',
        'drift':    'drift 5s ease-in-out infinite',
        'marquee':  'marquee 24s linear infinite',
        'twinkle':  'twinkle 2.2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        flame: {
          '0%,100%': { transform: 'scaleY(1) scaleX(1)' },
          '33%':     { transform: 'scaleY(1.16) scaleX(.88)' },
          '66%':     { transform: 'scaleY(.93) scaleX(1.07)' },
        },
        drift: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.15' },
          '50%':     { opacity: '0.85' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.4' },
          '50%':     { opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
```

---

## 3. Global CSS — `app/globals.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500;600;700;900&family=Cinzel+Decorative:wght@400;700;900&family=IM+Fell+English:ital@0;1&family=Josefin+Sans:wght@200;300;400;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --parallax-rx: 0deg;
  --parallax-ry: 0deg;
}

@layer base {
  * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
  html { background: #07050F; color: #F2E0D5; }
  body { font-family: 'Josefin Sans', sans-serif; font-weight: 300; }

  ::selection {
    background: rgba(201, 168, 76, 0.25);
    color: #F2E0D5;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #07050F; }
  ::-webkit-scrollbar-thumb { background: rgba(217, 167, 139, 0.25); border-radius: 2px; }
}

@layer components {
  /* Meander border utility */
  .meander-border {
    border-image: url("data:image/svg+xml,...") 12 repeat;
  }

  /* Gold shimmer line */
  .shimmer-line::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201,168,76,.7), transparent);
    opacity: 0;
    transition: opacity 0.4s;
  }
  .shimmer-line:hover::after { opacity: 1; }

  /* Stone tablet card */
  .stone-card {
    @apply bg-deep border border-stone/20 relative overflow-hidden
           transition-all duration-300 hover:border-sand/40 hover:-translate-y-1;
  }

  /* Button variants */
  .btn-gold {
    @apply font-cinzel text-[9px] tracking-[.18em] uppercase
           border border-sand text-sand bg-transparent px-6 py-3
           relative overflow-hidden transition-colors duration-300;
  }
  .btn-gold::before {
    content: '';
    @apply absolute inset-0 bg-sand scale-x-0 origin-left transition-transform duration-300;
    z-index: 0;
  }
  .btn-gold:hover::before { @apply scale-x-100; }
  .btn-gold:hover { @apply text-nox; }
  .btn-gold > * { position: relative; z-index: 1; }

  .btn-ghost {
    @apply font-cinzel text-[9px] tracking-[.18em] uppercase
           border border-stone/30 text-sand/35 bg-transparent px-6 py-3
           transition-all duration-300 hover:border-sand/50 hover:text-sand;
  }
}
```

---

## 4. Root Layout — `app/layout.tsx`

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pantheon — Where Mortal Code Becomes Immortal Legend',
  description: 'On-chain AI agent battle league. Forge your god. Enter the arena. Claim apotheosis.',
  openGraph: {
    title: 'Pantheon',
    description: 'On-chain AI agent battle league',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

## 5. Providers — `components/Providers.tsx`

```typescript
// components/Providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from '@/lib/wagmi'
import { AudioProvider } from '@/components/audio/AudioProvider'
import { useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AudioProvider>
            {children}
          </AudioProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

---

## 6. Game Route Layout — `app/(game)/layout.tsx`

```typescript
// app/(game)/layout.tsx
// This layout persists the R3F canvas across ALL game routes
'use client'

import { Suspense, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Navigation } from '@/components/ui/Navigation'
import { usePathname } from 'next/navigation'

// Lazy-load canvas to avoid SSR issues
const PantheonCanvas = dynamic(
  () => import('@/components/r3f/PantheonCanvas'),
  { ssr: false }
)

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="relative min-h-screen bg-nox overflow-hidden">

      {/* Persistent 3D canvas — never unmounts between routes */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <PantheonCanvas currentRoute={pathname} />
        </Suspense>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Page content overlaid on canvas */}
      <main className="relative z-10">
        {children}
      </main>

    </div>
  )
}
```

---

## 7. R3F Canvas Root — `components/r3f/PantheonCanvas.tsx`

```typescript
// components/r3f/PantheonCanvas.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three'
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing'
import { TempleScene } from './scenes/TempleScene'
import { ColosseumScene } from './scenes/ColosseumScene'
import { useGameStore } from '@/lib/store'

interface Props { currentRoute: string }

export default function PantheonCanvas({ currentRoute }: Props) {
  const cameraPhase = useGameStore(s => s.cameraPhase)

  const isColosseum = currentRoute.startsWith('/colosseum')
  const isForge = currentRoute.startsWith('/forge')
  const isLanding = currentRoute === '/'

  return (
    <Canvas
      camera={{ position: [0, 4, 28], fov: 55 }}
      gl={{
        antialias: true,
        alpha: true,             // transparent bg so CSS stars show through
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      shadows={{ type: PCFSoftShadowMap }}
      dpr={[1, 1.5]}             // cap at 1.5x for performance
      performance={{ min: 0.5 }} // adaptive performance
    >
      <Suspense fallback={null}>

        {/* Scene selection based on route */}
        {(isLanding || isForge) && <TempleScene />}
        {isColosseum && <ColosseumScene />}

        {/* Post-processing */}
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.4}
            mipmapBlur
            luminanceThreshold={0.6}
            luminanceSmoothing={0.5}
          />
          <DepthOfField
            focusDistance={0.02}
            focalLength={0.05}
            bokehScale={2}
          />
          <Vignette eskil={false} offset={0.12} darkness={0.85} />
        </EffectComposer>

      </Suspense>
    </Canvas>
  )
}
```

---

## 8. Temple Scene — `components/r3f/scenes/TempleScene.tsx`

```typescript
// components/r3f/scenes/TempleScene.tsx
import { Environment } from '@react-three/drei'
import { ScrollCamera } from '../ScrollCamera'
import { NightSky } from '../NightSky'
import { ParthenaSilhouette } from '../ParthenaSilhouette'
import { TorchSystem } from '../TorchSystem'
import { AgentMedallion } from '../AgentMedallion'
import { GroundFog } from '../GroundFog'

export function TempleScene() {
  return (
    <>
      <ScrollCamera />
      <NightSky starCount={2000} />
      <ParthenaSilhouette />
      <TorchSystem
        positions={[
          [-7, 0.5, 2],   // left outer
          [-4, 0.5, 2],   // left inner
          [4, 0.5, 2],    // right inner
          [7, 0.5, 2],    // right outer
        ]}
      />
      <AgentMedallion position={[0, 2, -2]} scale={1.4} />
      <GroundFog />
      <Environment preset="night" />
      <ambientLight intensity={0.12} color="#1A1020" />
    </>
  )
}
```

---

## 9. Scroll Camera — `components/r3f/ScrollCamera.tsx`

```typescript
// components/r3f/ScrollCamera.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useGameStore } from '@/lib/store'

gsap.registerPlugin(ScrollTrigger)

export function ScrollCamera() {
  const { camera } = useThree()
  const setCameraPhase = useGameStore(s => s.setCameraPhase)

  const cameraState = useRef({
    z: 28,
    y: 4,
    targetX: 0,
  })

  useGSAP(() => {
    // Camera dolly: scroll 0→100vh → Z 28→8 (entering temple)
    gsap.to(cameraState.current, {
      z: 8,
      y: 2.5,
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '60% top',
        scrub: 1.5,
        onUpdate: (self) => {
          if (self.progress > 0.9) setCameraPhase('inside')
          else if (self.progress > 0.1) setCameraPhase('entering')
          else setCameraPhase('landing')
        },
      },
    })
  })

  useFrame((_, delta) => {
    // Smooth lerp to scroll-driven target
    camera.position.z += (cameraState.current.z - camera.position.z) * Math.min(delta * 4, 1)
    camera.position.y += (cameraState.current.y - camera.position.y) * Math.min(delta * 4, 1)
  })

  return null
}
```

---

## 10. Torch System — `components/r3f/TorchSystem.tsx`

```typescript
// components/r3f/TorchSystem.tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { ConeGeometry, ShaderMaterial } from 'three'

const flameVertexShader = `
  uniform float uTime;
  uniform float uHeight;
  varying float vHeight;

  void main() {
    vHeight = position.y / uHeight;
    float sway = sin(uTime * 3.2 + vHeight * 5.0 + position.x * 2.0) * vHeight * 0.12;
    float taper = 1.0 - vHeight * 0.75;
    vec3 pos = position;
    pos.x = pos.x * taper + sway;
    pos.z = pos.z * taper + cos(uTime * 2.8 + vHeight * 4.0) * vHeight * 0.06;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const flameFragmentShader = `
  uniform float uTime;
  varying float vHeight;

  void main() {
    vec3 base   = vec3(0.545, 0.188, 0.063); // #8B3010
    vec3 mid    = vec3(0.851, 0.471, 0.125); // #D97820
    vec3 tip    = vec3(0.961, 0.816, 0.376); // #F5D060

    vec3 col = mix(base, mid, vHeight);
    col = mix(col, tip, smoothstep(0.5, 1.0, vHeight));

    float alpha = 1.0 - vHeight * 0.6;
    alpha *= 0.9 + 0.1 * sin(uTime * 8.0 + vHeight * 3.0);

    gl_FragColor = vec4(col, alpha);
  }
`

interface TorchSystemProps {
  positions: [number, number, number][]
}

export function TorchSystem({ positions }: TorchSystemProps) {
  const materialsRef = useRef<ShaderMaterial[]>([])

  const flameMaterial = useMemo(() => new ShaderMaterial({
    vertexShader: flameVertexShader,
    fragmentShader: flameFragmentShader,
    uniforms: {
      uTime:   { value: 0 },
      uHeight: { value: 0.8 },
    },
    transparent: true,
    depthWrite: false,
  }), [])

  useFrame(({ clock }) => {
    flameMaterial.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <>
      {positions.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {/* Torch staff */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 1.2, 8]} />
            <meshStandardMaterial color="#3A2810" roughness={0.9} />
          </mesh>

          {/* Flame mesh */}
          <mesh position={[0, 0.3, 0]} material={flameMaterial}>
            <coneGeometry args={[0.12, 0.8, 12, 8, true]} />
          </mesh>

          {/* Ember particles */}
          <Sparkles
            count={20}
            scale={0.5}
            size={1.5}
            speed={0.4}
            opacity={0.6}
            color="#F5C840"
            position={[0, 0.4, 0]}
          />

          {/* Orange point light */}
          <pointLight
            color="#D97820"
            intensity={2.5}
            distance={8}
            decay={2}
            castShadow={false}
          />
        </group>
      ))}
    </>
  )
}
```

---

## 11. Night Sky — `components/r3f/NightSky.tsx`

```typescript
// components/r3f/NightSky.tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, BufferAttribute, ShaderMaterial, AdditiveBlending } from 'three'

const starVertexShader = `
  attribute float aOffset;
  attribute float aSize;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vAlpha = 0.3 + 0.7 * abs(sin(uTime * 0.8 + aOffset * 6.28));
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const starFragmentShader = `
  varying float vAlpha;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float strength = 1.0 - d * 2.0;
    gl_FragColor = vec4(0.95, 0.88, 0.85, strength * vAlpha);
  }
`

export function NightSky({ starCount = 2000 }: { starCount?: number }) {
  const matRef = useRef<ShaderMaterial>(null)

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(starCount * 3)
    const offsets   = new Float32Array(starCount)
    const sizes     = new Float32Array(starCount)

    for (let i = 0; i < starCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100 + 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 30
      offsets[i] = Math.random() * Math.PI * 2
      sizes[i]   = Math.random() * 2.5 + 0.5
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    geo.setAttribute('aOffset',  new BufferAttribute(offsets, 1))
    geo.setAttribute('aSize',    new BufferAttribute(sizes, 1))

    const mat = new ShaderMaterial({
      vertexShader:   starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    })

    return { geometry: geo, material: mat }
  }, [starCount])

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  return (
    <points geometry={geometry}>
      <primitive object={material} ref={matRef} />
    </points>
  )
}
```

---

## 12. Zustand Store — `lib/store.ts`

```typescript
// lib/store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type Archetype = 'Strategist' | 'Oracle' | 'Berserker' | 'Diplomat'
export type Rank = 'Demigod' | 'Hero' | 'God' | 'Titan' | 'Olympian'
export type CameraPhase = 'landing' | 'entering' | 'inside'
export type BattlePhase = 'PENDING' | 'PREPARING' | 'ACTIVE' | 'SETTLED' | 'COMPLETE'

export interface Agent {
  tokenId: bigint
  name: string              // e.g. "achilles"
  ensName: string           // "achilles.pantheon.eth"
  archetype: Archetype
  elo: number
  rank: Rank
  wins: number
  losses: number
  storageHash: string
  lineage?: { parent1: bigint; parent2: bigint }
  badges: string[]
}

export interface AXLMessage {
  id: string
  from: string              // node short ID
  type: 'MOVE' | 'SCORE' | 'VERDICT' | 'ACK'
  content: string
  timestamp: number
  nodeColor: 'sky' | 'hadria' | 'willa'
}

export interface Battle {
  id: string
  agentA: Agent
  agentB: Agent
  round: number
  healthA: number           // 0–100
  healthB: number           // 0–100
  phase: BattlePhase
  wageredA: bigint          // total in pool for A
  wageredB: bigint          // total in pool for B
  startedAt: number
}

export interface RoundScore {
  round: number
  scoreA: number
  scoreB: number
  reasoning: string
}

export interface ForgeState {
  archetype: Archetype | null
  name: string
  nameStatus: 'idle' | 'checking' | 'available' | 'taken'
  directive: string
  stage: 0 | 1 | 2 | 3 | 4 | 5  // wizard step + forge stage
  txHashes: Partial<Record<'storage' | 'mint' | 'ens', string>>
}

interface GameState {
  // ── Wallet ──────────────────────────────
  address: `0x${string}` | null
  ensName: string | null
  setWallet: (address: `0x${string}` | null, ensName?: string) => void

  // ── Agents ──────────────────────────────
  ownedAgents: Agent[]
  selectedAgent: Agent | null
  setOwnedAgents: (agents: Agent[]) => void
  setSelectedAgent: (agent: Agent | null) => void

  // ── Active battle ────────────────────────
  activeBattle: Battle | null
  battleLog: AXLMessage[]
  roundScores: RoundScore[]
  setActiveBattle: (battle: Battle | null) => void
  addBattleEvent: (event: { type: string; data: unknown }) => void

  // ── Forge ────────────────────────────────
  forgeState: ForgeState
  updateForge: (partial: Partial<ForgeState>) => void
  resetForge: () => void

  // ── Scene / Audio ────────────────────────
  cameraPhase: CameraPhase
  setCameraPhase: (phase: CameraPhase) => void
  torchIntensity: number
  masterVolume: number
  setMasterVolume: (v: number) => void
  ambientPlaying: boolean
  setAmbientPlaying: (v: boolean) => void

  // ── Season ───────────────────────────────
  leaderboard: Agent[]
  setLeaderboard: (agents: Agent[]) => void
}

const defaultForgeState: ForgeState = {
  archetype: null,
  name: '',
  nameStatus: 'idle',
  directive: '',
  stage: 0,
  txHashes: {},
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    immer((set) => ({
      // Wallet
      address: null,
      ensName: null,
      setWallet: (address, ensName) =>
        set((s) => { s.address = address; s.ensName = ensName ?? null }),

      // Agents
      ownedAgents: [],
      selectedAgent: null,
      setOwnedAgents: (agents) => set((s) => { s.ownedAgents = agents }),
      setSelectedAgent: (agent) => set((s) => { s.selectedAgent = agent }),

      // Battle
      activeBattle: null,
      battleLog: [],
      roundScores: [],
      setActiveBattle: (battle) => set((s) => { s.activeBattle = battle }),
      addBattleEvent: (event) => set((s) => {
        switch (event.type) {
          case 'axl_message':
            s.battleLog.push(event.data as AXLMessage)
            if (s.battleLog.length > 50) s.battleLog.shift() // keep last 50
            break
          case 'round_score':
            s.roundScores.push(event.data as RoundScore)
            const score = event.data as RoundScore
            if (s.activeBattle) {
              s.activeBattle.healthA -= (100 - score.scoreA) * 0.08
              s.activeBattle.healthB -= (100 - score.scoreB) * 0.08
              s.activeBattle.round = score.round
            }
            break
          case 'battle_end':
            if (s.activeBattle) s.activeBattle.phase = 'SETTLED'
            break
        }
      }),

      // Forge
      forgeState: defaultForgeState,
      updateForge: (partial) => set((s) => { Object.assign(s.forgeState, partial) }),
      resetForge: () => set((s) => { s.forgeState = defaultForgeState }),

      // Scene
      cameraPhase: 'landing',
      setCameraPhase: (phase) => set((s) => { s.cameraPhase = phase }),
      torchIntensity: 0.8,
      masterVolume: 0.7,
      setMasterVolume: (v) => set((s) => { s.masterVolume = v }),
      ambientPlaying: false,
      setAmbientPlaying: (v) => set((s) => { s.ambientPlaying = v }),

      // Season
      leaderboard: [],
      setLeaderboard: (agents) => set((s) => { s.leaderboard = agents }),
    }))
  )
)
```

---

## 13. Wagmi Config — `lib/wagmi.ts`

```typescript
// lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// 0G Testnet chain definition
export const ogTestnet = {
  id: 16600,
  name: '0G Testnet',
  nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://testnet.0g.ai' },
  },
  testnet: true,
} as const

export const wagmiConfig = getDefaultConfig({
  appName: 'Pantheon',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [ogTestnet, mainnet],
  transports: {
    [ogTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
    [mainnet.id]:   http(),
  },
  ssr: true,
})
```

---

## 14. ENS Helpers — `lib/ens.ts`

```typescript
// lib/ens.ts
import { createEnsPublicClient } from '@ensdomains/ensjs'
import { http } from 'viem'
import { mainnet } from 'viem/chains'

export const ensClient = createEnsPublicClient({
  chain: mainnet,
  transport: http(),
})

export async function checkNameAvailability(name: string): Promise<boolean> {
  try {
    const owner = await ensClient.getOwner({ name: `${name}.pantheon.eth` })
    return owner === null || owner.owner === '0x0000000000000000000000000000000000000000'
  } catch {
    return true // assume available on error
  }
}

export interface AgentENSRecords {
  elo: string
  rank: string
  wins: string
  losses: string
  archetype: string
  tokenId: string
  axlKey: string
  storageHash: string
  lineage?: string
  badges: string
}

export async function getAgentRecords(name: string): Promise<AgentENSRecords | null> {
  try {
    const records = await ensClient.getRecords({
      name: `${name}.pantheon.eth`,
      texts: ['elo', 'rank', 'wins', 'losses', 'archetype', 'tokenId', 'axlKey', 'storageHash', 'lineage', 'badges'],
    })
    if (!records) return null
    return {
      elo:         records.texts.find(t => t.key === 'elo')?.value ?? '1200',
      rank:        records.texts.find(t => t.key === 'rank')?.value ?? 'Demigod',
      wins:        records.texts.find(t => t.key === 'wins')?.value ?? '0',
      losses:      records.texts.find(t => t.key === 'losses')?.value ?? '0',
      archetype:   records.texts.find(t => t.key === 'archetype')?.value ?? 'Strategist',
      tokenId:     records.texts.find(t => t.key === 'tokenId')?.value ?? '0',
      axlKey:      records.texts.find(t => t.key === 'axlKey')?.value ?? '',
      storageHash: records.texts.find(t => t.key === 'storageHash')?.value ?? '',
      lineage:     records.texts.find(t => t.key === 'lineage')?.value,
      badges:      records.texts.find(t => t.key === 'badges')?.value ?? '',
    }
  } catch {
    return null
  }
}
```

---

## 15. Contract ABIs & Hooks — `lib/contracts.ts`

```typescript
// lib/contracts.ts
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseAbi } from 'viem'
import { ogTestnet } from './wagmi'

export const PANTHEON_AGENT_ADDRESS = process.env.NEXT_PUBLIC_PANTHEON_AGENT as `0x${string}`
export const BATTLE_ARENA_ADDRESS   = process.env.NEXT_PUBLIC_BATTLE_ARENA as `0x${string}`
export const AGORA_POOL_ADDRESS     = process.env.NEXT_PUBLIC_AGORA_POOL as `0x${string}`

const pantheonAgentAbi = parseAbi([
  'function mint(uint8 archetype, string name, bytes32 storageHash) returns (uint256)',
  'function getAgent(uint256 tokenId) view returns (tuple(uint8 archetype, uint256 elo, uint256 xp, uint8 rank, uint256 battleCount, uint256 wins, uint256 losses, bytes32 storageHash, bytes32 directiveHash, uint256 parent1, uint256 parent2))',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokensOfOwner(address owner) view returns (uint256[])',
  'event AgentMinted(uint256 indexed tokenId, address indexed owner, string name)',
  'event RankAscended(uint256 indexed tokenId, uint8 newRank)',
])

const battleArenaAbi = parseAbi([
  'function challenge(uint256 challengerTokenId, uint256 defenderTokenId, address wagerToken, uint256 wagerAmount) returns (bytes32 battleId)',
  'function accept(bytes32 battleId) payable',
  'function submitResult(bytes32 battleId, address winner, bytes signature)',
  'function getBattle(bytes32 battleId) view returns (tuple(uint256 challengerTokenId, uint256 defenderTokenId, address wagerToken, uint256 wagerAmount, uint8 phase, uint256 startedAt, address winner))',
  'event BattleCreated(bytes32 indexed battleId, uint256 challenger, uint256 defender)',
  'event BattleSettled(bytes32 indexed battleId, address indexed winner)',
])

// React hooks
export function useAgent(tokenId: bigint | undefined) {
  return useReadContract({
    address: PANTHEON_AGENT_ADDRESS,
    abi: pantheonAgentAbi,
    functionName: 'getAgent',
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId, staleTime: 30_000 },
    chainId: ogTestnet.id,
  })
}

export function useOwnedAgents(address: `0x${string}` | undefined) {
  return useReadContract({
    address: PANTHEON_AGENT_ADDRESS,
    abi: pantheonAgentAbi,
    functionName: 'tokensOfOwner',
    args: address ? [address] : undefined,
    query: { enabled: !!address, staleTime: 60_000 },
    chainId: ogTestnet.id,
  })
}

export function useChallenge() {
  const { writeContractAsync, data: hash } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  const challenge = (challengerTokenId: bigint, defenderTokenId: bigint, wagerToken: `0x${string}`, wagerAmount: bigint) =>
    writeContractAsync({
      address: BATTLE_ARENA_ADDRESS,
      abi: battleArenaAbi,
      functionName: 'challenge',
      args: [challengerTokenId, defenderTokenId, wagerToken, wagerAmount],
    })

  return { challenge, hash, isLoading, isSuccess }
}
```

---

## 16. Agent Card Component — `components/ui/AgentCard.tsx`

```typescript
// components/ui/AgentCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Agent } from '@/lib/store'
import { MeanderBorder } from './MeanderBorder'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: Agent
  onChallenge?: (agent: Agent) => void
  onView?: (agent: Agent) => void
  featured?: boolean
}

const archetypeColors: Record<string, string> = {
  Oracle:     'sky2',
  Berserker:  'hadria',
  Strategist: 'questa',
  Diplomat:   'olivine',
}

const rankColors: Record<string, string> = {
  Olympian: 'text-gold border-gold/50 bg-gold/8',
  Titan:    'text-[#C09090] border-[#C09090]/50 bg-[#8B3A3A]/8',
  God:      'text-sky2 border-sky2/40 bg-sky2/6',
  Hero:     'text-olivine border-olivine/40 bg-olivine/6',
  Demigod:  'text-parch/40 border-parch/20 bg-parch/3',
}

export function AgentCard({ agent, onChallenge, onView, featured = false }: AgentCardProps) {
  const accent = archetypeColors[agent.archetype]

  return (
    <motion.div
      className="stone-card shimmer-line cursor-pointer"
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      onClick={() => onView?.(agent)}
      role="article"
      aria-label={`Agent ${agent.name} — ${agent.archetype}, ELO ${agent.elo}`}
    >
      {/* Archetype colour strip */}
      <div className={cn(
        'h-[2px]',
        agent.archetype === 'Oracle'     && 'bg-gradient-to-r from-transparent via-sky2/80 to-transparent',
        agent.archetype === 'Berserker'  && 'bg-gradient-to-r from-transparent via-hadria/80 to-transparent',
        agent.archetype === 'Strategist' && 'bg-gradient-to-r from-transparent via-questa/80 to-transparent',
        agent.archetype === 'Diplomat'   && 'bg-gradient-to-r from-transparent via-olivine/80 to-transparent',
      )} />

      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <ArchetypeIcon archetype={agent.archetype} />
          <span className={cn(
            'font-cinzel text-[8px] tracking-[.14em] uppercase px-[10px] py-[3px] border',
            rankColors[agent.rank]
          )}>
            {agent.rank}
          </span>
        </div>

        {/* Identity */}
        <div className="font-cinzel text-[14px] text-parch tracking-[.06em] mb-[2px]">
          {agent.name.charAt(0).toUpperCase() + agent.name.slice(1)}
        </div>
        <div className="font-josefin text-[8px] text-sky2/60 tracking-[.16em] uppercase mb-2">
          {agent.archetype} · Archetype
        </div>
        <div className="font-josefin text-[9px] tracking-[.07em] mb-3" style={{ color: `color-mix(in srgb, var(--tw-color-${accent}) 55%, transparent)` }}>
          {agent.ensName}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="font-cinzel text-[18px] text-gold">{agent.elo.toLocaleString()}</div>
            <div className="font-josefin text-[8px] text-parch/30 tracking-[.1em] mt-[2px]">ELO</div>
          </div>
          <div>
            <div className={cn(
              'font-cinzel text-[18px]',
              agent.wins / (agent.wins + agent.losses) > 0.8 ? 'text-olivine' : 'text-willa'
            )}>
              {Math.round((agent.wins / Math.max(agent.wins + agent.losses, 1)) * 100)}%
            </div>
            <div className="font-josefin text-[8px] text-parch/30 tracking-[.1em] mt-[2px]">WIN</div>
          </div>
        </div>

        {/* Stat bars */}
        <StatBars archetype={agent.archetype} />

        {/* CTA */}
        <button
          className="btn-gold w-full py-2 text-[9px] mt-3"
          onClick={(e) => { e.stopPropagation(); onChallenge?.(agent) }}
          aria-label={`Challenge ${agent.name}`}
        >
          <span>⚡ Issue Challenge</span>
        </button>
      </div>

      {/* Bred indicator */}
      {agent.lineage && (
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gold border-2 border-deep" title="Bred agent" />
      )}
    </motion.div>
  )
}

function ArchetypeIcon({ archetype }: { archetype: Archetype }) {
  const configs = {
    Oracle:     { bg: '#0A1420', stroke: '#5FB6D9', fill: '#85D3F2' },
    Berserker:  { bg: '#200808', stroke: '#C09090', fill: '#E08080' },
    Strategist: { bg: '#180E20', stroke: '#9A70C8', fill: '#B090D8' },
    Diplomat:   { bg: '#101808', stroke: '#9AAA60', fill: '#C8D080' },
  }
  const c = configs[archetype]
  return (
    <div className="w-[50px] h-[50px] flex items-center justify-center border"
      style={{ background: c.bg, borderColor: `${c.stroke}44` }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <ellipse cx="12" cy="8" rx="5" ry="7" fill={c.bg} stroke={c.stroke} strokeWidth=".7"/>
        <ellipse cx="12.4" cy="8" rx="2" ry="2.5" fill={c.fill} opacity=".85"/>
        <path d="M6 17 Q12 12 18 17 L18 24 L6 24 Z" fill={c.bg} stroke={c.stroke} strokeWidth=".6"/>
      </svg>
    </div>
  )
}

function StatBars({ archetype }: { archetype: string }) {
  const stats: Record<string, [string, number, string][]> = {
    Oracle:     [['ORACLE', 92, '#85D3F2'], ['REASON', 85, '#7A8A9A'], ['SPEED', 70, '#D9A78B']],
    Berserker:  [['AGGRESS', 97, '#8B3A3A'], ['RISK', 89, '#722020'],  ['SPEED', 94, '#D9A78B']],
    Strategist: [['LOGIC', 88, '#9A70C8'],  ['PLAN', 91, '#7A6070'],   ['ADAPT', 75, '#D9A78B']],
    Diplomat:   [['COLLAB', 82, '#9AAA60'], ['ADAPT', 86, '#9AAA60'],  ['SPEED', 68, '#D9A78B']],
  }
  const bars = stats[archetype] ?? stats.Strategist

  return (
    <div className="flex flex-col gap-[5px]">
      {bars.map(([label, pct, color]) => (
        <div key={label} className="flex gap-2 items-center">
          <div className="font-josefin text-[8px] text-parch/30 w-[48px] tracking-[.08em]">{label}</div>
          <div className="flex-1 h-[1px] bg-white/6">
            <motion.div
              className="h-[1px]"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 17. Meander Border — `components/ui/MeanderBorder.tsx`

```typescript
// components/ui/MeanderBorder.tsx
interface MeanderBorderProps {
  color?: string
  opacity?: number
  className?: string
}

export function MeanderBorder({
  color = '#D9A78B',
  opacity = 0.18,
  className = '',
}: MeanderBorderProps) {
  return (
    <svg
      className={`w-full ${className}`}
      height="14"
      viewBox="0 0 680 14"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 7 L30 7 L30 2 L38 2 L38 12 L46 12 L46 7 L54 7 L54 2 L62 2 L62 12 L70 12 L70 7
           L100 7 L100 2 L108 2 L108 12 L116 12 L116 7 L124 7 L124 2 L132 2 L132 12 L140 12 L140 7
           L170 7 L170 2 L178 2 L178 12 L186 12 L186 7 L194 7 L194 2 L202 2 L202 12 L210 12 L210 7
           L240 7 L240 2 L248 2 L248 12 L256 12 L256 7 L264 7 L264 2 L272 2 L272 12 L280 12 L280 7
           L310 7 L310 2 L318 2 L318 12 L326 12 L326 7 L334 7 L334 2 L342 2 L342 12 L350 12 L350 7
           L380 7 L380 2 L388 2 L388 12 L396 12 L396 7 L404 7 L404 2 L412 2 L412 12 L420 12 L420 7
           L450 7 L450 2 L458 2 L458 12 L466 12 L466 7 L474 7 L474 2 L482 2 L482 12 L490 12 L490 7
           L520 7 L520 2 L528 2 L528 12 L536 12 L536 7 L544 7 L544 2 L552 2 L552 12 L560 12 L560 7
           L590 7 L590 2 L598 2 L598 12 L606 12 L606 7 L614 7 L614 2 L622 2 L622 12 L630 12 L630 7
           L680 7"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity={opacity}
      />
    </svg>
  )
}
```

---

## 18. Lightning Strike — `components/ui/LightningStrike.tsx`

```typescript
// components/ui/LightningStrike.tsx
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface LightningStrikeProps {
  trigger: boolean
  onComplete?: () => void
}

export function LightningStrike({ trigger, onComplete }: LightningStrikeProps) {
  const path1Ref = useRef<SVGPathElement>(null)
  const path2Ref = useRef<SVGPathElement>(null)
  const path3Ref = useRef<SVGPathElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trigger) return

    const tl = gsap.timeline({ onComplete })

    // Each path: set stroke-dasharray = path length, dashoffset = length, then tween to 0
    ;[path1Ref, path2Ref, path3Ref].forEach((ref, i) => {
      if (!ref.current) return
      const len = ref.current.getTotalLength()
      gsap.set(ref.current, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 })
      tl.to(ref.current, {
        strokeDashoffset: 0,
        duration: 0.08,
        ease: 'none',
      }, i * 0.08)
      tl.to(ref.current, { opacity: 0, duration: 0.15 }, `+=${0.12}`)
    })

    // Screen flash
    tl.to(overlayRef.current, { opacity: 0.35, duration: 0.05 }, 0.05)
    tl.to(overlayRef.current, { opacity: 0, duration: 0.25 }, 0.12)
  }, [trigger])

  return (
    <>
      {/* Screen flash overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-white opacity-0 pointer-events-none z-50"
        aria-hidden="true"
      />

      {/* Lightning SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-40"
        viewBox="0 0 680 400"
        aria-hidden="true"
      >
        <path
          ref={path1Ref}
          d="M340 0 L328 80 L345 80 L316 180 L336 180 L300 300"
          fill="none"
          stroke="#F0C040"
          strokeWidth="2"
          opacity="0"
        />
        <path
          ref={path2Ref}
          d="M320 20 L308 90 L325 90 L298 190"
          fill="none"
          stroke="#F2E0D5"
          strokeWidth="1.2"
          opacity="0"
        />
        <path
          ref={path3Ref}
          d="M360 15 L350 85 L366 85 L340 180"
          fill="none"
          stroke="#D9A78B"
          strokeWidth="1"
          opacity="0"
        />
      </svg>
    </>
  )
}
```

---

## 19. Audio Provider — `components/audio/AudioProvider.tsx`

```typescript
// components/audio/AudioProvider.tsx
'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { Howl, Howler } from 'howler'
import { useGameStore } from '@/lib/store'

interface AudioContextType {
  play: (id: SoundId) => void
  stop: (id: SoundId) => void
  setVolume: (v: number) => void
}

type SoundId =
  | 'temple-wind'
  | 'torch-crackle'
  | 'colosseum-crowd'
  | 'forge-ignite'
  | 'ens-carve'
  | 'lightning-crack'
  | 'victory-horn'

const AudioCtx = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const masterVolume = useGameStore(s => s.masterVolume)
  const sounds = useRef<Partial<Record<SoundId, Howl>>>({})
  const initialized = useRef(false)

  // Lazy init on first user interaction (browser policy)
  useEffect(() => {
    const init = () => {
      if (initialized.current) return
      initialized.current = true

      sounds.current = {
        'temple-wind': new Howl({
          src: ['/audio/temple-wind.mp3'],
          loop: true, volume: 0.3,
        }),
        'torch-crackle': new Howl({
          src: ['/audio/torch-crackle.mp3'],
          loop: true, volume: 0.2,
        }),
        'colosseum-crowd': new Howl({
          src: ['/audio/colosseum-crowd.mp3'],
          loop: true, volume: 0,
        }),
        'forge-ignite': new Howl({
          src: ['/audio/forge-ignite.mp3'],
          volume: 0.7,
        }),
        'ens-carve': new Howl({
          src: ['/audio/ens-carve.mp3'],
          volume: 0.5,
          sprite: { chisel: [0, 180] },
        }),
        'lightning-crack': new Howl({
          src: ['/audio/lightning-crack.mp3'],
          volume: 0.85,
        }),
        'victory-horn': new Howl({
          src: ['/audio/victory-horn.mp3'],
          volume: 0.75,
        }),
      }
    }

    window.addEventListener('click', init, { once: true })
    window.addEventListener('keydown', init, { once: true })
    return () => {
      window.removeEventListener('click', init)
      window.removeEventListener('keydown', init)
    }
  }, [])

  // Sync master volume
  useEffect(() => {
    Howler.volume(masterVolume)
  }, [masterVolume])

  const ctx: AudioContextType = {
    play: (id) => sounds.current[id]?.play(),
    stop: (id) => sounds.current[id]?.stop(),
    setVolume: (v) => Howler.volume(v),
  }

  return <AudioCtx.Provider value={ctx}>{children}</AudioCtx.Provider>
}

export const useAudio = () => {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}
```

---

## 20. Utility — `lib/utils.ts`

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatELO(elo: number): string {
  return elo.toLocaleString('en-US')
}

export function eloToRank(elo: number): string {
  if (elo >= 1800) return 'Olympian'
  if (elo >= 1600) return 'Titan'
  if (elo >= 1400) return 'God'
  if (elo >= 1200) return 'Hero'
  return 'Demigod'
}

export function computeELODelta(
  winnerELO: number,
  loserELO: number,
  kFactor: 32 | 16 = 32
): { winnerDelta: number; loserDelta: number } {
  const expected = 1 / (1 + Math.pow(10, (loserELO - winnerELO) / 400))
  const winnerDelta = Math.round(kFactor * (1 - expected))
  const loserDelta  = Math.round(kFactor * (0 - (1 - expected)))
  return { winnerDelta, loserDelta }
}

export function shortenAddress(addr: string, chars = 4): string {
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`
}

export function formatBattleTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
```

---

*Pantheon Frontend Development Files v1.0 — Next.js 15 + R3F 9 + Three.js 0.176 + GSAP 3.13 + Theatre.js 0.7 + Zustand 5 + Howler 2.2*
