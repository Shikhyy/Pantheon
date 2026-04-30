// lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// 0G Testnet chain definition
export const ogTestnet = {
  id: 16600,
  name: '0G Testnet',
  nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-newton.0g.ai',
    },
  },
  testnet: true,
} as const

export const wagmiConfig = getDefaultConfig({
  appName: 'Pantheon',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'pantheon-demo',
  chains: [ogTestnet, mainnet],
  ssr: true,
})
