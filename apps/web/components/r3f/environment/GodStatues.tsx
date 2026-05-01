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