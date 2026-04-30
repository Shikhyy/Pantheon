// components/r3f/AgentMedallion.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import { Mesh, ShaderMaterial } from 'three'

const medallionVertexShader = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const medallionFragmentShader = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  // FBM marble pattern
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

  void main() {
    vec2 uv = vUv;
    float marble = noise(uv * 8.0 + uTime * 0.05) * 0.5 + noise(uv * 16.0) * 0.25;

    vec3 gold   = vec3(0.788, 0.659, 0.298); // #C9A84C
    vec3 deep   = vec3(0.055, 0.031, 0.094); // #0E081A
    vec3 color  = mix(deep, gold, marble * 0.6);

    // Fresnel rim glow
    float fresnel = pow(1.0 - dot(vNormal, vec3(0,0,1)), 3.0);
    color += vec3(0.788, 0.659, 0.298) * fresnel * 0.8;

    gl_FragColor = vec4(color, 1.0);
  }
`

interface Props {
  position?: [number, number, number]
  scale?: number
}

export function AgentMedallion({ position = [0, 2, -2], scale = 1.4 }: Props) {
  const meshRef = useRef<Mesh>(null)
  const matRef = useRef<ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.15
    }
  })

  const mat = new ShaderMaterial({
    vertexShader:   medallionVertexShader,
    fragmentShader: medallionFragmentShader,
    uniforms: { uTime: { value: 0 } },
  })

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.3}
      floatIntensity={0.6}
    >
      <group position={position} scale={scale}>
        {/* Main medallion disc */}
        <mesh ref={meshRef}>
          <cylinderGeometry args={[1, 1, 0.15, 32]} />
          <primitive object={mat} ref={matRef} />
        </mesh>

        {/* Outer ring */}
        <mesh>
          <torusGeometry args={[1.1, 0.06, 8, 32]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Inner ring */}
        <mesh>
          <torusGeometry args={[0.85, 0.03, 6, 32]} />
          <meshStandardMaterial color="#F0C040" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Glow sparkles */}
        <Sparkles
          count={30}
          scale={2.5}
          size={1.2}
          speed={0.3}
          opacity={0.4}
          color="#C9A84C"
        />

        {/* Point light */}
        <pointLight color="#C9A84C" intensity={1.5} distance={6} decay={2} />
      </group>
    </Float>
  )
}
