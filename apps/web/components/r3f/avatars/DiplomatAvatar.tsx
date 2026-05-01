'use client'
// components/r3f/avatars/DiplomatAvatar.tsx
// Hermes the Cunning — quicksilver, caduceus snakes, winged sandals

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { HeroBody } from './AvatarBodyBuilder'
import type { AvatarComponentProps } from './AgentAvatar'
import * as THREE from 'three'

export function DiplomatAvatar({ rank, elo, battleState, healthTint }: AvatarComponentProps) {
  const caduceusRef  = useRef<THREE.Group>(null)
  const snake1Ref    = useRef<THREE.Mesh>(null)
  const snake2Ref    = useRef<THREE.Mesh>(null)
  const sandal1Ref   = useRef<THREE.Group>(null)
  const sandal2Ref   = useRef<THREE.Group>(null)
  const hatRef       = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Caduceus sway
    if (caduceusRef.current) {
      caduceusRef.current.rotation.z = Math.sin(t * 0.5) * (battleState === 'idle' ? 0.06 : 0.03)
    }

    // Snake slither (offset sinusoids)
    if (snake1Ref.current) snake1Ref.current.rotation.y = Math.sin(t * 1.2) * 0.4
    if (snake2Ref.current) snake2Ref.current.rotation.y = Math.sin(t * 1.2 + Math.PI) * 0.4

    // Winged sandals flap
    const wingFlap = Math.sin(t * 4) * 0.2
    if (sandal1Ref.current) sandal1Ref.current.rotation.x = wingFlap
    if (sandal2Ref.current) sandal2Ref.current.rotation.x = -wingFlap

    // Petasos wings flap
    if (hatRef.current) {
      hatRef.current.children.forEach((child, i) => {
        if (child.name === 'wing') {
          (child as THREE.Object3D).rotation.z = Math.sin(t * 3 + i * Math.PI) * 0.15
        }
      })
    }
  })

  const inBattle = battleState === 'ready' || battleState === 'attacking'

  return (
    <group>
      <HeroBody
        armourColour="#1A4A3A"      // teal exomis
        skinColour="#C89060"
        crestColour="#30CC80"
        rank={rank}
      />

      {/* Petasos hat (wide-brimmed traveller's hat) */}
      <group ref={hatRef} position={[0, 0.92, 0]}>
        {/* Brim */}
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 20]} />
          <meshStandardMaterial color="#5A4020" roughness={0.9} />
        </mesh>
        {/* Crown */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.09, 0.13, 0.1, 12]} />
          <meshStandardMaterial color="#5A4020" roughness={0.9} />
        </mesh>
        {/* Wings (2) */}
        <mesh name="wing" position={[-0.22, 0.04, 0]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.1, 0.025, 0.07]} />
          <meshStandardMaterial color="#C0E0C0" roughness={0.8} />
        </mesh>
        <mesh name="wing" position={[0.22, 0.04, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.1, 0.025, 0.07]} />
          <meshStandardMaterial color="#C0E0C0" roughness={0.8} />
        </mesh>
      </group>

      {/* Caduceus staff */}
      <group ref={caduceusRef} position={[0.26, 0.1, 0.08]}>
        {/* Staff */}
        <mesh>
          <cylinderGeometry args={[0.012, 0.010, 0.9, 6]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Winged top */}
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.02, 0.06, 6]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Wing left */}
        <mesh position={[-0.06, 0.48, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.07, 0.022, 0.04]} />
          <meshStandardMaterial color="#40CC80" roughness={0.8} />
        </mesh>
        {/* Wing right */}
        <mesh position={[0.06, 0.48, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.07, 0.022, 0.04]} />
          <meshStandardMaterial color="#40CC80" roughness={0.8} />
        </mesh>

        {/* Snake 1 */}
        <mesh ref={snake1Ref} position={[-0.03, 0.15, 0]}>
          <torusGeometry args={[0.06, 0.008, 6, 12, Math.PI * 1.5]} />
          <meshStandardMaterial color="#206A40" roughness={0.8} />
        </mesh>

        {/* Snake 2 */}
        <mesh ref={snake2Ref} position={[0.03, 0.28, 0]}>
          <torusGeometry args={[0.06, 0.008, 6, 12, Math.PI * 1.5]} />
          <meshStandardMaterial color="#20604A" roughness={0.8} />
        </mesh>
      </group>

      {/* Winged sandals */}
      <group ref={sandal1Ref} position={[-0.1, -0.42, 0]}>
        <mesh>
          <boxGeometry args={[0.08, 0.018, 0.06]} />
          <meshStandardMaterial color="#8B6030" roughness={0.9} />
        </mesh>
        {/* Wing */}
        <mesh position={[-0.05, 0.01, 0]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.045, 0.012, 0.04]} />
          <meshStandardMaterial color="#C0E0C0" roughness={0.8} />
        </mesh>
      </group>
      <group ref={sandal2Ref} position={[0.1, -0.42, 0]}>
        <mesh>
          <boxGeometry args={[0.08, 0.018, 0.06]} />
          <meshStandardMaterial color="#8B6030" roughness={0.9} />
        </mesh>
        <mesh position={[0.05, 0.01, 0]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.045, 0.012, 0.04]} />
          <meshStandardMaterial color="#C0E0C0" roughness={0.8} />
        </mesh>
      </group>

      {/* Quicksilver messenger particles */}
      <Sparkles
        count={inBattle ? 35 : 14}
        scale={inBattle ? 1.4 : 0.6}
        size={inBattle ? 2.0 : 1.0}
        speed={inBattle ? 0.7 : 0.25}
        opacity={0.55 * healthTint}
        color="#40EEB0"
        position={[0, 0.3, 0]}
      />

      {/* Hermes teal light */}
      <pointLight color="#20CC80" intensity={healthTint * 1.8} distance={3} decay={2} position={[0, 0.5, 0.3]} />

      {/* Olympian cyan burst */}
      {rank === 'Olympian' && (
        <pointLight color="#00FFCC" intensity={3} distance={5} decay={2} position={[0, 1.2, 0]} />
      )}
    </group>
  )
}
