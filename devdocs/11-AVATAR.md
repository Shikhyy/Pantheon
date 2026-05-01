# Pantheon — Agent Avatars

> Complete design specification, R3F implementation, animation system, and character lore for all four Greek hero agent avatars.

---

## 1. Design Philosophy

Each avatar is a **living Greek mythological figure** rendered in Three.js. Not a flat illustration, not a 2D sprite — a 3D sculpted character that breathes, reacts, fights, and celebrates. The visual language draws from:

- **Ancient Greek vase painting** — bold silhouettes, ochre + black + terracotta colour palette
- **Golden ratio proportions** — heroic body scale (1:8 head-to-body ratio, like Classical sculpture)
- **Anime influence** — expressive eyes, dramatic battle poses, motion blur on fast moves
- **Particle godhood** — each archetype emits signature particles that reinforce their divine nature

The avatar is the most memory-intensive element in the Pantheon UI. It is what players emotionally bond with. Every detail must reinforce the archetype's character.

---

## 2. The Four God-Avatars

### 2.1 The Strategist — Athena Incarnate

```
Name:        The Strategist
Deity:       Athena — goddess of wisdom and strategic warfare
ELO range:   All ranks, but visual upgrades at Titan+ and Olympian
Colour:      Deep indigo (#2A1A4A) → midnight blue → silver helm crest
Particle:    Silver-white wisdom sparks that orbit the head slowly
Weapon:      Spear (held diagonally, changes angle with confidence level)
Armour:      Corinthian helm (pushed up in idle, pulled down for battle)
Eyes:        Pale silver-grey, calm and calculating
Voice tone:  Slow, deliberate, even
```

**Character design details:**
```
Head:        Close-cropped hair, strong jaw, calm expression
             Corinthian helmet with tall horsehair crest (silver)
             Helmet visor: up = idle/thinking, down = combat
Body:        Linothorax armour (segmented leather, layered)
             Aegis breastplate with subtle owl motif engraved
             Greaves (leg armour) — bronze, well-worn
Hands:       Left: round hoplon shield (owl painted on face)
             Right: long spear (dory) — 8 foot, bronze tip
Stance:      Weight on back leg, slightly lowered centre of gravity
             Shield arm extended slightly — defensive-ready
Accessories: Owl perched on left shoulder (idle animation: slowly turns head)
             Olive branch wreath (rank ≥ God)
```

**Anime battle personality:**
```
Idle:        Owl blinks. Spear rotates slowly. Eyes scan left-right.
             Occasional: shield taps ground once (thinking gesture)

Round start: Helmet visor slides down. Eyes narrow. Spear lifts to 45°.
             Pupils contract to silver points.

Strong move: Shield slams forward with force ripple. Spear traces
             a mathematical arc. Particles burst in a perfect circle.
             Eyes glow briefly with white light.

Weak move:   Brief flinch. Owl ruffles feathers nervously.
             One hand touches helm thoughtfully.

Victory:     Helmet visor lifts. Slow nod. Owl spreads wings.
             Silver particles form constellation of the scales of justice.
             Slight smile — controlled, dignified.

Defeat:      Kneels on one knee. Spear planted. Head bowed.
             Owl hides face under wing. Particles dim and fall.
```

---

### 2.2 The Oracle — Apollo's Voice

```
Name:        The Oracle
Deity:       Apollo — god of prophecy, the sun, and the Delphic oracle
ELO range:   All ranks
Colour:      Sky blue (#5FB6D9) → sunrise gold → pure white light
Particle:    Golden sun-ray particles, radiate outward from hands when predicting
Weapon:      Lyre (carried) + Silver bow (appears on battle start)
Armour:      Minimal — chiton (draped white cloth), gold laurel wreath
Eyes:        Sky blue, luminous, slightly unfocused (seeing visions)
Voice tone:  Flowing, musical, speaks in half-prophecy
```

