'use client'
import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useOdysseyStore } from '@/lib/odyssey-store'

interface CameraConfig {
  position: [number, number, number]
  lookAt: [number, number, number]
}

const sectionCameras: Record<string, CameraConfig> = {
  landing: { position: [0, 4, 28], lookAt: [0, 4, 0] },
  dashboard: { position: [0, 5, 15], lookAt: [0, 4, -5] },
  agora: { position: [0, 4, 18], lookAt: [0, 3, -5] },
  legends: { position: [0, 6, 20], lookAt: [0, 5, -5] },
  forge: { position: [0, 3, 12], lookAt: [0, 2, -5] },
  battle: { position: [0, 5, 16], lookAt: [0, 3, -5] },
}

export function CameraFlythrough() {
  const { camera } = useThree()
  const { activeSection, isTransitioning, setTransitioning } = useOdysseyStore()
  const currentConfig = useRef(sectionCameras.landing)

  useEffect(() => {
    const targetConfig = sectionCameras[activeSection]
    if (!targetConfig || activeSection === 'landing') return

    setTransitioning(true)

    const timeline = gsap.timeline({
      onComplete: () => setTransitioning(false),
    })

    timeline
      .to(camera.position, {
        x: 0,
        y: 8,
        z: 0,
        duration: 0.8,
        ease: 'power2.in',
      })
      .to(camera.position, {
        x: targetConfig.position[0],
        y: targetConfig.position[1],
        z: targetConfig.position[2],
        duration: 1.2,
        ease: 'power2.out',
      })

    currentConfig.current = targetConfig
  }, [activeSection, camera, setTransitioning])

  useFrame(() => {
    const config = currentConfig.current
    camera.lookAt(config.lookAt[0], config.lookAt[1], config.lookAt[2])
  })

  return null
}