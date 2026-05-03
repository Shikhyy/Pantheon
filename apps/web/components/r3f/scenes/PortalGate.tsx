'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Float, Text } from '@react-three/drei'

export function PortalGate({ 
  position = [0, 4, -8], 
  isActive = false, 
  name = 'portal',
  scale = 1
}: { 
  position?: [number, number, number],
  isActive?: boolean, 
  name?: string,
  scale?: number
}) {
  const innerRingRef = useRef<THREE.Group>(null)
  const outerRingRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (innerRingRef.current) innerRingRef.current.rotation.z = t * 0.5
    if (outerRingRef.current) outerRingRef.current.rotation.z = -t * 0.2
    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.1)
      ;(coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(t * 3)
    }
  })

  return (
    <group position={position} scale={scale}>
      {/* The Central Soul Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial 
          color="#d4af37" 
          emissive="#d4af37" 
          emissiveIntensity={2}
          metalness={1}
          roughness={0}
        />
      </mesh>
      <pointLight intensity={5} color="#d4af37" distance={15} />

      {/* Inner Rotating Ring */}
      <group ref={innerRingRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3, 0.1, 16, 100]} />
          <meshStandardMaterial color="#fff" metalness={1} roughness={0.1} />
        </mesh>
        {/* Floating Inscriptions */}
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
            <mesh position={[3, 0, 0]}>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Outer Rotating Ring (Heavy Marble) */}
      <group ref={outerRingRef}>
        <mesh rotation={[Math.PI / 2, 0.2, 0]}>
          <torusGeometry args={[5, 0.4, 16, 100]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.8} />
        </mesh>
        {/* Floating Pillars on Ring - now circular and smoother */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
            <mesh position={[5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
              <meshStandardMaterial color="#222" roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}