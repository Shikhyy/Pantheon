# Greek 3D Odyssey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Pantheon into an immersive 3D Greek odyssey with interactive camera fly-throughs between pages

**Architecture:** Unified 3D environment with themed portal gates for each section, GSAP-powered camera transitions, shared atmospheric elements

**Tech Stack:** React Three Fiber, Three.js, GSAP, @react-three/postprocessing, @react-three/drei, Zustand

---

## File Structure Overview

```
apps/web/components/r3f/
├── OdysseyScene.tsx          # Main orchestrator (replace PantheonCanvas)
├── scenes/
│   ├── PortalGate.tsx        # Reusable portal component
│   ├── TempleOfZeus.tsx     # Dashboard portal (replaces TempleScene)
│   ├── MarketArchway.tsx    # Agora portal
│   ├── HallOfGods.tsx       # Legends portal
│   ├── HephaestusForge.tsx  # Forge portal
│   └── ColosseumGate.tsx    # Battle portal
├── environment/
│   ├── GreekSky.tsx         # Constellation starfield
│   ├── MarbleMaterial.tsx    # PBR marble material
│   ├── GoldAccent.tsx        # Gold trim material
│   ├── TorchLight.tsx        # Animated torch
│   ├── GodStatues.tsx        # God silhouettes
│   ├── ParticleSystem.tsx    # Embers & dust
│   └── GreekFountain.tsx   # Water feature
└── transitions/
    ├── CameraFlythrough.tsx  # GSAP camera animation
    └── OdysseyLayout.tsx     # Layout wrapper with navigation

apps/web/lib/
└── odyssey-store.ts          # Zustand store for 3D state
```

---

## Task 1: Odyssey Store

**Files:**
- Create: `apps/web/lib/odyssey-store.ts`

- [ ] **Step 1: Create odyssey store**

```typescript
import { create } from 'zustand'

export type OdysseySection = 'landing' | 'dashboard' | 'agora' | 'legends' | 'forge' | 'battle'

interface OdysseyState {
  activeSection: OdysseySection
  isTransitioning: boolean
  cameraTarget: { x: number; y: number; z: number }
  setActiveSection: (section: OdysseySection) => void
  setTransitioning: (value: boolean) => void
  setCameraTarget: (target: { x: number; y: number; z: number }) => void
}

export const useOdysseyStore = create<OdysseyState>((set) => ({
  activeSection: 'landing',
  isTransitioning: false,
  cameraTarget: { x: 0, y: 4, z: 28 },
  setActiveSection: (section) => set({ activeSection: section }),
  setTransitioning: (value) => set({ isTransitioning: value }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
}))
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/odyssey-store.ts
git commit -m "feat: add odyssey store for 3D navigation state"
```

---

## Task 2: Material Components

**Files:**
- Create: `apps/web/components/r3f/environment/MarbleMaterial.tsx`
- Create: `apps/web/components/r3f/environment/GoldAccent.tsx`

- [ ] **Step 1: Create MarbleMaterial component**

```typescript
'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

interface MarbleMaterialProps {
  roughness?: number
  color?: string
}

export function MarbleMaterial({ roughness = 0.3, color = '#F5F5F0' }: MarbleMaterialProps) {
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness: 0,
      envMapIntensity: 0.5,
    })
    return mat
  }, [roughness, color])

  return <primitive object={material} attach="material" />
}

export function GoldMaterial({ roughness = 0.2, color = '#D4AF37' }: MarbleMaterialProps) {
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness: 0.9,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.15,
    })
    return mat
  }, [roughness, color])

  return <primitive object={material} attach="material" />
}
```

- [ ] **Step 2: Create GoldAccent component**

```typescript
'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

export function GoldAccent({ emissiveIntensity = 0.2 }: { emissiveIntensity?: number }) {
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      roughness: 0.2,
      metalness: 0.9,
      emissive: new THREE.Color('#D4AF37'),
      emissiveIntensity,
    })
  }, [emissiveIntensity])

  return <primitive object={material} attach="material" />
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/r3f/environment/MarbleMaterial.tsx apps/web/components/r3f/environment/GoldAccent.tsx
git commit -m "feat: add marble and gold material components"
```

---

## Task 3: Torch and Particle Systems

**Files:**
- Create: `apps/web/components/r3f/environment/TorchLight.tsx`
- Create: `apps/web/components/r3f/environment/ParticleSystem.tsx`

- [ ] **Step 1: Create animated TorchLight component**

