'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

interface GreekColumnProps {
  position?: [number, number, number]
  scale?: number
  material?: THREE.Material
  height?: number
  radius?: number
}

export function GreekColumn({ 
  position = [0, 0, 0], 
  scale = 1, 
  material,
  height = 7,
  radius = 0.4
}: GreekColumnProps) {
  const darkStoneMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5A4B60', // Lighter stone for better visibility
    roughness: 0.5,
    metalness: 0.3,
  }), [])

  const activeMaterial = material || darkStoneMaterial

  return (
    <group position={position} scale={scale}>
      {/* Base / Plinth (More detailed) */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[radius * 3.2, 0.2, radius * 3.2]} />
        <primitive object={activeMaterial} attach="material" />
      </mesh>
      
      {/* Torus (Base ring) */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[radius * 1.4, radius * 1.5, 0.3, 32]} />
        <primitive object={activeMaterial} attach="material" />
      </mesh>

      {/* Fluted Shaft (Higher segment count for "fluting" look) */}
      <mesh position={[0, height / 2 + 0.5, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 1.1, height, 20]} />
        <primitive object={activeMaterial} attach="material" />
      </mesh>

      {/* Capital (Echinus + Details) */}
      <mesh position={[0, height + 0.7, 0]}>
        <cylinderGeometry args={[radius * 1.5, radius * 0.9, 0.5, 32]} />
        <primitive object={activeMaterial} attach="material" />
      </mesh>

      {/* Abacus (Top square) */}
      <mesh position={[0, height + 1.1, 0]}>
        <boxGeometry args={[radius * 3.2, 0.4, radius * 3.2]} />
        <primitive object={activeMaterial} attach="material" />
      </mesh>
    </group>
  )
}
