// components/r3f/ParthenaSilhouette.tsx
'use client'

import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'

export function ParthenaSilhouette() {
  const marbleMat = useMemo(() => new MeshStandardMaterial({
    color: '#3A2B40',
    roughness: 0.4,
    metalness: 0.1,
  }), [])

  const columnPositions: [number, number, number][] = [
    [-9, 0, 0], [-6.5, 0, 0], [-4, 0, 0], [-1.5, 0, 0],
    [1.5, 0, 0],  [4, 0, 0],   [6.5, 0, 0], [9, 0, 0],
  ]

  return (
    <group position={[0, -2.5, -8]}>
      {/* Stylobate (base platform) */}
      <mesh position={[0, 0, 0]} material={marbleMat}>
        <boxGeometry args={[24, 0.3, 4]} />
      </mesh>

      {/* Columns */}
      {columnPositions.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {/* Column shaft */}
          <mesh position={[0, 3.5, 0]} material={marbleMat}>
            <cylinderGeometry args={[0.38, 0.45, 7, 12]} />
          </mesh>
          {/* Capital */}
          <mesh position={[0, 7.2, 0]} material={marbleMat}>
            <cylinderGeometry args={[0.6, 0.4, 0.5, 8]} />
          </mesh>
          <mesh position={[0, 7.55, 0]} material={marbleMat}>
            <boxGeometry args={[1.2, 0.3, 1.2]} />
          </mesh>
        </group>
      ))}

      {/* Architrave */}
      <mesh position={[0, 7.85, 0]} material={marbleMat}>
        <boxGeometry args={[22, 0.6, 1.2]} />
      </mesh>

      {/* Frieze */}
      <mesh position={[0, 8.6, 0]} material={marbleMat}>
        <boxGeometry args={[22, 0.8, 1]} />
      </mesh>

      {/* Pediment */}
      <mesh position={[0, 9.8, 0]} material={marbleMat}>
        <coneGeometry args={[12, 2.4, 2, 1]} />
      </mesh>

      {/* Inner naos */}
      <mesh position={[0, 3.5, -1]} material={marbleMat}>
        <boxGeometry args={[14, 7, 0.5]} />
      </mesh>
    </group>
  )
}
