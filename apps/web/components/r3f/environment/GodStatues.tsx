'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

interface GodStatueProps {
  god: 'zeus' | 'athena' | 'ares' | 'aphrodite' | 'poseidon'
  position: [number, number, number]
  scale?: number
}

function GodMesh({ god, position, scale = 1 }: GodStatueProps) {
  // Using the core application theme color (Gold) for all statues
  const accentColor = '#d4af37'

  const bronzeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D4AF37', // Brighter Gold/Bronze
    roughness: 0.2,
    metalness: 0.9,
  }), [])

  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2A2530', // Slightly lighter stone for visibility
    roughness: 0.7,
    metalness: 0.2,
  }), [])
  
  const clothMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.9,
    metalness: 0.1,
  }), [accentColor])

  const glowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 3, // Increased for visibility
  }), [accentColor])

  return (
    <group position={position} scale={scale}>
      {/* ── GRAND PEDESTAL ── */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 1, 3]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[2.5, 0.5, 2.5]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>

      {/* ── THE HERM / BODY ── */}
      {/* A monumental pillar acting as the body of the statue (Herm style) */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.8, 1.1, 5, 16]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>

      {/* Divine Draping / Sash */}
      <mesh position={[0, 4, 0]} rotation={[0.2, 0.5, 0.3]}>
        <cylinderGeometry args={[0.85, 1.15, 1.5, 16]} />
        <primitive object={clothMat} attach="material" />
      </mesh>

      {/* ── CORINTHIAN HELMET & HEAD ── */}
      <group position={[0, 7.2, 0]}>
        {/* Face/Shadow Core */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.4, 1.0, 16]} />
          <meshStandardMaterial color="#000000" roughness={1} />
        </mesh>
        
        {/* Helmet Dome */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={bronzeMat} attach="material" />
        </mesh>
        
        {/* Helmet Cheek Guards */}
        <mesh position={[-0.35, -0.2, 0.3]} rotation={[0, 0.2, -0.1]}>
          <boxGeometry args={[0.2, 0.8, 0.5]} />
          <primitive object={bronzeMat} attach="material" />
        </mesh>
        <mesh position={[0.35, -0.2, 0.3]} rotation={[0, -0.2, 0.1]}>
          <boxGeometry args={[0.2, 0.8, 0.5]} />
          <primitive object={bronzeMat} attach="material" />
        </mesh>
        
        {/* Nose Guard */}
        <mesh position={[0, 0.1, 0.6]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <primitive object={bronzeMat} attach="material" />
        </mesh>

        {/* Helmet Crest Base */}
        <mesh position={[0, 0.9, -0.1]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.15, 0.4, 1.2]} />
          <primitive object={bronzeMat} attach="material" />
        </mesh>

        {/* Sweeping Plume (Glows with God's color) */}
        <mesh position={[0, 1.2, -0.2]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.3, 0.3, 1.6]} />
          <primitive object={glowMat} attach="material" />
        </mesh>
      </group>

      {/* ── DIVINE WEAPON (Spear) ── */}
      <group position={[1.4, 4.5, 0.8]} rotation={[0.15, 0, -0.1]}>
        {/* Shaft */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 9, 8]} />
          <primitive object={bronzeMat} attach="material" />
        </mesh>
        {/* Spear Tip (Glowing) */}
        <mesh position={[0, 4.8, 0]}>
          <coneGeometry args={[0.15, 0.8, 4]} />
          <primitive object={glowMat} attach="material" />
        </mesh>
      </group>

      {/* Subtle Aura Light */}
      <pointLight position={[0, 6, 2]} intensity={5} color={accentColor} distance={20} />
    </group>
  )
}

export function GodStatues({ gods }: { gods: GodStatueProps[] }) {
  return (
    <group>
      {gods.map((god, i) => (
        <GodMesh key={i} god={god.god} position={god.position} scale={god.scale} />
      ))}
    </group>
  )
}
