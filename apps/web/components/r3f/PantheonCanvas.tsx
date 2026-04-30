// components/r3f/PantheonCanvas.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { TempleScene } from './scenes/TempleScene'
import { ColosseumScene } from './scenes/ColosseumScene'
import { useGameStore } from '@/lib/store'

interface Props { currentRoute: string }

export default function PantheonCanvas({ currentRoute }: Props) {
  const isColosseum = currentRoute.startsWith('/colosseum')
  const isForge     = currentRoute.startsWith('/forge')
  const isLanding   = currentRoute === '/'

  return (
    <Canvas
      camera={{ position: [0, 4, 28], fov: 55 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      shadows={{ type: PCFSoftShadowMap }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={null}>

        {/* Scene selection based on route */}
        {(isLanding || isForge) && <TempleScene />}
        {isColosseum && <ColosseumScene />}
        {(!isLanding && !isForge && !isColosseum) && <TempleScene />}

        {/* Post-processing */}
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.4}
            mipmapBlur
            luminanceThreshold={0.6}
            luminanceSmoothing={0.5}
          />
          <Vignette eskil={false} offset={0.12} darkness={0.85} />
        </EffectComposer>

      </Suspense>
    </Canvas>
  )
}
