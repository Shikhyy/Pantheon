'use client'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleSystemProps {
  type: 'embers' | 'dust' | 'mystic' | 'soul'
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
      positions[i * 3 + 1] = Math.random() * 8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2

      velocities[i * 3] = (Math.random() - 0.5) * 0.01
      velocities[i * 3 + 1] = 0.005 + Math.random() * 0.015
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01

      if (type === 'embers') {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.4
        colors[i * 3 + 2] = 0.1
      } else if (type === 'mystic') {
        colors[i * 3] = 0.4 + Math.random() * 0.3
        colors[i * 3 + 1] = 0.1
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2
      } else if (type === 'soul') {
        colors[i * 3] = 0.9
        colors[i * 3 + 1] = 0.9
        colors[i * 3 + 2] = 1.0
      } else {
        // dust
        colors[i * 3] = 0.8
        colors[i * 3 + 1] = 0.75
        colors[i * 3 + 2] = 0.7
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

      // Gentle drift
      posArray[i * 3] += Math.sin(clock.elapsedTime + i) * 0.002

      if (posArray[i * 3 + 1] > 10) {
        posArray[i * 3] = (Math.random() - 0.5) * 20
        posArray[i * 3 + 1] = -2
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
        size={type === 'embers' ? 0.06 : type === 'soul' ? 0.04 : 0.03}
        vertexColors
        transparent
        opacity={type === 'embers' ? 0.6 : 0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}