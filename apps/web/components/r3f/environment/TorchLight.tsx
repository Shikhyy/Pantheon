'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TorchLightProps {
  position: [number, number, number]
  scale?: number
}

export function TorchLight({ position, scale = 1 }: TorchLightProps) {
  const lightRef = useRef<THREE.PointLight>(null)
  const flameRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime()
      lightRef.current.intensity = 1.5 + Math.sin(t * 8) * 0.3 + Math.sin(t * 12) * 0.2
      lightRef.current.position.x = position[0] + Math.sin(t * 3) * 0.02
    }
    if (flameRef.current) {
      const t = clock.getElapsedTime()
      flameRef.current.scale.y = 1 + Math.sin(t * 10) * 0.1
      flameRef.current.scale.x = 1 + Math.sin(t * 8) * 0.05
    }
  })

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.5, 0]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial
          color="#ff6622"
          emissive="#ff4400"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.5, 0]}
        color="#ff6622"
        intensity={1.5}
        distance={8}
        decay={2}
      />
    </group>
  )
}