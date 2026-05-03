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
  varying float vHeight;

  void main() {
    vec3 base  = vec3(0.545, 0.188, 0.063);
    vec3 mid   = vec3(0.851, 0.471, 0.125);
    vec3 tip   = vec3(0.961, 0.816, 0.376);

    vec3 col = mix(base, mid, vHeight);
    col = mix(col, tip, smoothstep(0.5, 1.0, vHeight));

    float alpha = 1.0 - vHeight * 0.6;
    alpha *= 0.9 + 0.1 * sin(uTime * 8.0 + vHeight * 3.0);

    gl_FragColor = vec4(col, alpha);
  }
`

interface TorchSystemProps {
  positions: [number, number, number][]
}

export function TorchSystem({ positions }: TorchSystemProps) {
  const flameMaterial = useMemo(() => new ShaderMaterial({
    vertexShader: flameVertexShader,
    fragmentShader: flameFragmentShader,
    uniforms: {
      uTime:   { value: 0 },
      uHeight: { value: 0.8 },
    },
    transparent: true,
    depthWrite: false,
  }), [])

  useFrame(({ clock }) => {
    // eslint-disable-next-line react-hooks/immutability
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
            scale={0.5}
            size={1.5}
            speed={0.4}
            opacity={0.6}
            color="#F5C840"
            position={[0, 0.4, 0]}
          />

          {/* Orange point light */}
          <pointLight
            color="#D97820"
            intensity={2.5}
            distance={8}
            decay={2}
            castShadow={false}
          />
        </group>
      ))}
    </>
  )
}
