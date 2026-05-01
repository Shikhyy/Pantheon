'use client'
import { PortalGate } from './PortalGate'
import { GodStatues } from '../environment/GodStatues'
import { TorchLight } from '../environment/TorchLight'
import { GreekFountain } from '../environment/GreekFountain'

export function TempleOfZeus({ isActive = false }: { isActive?: boolean }) {
  return (
    <group>
      <PortalGate position={[0, 0, -5]} isActive={isActive} name="temple" />

      <GodStatues
        gods={[
          { god: 'zeus', position: [-5, 0, 0], scale: 1.5 },
          { god: 'athena', position: [5, 0, 0], scale: 1.5 },
        ]}
      />

      <TorchLight position={[-4, 0.5, 0]} scale={0.8} />
      <TorchLight position={[4, 0.5, 0]} scale={0.8} />
      <TorchLight position={[-4, 0.5, -4]} scale={0.8} />
      <TorchLight position={[4, 0.5, -4]} scale={0.8} />

      <GreekFountain position={[0, 0, 2]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e8e4d8" roughness={0.8} />
      </mesh>
    </group>
  )
}