// components/r3f/TorchSystem.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { ShaderMaterial } from 'three'

const flameVertexShader = /* glsl */`
  uniform float uTime;
  uniform float uHeight;
  varying float vHeight;

  void main() {
    vHeight = position.y / uHeight;
    float sway = sin(uTime * 3.2 + vHeight * 5.0 + position.x * 2.0) * vHeight * 0.12;
    float taper = 1.0 - vHeight * 0.75;
    vec3 pos = position;
    pos.x = pos.x * taper + sway;
    pos.z = pos.z * taper + cos(uTime * 2.8 + vHeight * 4.0) * vHeight * 0.06;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const flameFragmentShader = /* glsl */`
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uMidColor;
  uniform vec3 uTipColor;
  varying float vHeight;

  void main() {
    vec3 col = mix(uBaseColor, uMidColor, vHeight);
    col = mix(col, uTipColor, smoothstep(0.5, 1.0, vHeight));

    float alpha = 1.0 - vHeight * 0.6;
    alpha *= 0.9 + 0.1 * sin(uTime * 8.0 + vHeight * 3.0);

    gl_FragColor = vec4(col, alpha);
  }
`

interface TorchSystemProps {
  positions: [number, number, number][]
  color?: string
  flameColors?: {
    base: [number, number, number]
    mid: [number, number, number]
    tip: [number, number, number]
  }
}

export function TorchSystem({ 
  positions, 
  color = "#D97820", 
  flameColors = {
    base: [0.545, 0.188, 0.063],
    mid: [0.851, 0.471, 0.125],
    tip: [0.961, 0.816, 0.376]
  }
}: TorchSystemProps) {
  const flameMaterial = useMemo(() => new ShaderMaterial({
    vertexShader: flameVertexShader,
    fragmentShader: flameFragmentShader,
    uniforms: {
      uTime:   { value: 0 },
      uHeight: { value: 0.8 },
      uBaseColor: { value: new THREE.Vector3(...flameColors.base) },
      uMidColor: { value: new THREE.Vector3(...flameColors.mid) },
      uTipColor: { value: new THREE.Vector3(...flameColors.tip) },
    },
    transparent: true,
    depthWrite: false,
  }), [flameColors])

  useFrame(({ clock }) => {
    flameMaterial.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <>
      {positions.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {/* Torch staff */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 1.2, 8]} />
            <meshStandardMaterial color="#3A2810" roughness={0.9} />
          </mesh>

          {/* Flame mesh */}
          <mesh position={[0, 0.3, 0]} material={flameMaterial}>
            <coneGeometry args={[0.12, 0.8, 12, 8, true]} />
          </mesh>

          {/* Ember particles */}
          <Sparkles
            count={20}
            scale={0.8}
            size={1.5}
            speed={0.6}
            opacity={0.8}
            color={color}
            position={[0, 0.4, 0]}
          />
          
          {/* Point light */}
          <pointLight
            color={color}
            intensity={5.0}
            distance={10}
            decay={2}
            castShadow={false}
          />
        </group>
      ))}
    </>
  )
}

import * as THREE from 'three'
