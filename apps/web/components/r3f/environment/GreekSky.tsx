'use client'
import { useState, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GreekSkyProps {
  starCount?: number
}

export function GreekSky({ starCount = 2000 }: GreekSkyProps) {
  const starsRef = useRef<THREE.Points>(null)

  const [{ positions, sizes }] = useState(() => {
    const positions = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const r = 80 + Math.random() * 20

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 10
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      sizes[i] = Math.random() * 2 + 0.5
    }
    return { positions, sizes }
  })

  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.002
    }
  })

  const constellationPositions = useMemo(() => [
    // Orion
    { name: 'Orion', points: [[-15, 35, -40], [-12, 38, -42], [-10, 35, -38], [-8, 40, -35], [-6, 36, -40]] },
    // Big Dipper
    { name: 'Ursa Major', points: [[20, 30, -45], [22, 28, -42], [25, 30, -40], [28, 27, -38], [30, 29, -35], [32, 26, -38], [35, 28, -40]] },
    // Cassiopeia
    { name: 'Cassiopeia', points: [[-25, 25, -50], [-22, 22, -48], [-20, 25, -46], [-18, 22, -44], [-15, 25, -42]] },
  ], [])

  return (
    <group>
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#9090ff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {constellationPositions.map((constellation) => (
        <group key={constellation.name}>
          {constellation.points.map((point, i) => (
            <mesh key={i} position={point as [number, number, number]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
            </mesh>
          ))}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(constellation.points.flat() as number[]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffd700" opacity={0.3} transparent />
          </line>
        </group>
      ))}

      <mesh position={[0, 60, -50]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial color="#ffffdd" emissive="#ffffdd" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}