'use client'
import { GreekColumn } from '../environment/GreekColumn'
import { RuinedColumn } from '../environment/GreekProps'
import { useMemo } from 'react'
import * as THREE from 'three'

export function ColosseumGate({ isActive = false }: { isActive?: boolean }) {
  const darkStoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2A1010',
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide
  }), [])

  const sandMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1A0A0A',
    roughness: 1.0,
  }), [])

  return (
    <group>
      {/* ── STYLIZED BACKGROUND: THE DARK MARBLE ARENA ── */}
      <group position={[0, -2.5, -20]}>
        {/* Massive Circular Arena Wall */}
        <mesh position={[0, 10, 0]}>
          <cylinderGeometry args={[45, 48, 20, 64, 1, true, 0, Math.PI]} />
          <primitive object={darkStoneMat} attach="material" />
        </mesh>
        
        {/* Tiered Seating (Dark Stone) */}
        {[0, 1, 2, 3, 4].map((tier) => (
          <mesh key={tier} position={[0, tier * 2.5 + 1.2, tier * 2.5]}>
            <cylinderGeometry args={[45 - tier * 5, 42 - tier * 5, 2.5, 64, 1, true, 0, Math.PI]} />
            <primitive object={darkStoneMat} attach="material" />
          </mesh>
        ))}

        {/* Grand Entry Arches (Dark Stone) */}
        {[-25, 0, 25].map((x, i) => (
          <group key={i} position={[x, 5, -12]} rotation={[0, x * 0.04, 0]}>
            <mesh material={darkStoneMat}>
              <boxGeometry args={[10, 15, 3]} />
            </mesh>
            <mesh position={[0, 7.5, 0]} rotation={[0, 0, Math.PI / 2]} material={darkStoneMat}>
              <cylinderGeometry args={[5, 5, 3, 32, 1, false, 0, Math.PI]} />
            </mesh>
          </group>
        ))}

        {/* Framing Columns on Top Tier */}
        {[-35, -25, 25, 35].map((x, i) => (
          <GreekColumn 
            key={i} 
            position={[x, 15, 10]} 
            material={darkStoneMat}
            height={8}
            radius={0.6}
          />
        ))}

        {/* Ruins & History */}
        <RuinedColumn position={[-20, 0, 8]} rotation={[0.2, 0.5, 1.5]} scale={1.5} />
        <RuinedColumn position={[22, 0, 5]} rotation={[-0.3, -0.8, 1.4]} scale={1.2} />
      </group>

      {/* Central Sand Arena Pit */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, -15]}>
        <circleGeometry args={[30, 64]} />
        <primitive object={sandMat} attach="material" />
      </mesh>
      
      <pointLight position={[0, 20, -15]} intensity={5} color="#8B3A3A" distance={50} />
      <ambientLight intensity={0.2} />
    </group>
  )
}