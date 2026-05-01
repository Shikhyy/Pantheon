'use client'
import { PortalGate } from './PortalGate'
import { TorchLight } from '../environment/TorchLight'

export function MarketArchway({ isActive = false }: { isActive?: boolean }) {
  return (
    <group>
      <PortalGate position={[0, 0, -5]} isActive={isActive} name="market" />

      {[-5, -2, 2, 5].map((x, i) => (
        <group key={i} position={[x, 0, -2]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
            <meshStandardMaterial color="#c45c26" roughness={0.7} />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <coneGeometry args={[0.5, 0.5, 8]} />
            <meshStandardMaterial color="#c45c26" roughness={0.7} />
          </mesh>
        </group>
      ))}

      <TorchLight position={[-3, 0.5, -1]} scale={0.6} />
      <TorchLight position={[3, 0.5, -1]} scale={0.6} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d4c8b8" roughness={0.9} />
      </mesh>
    </group>
  )
}