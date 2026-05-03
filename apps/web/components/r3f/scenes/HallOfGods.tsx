'use client'
import { GodStatues } from '../environment/GodStatues'
import { GreekColumn } from '../environment/GreekColumn'
import { useMemo } from 'react'
import * as THREE from 'three'

export function HallOfGods({ isActive = false }: { isActive?: boolean }) {
  const darkStoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2b2131',
    roughness: 0.7,
    metalness: 0.2,
  }), [])

  const radius = 22;
  const columnsCount = 16;

  return (
    <group>
      {/* ── THE THOLOS OF LEGENDS ── */}
      <group position={[0, -2.5, -28]}>
        {/* Circular Stepped Floor */}
        <mesh position={[0, 0, 0]} material={darkStoneMat}>
          <cylinderGeometry args={[radius + 5, radius + 6, 0.4, 64]} />
        </mesh>
        <mesh position={[0, 0.4, 0]} material={darkStoneMat}>
          <cylinderGeometry args={[radius + 2, radius + 3, 0.4, 64]} />
        </mesh>

        {/* Circular Colonnade */}
        {[...Array(columnsCount)].map((_, i) => {
          const angle = (i / columnsCount) * Math.PI * 2;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          
          // Only show the back arc so it frames the statues rather than blocking them
          if (z > 2) return null;
          
          return (
            <GreekColumn 
              key={i} 
              position={[x, 0.8, z]} 
              material={darkStoneMat} 
              height={18} 
              radius={1.0} 
            />
          )
        })}

        {/* Rotunda Architrave */}
        <mesh position={[0, 20.5, 0]} material={darkStoneMat}>
          <cylinderGeometry args={[radius + 2, radius + 2, 2.5, 64, 1, false, 0, Math.PI]} />
        </mesh>
        <mesh position={[0, 22.5, 0]} material={darkStoneMat}>
          <cylinderGeometry args={[radius + 3, radius + 3, 1.5, 64, 1, false, 0, Math.PI]} />
        </mesh>
      </group>

      {/* The Eternal Pantheon of Gods in a semi-circle */}
      <GodStatues
        gods={[
          { god: 'ares', position: [-16, 0.5, -28], scale: 1.6 },
          { god: 'aphrodite', position: [-8, 0.5, -33], scale: 1.5 },
          { god: 'athena', position: [0, 0.5, -35], scale: 2.0 },
          { god: 'poseidon', position: [8, 0.5, -33], scale: 1.5 },
          { god: 'zeus', position: [16, 0.5, -28], scale: 1.6 },
        ]}
      />

      <pointLight position={[0, 20, -20]} intensity={7} color="#d4af37" distance={70} />
      <ambientLight intensity={0.15} />
    </group>
  )
}