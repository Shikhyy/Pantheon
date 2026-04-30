// components/r3f/scenes/ColosseumScene.tsx
'use client'

import { NightSky } from '../NightSky'
import { TorchSystem } from '../TorchSystem'
import { Environment } from '@react-three/drei'

export function ColosseumScene() {
  return (
    <>
      <NightSky starCount={1200} />
      <TorchSystem
        positions={[
          [-10, 1, 0],
          [-8, 1, -3],
          [8, 1, -3],
          [10, 1, 0],
        ]}
      />
      {/* Arena floor */}
      <mesh position={[0, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#1A1008" roughness={0.9} />
      </mesh>
      {/* Arena walls (curved arches approximated) */}
      <mesh position={[0, 0, -8]}>
        <boxGeometry args={[30, 8, 1]} />
        <meshStandardMaterial color="#0E0A14" roughness={1} />
      </mesh>
      <Environment preset="night" />
      <ambientLight intensity={0.08} color="#1A1020" />
    </>
  )
}
