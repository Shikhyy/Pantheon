'use client'
import { PortalGate } from './PortalGate'

export function ColosseumGate({ isActive = false }: { isActive?: boolean }) {
  return (
    <group>
      <PortalGate position={[0, 0, -5]} isActive={isActive} name="colosseum" />

      {[...Array(6)].map((_, i) => (
        <group key={i} position={[i * 2 - 5, 0, -10]}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 6, 8]} />
            <meshStandardMaterial color="#d4c8b8" roughness={0.7} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 7, -10]}>
        <boxGeometry args={[14, 1, 2]} />
        <meshStandardMaterial color="#d4c8b8" roughness={0.7} />
      </mesh>

      <mesh position={[0, 0, -15]} rotation={[0, 0, 0]}>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color="#1a0a0a" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[25, 30]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
    </group>
  )
}