'use client'
import { PortalGate } from './PortalGate'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

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