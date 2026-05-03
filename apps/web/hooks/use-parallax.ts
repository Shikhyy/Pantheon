'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ParallaxState {
  offset: number // -200 to 200
  normalizedOffset: number // -1 to 1
}

export function useParallax() {
  const [parallax, setParallax] = useState<ParallaxState>({ offset: 0, normalizedOffset: 0 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 400 // ±200px range
    setParallax({
      offset: x,
      normalizedOffset: x / 200,
    })
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const x = (e.touches[0].clientX / window.innerWidth - 0.5) * 400
      setParallax({
        offset: x,
        normalizedOffset: x / 200,
      })
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handleMouseMove, handleTouchMove])

  return parallax
}
