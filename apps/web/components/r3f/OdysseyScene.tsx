'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

import { GreekSky } from './environment/GreekSky'
import { ParticleSystem } from './environment/ParticleSystem'
import { GroundFog } from './GroundFog'
import { CameraFlythrough } from './transitions/CameraFlythrough'

import { TempleOfZeus } from './scenes/TempleOfZeus'
import { MarketArchway } from './scenes/MarketArchway'
import { HallOfGods } from './scenes/HallOfGods'
import { HephaestusForge } from './scenes/HephaestusForge'
import { ColosseumGate } from './scenes/ColosseumGate'

import { useOdysseyStore, OdysseySection } from '@/lib/odyssey-store'

function SceneContent() {
  const { activeSection } = useOdysseyStore()

  return (
    <>
      <CameraFlythrough />

      <GreekSky starCount={2000} />

      <ambientLight intensity={0.15} color="#1a3a5c" />
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.2}
        color="#9090ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {activeSection === 'landing' && (
        <>
          <TempleOfZeus isActive={true} />
          <ParticleSystem type="embers" count={30} />
        </>
      )}
      {activeSection === 'dashboard' && <TempleOfZeus isActive={true} />}
      {activeSection === 'agora' && <MarketArchway isActive={true} />}
      {activeSection === 'legends' && <HallOfGods isActive={true} />}
      {activeSection === 'forge' && <HephaestusForge isActive={true} />}
      {activeSection === 'battle' && <ColosseumGate isActive={true} />}

      <GroundFog />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0a0a0f" roughness={1} />
      </mesh>

      <EffectComposer multisampling={4}>
        <Bloom
          intensity={0.5}
          mipmapBlur
          luminanceThreshold={0.7}
          luminanceSmoothing={0.4}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.9} />
      </EffectComposer>
    </>
  )
}

interface OdysseySceneProps {
  currentRoute: string
}

export default function OdysseyScene({ currentRoute }: OdysseySceneProps) {
  const { setActiveSection } = useOdysseyStore()

  useEffect(() => {
    const sectionMap: Record<string, OdysseySection> = {
      '/': 'landing',
      '/dashboard': 'dashboard',
      '/agora': 'agora',
      '/legends': 'legends',
      '/forge': 'forge',
      '/colosseum': 'battle',
    }

    const basePath = '/' + currentRoute.split('/')[1]
    const section = sectionMap[basePath] || 'landing'
    setActiveSection(section)
  }, [currentRoute, setActiveSection])

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 4, 28], fov: 55 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        shadows={{ type: PCFSoftShadowMap }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}