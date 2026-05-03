// components/r3f/ScrollCamera.tsx
'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useGameStore } from '@/lib/store'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(useGSAP)

export function ScrollCamera() {
  const setCameraPhase = useGameStore(s => s.setCameraPhase)

  const cameraState = useRef({
    z: 28,
    y: 4,
    targetX: 0,
  })

  useGSAP(() => {
    // Camera dolly: scroll 0→100vh → Z 28→8 (entering temple)
    gsap.to(cameraState.current, {
      z: 8,
      y: 2.5,
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '60% top',
        scrub: 1.5,
        onUpdate: (self) => {
          if (self.progress > 0.9) setCameraPhase('inside')
          else if (self.progress > 0.1) setCameraPhase('entering')
          else setCameraPhase('landing')
        },
      },
    })
  })

  useFrame(({ camera }, delta) => {
    // Smooth lerp to scroll-driven target
    // eslint-disable-next-line react-hooks/immutability
    camera.position.z += (cameraState.current.z - camera.position.z) * Math.min(delta * 4, 1)
    // eslint-disable-next-line react-hooks/immutability
    camera.position.y += (cameraState.current.y - camera.position.y) * Math.min(delta * 4, 1)
  })

  return null
}
