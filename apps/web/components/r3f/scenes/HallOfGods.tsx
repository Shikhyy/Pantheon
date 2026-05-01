'use client'
import { PortalGate } from './PortalGate'
import { GodStatues } from '../environment/GodStatues'
import { GoldAccent } from '../environment/GoldAccent'

export function HallOfGods({ isActive = false }: { isActive?: boolean }) {
  return (
    <group>
      <PortalGate position={[0, 0, -5]} isActive={isActive} name="legends" />

      <GodStatues
        gods={[
          { god: 'ares', position: [-8, 0, -4], scale: 1.3 },
          { god: 'aphrodite', position: [-4, 0, -4], scale: 1.2 },
          { god: 'athena', position: [0, 0, -6], scale: 1.4 },
          { god: 'poseidon', position: [4, 0, -4], scale: 1.2 },
          { god: 'zeus', position: [8, 0, -4], scale: 1.3 },
        ]}
      />

      {[...Array(8)].map((_, i) => (
        <group key={i} position={[(i - 3.5) * 3, 0, -8]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.4, 0.5, 8, 10]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2d1b4e" roughness={0.5} />
      </mesh>
    </group>
  )
}