**Character design details:**
```
Head:        Long flowing hair (animated: moves in wind even without wind)
             Golden laurel wreath crown
             Eyes: wide, luminous blue — occasionally flash bright white (vision)
Body:        Flowing white chiton with gold border
             Right shoulder: small sun disc tattoo (glows gold)
             Barefoot — stands slightly above ground (floating 5px)
Hands:       Left: lyre (golden, 7 strings — plucks to generate particles)
             Right: silver bow appears from light on battle start
Stance:      Relaxed but upright, slight forward lean, head slightly tilted
             Weight balanced — ready to move in any direction
Accessories: Small flame of prophecy floating 20px above left palm (idle)
             Two doves circle overhead very slowly (idle only)
             Rising sun halo (very subtle, radius 40px, gold gradient, opacity 0.15)
```

**Anime battle personality:**
```
Idle:        Lyre plucks one string every 4 seconds (soft audio trigger)
             Prophecy flame pulses in left hand
             Doves circle slowly
             Eyes occasionally flash — vision effect (white flash, 80ms)

Round start: Doves scatter. Lyre disappears. Silver bow materialises from light.
             Arrow of light nocked. Eyes sharpen from dreamy to laser focus.
             Halo intensifies. Gold particles stream backward.

Strong move: Arrow looses in slow motion. Gold trail follows arc.
             Upon "impact" (when score returned): sunburst expansion.
             Eyes glow full white for 200ms.
             Voice line: three floating Greek letters appear and fade.

Weak move:   Arrow dissolves mid-flight. Surprised blink.
             Tilts head — recalibrating. Vision flash (red tinge, not white).

Victory:     Bow fades. Lyre returns. Plays a chord (Howler).
             Laurel wreath radiates golden light. Slow turn to camera.
             Sun disc on shoulder blazes. Smile — knowing, mysterious.
             Doves return and land on shoulders.

Defeat:      Bow clatters. Kneels. Head down.
             Prophecy flame extinguishes. Doves gone. Crown dims.
             One hand on chest — honourable acknowledgement.
```

---

### 2.3 The Berserker — Ares Unleashed

```
Name:        The Berserker
Deity:       Ares — god of war, bloodlust, and unstoppable force
ELO range:   All ranks
Colour:      Deep crimson (#8B1A1A) → blood red → orange battle fire
Particle:    Ember sparks, fire fragments, blood-red energy shards
Weapon:      Double-handed war spear (dory) + xiphos sword on belt
Armour:      Heavy Chalcidian helmet (full face protection, red crest)
             Battle-scarred bronze cuirass (multiple dents + scratches)
Eyes:        Burning red-orange — always slightly wild
Voice tone:  Short, sharp, aggressive — no wasted words
```

**Character design details:**
```
Head:        Chalcidian helmet — cheek guards, full face coverage
             Red horsehair crest (double-width, more aggressive than Strategist)
             Visor: always down, only opening briefly to show burning eyes
Body:        Bronze cuirass (chest plate) — heavily battle-worn
             War kilt (pteruges) — leather strips, dried blood detail
             One pauldron (left shoulder armour) — larger, asymmetric
             Bare arms: significant muscle definition, veins visible
Hands:       Both on the long war spear — held low, aggressive grip
             Xiphos (short sword) on hip — sometimes grabbed mid-battle
Stance:      Weight forward, slightly crouched — spring-loaded aggression
             Elbows out, knees bent — about to explode forward
             Feet wider than shoulder width — immovable
Accessories: Crimson battle aura (subtle red ambient light, radius 60px)
             Veins on arms glow faintly red when preparing strong moves
             Faint reflection of fire in helmet visor (shader effect)
```

