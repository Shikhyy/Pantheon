'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Environment } from '@react-three/drei'

import { NightSky } from './NightSky'
import { ParticleSystem } from './environment/ParticleSystem'
import { ScrollCamera } from './ScrollCamera'

import { TempleOfZeus } from './scenes/TempleOfZeus'
import { MarketArchway } from './scenes/MarketArchway'
import { HallOfGods } from './scenes/HallOfGods'
import { HephaestusForge } from './scenes/HephaestusForge'
import { ColosseumGate } from './scenes/ColosseumGate'
import { ParthenaSilhouette } from './ParthenaSilhouette'
import { ParallaxLayer } from './ParallaxLayer'
import { TorchSystem } from './TorchSystem'
import { GroundFog } from './GroundFog'

import { useOdysseyStore, OdysseySection } from '@/lib/odyssey-store'

function SceneContent() {
  const { activeSection, parallaxOffset } = useOdysseyStore()

  return (
    <>
      <ScrollCamera />

      <NightSky starCount={2000} />

      {/* ── DYNAMIC LIGHTING PER SECTION ── */}
      <ambientLight 
        intensity={activeSection === 'forge' || activeSection === 'battle' ? 0.8 : 1.2} 
        color={activeSection === 'forge' ? "#402020" : "#2A1A30"} 
      />
      
      <directionalLight
        position={[0, 10, 5]}
        intensity={activeSection === 'forge' ? 4.5 : 3.5}
        color={activeSection === 'agora' ? "#7FC6E9" : "#BBA580"}
      />
      
      {/* Central glow for architecture */}
      <pointLight 
        position={[0, 8, -8]} 
        intensity={activeSection === 'landing' ? 12 : 8.0} 
        color={activeSection === 'agora' ? "#5FB6D9" : activeSection === 'forge' ? "#FF4400" : "#D4AF37"} 
        distance={40} 
      />

      {/* ── SECTION SPECIFIC ATMOSPHERE ── */}
      
      {activeSection === 'landing' && (
        <>
          <ParallaxLayer speed={0.2} parallaxOffset={parallaxOffset}>
            <ParthenaSilhouette />
            <TorchSystem positions={[
              [-7, 0.5, 2], [-4, 0.5, 2], [4, 0.5, 2], [7, 0.5, 2],
              [-3, 0.5, -6], [3, 0.5, -6], [0, 0.5, -9],
            ]} />
          </ParallaxLayer>
          <GroundFog color="#1A1020" />
          <ParticleSystem type="embers" count={60} />
        </>
      )}

      {activeSection === 'dashboard' && (
        <>
          <ParallaxLayer speed={0.15} parallaxOffset={parallaxOffset}>
            <TempleOfZeus isActive={true} />
            <TorchSystem positions={[
              [-6, 0.5, -4], [6, 0.5, -4],
              [-10, 0.5, -8], [10, 0.5, -8],
            ]} color="#D4AF37" />
          </ParallaxLayer>
          <GroundFog color="#1A1020" />
          <ParticleSystem type="dust" count={40} />
        </>
      )}

      {activeSection === 'agora' && (
        <>
          <ParallaxLayer speed={0.15} parallaxOffset={parallaxOffset}>
            <MarketArchway isActive={true} />
            <TorchSystem 
              positions={[[-4, 0.5, -2], [4, 0.5, -2], [-8, 0.5, -6], [8, 0.5, -6]]} 
              color="#5FB6D9" 
              flameColors={{
                base: [0.1, 0.3, 0.5],
                mid: [0.2, 0.6, 0.8],
                tip: [0.6, 0.9, 1.0]
              }}
            />
          </ParallaxLayer>
          <GroundFog color="#102030" />
          <ParticleSystem type="mystic" count={30} />
        </>
      )}

      {activeSection === 'legends' && (
        <>
          <ParallaxLayer speed={0.1} parallaxOffset={parallaxOffset}>
            <HallOfGods isActive={true} />
            <TorchSystem 
              positions={[[-12, 0.5, -10], [12, 0.5, -10], [-6, 0.5, -12], [6, 0.5, -12]]} 
              color="#FFFFFF" 
              flameColors={{
                base: [0.4, 0.4, 0.6],
                mid: [0.7, 0.7, 0.9],
                tip: [1.0, 1.0, 1.0]
              }}
            />
          </ParallaxLayer>
          <GroundFog color="#202020" />
          <ParticleSystem type="soul" count={50} />
        </>
      )}

      {activeSection === 'forge' && (
        <>
          <ParallaxLayer speed={0.2} parallaxOffset={parallaxOffset}>
            <HephaestusForge isActive={true} />
          </ParallaxLayer>
          <GroundFog color="#301000" />
          <ParticleSystem type="embers" count={80} />
        </>
      )}

      {activeSection === 'battle' && (
        <>
          <ParallaxLayer speed={0.1} parallaxOffset={parallaxOffset}>
            <ColosseumGate isActive={true} />
          </ParallaxLayer>
          <GroundFog color="#200000" />
          <ParticleSystem type="embers" count={100} />
        </>
      )}

      {/* Simple dark floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#000000" roughness={1} />
      </mesh>

      <EffectComposer multisampling={4}>
        <Bloom
          intensity={1.2}
          mipmapBlur
          luminanceThreshold={0.15}
          luminanceSmoothing={0.8}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
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
    const path = currentRoute.startsWith('/') ? currentRoute : '/' + currentRoute
    const firstSegment = '/' + path.split('/')[1]
    const secondSegment = path.split('/')[2]

    let section: OdysseySection = 'landing'

    if (firstSegment === '/colosseum' && secondSegment) {
      section = 'battle'
    } else if (firstSegment === '/colosseum' && !secondSegment) {
      section = 'landing'
    } else {
      const sectionMap: Record<string, OdysseySection> = {
        '/': 'landing',
        '/dashboard': 'dashboard',
        '/agora': 'agora',
        '/legends': 'legends',
        '/forge': 'forge',
      }
      section = sectionMap[firstSegment] || 'landing'
    }

    setActiveSection(section)
  }, [currentRoute, setActiveSection])

  return (
    <div className="fixed inset-0 -z-10 bg-nox">
      <Canvas
        key="pantheon-main-canvas"
        camera={{ position: [0, 3, 12], fov: 60 }}
        gl={{
          antialias: false,
          alpha: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
          powerPreference: 'default',
        }}
        shadows={false}
        dpr={1}
        performance={{ min: 0.5 }}
        onCreated={() => console.log('✨ Pantheon WebGL Context Created')}
        onError={(err) => console.error('❌ Pantheon WebGL Error:', err)}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}
