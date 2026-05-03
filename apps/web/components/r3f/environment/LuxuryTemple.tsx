'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { Float } from '@react-three/drei'
import { TorchSystem } from '../TorchSystem'

interface LuxuryTempleProps {
  type: 'interior' | 'archway' | 'forge' | 'circular' | 'curved'
  color?: string
}

export function LuxuryTemple({ type, color = '#d4af37' }: LuxuryTempleProps) {
  const marbleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#050505',
    roughness: 0.1,
    metalness: 0.9,
  }), [])

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.2,
    metalness: 0.8,
    emissive: color,
    emissiveIntensity: 0.2,
  }), [color])

  return (
    <group>
      {/* ── SHARED BASE (BLACK MARBLE) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#000" roughness={1} />
      </mesh>

      {/* ── TYPE SPECIFIC STRUCTURES ── */}
      
      {/* 1. INTERIOR HALL (Temple of Zeus) */}
      {type === 'interior' && (
        <group position={[0, -0.1, -10]}>
          {[...Array(6)].map((_, i) => (
            <group key={i} position={[(i % 2 === 0 ? -6 : 6), 0, Math.floor(i / 2) * -8]}>
              <Column mat={marbleMat} accent={goldMat} />
              <TorchSystem positions={[[0, 1.5, 0.5]]} />
            </group>
          ))}
          {/* Back Wall */}
          <mesh position={[0, 5, -20]}>
            <boxGeometry args={[20, 10, 1]} />
            <primitive object={marbleMat} />
          </mesh>
        </group>
      )}

      {/* 2. GRAND ARCHWAY (Market / Agora) */}
      {type === 'archway' && (
        <group position={[0, -0.1, -12]}>
          <group position={[-8, 0, 0]}><Column mat={marbleMat} accent={goldMat} height={12} /></group>
          <group position={[8, 0, 0]}><Column mat={marbleMat} accent={goldMat} height={12} /></group>
          {/* Top Architrave */}
          <mesh position={[0, 12, 0]}>
            <boxGeometry args={[18, 1.5, 2]} />
            <primitive object={marbleMat} />
          </mesh>
          <mesh position={[0, 13, 0]}>
            <boxGeometry args={[20, 0.5, 2.5]} />
            <primitive object={goldMat} />
          </mesh>
        </group>
      )}

      {/* 3. HEAVY FORGE (Hephaestus) */}
      {type === 'forge' && (
        <group position={[0, -0.1, -8]}>
          {[...Array(4)].map((_, i) => (
            <group key={i} position={[(i % 2 === 0 ? -8 : 8), 0, Math.floor(i / 2) * -12]}>
              <mesh position={[0, 5, 0]}>
                <boxGeometry args={[2, 10, 2]} />
                <primitive object={marbleMat} />
              </mesh>
              {/* Glowing Lava Seam */}
              <mesh position={[0, 5, 1.01]}>
                <planeGeometry args={[0.2, 10]} />
                <meshStandardMaterial color="#ff4500" emissive="#ff4500" emissiveIntensity={5} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 4. CIRCULAR COLONNADE (Legends) */}
      {type === 'circular' && (
        <group position={[0, -0.1, -8]}>
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const r = 15
            return (
              <group key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
                <Column mat={marbleMat} accent={goldMat} scale={0.8} />
              </group>
            )
          })}
        </group>
      )}

      {/* 5. CURVED AMPHITHEATER (Battle) */}
      {type === 'curved' && (
        <group position={[0, -0.1, -20]}>
          {[...Array(10)].map((_, i) => {
            const angle = (i / 10) * Math.PI - Math.PI / 2
            const r = 30
            return (
              <group key={i} position={[Math.sin(angle) * r, 0, Math.cos(angle) * -r]}>
                <Column mat={marbleMat} accent={goldMat} height={15} />
              </group>
            )
          })}
        </group>
      )}
    </group>
  )
}

function Column({ mat, accent, height = 8, scale = 1 }: { mat: THREE.Material, accent: THREE.Material, height?: number, scale?: number }) {
  return (
    <group scale={scale}>
      {/* Base */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.8, 1.2]} />
        <primitive object={mat} />
      </mesh>
      {/* Shaft */}
      <mesh position={[0, height / 2 + 0.8, 0]}>
        <cylinderGeometry args={[0.4, 0.5, height, 12]} />
        <primitive object={mat} />
      </mesh>
      {/* Golden Rings */}
      <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.04, 8, 24]} />
        <primitive object={accent} />
      </mesh>
      <mesh position={[0, height + 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.04, 8, 24]} />
        <primitive object={accent} />
      </mesh>
      {/* Capital */}
      <mesh position={[0, height + 0.8, 0]}>
        <boxGeometry args={[1.2, 0.4, 1.2]} />
        <primitive object={mat} />
      </mesh>
    </group>
  )
}