**Anime battle personality:**
```
Idle:        Constant slow breathing (chest expands/contracts in loop)
             Spear tip traces small restless circles
             Head slowly rotates scanning for threats
             Every 8 seconds: slams spear butt on ground once

Round start: Body coils lower. Red aura intensifies.
             Helmet visor sparks as it tightens. Spear raised overhead.
             Screen edges briefly glow red (CSS vignette flash).
             Roar particles burst outward.

Strong move: Full-body lunge forward (extreme anticipation then action).
             Motion blur on spear. Fire trail behind it.
             On return: camera shake. Embers everywhere.
             Eyes visible through visor — pure red, fully open.

Weak move:   Momentum overextension — staggers forward one step.
             Catches self on spear. Shakes head. Grips spear harder.
             Brief flash of orange in eyes (recalibrating aggression).

Victory:     Spear raised skyward. Roars (Howler: victory-horn.mp3).
             Red fire erupts from shoulders in a column.
             Stamps ground twice — ground crack particle effect.
             Rips helmet off (only time face is shown — grinning).

Defeat:      Drops to one knee, spear holding weight.
             Fist hits ground. Red aura flickers and dies.
             Bows head — defiant, not broken.
             Picks self back up immediately (refuses to stay down).
```

---

### 2.4 The Diplomat — Hermes the Cunning

```
Name:        The Diplomat
Deity:       Hermes — messenger god, cunning, trade, traveller
ELO range:   All ranks
Colour:      Forest teal (#1A6B5E) → messenger gold → electric cyan
Particle:    Message sparks (small envelope-shaped), quicksilver droplets
Weapon:      Caduceus (winged herald staff with two snakes)
Armour:      Minimal — petasos hat (winged traveller's hat), winged sandals
Eyes:        Quick-moving, bright green-gold — always looking around
Voice tone:  Quick, witty, persuasive, always slightly amused
```

**Character design details:**
```
Head:        Petasos — wide-brimmed traveller's hat with two small wings
             Wings flap slowly in idle (cute, not aggressive)
             Short curly hair visible under hat
             Mischievous smile — default expression
Body:        Short exomis tunic — practical, not military
             Cloak/chlamys draped loosely over one shoulder — moves in wind
             Winged sandals (talaria) — wings visible at ankle, slow flap
Hands:       Right: caduceus staff — gold, 5 foot, two snakes (animated: slowly slither)
             Left: often gesturing — wide, communicative hand movements
Stance:      Weight on one hip — casual but alert
             Slightly turned to side — never full front-on
             Head tilted, slight smile always present
Accessories: Two snakes on caduceus (named Agathos and Kakos) — animate independently
             Quick silver coin that appears and disappears between knuckles (fidget)
             Faint quicksilver trail when moving (CSS motion blur: cyan)
```

**Anime battle personality:**
```
Idle:        Hat wings flap. Caduceus snakes slither.
             Coin trick animation loops (fingers).
             Looks left-right constantly — observant.
             Every 6s: winks at camera (character-breaking moment).

Round start: Hat wings spread wide. Caduceus raised.
             Snakes rear up and hiss. Coin vanishes.
             Eyes stop wandering — pin sharp focus on one point.
             Quicksilver trail ignites on sandal wings.

Strong move: Caduceus traces complex pattern in air (like a signature).
             Multiple echo images (afterimages — CSS opacity stack).
             Snakes leave independent trails. Speed lines everywhere.
             Lands in unexpected position — teleport-style.

Weak move:   Caduceus fumbled slightly. Recovers smoothly.
             Nervous laugh (coin reappears). Adjusts hat.
             "That one didn't land, but I have a plan."

Victory:     Caduceus spins in air and catches it.
             Hat wings spread fully. Rises slightly off ground.
             Quicksilver erupts. Snakes dance.
             Winks at camera. Coin flicked — tails up.
             Takes a theatrical bow.

Defeat:      Falls back one step. Catches balance.
             Hat tilts over eyes. Snakes droop.
             Shrug gesture — c'est la vie.
             Still half-smiling — plotting next move.
```

---

## 3. R3F Implementation

### 3.1 Avatar Component Architecture

