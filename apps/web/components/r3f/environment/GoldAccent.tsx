'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

export function GoldAccent({ emissiveIntensity = 0.2 }: { emissiveIntensity?: number }) {
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      roughness: 0.2,
      metalness: 0.9,
      emissive: new THREE.Color('#D4AF37'),
      emissiveIntensity,
    })
  }, [emissiveIntensity])

  return <primitive object={material} attach="material" />
}