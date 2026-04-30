// apps/web/components/audio/AudioProvider.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { SOUNDS } from './SoundEffects'

// This provider ensures that ambient drone can auto-play upon first user interaction
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [hasInteracted, setHasInteracted] = useState(false)
  const droneIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Only play ambient sound once user has interacted to comply with browser auto-play policies
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true)
        // Start the drone if it's not already playing
        if (!droneIdRef.current) {
          droneIdRef.current = SOUNDS.templeDrone.play()
          SOUNDS.templeDrone.fade(0, 0.3, 2000, droneIdRef.current)
        }
      }
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('keydown', handleInteraction)
    window.addEventListener('scroll', handleInteraction, { once: true })

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
    }
  }, [hasInteracted])

  return <>{children}</>
}
