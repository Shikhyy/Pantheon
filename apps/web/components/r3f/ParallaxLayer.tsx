'use client'

import { Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

interface ParallaxLayerProps {
  speed: number // 0.2 for bg, 0.5 for mid, 0.8 for fg
  parallaxOffset: number
  children: React.ReactNode
}

export function ParallaxLayer({ speed, parallaxOffset, children }: ParallaxLayerProps) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = parallaxOffset * speed
    }
  })

  return <group ref={groupRef}>{children}</group>
}