```typescript
'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TorchLightProps {
  position: [number, number, number]
  scale?: number
}

export function TorchLight({ position, scale = 1 }: TorchLightProps) {
  const lightRef = useRef<THREE.PointLight>(null)
  const flameRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime()
      lightRef.current.intensity = 1.5 + Math.sin(t * 8) * 0.3 + Math.sin(t * 12) * 0.2
      lightRef.current.position.x = position[0] + Math.sin(t * 3) * 0.02
    }
    if (flameRef.current) {
      const t = clock.getElapsedTime()
      flameRef.current.scale.y = 1 + Math.sin(t * 10) * 0.1
      flameRef.current.scale.x = 1 + Math.sin(t * 8) * 0.05
    }
  })

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.5, 0]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial
          color="#ff6622"
          emissive="#ff4400"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.5, 0]}
        color="#ff6622"
        intensity={1.5}
        distance={8}
        decay={2}
      />
    </group>
  )
}
```

- [ ] **Step 2: Create ParticleSystem for embers and dust**

```typescript
'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleSystemProps {
  type: 'embers' | 'dust'
  count?: number
  bounds?: { min: THREE.Vector3; max: THREE.Vector3 }
}

export function ParticleSystem({ type = 'embers', count = 50 }: ParticleSystemProps) {
  const meshRef = useRef<THREE.Points>(null)

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2

      velocities[i * 3] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 1] = 0.01 + Math.random() * 0.02
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02

      if (type === 'embers') {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.3
        colors[i * 3 + 2] = 0
      } else {
        colors[i * 3] = 0.9
        colors[i * 3 + 1] = 0.9
        colors[i * 3 + 2] = 0.85
      }
    }
    return { positions, velocities, colors }
  }, [count, type])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const posArray = meshRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3]
      posArray[i * 3 + 1] += velocities[i * 3 + 1]
      posArray[i * 3 + 2] += velocities[i * 3 + 2]

      if (posArray[i * 3 + 1] > 8) {
        posArray[i * 3] = (Math.random() - 0.5) * 20
        posArray[i * 3 + 1] = 0
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={type === 'embers' ? 0.08 : 0.03}
        vertexColors
        transparent
        opacity={type === 'embers' ? 0.8 : 0.4}
        sizeAttenuation
      />
    </points>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/r3f/environment/TorchLight.tsx apps/web/components/r3f/environment/ParticleSystem.tsx
git commit -m "feat: add torch and particle system components"
```

---

## Task 4: Greek Sky and God Statues

**Files:**
- Create: `apps/web/components/r3f/environment/GreekSky.tsx`
- Create: `apps/web/components/r3f/environment/GodStatues.tsx`

- [ ] **Step 1: Create GreekSky with constellations**

```typescript
'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GreekSkyProps {
  starCount?: number
}

export function GreekSky({ starCount = 2000 }: GreekSkyProps) {
  const starsRef = useRef<THREE.Points>(null)

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const r = 80 + Math.random() * 20

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 10
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      sizes[i] = Math.random() * 2 + 0.5
    }
    return { positions, sizes }
  }, [starCount])

  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.002
    }
  })

  const constellationPositions = useMemo(() => [
    // Orion
    { name: 'Orion', points: [[-15, 35, -40], [-12, 38, -42], [-10, 35, -38], [-8, 40, -35], [-6, 36, -40]] },
    // Big Dipper
    { name: 'Ursa Major', points: [[20, 30, -45], [22, 28, -42], [25, 30, -40], [28, 27, -38], [30, 29, -35], [32, 26, -38], [35, 28, -40]] },
    // Cassiopeia
    { name: 'Cassiopeia', points: [[-25, 25, -50], [-22, 22, -48], [-20, 25, -46], [-18, 22, -44], [-15, 25, -42]] },
  ], [])

  return (
    <group>
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={starCount}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#9090ff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {constellationPositions.map((constellation) => (
        <group key={constellation.name}>
          {constellation.points.map((point, i) => (
            <mesh key={i} position={point as [number, number, number]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
            </mesh>
          ))}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={constellation.points.length}
                array={new Float32Array(constellation.points.flat() as number[])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffd700" opacity={0.3} transparent />
          </line>
        </group>
      ))}

      <mesh position={[0, 60, -50]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial color="#ffffdd" emissive="#ffffdd" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Create GodStatues component**

```typescript
'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GodStatueProps {
  god: 'zeus' | 'athena' | 'ares' | 'aphrodite' | 'poseidon'
  position: [number, number, number]
  scale?: number
}