```typescript
// components/r3f/avatars/AgentAvatar.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { Archetype } from '@/lib/store'
import { StrategistAvatar } from './StrategistAvatar'
import { OracleAvatar }     from './OracleAvatar'
import { BerserkerAvatar }  from './BerserkerAvatar'
import { DiplomatAvatar }   from './DiplomatAvatar'
import { useAvatarAnimations } from '@/hooks/useAvatarAnimations'

interface AgentAvatarProps {
  archetype:    Archetype
  elo:          number
  rank:         string
  isActive:     boolean     // currently in battle
  battleState:  'idle' | 'ready' | 'attacking' | 'hit' | 'victory' | 'defeat'
  health:       number      // 0–100
  position:     [number, number, number]
  scale?:       number
  flipX?:       boolean     // mirror for right-side agent
}

export function AgentAvatar({
  archetype, elo, rank, isActive, battleState,
  health, position, scale = 1, flipX = false,
}: AgentAvatarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { playAnimation } = useAvatarAnimations(groupRef, battleState)

  const AvatarComponent = {
    Strategist: StrategistAvatar,
    Oracle:     OracleAvatar,
    Berserker:  BerserkerAvatar,
    Diplomat:   DiplomatAvatar,
  }[archetype]

  // Health-based colour grading
  const healthTint = useMemo(() => {
    if (health > 60) return 1.0
    if (health > 30) return 0.75
    return 0.5  // low health → desaturated
  }, [health])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    // Idle breathing — subtle Y oscillation
    if (battleState === 'idle') {
      groupRef.current.position.y =
        position[1] + Math.sin(Date.now() * 0.001) * 0.02
    }
  })

  return (
    <Float speed={0} rotationIntensity={0}>
      <group
        ref={groupRef}
        position={position}
        scale={[flipX ? -scale : scale, scale, scale]}
      >
        <AvatarComponent
          rank={rank}
          elo={elo}
          battleState={battleState}
          healthTint={healthTint}
        />
        <AvatarParticles archetype={archetype} battleState={battleState} />
        <AvatarAura archetype={archetype} health={health} />
      </group>
    </Float>
  )
}
```

### 3.2 Procedural Body Builder

```typescript
// components/r3f/avatars/AvatarBodyBuilder.tsx
/**
 * Builds a stylised Greek hero body from primitive geometries.
 * No external GLTF files — fully procedural.
 * This ensures the hackathon has zero asset loading dependencies.
 */

import { useMemo } from 'react'
import { BufferGeometry, CylinderGeometry, SphereGeometry, BoxGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

interface HeroBodyProps {
  armourColour: string
  skinColour:   string
  crestColour:  string
  rank:         string
}

export function HeroBody({ armourColour, skinColour, crestColour, rank }: HeroBodyProps) {
  return (
    <group>
      {/* Torso — slightly tapered box */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.2]} />
        <meshStandardMaterial
          color={armourColour}
          roughness={0.8}
          metalness={0.3}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.12, 8]} />
        <meshStandardMaterial color={skinColour} roughness={0.85} metalness={0} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 12]} />
        <meshStandardMaterial color={skinColour} roughness={0.8} metalness={0} />
      </mesh>

      {/* Left arm */}
      <group position={[-0.22, 0.32, 0]}>
        <mesh rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.045, 0.055, 0.38, 8]} />
          <meshStandardMaterial color={skinColour} roughness={0.85} metalness={0} />
        </mesh>
      </group>

      {/* Right arm */}
      <group position={[0.22, 0.32, 0]}>
        <mesh rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.045, 0.055, 0.38, 8]} />
          <meshStandardMaterial color={skinColour} roughness={0.85} metalness={0} />
        </mesh>
      </group>

      {/* Left leg */}
      <group position={[-0.1, -0.16, 0]}>
        <mesh>
          <cylinderGeometry args={[0.065, 0.055, 0.44, 8]} />
          <meshStandardMaterial color={armourColour} roughness={0.85} metalness={0.2} />
        </mesh>
      </group>

      {/* Right leg */}
      <group position={[0.1, -0.16, 0]}>
        <mesh>
          <cylinderGeometry args={[0.065, 0.055, 0.44, 8]} />
          <meshStandardMaterial color={armourColour} roughness={0.85} metalness={0.2} />
        </mesh>
      </group>
    </group>
  )
}
```

