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
    vec2 uv = vUv + vec2(uTime * 0.02, uTime * 0.01);
    float fog = fbm(uv * 3.0) * 0.8;
    float edge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x)
               * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.5, vUv.y);

    vec3 fogColor = vec3(0.1, 0.07, 0.15);
    gl_FragColor = vec4(fogColor, fog * edge * 0.5);
  }
`

export function GroundFog() {
  const matRef = useRef<ShaderMaterial>(null)

  const mat = useMemo(() => new ShaderMaterial({
    vertexShader:   fogVertexShader,
    fragmentShader: fogFragmentShader,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
  }), [])

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 20, 1, 1]} />
      <primitive object={mat} ref={matRef} />
    </mesh>
  )
}