function GodMesh({ god, position, scale = 1 }: GodStatueProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.05
    }
  })

  const color = {
    zeus: '#d4af37',
    athena: '#f5f5f0',
    ares: '#8b0000',
    aphrodite: '#ffb6c1',
    poseidon: '#1a3a5c',
  }[god]

  return (
    <group position={position} scale={scale}>
      <mesh ref={meshRef} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 5, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 5.5, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.5, 8]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      <spotLight
        position={[0, 8, 3]}
        angle={0.4}
        penumbra={0.5}
        intensity={1}
        color="#ffd700"
        castShadow
      />
    </group>
  )
}

export function GodStatues({ gods }: { gods: GodStatueProps[] }) {
  return (
    <group>
      {gods.map((god, i) => (
        <GodMesh key={i} god={god.god} position={god.position} scale={god.scale} />
      ))}
    </group>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/r3f/environment/GreekSky.tsx apps/web/components/r3f/environment/GodStatues.tsx
git commit -m "feat: add Greek sky with constellations and god statues"
```

---

## Task 5: Portal Gate Component

**Files:**
- Create: `apps/web/components/r3f/scenes/PortalGate.tsx`

- [ ] **Step 1: Create reusable PortalGate component**

```typescript
'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MarbleMaterial } from '../environment/MarbleMaterial'
import { GoldAccent } from '../environment/GoldAccent'

interface PortalGateProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  isActive?: boolean
  name?: string
}

export function PortalGate({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  isActive = false,
  name = 'portal'
}: PortalGateProps) {
  const glowRef = useRef<THREE.Mesh>(null)
  const leftColumnRef = useRef<THREE.Group>(null)
  const rightColumnRef = useRef<THREE.Group>(null)

  const columnHeight = 8
  const columnRadius = 0.6

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (glowRef.current && isActive) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.3 + Math.sin(t * 2) * 0.1
    }
    if (leftColumnRef.current && rightColumnRef.current) {
      const openAmount = isActive ? 1.5 : 0
      leftColumnRef.current.position.x = -2 - openAmount
      rightColumnRef.current.position.x = 2 + openAmount
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={leftColumnRef} position={[-2, 0, 0]}>
        <mesh position={[0, columnHeight / 2, 0]}>
          <cylinderGeometry args={[columnRadius, columnRadius * 1.2, columnHeight, 12]} />
          <MarbleMaterial roughness={0.35} />
        </mesh>
        <mesh position={[0, columnHeight + 0.4, 0]}>
          <boxGeometry args={[1.5, 0.8, 1.2]} />
          <MarbleMaterial roughness={0.35} />
        </mesh>
      </group>

      <group ref={rightColumnRef} position={[2, 0, 0]}>
        <mesh position={[0, columnHeight / 2, 0]}>
          <cylinderGeometry args={[columnRadius, columnRadius * 1.2, columnHeight, 12]} />
          <MarbleMaterial roughness={0.35} />
        </mesh>
        <mesh position={[0, columnHeight + 0.4, 0]}>
          <boxGeometry args={[1.5, 0.8, 1.2]} />
          <MarbleMaterial roughness={0.35} />
        </mesh>
      </group>

      <mesh position={[0, columnHeight + 0.8, 0]}>
        <boxGeometry args={[6, 1.2, 1.5]} />
        <MarbleMaterial roughness={0.35} />
      </mesh>

      <mesh position={[0, columnHeight / 2, -0.3]}>
        <boxGeometry args={[4, columnHeight - 1, 0.2]} />
        <GoldAccent emissiveIntensity={isActive ? 0.4 : 0.1} />
      </mesh>

      <mesh ref={glowRef} position={[0, columnHeight / 2, 0.1]}>
        <planeGeometry args={[3, columnHeight - 2]} />
        <meshStandardMaterial
          color="#1a3a5c"
          emissive={isActive ? '#d4af37' : '#1a3a5c'}
          emissiveIntensity={isActive ? 0.5 : 0.1}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {isActive && (
        <>
          <pointLight position={[0, columnHeight / 2, 1]} color="#d4af37" intensity={2} distance={8} />
          <spotLight position={[0, columnHeight + 2, 2]} color="#ffd700" intensity={1} angle={0.5} />
        </>
      )}
    </group>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/r3f/scenes/PortalGate.tsx
git commit -m "feat: add reusable PortalGate component"
```

---

## Task 6: Section Portals

**Files:**
- Create: `apps/web/components/r3f/scenes/TempleOfZeus.tsx`
- Create: `apps/web/components/r3f/scenes/MarketArchway.tsx`
- Create: `apps/web/components/r3f/scenes/HallOfGods.tsx`
- Create: `apps/web/components/r3f/scenes/HephaestusForge.tsx`
- Create: `apps/web/components/r3f/scenes/ColosseumGate.tsx`

- [ ] **Step 1: Create TempleOfZeus (Dashboard portal)**

```typescript
'use client'
import { PortalGate } from './PortalGate'
import { GodStatues } from '../environment/GodStatues'
import { TorchLight } from '../environment/TorchLight'
import { GreekFountain } from '../environment/GreekFountain'

export function TempleOfZeus({ isActive = false }: { isActive?: boolean }) {
  return (
    <group>
      <PortalGate position={[0, 0, -5]} isActive={isActive} name="temple" />

      <GodStatues
        gods={[
          { god: 'zeus', position: [-6, 0, -3], scale: 1.2 },
          { god: 'athena', position: [6, 0, -3], scale: 1.2 },
        ]}
      />

      <TorchLight position={[-4, 0.5, 0]} scale={0.8} />
      <TorchLight position={[4, 0.5, 0]} scale={0.8} />
      <TorchLight position={[-4, 0.5, -4]} scale={0.8} />
      <TorchLight position={[4, 0.5, -4]} scale={0.8} />

      <GreekFountain position={[0, 0, 2]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e8e4d8" roughness={0.8} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Create GreekFountain (needed by TempleOfZeus)**

```typescript
'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GreekFountainProps {
  position: [number, number, number]
  scale?: number
}

export function GreekFountain({ position, scale = 1 }: GreekFountainProps) {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (waterRef.current) {
      const t = clock.getElapsedTime()
      waterRef.current.position.y = 0.1 + Math.sin(t * 2) * 0.02
    }
  })

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[1.5, 1.2, 0.6, 16]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.8, 1, 1, 16]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh ref={waterRef} position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.7, 0.9, 0.1, 16]} />
        <meshStandardMaterial
          color="#4a90a4"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 3: Create MarketArchway (Agora portal)**

```typescript
'use client'
import { PortalGate } from './PortalGate'
import { TorchLight } from '../environment/TorchLight'

export function MarketArchway({ isActive = false }: { isActive?: boolean }) {
  return (
    <group>
      <PortalGate position={[0, 0, -5]} isActive={isActive} name="market" />

      {[-5, -2, 2, 5].map((x, i) => (
        <group key={i} position={[x, 0, -2]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
            <meshStandardMaterial color="#c45c26" roughness={0.7} />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <coneGeometry args={[0.5, 0.5, 8]} />
            <meshStandardMaterial color="#c45c26" roughness={0.7} />
          </mesh>
        </group>
      ))}

      <TorchLight position={[-3, 0.5, -1]} scale={0.6} />
      <TorchLight position={[3, 0.5, -1]} scale={0.6} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d4c8b8" roughness={0.9} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 4: Create HallOfGods (Legends portal)**

```typescript
'use client'
import { PortalGate } from './PortalGate'
import { GodStatues } from '../environment/GodStatues'
import { GoldAccent } from '../environment/GoldAccent'

export function HallOfGods({ isActive = false }: { isActive?: boolean }) {
  return (
    <group>
      <PortalGate position={[0, 0, -5]} isActive={isActive} name="legends" />

      <GodStatues
        gods={[
          { god: 'ares', position: [-8, 0, -4], scale: 1.3 },
          { god: 'aphrodite', position: [-4, 0, -4], scale: 1.2 },
          { god: 'athena', position: [0, 0, -6], scale: 1.4 },
          { god: 'poseidon', position: [4, 0, -4], scale: 1.2 },
          { god: 'zeus', position: [8, 0, -4], scale: 1.3 },
        ]}
      />

      {[...Array(8)].map((_, i) => (
        <group key={i} position={[(i - 3.5) * 3, 0, -8]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.4, 0.5, 8, 10]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2d1b4e" roughness={0.5} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 5: Create HephaestusForge (Forge portal)**

```typescript
'use client'
import { PortalGate } from './PortalGate'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function HephaestusForge({ isActive = false }: { isActive?: boolean }) {
  const lavaRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (lavaRef.current) {
      const t = clock.getElapsedTime()
      lavaRef.current.rotation.z = t * 0.1
    }
  })

  return (
    <group>
      <PortalGate position={[0, 0, -5]} isActive={isActive} name="forge" />

      <mesh position={[0, 0.1, 2]}>
        <boxGeometry args={[3, 0.5, 2]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.5, 2]}>
        <boxGeometry args={[2.5, 0.3, 1.5]} />
        <meshStandardMaterial color="#3d2817" roughness={0.8} />
      </mesh>

      <pointLight position={[0, 1, 2]} color="#ff4400" intensity={3} distance={6} />
      <pointLight position={[-2, 0.5, 0]} color="#ff6622" intensity={1} distance={4} />
      <pointLight position={[2, 0.5, 0]} color="#ff6622" intensity={1} distance={4} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 6: Create ColosseumGate (Battle portal)**

```typescript
'use client'
import { PortalGate } from './PortalGate'

export function ColosseumGate({ isActive = false }: { isActive?: boolean }) {
  return (
    <group>
      <PortalGate position={[0, 0, -5]} isActive={isActive} name="colosseum" />

      {[...Array(6)].map((_, i) => (
        <group key={i} position={[i * 2 - 5, 0, -10]}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 6, 8]} />
            <meshStandardMaterial color="#d4c8b8" roughness={0.7} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 7, -10]}>
        <boxGeometry args={[14, 1, 2]} />
        <meshStandardMaterial color="#d4c8b8" roughness={0.7} />
      </mesh>

      <mesh position={[0, 0, -15]} rotation={[0, 0, 0]}>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color="#1a0a0a" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[25, 30]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/r3f/scenes/TempleOfZeus.tsx apps/web/components/r3f/scenes/MarketArchway.tsx apps/web/components/r3f/scenes/HallOfGods.tsx apps/web/components/r3f/scenes/HephaestusForge.tsx apps/web/components/r3f/scenes/ColosseumGate.tsx apps/web/components/r3f/environment/GreekFountain.tsx
git commit -m "feat: add all section portal scenes"
```

---

## Task 7: Camera Flythrough

**Files:**
- Create: `apps/web/components/r3f/transitions/CameraFlythrough.tsx`

- [ ] **Step 1: Create CameraFlythrough component**

```typescript
'use client'
import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useOdysseyStore } from '@/lib/odyssey-store'

interface CameraConfig {
  position: [number, number, number]
  lookAt: [number, number, number]
}

const sectionCameras: Record<string, CameraConfig> = {
  landing: { position: [0, 4, 28], lookAt: [0, 4, 0] },
  dashboard: { position: [0, 5, 15], lookAt: [0, 4, -5] },
  agora: { position: [0, 4, 18], lookAt: [0, 3, -5] },
  legends: { position: [0, 6, 20], lookAt: [0, 5, -5] },
  forge: { position: [0, 3, 12], lookAt: [0, 2, -5] },
  battle: { position: [0, 5, 16], lookAt: [0, 3, -5] },
}

export function CameraFlythrough() {
  const { camera } = useThree()
  const { activeSection, isTransitioning, setTransitioning } = useOdysseyStore()
  const currentConfig = useRef(sectionCameras.landing)

  useEffect(() => {
    const targetConfig = sectionCameras[activeSection]
    if (!targetConfig || activeSection === 'landing') return

    setTransitioning(true)

    const timeline = gsap.timeline({
      onComplete: () => setTransitioning(false),
    })

    timeline
      .to(camera.position, {
        x: 0,
        y: 8,
        z: 0,
        duration: 0.8,
        ease: 'power2.in',
      })
      .to(camera.position, {
        x: targetConfig.position[0],
        y: targetConfig.position[1],
        z: targetConfig.position[2],
        duration: 1.2,
        ease: 'power2.out',
      })

    currentConfig.current = targetConfig
  }, [activeSection, camera, setTransitioning])

  useFrame(() => {
    const config = currentConfig.current
    camera.lookAt(config.lookAt[0], config.lookAt[1], config.lookAt[2])
  })

  return null
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/r3f/transitions/CameraFlythrough.tsx
git commit -m "feat: add GSAP camera flythrough transitions"
```

---

## Task 8: Main Odyssey Scene

**Files:**
- Create: `apps/web/components/r3f/OdysseyScene.tsx`

- [ ] **Step 1: Create OdysseyScene orchestrator**

```typescript
'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

import { GreekSky } from './environment/GreekSky'
import { ParticleSystem } from './environment/ParticleSystem'
import { GroundFog } from './GroundFog'
import { CameraFlythrough } from './transitions/CameraFlythrough'

import { TempleOfZeus } from './scenes/TempleOfZeus'
import { MarketArchway } from './scenes/MarketArchway'
import { HallOfGods } from './scenes/HallOfGods'
import { HephaestusForge } from './scenes/HephaestusForge'
import { ColosseumGate } from './scenes/ColosseumGate'

import { useOdysseyStore } from '@/lib/odyssey-store'

function SceneContent() {
  const { activeSection } = useOdysseyStore()

  return (
    <>
      <CameraFlythrough />

      <GreekSky starCount={2000} />

      <ambientLight intensity={0.15} color="#1a3a5c" />
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.2}
        color="#9090ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {activeSection === 'landing' && (
        <>
          <TempleOfZeus isActive={true} />
          <ParticleSystem type="embers" count={30} />
        </>
      )}
      {activeSection === 'dashboard' && <TempleOfZeus isActive={true} />}
      {activeSection === 'agora' && <MarketArchway isActive={true} />}
      {activeSection === 'legends' && <HallOfGods isActive={true} />}
      {activeSection === 'forge' && <HephaestusForge isActive={true} />}
      {activeSection === 'battle' && <ColosseumGate isActive={true} />}

      <GroundFog />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0a0a0f" roughness={1} />
      </mesh>

      <EffectComposer multisampling={4}>
        <Bloom
          intensity={0.5}
          mipmapBlur
          luminanceThreshold={0.7}
          luminanceSmoothing={0.4}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.9} />
      </EffectComposer>
    </>
  )
}

interface OdysseySceneProps {
  currentRoute: string
}

export default function OdysseyScene({ currentRoute }: OdysseySceneProps) {
  const { setActiveSection } = useOdysseyStore()

  useEffect(() => {
    const sectionMap: Record<string, string> = {
      '/': 'landing',
      '/dashboard': 'dashboard',
      '/agora': 'agora',
      '/legends': 'legends',
      '/forge': 'forge',
    }

    const basePath = '/' + currentRoute.split('/')[1]
    const section = sectionMap[basePath] || 'landing'
    setActiveSection(section as any)
  }, [currentRoute, setActiveSection])

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 4, 28], fov: 55 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        shadows={{ type: PCFSoftShadowMap }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/r3f/OdysseyScene.tsx
git commit -m "feat: create main OdysseyScene orchestrator"
```

---

## Task 9: Integration with Navigation

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/components/ui/Navigation.tsx`

- [ ] **Step 1: Update Navigation component for Greek styling**

```typescript
// Add Greek-styled active state to Navigation.tsx
// Replace the active indicator with gold glow and Greek key pattern

// In the NavItem component, change active state styling:
// active: "text-[#D4AF37] border-b-2 border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"

// Add Greek key pattern via CSS or inline SVG for visual accent
```

- [ ] **Step 2: Update layout to include OdysseyScene**

```typescript
// In apps/web/app/layout.tsx, import OdysseyScene and use it
// Replace existing PantheonCanvas with OdysseyScene

import OdysseyScene from '@/components/r3f/OdysseyScene'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <html lang="en">
      <body>
        <OdysseyScene currentRoute={pathname} />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/layout.tsx apps/web/components/ui/Navigation.tsx
git commit -m "feat: integrate OdysseyScene into layout"
```

---

## Task 10: Polish and Testing

**Files:**
- Test all route transitions

- [ ] **Step 1: Verify all pages work correctly**

Test each route:
- `/` - Landing (Temple)
- `/dashboard` - Dashboard portal
- `/agora` - Agora portal
- `/legends` - Legends portal
- `/forge` - Forge portal
- `/colosseum` - Battle portal

- [ ] **Step 2: Check performance**

Run dev server and verify 60fps on desktop

- [ ] **Step 3: Commit**

```bash
git commit -m "fix: polish and verify all routes"
```

---

## Plan Complete

The plan creates:
1. Odyssey store for 3D navigation state
2. Reusable marble and gold materials
3. Animated torch and particle systems
4. Greek sky with constellations and god statues
5. Reusable portal gate with active/inactive states
6. 5 themed section portals (Temple, Market, Hall, Forge, Colosseum)
7. GSAP camera flythrough transitions
8. Main OdysseyScene orchestrator
9. Navigation integration

All acceptance criteria from the spec should be met after execution.

**Plan complete and saved to `docs/superpowers/plans/2026-05-01-greek-3d-odyssey-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?