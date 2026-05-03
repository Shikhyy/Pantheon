'use client'
import * as THREE from 'three'
import { useMemo } from 'react'

interface PillarProps {
  position: [number, number, number]
  height?: number
  accentColor?: string
  scale?: number
}

export function CinematicPillar({ position, height = 12, accentColor = '#d4af37', scale = 1 }: PillarProps) {
  const obsidianMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#080808',
    roughness: 0.1,
    metalness: 0.9,
  }), [])

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.2,
    metalness: 1,
    emissive: accentColor,
    emissiveIntensity: 0.15, // Reduced from 0.4
  }), [accentColor])

  return (
    <group position={position} scale={scale}>
      {/* Plinth (Base) */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.5, 0.8, 1.5]} />
        <primitive object={obsidianMat} />
      </mesh>
      
      {/* Torus Base Accent */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.1, 16, 32]} />
        <primitive object={goldMat} />
      </mesh>

      {/* Fluted Shaft (Simulated with segments) */}
      <mesh position={[0, height / 2 + 0.8, 0]}>
        <cylinderGeometry args={[0.45, 0.55, height, 16]} />
        <primitive object={obsidianMat} />
      </mesh>

      {/* Decorative Rings */}
      <mesh position={[0, height * 0.2 + 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.03, 8, 32]} />
        <primitive object={goldMat} />
      </mesh>
      <mesh position={[0, height * 0.8 + 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.03, 8, 32]} />
        <primitive object={goldMat} />
      </mesh>

      {/* Capital (Top) */}
      <mesh position={[0, height + 1.0, 0]}>
        <boxGeometry args={[1.6, 0.4, 1.6]} />
        <primitive object={obsidianMat} />
      </mesh>
      <mesh position={[0, height + 1.3, 0]}>
        <boxGeometry args={[1.8, 0.2, 1.8]} />
        <primitive object={goldMat} />
      </mesh>
      
      {/* Subtle Light Beam */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, height, 8]} />
        <meshStandardMaterial 
          color={accentColor} 
          emissive={accentColor} 
          emissiveIntensity={0.5} // Reduced from 2 
          transparent 
          opacity={0.05} // Reduced from 0.1
        />
      </mesh>
    </group>
  )
}