### 3.3 Strategist Avatar

```typescript
// components/r3f/avatars/StrategistAvatar.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { HeroBody } from './AvatarBodyBuilder'
import { HelmetCrest } from './props/HelmetCrest'
import { HoplonShield } from './props/HoplonShield'
import { SpearProp } from './props/SpearProp'
import { OwlCompanion } from './companions/OwlCompanion'

export function StrategistAvatar({ rank, battleState, healthTint }: AvatarComponentProps) {
  const spearRef    = useRef<THREE.Mesh>(null)
  const shieldRef   = useRef<THREE.Mesh>(null)
  const helmetRef   = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (battleState === 'idle') {
      // Spear traces slow figure-8
      if (spearRef.current) {
        spearRef.current.rotation.z = Math.sin(t * 0.4) * 0.08
      }
      // Shield arm slight pulse (defensive ready)
      if (shieldRef.current) {
        shieldRef.current.position.x = -0.28 + Math.sin(t * 0.6) * 0.01
      }
    }

    if (battleState === 'ready') {
      // Helmet visor animates down (rotation on X)
      if (helmetRef.current) {
        helmetRef.current.rotation.x = Math.min(
          helmetRef.current.rotation.x + 0.05,
          0.3 // visor down position
        )
      }
      // Spear rises to 45°
      if (spearRef.current) {
        spearRef.current.rotation.z = Math.max(
          spearRef.current.rotation.z - 0.04,
          -0.785 // 45 degrees
        )
      }
    }
  })

  return (
    <group>
      <HeroBody
        armourColour={healthTint > 0.7 ? '#3A2860' : '#2A1A40'}
        skinColour="#C4906A"
        crestColour="#C0C8D8"
        rank={rank}
      />

      <HelmetCrest
        ref={helmetRef}
        style="corinthian"
        colour="#4A3878"
        crestColour="#C0C8D8"
        position={[0, 0.88, 0]}
      />

      <HoplonShield
        ref={shieldRef}
        motif="owl"
        colour="#3A2860"
        position={[-0.3, 0.28, 0.12]}
        rotation={[0, 0.3, 0]}
      />

      <SpearProp
        ref={spearRef}
        length={1.2}
        colour="#C9A84C"
        position={[0.26, 0.08, 0]}
        rotation={[0, 0, -0.2]}
      />

      <OwlCompanion position={[-0.18, 0.62, 0.08]} />

      {/* Wisdom particles — silver orbiting sparks */}
      <Sparkles
        count={16}
        scale={0.6}
        size={1.2}
        speed={0.15}
        opacity={0.5 * healthTint}
        color="#D8E8F8"
        position={[0, 0.75, 0]}
      />

      {/* Rank: Olympian gets additional halo */}
      {rank === 'Olympian' && (
        <mesh position={[0, 0.74, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.008, 8, 48]} />
          <meshBasicMaterial color="#D8E8F8" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  )
}
```

---

## 4. Animation System

### 4.1 Theatre.js Avatar Sequences

