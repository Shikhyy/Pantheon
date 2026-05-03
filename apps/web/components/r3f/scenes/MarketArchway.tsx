'use client'
import { GreekColumn } from '../environment/GreekColumn'
import { OliveTree, Amphora, RuinedColumn } from '../environment/GreekProps'
import { useMemo } from 'react'
import * as THREE from 'three'

export function MarketArchway({ isActive = false }: { isActive?: boolean }) {
  const darkStoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4A3B50',
    roughness: 0.4,
    metalness: 0.6,
  }), [])

  const stallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4A3728',
    roughness: 0.9,
  }), [])

  return (
    <group>
      {/* ── STYLIZED BACKGROUND: THE DARK STOA ── */}
      <group position={[0, -2.5, -12]}>
        {/* Foundation */}
        <mesh position={[0, 0, 0]} material={darkStoneMat}>
          <boxGeometry args={[60, 0.4, 12]} />
        </mesh>

        {/* Row of Detailed Columns */}
        {[-22, -14, -6, 2, 10, 18].map((x, i) => (
          <GreekColumn 
            key={i} 
            position={[x, 0, 4]} 
            material={darkStoneMat} 
            height={9} 
            radius={0.45} 
          />
        ))}

        {/* Market Stalls (Thematic Dark Colors) */}
        {[-18, -10, -2, 6, 14, 22].map((x, i) => (
          <group key={i} position={[x, 0, 2]}>
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[3.5, 2.4, 2]} />
              <primitive object={stallMat} attach="material" />
            </mesh>
            {/* Draped Top - Deep Colors */}
            <mesh position={[0, 2.5, 0.2]} rotation={[-0.2, 0, 0]}>
              <boxGeometry args={[3.8, 0.1, 2.5]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#5FB6D9" : "#B0709A"} opacity={0.6} transparent />
            </mesh>
            {/* Scattered Pottery */}
            <Amphora position={[-1, 2.4, 0.5]} scale={0.2} color="#4A3728" />
            <Amphora position={[0.8, 2.4, 0.6]} scale={0.18} color="#331100" />
          </group>
        ))}

        {/* Framing Nature */}
        <OliveTree position={[-28, 0, 8]} scale={1.6} />
        <OliveTree position={[28, 0, 8]} scale={1.4} />
        
        {/* Ruins */}
        <RuinedColumn position={[-20, 0, 10]} rotation={[0, 0.2, 1.57]} scale={0.8} />
        <RuinedColumn position={[15, 0, 11]} rotation={[0, -0.4, 1.4]} scale={0.7} />
      </group>

      <pointLight position={[0, 10, -5]} intensity={12} color="#5FB6D9" distance={50} />
    </group>
  )
}