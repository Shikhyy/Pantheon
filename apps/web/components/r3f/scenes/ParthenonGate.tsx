'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

export function ParthenonGate() {
  const groupRef = useRef<THREE.Group>(null)

  // Subtle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02
    }
  })

  // Create 8 Doric columns
  const columns = Array.from({ length: 8 }, (_, i) => {
    const x = (i - 3.5) * 2.5 // Spread columns across
    return { x, z: 0 }
  })

  return (
    <group ref={groupRef}>
      {/* Base platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[24, 0.5, 8]} />
        <meshStandardMaterial color="#F5F5F0" roughness={0.3} />
      </mesh>

      {/* Columns */}
      {columns.map((col, i) => (
        <group key={i} position={[col.x, 0, col.z]}>
          {/* Column shaft */}
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.45, 6, 16]} />
            <meshStandardMaterial color="#F5F5F0" roughness={0.3} />
          </mesh>
          {/* Column capital (gold) */}
          <mesh position={[0, 6.2, 0]}>
            <boxGeometry args={[1, 0.4, 1]} />
            <meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.9} emissive="#D4AF37" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}

      {/* Pediment (triangle top) */}
      <mesh position={[0, 7.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[12, 2, 3]} />
        <meshStandardMaterial color="#F5F5F0" roughness={0.3} />
      </mesh>

      {/* Golden glow light between columns */}
      <pointLight position={[0, 4, 2]} color="#ffd700" />

      {/* Atmospheric particles */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[0, 8, -2]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <MeshDistortMaterial
            color="#ffd700"
            emissive="#ffd700"
            emissiveIntensity={0.5}
            distort={0.2}
            speed={1}
          />
        </mesh>
      </Float>
    </group>
  )
}
