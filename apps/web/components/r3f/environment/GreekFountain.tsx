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