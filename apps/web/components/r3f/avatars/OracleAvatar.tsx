'use client'
// components/r3f/avatars/OracleAvatar.tsx
// Apollo's Voice — prophecy, sun-rays, sky-blue luminous eyes

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { HeroBody } from './AvatarBodyBuilder'
import type { AvatarComponentProps } from './AgentAvatar'
import * as THREE from 'three'

export function OracleAvatar({ rank, elo, battleState, healthTint }: AvatarComponentProps) {
  const flameRef  = useRef<THREE.Mesh>(null)
  const lyreRef   = useRef<THREE.Group>(null)
  const bowRef    = useRef<THREE.Group>(null)
  const haloRef   = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Prophecy flame pulsing
    if (flameRef.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.15
      flameRef.current.scale.set(pulse, pulse, pulse)
    }

    // Lyre sway in idle
    if (lyreRef.current && battleState === 'idle') {
      lyreRef.current.rotation.z = Math.sin(t * 0.4) * 0.06
    }

    // Halo slow rotation
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.2
    }

    // Floating slightly above ground
    if (battleState === 'idle' || battleState === 'ready') {
      // Handled in parent via Float + useFrame breathing
    }
  })

  const inBattle = battleState === 'ready' || battleState === 'attacking'

  return (
    <group>
      <HeroBody
        armourColour="#1A3A5E"      // white chiton → deep blue tint for 3D readability
        skinColour="#D4A574"
        crestColour="#5FB6D9"
        rank={rank}
      />

      {/* Golden laurel wreath */}
      <mesh position={[0, 0.9, 0]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.155, 0.018, 6, 24]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Sun disc tattoo on right shoulder (glow) */}
      <mesh position={[0.22, 0.46, 0.06]} rotation={[0, -0.3, 0]}>
        <circleGeometry args={[0.035, 12]} />
        <meshStandardMaterial color="#FFD060" emissive="#FFD060" emissiveIntensity={healthTint * 1.5} />
      </mesh>

      {/* Subtle halo ring */}
      <mesh ref={haloRef} position={[0, 0.74, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.004, 6, 40]} />
        <meshBasicMaterial color="#FFD060" transparent opacity={0.15 * healthTint} />
      </mesh>

      {/* Lyre (visible in idle) */}
      {!inBattle && (
        <group ref={lyreRef} position={[-0.24, 0.25, 0.1]}>
          {/* Frame */}
          <mesh>
            <torusGeometry args={[0.1, 0.015, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#C9A84C" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Strings */}
          {[-0.04, -0.02, 0, 0.02, 0.04, 0.06, 0.08].map((x, i) => (
            <mesh key={i} position={[x, -0.04, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.12, 4]} />
              <meshStandardMaterial color="#FFD060" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </group>
      )}

      {/* Silver bow (visible in battle) */}
      {inBattle && (
        <group ref={bowRef} position={[-0.24, 0.25, 0.1]}>
          <mesh>
            <torusGeometry args={[0.18, 0.012, 6, 20, Math.PI * 1.2]} />
            <meshStandardMaterial color="#C0C8E0" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Bowstring */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.003, 0.003, 0.36, 4]} />
            <meshStandardMaterial color="#E8E8F8" />
          </mesh>
        </group>
      )}

      {/* Prophecy flame */}
      <mesh ref={flameRef} position={[-0.28, 0.2, 0.12]}>
        <coneGeometry args={[0.025, 0.07, 8]} />
        <meshStandardMaterial
          color="#FFD060"
          emissive="#FF8020"
          emissiveIntensity={healthTint * 2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Sun-ray particles */}
      <Sparkles
        count={inBattle ? 30 : 12}
        scale={inBattle ? 1.2 : 0.7}
        size={inBattle ? 2.5 : 1.0}
        speed={inBattle ? 0.5 : 0.2}
        opacity={0.6 * healthTint}
        color="#FFD060"
        position={[0, 0.4, 0]}
      />

      {/* Olympian blazing sun halo */}
      {rank === 'Olympian' && (
        <pointLight color="#FFB020" intensity={healthTint * 3} distance={4} decay={2} position={[0, 0.7, 0.2]} />
      )}

      <pointLight color="#5FB6D9" intensity={healthTint * 1.2} distance={2.5} decay={2} position={[0, 0.6, 0.3]} />
    </group>
  )
}
