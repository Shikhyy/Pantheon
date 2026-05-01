'use client'
// components/r3f/avatars/StrategistAvatar.tsx
// Athena Incarnate — wisdom, strategy, silver sparks

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { HeroBody } from './AvatarBodyBuilder'
import type { AvatarComponentProps } from './AgentAvatar'
import * as THREE from 'three'

export function StrategistAvatar({ rank, elo, battleState, healthTint }: AvatarComponentProps) {
  const spearRef  = useRef<THREE.Mesh>(null)
  const shieldRef = useRef<THREE.Mesh>(null)
  const helmetRef = useRef<THREE.Group>(null)
  const owlRef    = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (battleState === 'idle') {
      // Spear traces slow figure-8
      if (spearRef.current)  spearRef.current.rotation.z  = Math.sin(t * 0.4) * 0.08
      // Shield defensive pulse
      if (shieldRef.current) shieldRef.current.position.x = -0.28 + Math.sin(t * 0.6) * 0.01
      // Owl head sway
      if (owlRef.current)    owlRef.current.rotation.y    = Math.sin(t * 0.5) * 0.3
    }

    if (battleState === 'ready') {
      // Spear rises to 45°
      if (spearRef.current) {
        spearRef.current.rotation.z = THREE.MathUtils.lerp(
          spearRef.current.rotation.z, -0.785, 0.07
        )
      }
      // Helmet visor down
      if (helmetRef.current) {
        helmetRef.current.rotation.x = THREE.MathUtils.lerp(
          helmetRef.current.rotation.x, 0.3, 0.06
        )
      }
    }

    if (battleState === 'attacking') {
      // Shield slams forward
      if (shieldRef.current) {
        shieldRef.current.position.z = THREE.MathUtils.lerp(
          shieldRef.current.position.z, 0.25, 0.15
        )
      }
    } else if (shieldRef.current) {
      shieldRef.current.position.z = THREE.MathUtils.lerp(
        shieldRef.current.position.z, 0.12, 0.05
      )
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

      {/* Corinthian Helmet */}
      <group ref={helmetRef} position={[0, 0.88, 0]}>
        {/* Helm cap */}
        <mesh>
          <sphereGeometry args={[0.155, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshStandardMaterial color="#4A3878" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Horsehair crest */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.04, 0.22, 0.16]} />
          <meshStandardMaterial color="#C0C8D8" roughness={0.9} />
        </mesh>
        {/* Cheek guards */}
        <mesh position={[-0.09, -0.04, 0.05]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.05, 0.1, 0.06]} />
          <meshStandardMaterial color="#4A3878" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.09, -0.04, 0.05]} rotation={[0, -0.3, 0]}>
          <boxGeometry args={[0.05, 0.1, 0.06]} />
          <meshStandardMaterial color="#4A3878" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Hoplon Shield */}
      <mesh ref={shieldRef} position={[-0.3, 0.28, 0.12]} rotation={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.03, 20]} />
        <meshStandardMaterial color="#3A2860" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Shield owl motif ring */}
      <mesh position={[-0.3, 0.28, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.012, 6, 20]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Spear (dory) */}
      <mesh
        ref={spearRef}
        position={[0.26, 0.08, 0]}
        rotation={[0, 0, -0.2]}
      >
        <cylinderGeometry args={[0.012, 0.008, 1.2, 6]} />
        <meshStandardMaterial color="#8B6914" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Spear tip */}
      <mesh position={[0.26 + Math.sin(-0.2) * 0.6, 0.08 + Math.cos(-0.2) * 0.6, 0]}>
        <coneGeometry args={[0.02, 0.08, 6]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Owl companion */}
      <group ref={owlRef} position={[-0.18, 0.62, 0.1]}>
        {/* Body */}
        <mesh>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color="#7A6840" roughness={0.9} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.07, 0]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshStandardMaterial color="#7A6840" roughness={0.9} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.02, 0.08, 0.04]}>
          <sphereGeometry args={[0.012, 6, 4]} />
          <meshStandardMaterial color="#C0C8D8" emissive="#C0C8D8" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.02, 0.08, 0.04]}>
          <sphereGeometry args={[0.012, 6, 4]} />
          <meshStandardMaterial color="#C0C8D8" emissive="#C0C8D8" emissiveIntensity={0.5} />
        </mesh>
      </group>

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

      {/* Olympian halo */}
      {rank === 'Olympian' && (
        <mesh position={[0, 0.74, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.008, 8, 48]} />
          <meshBasicMaterial color="#D8E8F8" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Ambient silver light */}
      <pointLight color="#8899CC" intensity={healthTint * 1.5} distance={3} decay={2} position={[0, 0.6, 0.3]} />
    </group>
  )
}
