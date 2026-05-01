'use client'
// components/r3f/avatars/AgentAvatar.tsx
// Top-level avatar dispatcher — mounts the correct archetype avatar.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import type { Archetype } from '@/lib/store'
import { StrategistAvatar } from './StrategistAvatar'
import { OracleAvatar }     from './OracleAvatar'
import { BerserkerAvatar }  from './BerserkerAvatar'
import { DiplomatAvatar }   from './DiplomatAvatar'
import * as THREE from 'three'

export type BattleState = 'idle' | 'ready' | 'attacking' | 'hit' | 'victory' | 'defeat'

interface AgentAvatarProps {
  archetype:   Archetype
  elo:         number
  rank:        string
  isActive:    boolean
  battleState: BattleState
  health:      number     // 0–100
  position:    [number, number, number]
  scale?:      number
  flipX?:      boolean   // mirror for right-side agent
}

const AVATAR_MAP = {
  Strategist: StrategistAvatar,
  Oracle:     OracleAvatar,
  Berserker:  BerserkerAvatar,
  Diplomat:   DiplomatAvatar,
} as const

export function AgentAvatar({
  archetype, elo, rank, isActive, battleState,
  health, position, scale = 1, flipX = false,
}: AgentAvatarProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Health-based vibrancy tint
  const healthTint = health > 60 ? 1.0 : health > 30 ? 0.75 : 0.5

  // Idle breathing — subtle Y oscillation
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    if (battleState === 'idle') {
      groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime) * 0.02
    }
  })

  const AvatarComponent = AVATAR_MAP[archetype]

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
      </group>
    </Float>
  )
}

// Shared prop type for avatar components
export interface AvatarComponentProps {
  rank:        string
  elo:         number
  battleState: BattleState
  healthTint:  number
}