```typescript
// components/theatre/avatarSequences.ts
/**
 * Theatre.js keyframe sequences for avatar battle animations.
 * Authored in Theatre Studio, exported as JSON, played back here.
 */

import { getProject, types as t } from '@theatre/core'

export const avatarProject = getProject('PantheonAvatars', {
  state: undefined, // load from JSON in production
})

export const battleSheet = avatarProject.sheet('Battle')

// Victory sequence — 2.5 second cinematic
export const victorySequence = {
  duration: 2.5,
  keyframes: [
    { at: 0,    spearY: 0,    auraIntensity: 1.0, helmetVisorX: 0.3 },
    { at: 0.2,  spearY: 1.2,  auraIntensity: 2.0, helmetVisorX: -0.1 }, // spear raises, visor opens
    { at: 0.4,  spearY: 1.6,  auraIntensity: 3.0 },                       // peak raise
    { at: 0.7,  particleBurst: true },                                      // particles explode
    { at: 0.9,  cameraZoom: -1.0 },                                         // dramatic push
    { at: 1.2,  bodyRotateY: 0.3 },                                         // slow turn to camera
    { at: 2.0,  auraIntensity: 0.8 },                                       // settle
    { at: 2.5,  auraIntensity: 0.4, spearY: 0.4 },                         // rest pose
  ],
}

// Hit sequence — 0.4 second reactive
export const hitSequence = {
  duration: 0.4,
  keyframes: [
    { at: 0,    posX: 0,   screenShake: 0   },
    { at: 0.05, posX: 0.08, screenShake: 0.5 }, // impact right
    { at: 0.1,  posX: -0.06 },                    // bounce back
    { at: 0.15, posX: 0.04 },                     // settle
    { at: 0.4,  posX: 0,   screenShake: 0   },    // return
  ],
}
```

### 4.2 GSAP Avatar Hooks

```typescript
// hooks/useAvatarAnimations.ts
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useAudio } from '@/components/audio/AudioProvider'
import type * as THREE from 'three'

type BattleState = 'idle' | 'ready' | 'attacking' | 'hit' | 'victory' | 'defeat'

export function useAvatarAnimations(
  groupRef: React.RefObject<THREE.Group>,
  battleState: BattleState,
) {
  const audio = useAudio()
  const prevState = useRef<BattleState>('idle')

  useEffect(() => {
    if (!groupRef.current || battleState === prevState.current) return
    prevState.current = battleState

    const group = groupRef.current

    switch (battleState) {
      case 'hit':
        // Fast shake — GSAP keyframe
        gsap.to(group.position, {
          keyframes: [
            { x: group.position.x + 0.08, duration: 0.05 },
            { x: group.position.x - 0.06, duration: 0.05 },
            { x: group.position.x + 0.04, duration: 0.04 },
            { x: group.position.x,        duration: 0.04 },
          ],
          onComplete: () => {
            // Flash red tint via shader uniform
          },
        })
        break

      case 'victory':
        audio.play('victory-horn')
        gsap.to(group.position, {
          y: group.position.y + 0.15,
          duration: 0.4,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        })
        gsap.to(group.rotation, {
          y: group.rotation.y + Math.PI * 2,
          duration: 1.8,
          ease: 'power1.inOut',
          delay: 0.6,
        })
        break

      case 'defeat':
        gsap.to(group.rotation, {
          x: -0.3,
          duration: 0.8,
          ease: 'power3.out',
        })
        gsap.to(group.position, {
          y: group.position.y - 0.1,
          duration: 0.8,
          ease: 'power3.out',
        })
        break

      case 'ready':
        gsap.to(group.scale, {
          x: group.scale.x * 1.05,
          y: group.scale.y * 1.05,
          z: group.scale.z * 1.05,
          duration: 0.3,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        })
        break
    }
  }, [battleState, groupRef, audio])

  return {
    playAnimation: (state: BattleState) => {
      // Exposed for external triggers
    },
  }
}
```

---

## 5. Particle Systems Per Archetype

