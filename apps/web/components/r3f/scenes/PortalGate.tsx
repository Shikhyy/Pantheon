'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MarbleMaterial } from '../environment/MarbleMaterial'
import { GoldAccent } from '../environment/GoldAccent'

interface PortalGateProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  isActive?: boolean
  name?: string
}

export function PortalGate({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  isActive = false,
  name = 'portal'
}: PortalGateProps) {
  const glowRef = useRef<THREE.Mesh>(null)
  const leftColumnRef = useRef<THREE.Group>(null)
  const rightColumnRef = useRef<THREE.Group>(null)

  const columnHeight = 8
  const columnRadius = 0.6

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (glowRef.current && isActive) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.3 + Math.sin(t * 2) * 0.1
    }
    if (leftColumnRef.current && rightColumnRef.current) {
      const openAmount = isActive ? 1.5 : 0
      leftColumnRef.current.position.x = -2 - openAmount
      rightColumnRef.current.position.x = 2 + openAmount
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={leftColumnRef} position={[-2, 0, 0]}>
        <mesh position={[0, columnHeight / 2, 0]}>
          <cylinderGeometry args={[columnRadius, columnRadius * 1.2, columnHeight, 12]} />
          <MarbleMaterial roughness={0.35} />
        </mesh>
        <mesh position={[0, columnHeight + 0.4, 0]}>
          <boxGeometry args={[1.5, 0.8, 1.2]} />
          <MarbleMaterial roughness={0.35} />
        </mesh>
      </group>

      <group ref={rightColumnRef} position={[2, 0, 0]}>
        <mesh position={[0, columnHeight / 2, 0]}>
          <cylinderGeometry args={[columnRadius, columnRadius * 1.2, columnHeight, 12]} />
          <MarbleMaterial roughness={0.35} />
        </mesh>
        <mesh position={[0, columnHeight + 0.4, 0]}>
          <boxGeometry args={[1.5, 0.8, 1.2]} />
          <MarbleMaterial roughness={0.35} />
        </mesh>
      </group>

      <mesh position={[0, columnHeight + 0.8, 0]}>
        <boxGeometry args={[6, 1.2, 1.5]} />
        <MarbleMaterial roughness={0.35} />
      </mesh>

      <mesh position={[0, columnHeight / 2, -0.3]}>
        <boxGeometry args={[4, columnHeight - 1, 0.2]} />
        <GoldAccent emissiveIntensity={isActive ? 0.4 : 0.1} />
      </mesh>

      <mesh ref={glowRef} position={[0, columnHeight / 2, 0.1]}>
        <planeGeometry args={[3, columnHeight - 2]} />
        <meshStandardMaterial
          color="#1a3a5c"
          emissive={isActive ? '#d4af37' : '#1a3a5c'}
          emissiveIntensity={isActive ? 0.5 : 0.1}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {isActive && (
        <>
          <pointLight position={[0, columnHeight / 2, 1]} color="#d4af37" intensity={2} distance={8} />
          <spotLight position={[0, columnHeight + 2, 2]} color="#ffd700" intensity={1} angle={0.5} />
        </>
      )}
    </group>
  )
}