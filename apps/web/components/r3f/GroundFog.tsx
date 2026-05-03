// components/r3f/GroundFog.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial } from 'three'

const fogVertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fogFragmentShader = /* glsl */`
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    v += noise(p) * 0.5;
    v += noise(p * 2.0) * 0.25;
    v += noise(p * 4.0) * 0.125;
    return v;
  }

  void main() {
    vec2 uv = vUv + vec2(uTime * 0.015, uTime * 0.008);
    float fog = fbm(uv * 4.0);
    float edge = smoothstep(0.0, 0.4, vUv.x) * smoothstep(1.0, 0.6, vUv.x)
               * smoothstep(0.0, 0.4, vUv.y) * smoothstep(1.0, 0.6, vUv.y);

    gl_FragColor = vec4(uColor, fog * edge * 0.3);
  }
`

interface GroundFogProps {
  color?: string
}

export function GroundFog({ color = "#1A1020" }: GroundFogProps) {
  const matRef = useRef<ShaderMaterial>(null)
  const threeColor = useMemo(() => new THREE.Color(color), [color])

  const mat = useMemo(() => new ShaderMaterial({
    vertexShader:   fogVertexShader,
    fragmentShader: fogFragmentShader,
    uniforms: { 
      uTime: { value: 0 },
      uColor: { value: threeColor }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [threeColor])

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 30]} />
      <primitive object={mat} ref={matRef} />
    </mesh>
  )
}

import * as THREE from 'three'
