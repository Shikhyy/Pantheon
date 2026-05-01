'use client'
// components/r3f/avatars/AvatarBodyBuilder.tsx
// Fully procedural Greek hero body — no external GLTF required.

interface HeroBodyProps {
  armourColour: string
  skinColour:   string
  crestColour:  string
  rank:         string
}

export function HeroBody({ armourColour, skinColour, crestColour, rank }: HeroBodyProps) {
  return (
    <group>
      {/* Torso — slightly tapered box */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.2]} />
        <meshStandardMaterial color={armourColour} roughness={0.8} metalness={0.3} envMapIntensity={0.6} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.12, 8]} />
        <meshStandardMaterial color={skinColour} roughness={0.85} metalness={0} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 12]} />
        <meshStandardMaterial color={skinColour} roughness={0.8} metalness={0} />
      </mesh>

      {/* Eyes (left) */}
      <mesh position={[-0.045, 0.755, 0.13]}>
        <sphereGeometry args={[0.022, 8, 6]} />
        <meshStandardMaterial color={crestColour} emissive={crestColour} emissiveIntensity={0.6} roughness={0.1} />
      </mesh>

      {/* Eyes (right) */}
      <mesh position={[0.045, 0.755, 0.13]}>
        <sphereGeometry args={[0.022, 8, 6]} />
        <meshStandardMaterial color={crestColour} emissive={crestColour} emissiveIntensity={0.6} roughness={0.1} />
      </mesh>

      {/* Left arm */}
      <group position={[-0.22, 0.32, 0]}>
        <mesh rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.045, 0.055, 0.38, 8]} />
          <meshStandardMaterial color={skinColour} roughness={0.85} metalness={0} />
        </mesh>
      </group>

      {/* Right arm */}
      <group position={[0.22, 0.32, 0]}>
        <mesh rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.045, 0.055, 0.38, 8]} />
          <meshStandardMaterial color={skinColour} roughness={0.85} metalness={0} />
        </mesh>
      </group>

      {/* Left leg */}
      <group position={[-0.1, -0.16, 0]}>
        <mesh>
          <cylinderGeometry args={[0.065, 0.055, 0.44, 8]} />
          <meshStandardMaterial color={armourColour} roughness={0.85} metalness={0.2} />
        </mesh>
      </group>

      {/* Right leg */}
      <group position={[0.1, -0.16, 0]}>
        <mesh>
          <cylinderGeometry args={[0.065, 0.055, 0.44, 8]} />
          <meshStandardMaterial color={armourColour} roughness={0.85} metalness={0.2} />
        </mesh>
      </group>

      {/* Rank Olympian — shoulder epaulets */}
      {rank === 'Olympian' && (
        <>
          <mesh position={[-0.23, 0.5, 0]}>
            <sphereGeometry args={[0.075, 8, 6]} />
            <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.23, 0.5, 0]}>
            <sphereGeometry args={[0.075, 8, 6]} />
            <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
          </mesh>
        </>
      )}
    </group>
  )
}
