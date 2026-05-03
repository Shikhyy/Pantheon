'use client'
import * as THREE from 'three'
import { useMemo } from 'react'

/**
 * A stylized Greek Amphora (vase)
 */
export function Amphora({ position = [0, 0, 0], scale = 1, color = '#554433' }: { position?: [number, number, number], scale?: number, color?: string }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 }), [color])
  
  return (
    <group position={position} scale={scale}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.2, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI]} />
        <mesh position={[0, 0, 0]} scale={[1, 1.4, 1]}>
            <sphereGeometry args={[0.7, 16, 16]} />
            <primitive object={material} attach="material" />
        </mesh>
        <primitive object={material} attach="material" />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.3, 0.2, 0.6, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 2.1, 0]}>
        <torusGeometry args={[0.35, 0.05, 8, 24]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Handles */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.5, 1.6, 0]} rotation={[0, 0, side * 0.5]}>
          <torusGeometry args={[0.3, 0.05, 8, 16, Math.PI]} />
          <primitive object={material} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

/**
 * A stylized Olive Tree
 */
export function OliveTree({ position = [0, 0, 0], scale = 1 }: { position?: [number, number, number], scale?: number }) {
  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4A3728', roughness: 0.9 }), [])
  const leafMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#556B2F', roughness: 0.8 }), [])

  return (
    <group position={position} scale={scale}>
      {/* Twisted Trunk */}
      <mesh position={[0, 1.5, 0]} rotation={[0.1, 0, 0.1]}>
        <cylinderGeometry args={[0.2, 0.4, 3, 8]} />
        <primitive object={woodMat} attach="material" />
      </mesh>
      {/* Canopy */}
      {[
        [0, 3, 0], [0.8, 2.8, 0.5], [-0.8, 2.8, -0.5], [0.5, 3.2, -0.8], [-0.5, 3.2, 0.8]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.8 + Math.random() * 0.4, 8, 8]} />
          <primitive object={leafMat} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

/**
 * A fallen ruined column piece
 */
export function RuinedColumn({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: { position?: [number, number, number], rotation?: [number, number, number], scale?: number }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3A2B40', roughness: 0.7 }), [])
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.45, 2, 12]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[0, 1, 0]} rotation={[0.5, 0.2, 0.8]}>
        <cylinderGeometry args={[0.4, 0.4, 1.2, 12]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  )
}
