'use client'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Sparkles, Float } from '@react-three/drei'
import { Amphora, RuinedColumn } from '../environment/GreekProps'
import { GreekColumn } from '../environment/GreekColumn'

export function HephaestusForge({ isActive = false }: { isActive?: boolean }) {
  const anvilRef = useRef<THREE.Group>(null)

  const darkStoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1A0D0D',
    roughness: 1.0,
    metalness: 0.0,
  }), [])

  const lavaMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FF4400',
    emissive: '#FF2200',
    emissiveIntensity: 3,
  }), [])

  return (
    <group>
      {/* ── STYLIZED BACKGROUND: THE VOLCANIC DARK FORGE ── */}
      <group position={[0, -2.5, -18]}>
        {/* Dark Floor */}
        <mesh position={[0, 0, 0]} material={darkStoneMat}>
          <boxGeometry args={[70, 0.4, 45]} />
        </mesh>
        
        {/* Large Magma Pool */}
        <mesh position={[0, 0.1, -12]} material={lavaMat}>
          <cylinderGeometry args={[15, 15, 0.1, 32]} />
        </mesh>

        {/* Framing Columns (Dark Stone) */}
        {[-25, -15, 15, 25].map((x) => (
          [ -10, 10 ].map((z, j) => (
            <GreekColumn 
              key={`${x}-${z}`} 
              position={[x, 0, z]} 
              material={darkStoneMat} 
              height={12} 
              radius={0.8} 
            />
          ))
        ))}

        {/* Scattered Artifacts */}
        <Amphora position={[-8, 0, 6]} scale={0.6} color="#4A3728" />
        <Amphora position={[6, 0, 9]} scale={0.5} color="#331100" />
        <RuinedColumn position={[-20, 0, 15]} rotation={[0.4, 0.2, 1.5]} scale={1.8} />
      </group>

      {/* Central Altar of Creation (Stone & Lava) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group ref={anvilRef} position={[0, 1.8, -10]}>
          <mesh material={darkStoneMat}>
            <octahedronGeometry args={[3, 0]} />
          </mesh>
          <mesh position={[0, 2.5, 0]} material={lavaMat}>
            <boxGeometry args={[4.5, 0.3, 3]} />
          </mesh>
          <pointLight position={[0, 3, 0]} intensity={8} color="#ff4400" distance={25} />
        </group>
      </Float>

      <Sparkles count={150} scale={30} size={4} speed={1.2} color="#ff6600" />
      <ambientLight intensity={0.1} />
    </group>
  )
}