'use client'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleSystemProps {
  type: 'embers' | 'dust'
  count?: number
}

export function ParticleSystem({ type = 'embers', count = 50 }: ParticleSystemProps) {
  const meshRef = useRef<THREE.Points>(null)

  const [{ positions, velocities, colors }] = useState(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2

      velocities[i * 3] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 1] = 0.01 + Math.random() * 0.02
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02

      if (type === 'embers') {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.3
        colors[i * 3 + 2] = 0
      } else {
        colors[i * 3] = 0.9
        colors[i * 3 + 1] = 0.9
        colors[i * 3 + 2] = 0.85
      }
    }
    return { positions, velocities, colors }
  })

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const posArray = meshRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3]
      posArray[i * 3 + 1] += velocities[i * 3 + 1]
      posArray[i * 3 + 2] += velocities[i * 3 + 2]

      if (posArray[i * 3 + 1] > 8) {
        posArray[i * 3] = (Math.random() - 0.5) * 20
        posArray[i * 3 + 1] = 0
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={type === 'embers' ? 0.08 : 0.03}
        vertexColors
        transparent
        opacity={type === 'embers' ? 0.8 : 0.4}
        sizeAttenuation
      />
    </points>
  )
}