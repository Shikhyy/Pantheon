'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

interface MarbleMaterialProps {
  roughness?: number
  color?: string
}

export function MarbleMaterial({ roughness = 0.3, color = '#F5F5F0' }: MarbleMaterialProps) {
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness: 0,
      envMapIntensity: 0.5,
    })
    return mat
  }, [roughness, color])

  return <primitive object={material} attach="material" />
}

export function GoldMaterial({ roughness = 0.2, color = '#D4AF37' }: MarbleMaterialProps) {
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness: 0.9,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.15,
    })
    return mat
  }, [roughness, color])

  return <primitive object={material} attach="material" />
}