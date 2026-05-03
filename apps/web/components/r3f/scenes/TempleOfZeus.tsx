'use client'
import { GodStatues } from '../environment/GodStatues'
import { GreekColumn } from '../environment/GreekColumn'
import { useMemo } from 'react'
import * as THREE from 'three'

export function TempleOfZeus({ isActive = false }: { isActive?: boolean }) {
  const darkStoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2a222f',
    roughness: 0.3,
    metalness: 0.8,
  }), [])

  const polishedFloorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0d0a11',
    roughness: 0.1,
    metalness: 0.5,
  }), [])

  return (
    <group>
      {/* ── THE SANCTUM OF THE THUNDERER ── */}
      <group position={[0, -2.5, -20]}>
        {/* Polished Obsidian Floor */}
        <mesh position={[0, 0, 0]} material={polishedFloorMat}>
          <boxGeometry args={[60, 0.4, 45]} />
        </mesh>
        
        {/* Enclosing Walls */}
        <mesh position={[-25, 10, -5]} material={darkStoneMat}>
          <boxGeometry args={[4, 20, 50]} />
        </mesh>
        <mesh position={[25, 10, -5]} material={darkStoneMat}>
          <boxGeometry args={[4, 20, 50]} />
        </mesh>
        <mesh position={[0, 10, -25]} material={darkStoneMat}>
          <boxGeometry args={[50, 20, 4]} />
        </mesh>

        {/* Colossal Framing Columns */}
        {[-15, 15].map((x) => (
          [-10, 0, 10].map((z, j) => (
            <GreekColumn 
              key={`${x}-${z}`} 
              position={[x, 0.2, z]} 
              material={darkStoneMat} 
              height={18} 
              radius={1.4} 
            />
          ))
        ))}

        {/* Stepped Grand Altar */}
        {[0, 1, 2].map((step) => (
          <mesh key={step} position={[0, 0.4 + step * 0.5, -15 + step * 1]} material={polishedFloorMat}>
            <boxGeometry args={[20 - step * 2, 0.5, 8 - step]} />
          </mesh>
        ))}
      </group>

      {/* The Singular Colossus */}
      <GodStatues
        gods={[
          { god: 'zeus', position: [0, 0.5, -30], scale: 3.5 },
        ]}
      />

      {/* Atmospheric Braziers / Divine Lighting */}
      <pointLight position={[-10, 4, -20]} intensity={15} color="#ff8800" distance={35} />
      <pointLight position={[10, 4, -20]} intensity={15} color="#ff8800" distance={35} />
      <pointLight position={[0, 25, -15]} intensity={12} color="#d4af37" distance={60} />
      <ambientLight intensity={0.4} />
    </group>
  )
}