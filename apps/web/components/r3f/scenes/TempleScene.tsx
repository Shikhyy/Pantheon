// components/r3f/scenes/TempleScene.tsx
'use client'

import { Environment } from '@react-three/drei'
import { ScrollCamera } from '../ScrollCamera'
import { NightSky } from '../NightSky'
import { ParthenaSilhouette } from '../ParthenaSilhouette'
import { TorchSystem } from '../TorchSystem'
import { AgentMedallion } from '../AgentMedallion'
import { GroundFog } from '../GroundFog'

export function TempleScene() {
  return (
    <>
      <ScrollCamera />
      <NightSky starCount={2000} />
      <ParthenaSilhouette />
      <TorchSystem
        positions={[
          [-7, 0.5, 2],
          [-4, 0.5, 2],
          [4, 0.5, 2],
          [7, 0.5, 2],
        ]}
      />
      <AgentMedallion position={[0, 2, -2]} scale={1.4} />
      <GroundFog />
      <Environment preset="night" />
      <ambientLight intensity={0.12} color="#1A1020" />
      <directionalLight
        position={[0, 10, 5]}
        intensity={0.3}
        color="#8B6A4A"
      />
    </>
  )
}