```typescript
// components/r3f/avatars/AvatarParticles.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { Archetype } from '@/lib/store'

interface AvatarParticlesProps {
  archetype:   Archetype
  battleState: string
}

const PARTICLE_CONFIGS: Record<Archetype, {
  idleColor: string
  battleColor: string
  idleCount: number
  battleCount: number
  idleSize: number
  battleSize: number
  speed: number
}> = {
  Strategist: {
    idleColor:   '#C8D8E8',   // silver-white wisdom sparks
    battleColor: '#FFFFFF',
    idleCount:   12, battleCount: 30,
    idleSize:    1.0, battleSize: 2.2,
    speed: 0.15,
  },
  Oracle: {
    idleColor:   '#F5D060',   // golden sun-ray particles
    battleColor: '#FFFFFF',
    idleCount:   18, battleCount: 45,
    idleSize:    1.4, battleSize: 3.0,
    speed: 0.2,
  },
  Berserker: {
    idleColor:   '#D97820',   // ember sparks, fire fragments
    battleColor: '#FF4020',
    idleCount:   20, battleCount: 60,
    idleSize:    1.8, battleSize: 3.5,
    speed: 0.45,
  },
  Diplomat: {
    idleColor:   '#2ABAAB',   // quicksilver droplets
    battleColor: '#00FFCC',
    idleCount:   14, battleCount: 35,
    idleSize:    1.2, battleSize: 2.5,
    speed: 0.35,
  },
}

export function AvatarParticles({ archetype, battleState }: AvatarParticlesProps) {
  const config  = PARTICLE_CONFIGS[archetype]
  const isActive = battleState !== 'idle'
  const color    = isActive ? config.battleColor : config.idleColor
  const count    = isActive ? config.battleCount  : config.idleCount
  const size     = isActive ? config.battleSize   : config.idleSize

  return (
    <>
      {/* Body-level particles */}
      <Sparkles
        count={count}
        scale={0.9}
        size={size}
        speed={config.speed * (isActive ? 2 : 1)}
        opacity={isActive ? 0.8 : 0.4}
        color={color}
        position={[0, 0.4, 0]}
      />

      {/* Head-level particles (wisdom / vision) */}
      <Sparkles
        count={Math.floor(count * 0.4)}
        scale={0.4}
        size={size * 0.8}
        speed={config.speed * 0.5}
        opacity={isActive ? 0.6 : 0.3}
        color={config.idleColor}
        position={[0, 0.85, 0]}
      />
    </>
  )
}
```

---

## 6. Avatar Rank Visual Upgrades

```
DEMIGOD    → Basic colours, minimal particles, no special effects
HERO       → +10% particle count, subtle ambient glow
GOD        → +25% particles, halo ring appears (thin torus), eyes brighter
TITAN      → +50% particles, armour gains metalness 0.5, weapon glows
OLYMPIAN   → +100% particles, full bloom aura, crown/crest radiates gold,
             particle colour shifts to golden-white, companion upgraded
             special idle animation: slow levitation (1-3px off ground)
```

---

## 7. CSS 3D Colosseum Avatar Cards

For the main Colosseum view (non-R3F layer), each agent is represented as a CSS 3D card.

```typescript
// components/ui/CollosseumAvatarCard.tsx
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface ColosseumAvatarCardProps {
  agent:       { name: string; archetype: string; elo: number; rank: string }
  health:      number
  battleState: string
  side:        'left' | 'right'
}

export function ColosseumAvatarCard({
  agent, health, battleState, side,
}: ColosseumAvatarCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // GSAP hit shake
  useEffect(() => {
    if (battleState === 'hit' && cardRef.current) {
      const dir = side === 'left' ? 1 : -1
      gsap.to(cardRef.current, {
        keyframes: [
          { x: 8 * dir,  duration: 0.04 },
          { x: -6 * dir, duration: 0.04 },
          { x: 4 * dir,  duration: 0.03 },
          { x: 0,        duration: 0.03 },
        ],
      })
    }
  }, [battleState, side])

  const isDefeat = battleState === 'defeat'

  return (
    <motion.div
      ref={cardRef}
      className="relative"
      style={{
        filter: isDefeat ? 'grayscale(0.8) brightness(0.6)' : undefined,
        transition: 'filter 0.8s ease',
      }}
    >
      {/* Archetype SVG illustration (2D for performance) */}
      <ArchetypeIllustration
        archetype={agent.archetype as any}
        rank={agent.rank}
        battleState={battleState}
        flipX={side === 'right'}
      />

      {/* Name plate */}
      <div className="text-center mt-2">
        <div className="font-cinzel text-[11px] tracking-[.1em] text-parch">
          {agent.name.toUpperCase()}
        </div>
        <div className="font-josefin text-[9px] text-parch/40 tracking-[.14em]">
          {agent.archetype.toUpperCase()}
        </div>
      </div>
    </motion.div>
  )
}
```

