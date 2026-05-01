'use client'
// components/r3f/avatars/BerserkerAvatar.tsx
// Ares Unleashed — crimson fire, battle-scarred armour, pure aggression

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { HeroBody } from './AvatarBodyBuilder'
import type { AvatarComponentProps } from './AgentAvatar'
import * as THREE from 'three'

export function BerserkerAvatar({ rank, elo, battleState, healthTint }: AvatarComponentProps) {
  const spearRef    = useRef<THREE.Mesh>(null)
  const auraRef     = useRef<THREE.Mesh>(null)
  const helmetRef   = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Restless spear circles
    if (spearRef.current && battleState === 'idle') {
      spearRef.current.rotation.z = Math.sin(t * 0.8) * 0.04
    }

    // Head slow scan
    if (helmetRef.current && battleState === 'idle') {
      helmetRef.current.rotation.y = Math.sin(t * 0.3) * 0.25
    }

    // Red aura breathes
    if (auraRef.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.08
      auraRef.current.scale.set(pulse, pulse, pulse)
      ;(auraRef.current.material as THREE.MeshBasicMaterial).opacity =
        (0.08 + Math.sin(t * 1.5) * 0.03) * healthTint
    }

    if (battleState === 'attacking') {
      // Full-body lunge — spear forward
      if (spearRef.current) {
        spearRef.current.rotation.z = THREE.MathUtils.lerp(
          spearRef.current.rotation.z, -1.2, 0.12
        )
      }
    } else if (spearRef.current && battleState !== 'idle') {
      spearRef.current.rotation.z = THREE.MathUtils.lerp(spearRef.current.rotation.z, 0, 0.05)
    }
  })

  const inBattle = battleState === 'ready' || battleState === 'attacking'

  return (
    <group>
      {/* Crimson battle aura sphere */}
      <mesh ref={auraRef} position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.7, 12, 8]} />
        <meshBasicMaterial color="#8B1A1A" transparent opacity={0.08 * healthTint} side={THREE.BackSide} />
      </mesh>

      <HeroBody
        armourColour={healthTint > 0.6 ? '#6B2020' : '#4A1010'}
        skinColour="#C08060"
        crestColour="#FF4020"
        rank={rank}
      />

      {/* Chalcidian Helmet — heavy battle version */}
      <group ref={helmetRef} position={[0, 0.86, 0]}>
        {/* Main cap */}
        <mesh>
          <sphereGeometry args={[0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
          <meshStandardMaterial color="#5A2010" metalness={0.6} roughness={0.5} />
        </mesh>
        {/* Red double crest — larger than Strategist */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.06, 0.25, 0.2]} />
          <meshStandardMaterial color="#CC2020" roughness={0.85} />
        </mesh>
        {/* Full face guard */}
        <mesh position={[0, -0.04, 0.1]}>
          <boxGeometry args={[0.12, 0.1, 0.04]} />
          <meshStandardMaterial color="#5A2010" metalness={0.6} roughness={0.5} />
        </mesh>
      </group>

      {/* Battle pauldron (left — asymmetric, larger) */}
      <mesh position={[-0.24, 0.48, 0]}>
        <boxGeometry args={[0.1, 0.06, 0.1]} />
        <meshStandardMaterial color="#5A2010" metalness={0.55} roughness={0.55} />
      </mesh>

      {/* War spear — double-handed */}
      <mesh
        ref={spearRef}
        position={[0.05, 0.1, 0.1]}
        rotation={[0, 0, -0.15]}
      >
        <cylinderGeometry args={[0.015, 0.01, 1.4, 6]} />
        <meshStandardMaterial color="#6B4010" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Spear tip */}
      <mesh position={[0.05 - 0.15 * Math.sin(-0.15), 0.1 + 0.7 * Math.cos(-0.15), 0.1]}>
        <coneGeometry args={[0.025, 0.1, 6]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Xiphos (sword) on hip */}
      <mesh position={[-0.16, 0, 0.08]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.025, 0.22, 0.015]} />
        <meshStandardMaterial color="#8B7050" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Ember / fire particles */}
      <Sparkles
        count={inBattle ? 40 : 18}
        scale={inBattle ? 1.8 : 0.9}
        size={inBattle ? 3.0 : 1.5}
        speed={inBattle ? 0.9 : 0.35}
        opacity={0.7 * healthTint}
        color="#FF4020"
        position={[0, 0.35, 0]}
      />

      {/* Battle heat light */}
      <pointLight
        color="#FF3010"
        intensity={healthTint * (inBattle ? 3 : 1.5)}
        distance={3.5}
        decay={2}
        position={[0, 0.5, 0.4]}
      />

      {/* Olympian fire column */}
      {rank === 'Olympian' && (
        <Sparkles
          count={25}
          scale={0.4}
          size={4}
          speed={0.6}
          opacity={0.5}
          color="#FF6030"
          position={[0, 1.0, 0]}
        />
      )}
    </group>
  )
}
