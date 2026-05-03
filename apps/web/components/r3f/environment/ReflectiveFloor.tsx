'use client'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'

export function ReflectiveFloor({ color = '#050505' }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={60}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color={color}
        metalness={0.5}
        mirror={0.8}
      />
    </mesh>
  )
}