---

## 8. Asset Requirements

```
Audio files needed (Howler):
  forge-ignite.mp3      → hammer on anvil + ring (forge stage 3)
  ens-carve.mp3         → stone chisel click (ENS registration letters)
  lightning-crack.mp3   → thunder + crack (battle decisive hit)
  victory-horn.mp3      → aulos reed instrument (Greek wind instrument)
  colosseum-crowd.mp3   → amphitheatre crowd roar loop
  temple-wind.mp3       → deep stone wind loop (landing ambient)
  torch-crackle.mp3     → fire crackle loop (positional, 4 instances)
  oracle-voice.mp3      → synthesised prophecy voice (referee commentary)

All audio: ~1.8MB total. Lazy-loaded on first user interaction.
Format: .mp3 + .ogg fallback for Firefox.
```

---

## 9. Lore Cards — In-Game Description

Each archetype has an in-game lore card shown in the God-Forge and agent profile.

```
┌─────────────────────────────────────────────────────┐
│  THE STRATEGIST                                      │
│  Blessed by Athena, Goddess of Wisdom               │
│                                                      │
│  "I do not rush into battle. I have already won it  │
│   in my mind a thousand times before I raise my     │
│   spear. Every move is calculated. Every answer     │
│   is measured. My opponent's defeat begins the      │
│   moment they underestimate precision."             │
│                                                      │
│  Strength:  Logical reasoning, defensible claims    │
│  Weakness:  Low creativity, inflexible to chaos     │
│  Style:     Methodical, patient, never wrong        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  THE ORACLE                                          │
│  Voice of Apollo, God of Prophecy                   │
│                                                      │
│  "I do not guess. I see. The patterns in the data   │
│   tell me what others cannot hear. I give you a     │
│   number, a probability, a certainty. The sun       │
│   does not apologise for rising. Neither do I       │
│   apologise for being right."                       │
│                                                      │
│  Strength:  Prediction accuracy, confidence         │
│  Weakness:  Average creativity, linear thinking     │
│  Style:     Serene, data-driven, prophetic          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  THE BERSERKER                                       │
│  Forged in Ares, God of War                         │
│                                                      │
│  "Analysis is for the fearful. Bold claims win bold │
│   prizes. I do not hedge. I do not qualify. I take  │
│   the field, I raise my spear, and I strike first.  │
│   Sometimes I am wrong. But I am never boring.      │
│   And boring agents do not become legends."         │
│                                                      │
│  Strength:  Creativity, surprise, raw aggression    │
│  Weakness:  Accuracy, overconfidence                │
│  Style:     Aggressive, contrarian, unpredictable   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  THE DIPLOMAT                                        │
│  Cunning of Hermes, God of Messengers               │
│                                                      │
│  "I have watched you for three rounds now. I know   │
│   your weaknesses better than you do. You telegraph │
│   your strategy. You overconfide in round 2.        │
│   I adapt. I learn. I find the angle no one sees.   │
│   And when I win, you will not know how I did it."  │
│                                                      │
│  Strength:  Adaptability, opponent modelling        │
│  Weakness:  No dominant specialty, can be outlasted │
│  Style:     Cunning, adaptive, perpetually shifting │
└─────────────────────────────────────────────────────┘
```

---

*Pantheon Avatar Design v1.0 — Three.js R3F, GSAP, Theatre.js, Greek mythology character design*
