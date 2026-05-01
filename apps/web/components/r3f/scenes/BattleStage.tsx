'use client'
// components/r3f/scenes/BattleStage.tsx
// Full R3F battle scene with two opposing avatars, arena floor, and column lighting.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, Grid } from '@react-three/drei'
import { AgentAvatar, type BattleState } from '../avatars/AgentAvatar'
import type { Archetype } from '@/lib/store'
import * as THREE from 'three'

interface BattleAgent {
  archetype:   Archetype
  elo:         number
  rank:        string
  health:      number
  battleState: BattleState
}

interface BattleStageProps {
  agentA: BattleAgent
  agentB: BattleAgent
}

function ArenaColumn({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Column shaft */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.1, 1.8, 12]} />
        <meshStandardMaterial color="#C8B88A" roughness={0.9} metalness={0} />
      </mesh>
      {/* Capital (top) */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.25, 0.1, 0.25]} />
        <meshStandardMaterial color="#D0C090" roughness={0.85} metalness={0} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.95, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.1, 12]} />
        <meshStandardMaterial color="#B8A870" roughness={0.9} metalness={0} />
      </mesh>
      {/* Torch flame */}
      <mesh position={[0, 1.1, 0]}>
        <coneGeometry args={[0.04, 0.14, 8]} />
        <meshStandardMaterial
          color="#FF8020"
          emissive="#FF4000"
          emissiveIntensity={2.5}
          transparent
          opacity={0.85}
        />
      </mesh>
      <pointLight color="#FF6020" intensity={1.5} distance={3} decay={2} position={[0, 1.1, 0]} />
    </group>
  )
}

function ArenaPlatform() {
  return (
    <group position={[0, -0.62, 0]}>
      {/* Main arena slab */}
      <mesh receiveShadow>
        <boxGeometry args={[4, 0.08, 2.5]} />
        <meshStandardMaterial color="#D8C898" roughness={0.95} metalness={0} />
      </mesh>
      {/* Greek key border — edge strips */}
      {([-2, 2] as const).map((x, i) => (
        <mesh key={i} position={[x * 0.96, 0.05, 0]}>
          <boxGeometry args={[0.08, 0.04, 2.5]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Center dividing stripe */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.02, 0.04, 2.5]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function BattleStage({ agentA, agentB }: BattleStageProps) {
  const lightRef = useRef<THREE.PointLight>(null)

  // Dramatic light flicker during battle
  useFrame(({ clock }) => {
    if (lightRef.current) {
      const flicker = 1 + Math.sin(clock.elapsedTime * 7) * 0.05
      lightRef.current.intensity = 1.2 * flicker
    }
  })

  return (
    <>
      {/* Ambient sky */}
      <ambientLight intensity={0.18} color="#1A1030" />

      {/* Moon-light directional */}
      <directionalLight
        position={[0, 8, 4]}
        intensity={0.6}
        color="#C0C8E0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Dramatic central torch fill */}
      <pointLight ref={lightRef} color="#FF8030" intensity={1.2} distance={6} decay={2} position={[0, 1.5, 1]} />

      {/* Arena platform */}
      <ArenaPlatform />

      {/* Columns — symmetrical frame */}
      <ArenaColumn position={[-1.8, 0.28, -1.1]} />
      <ArenaColumn position={[ 1.8, 0.28, -1.1]} />
      <ArenaColumn position={[-1.8, 0.28,  1.1]} />
      <ArenaColumn position={[ 1.8, 0.28,  1.1]} />

      {/* Contact shadow on arena floor */}
      <ContactShadows
        position={[0, -0.61, 0]}
        opacity={0.4}
        scale={5}
        blur={2}
        far={1}
      />

      {/* Agent A (left, Challenger) */}
      <AgentAvatar
        archetype={agentA.archetype}
        elo={agentA.elo}
        rank={agentA.rank}
        isActive={true}
        battleState={agentA.battleState}
        health={agentA.health}
        position={[-0.9, -0.58, 0]}
        scale={0.9}
        flipX={false}
      />

      {/* Agent B (right, Defender — mirrored) */}
      <AgentAvatar
        archetype={agentB.archetype}
        elo={agentB.elo}
        rank={agentB.rank}
        isActive={true}
        battleState={agentB.battleState}
        health={agentB.health}
        position={[0.9, -0.58, 0]}
        scale={0.9}
        flipX={true}
      />
    </>
  )
}
