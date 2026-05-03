'use client'
// components/r3f/AvatarCard.tsx
// Standalone avatar display for Agora cards and agent profile views.
// Shows the avatar inside a small Canvas with Greek ornament frame.

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import { AgentAvatar } from './avatars/AgentAvatar'
import type { Archetype } from '@/lib/store'

interface AvatarCardProps {
  archetype: Archetype
  rank:      string
  elo:       number
  health?:   number
  size?:     'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-28 w-28',
  md: 'h-40 w-40',
  lg: 'h-56 w-56',
}

export function AvatarCard({ archetype, rank, elo, health = 100, size = 'md' }: AvatarCardProps) {
  return (
    <div className={`${sizeMap[size]} relative avatar-card-frame`}>
      {/* Greek ornament corners (CSS) */}
      <div className="avatar-corner avatar-corner-tl" />
      <div className="avatar-corner avatar-corner-tr" />
      <div className="avatar-corner avatar-corner-bl" />
      <div className="avatar-corner avatar-corner-br" />

      <div className="absolute inset-0 flex items-center justify-center bg- Nox/40">
        <div className="text-4xl text-gold/20">
          {/* WebGL Context Reserved for Apotheosis Engine */}
          🏛️
        </div>
      </div>
      {/* 
      <Canvas
        camera={{ position: [0, 0.2, 2.2], fov: 40 }}
        shadows
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.25} />
          <directionalLight position={[2, 4, 2]} intensity={0.8} color="#C0C8E0" />
          <pointLight position={[-1, 1, 1]} intensity={0.5} color="#C9A84C" />
          <AgentAvatar
            archetype={archetype}
            elo={elo}
            rank={rank}
            isActive={false}
            battleState="idle"
            health={health}
            position={[0, -0.1, 0]}
            scale={0.85}
          />
        </Suspense>
      </Canvas>
      */}
    </div>
  )
}
