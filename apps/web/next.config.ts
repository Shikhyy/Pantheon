import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Transpile Three.js and related packages that use ES modules
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/postprocessing',
    '@theatre/core',
    '@theatre/r3f',
    '@rainbow-me/rainbowkit',
  ],

  // Turbopack config (Next.js 16 default)
  turbopack: {},
}

export default nextConfig
