// components/r3f/NightSky.tsx
'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, BufferAttribute, ShaderMaterial, AdditiveBlending } from 'three'

const starVertexShader = /* glsl */`
  attribute float aOffset;
  attribute float aSize;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vAlpha = 0.3 + 0.7 * abs(sin(uTime * 0.8 + aOffset * 6.28));
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Calculate point size based on depth, but clamp it to prevent giant spheres
    float calculatedSize = aSize * (300.0 / max(-mvPosition.z, 0.1));
    gl_PointSize = clamp(calculatedSize, 0.0, 15.0);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`

const starFragmentShader = /* glsl */`
  varying float vAlpha;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float strength = 1.0 - d * 2.0;
    gl_FragColor = vec4(0.95, 0.88, 0.85, strength * vAlpha);
  }
`

export function NightSky({ starCount = 2000 }: { starCount?: number }) {
  const matRef = useRef<ShaderMaterial>(null)

  const [{ geometry, material }] = useState(() => {
    const positions = new Float32Array(starCount * 3)
    const offsets   = new Float32Array(starCount)
    const sizes     = new Float32Array(starCount)

    for (let i = 0; i < starCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 400
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200 + 40
      // Spawn stars strictly in the deep background (z from -50 to -450)
      positions[i * 3 + 2] = -Math.random() * 400 - 50
      offsets[i] = Math.random() * Math.PI * 2
      sizes[i]   = Math.random() * 0.8 + 0.1
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    geo.setAttribute('aOffset',  new BufferAttribute(offsets, 1))
    geo.setAttribute('aSize',    new BufferAttribute(sizes, 1))

    const mat = new ShaderMaterial({
      vertexShader:   starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    })

    return { geometry: geo, material: mat }
  })

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  return (
    <points geometry={geometry}>
      <primitive object={material} ref={matRef} />
    </points>
  )
}
