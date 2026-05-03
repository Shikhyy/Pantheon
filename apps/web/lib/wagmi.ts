// lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// 0G Testnet chain definition
export const ogTestnet = {
  id: 16601,
  name: '0G Galileon Testnet',
  nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
} as const

// Local Anvil chain (_foundry)
export const localAnvil = {
  id: 31337,
  name: 'Local Anvil',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
} as const

const isProd = process.env.NODE_ENV === 'production'

export const wagmiConfig = getDefaultConfig({
  appName: 'Pantheon',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'pantheon-demo',
  chains: [ogTestnet, localAnvil, mainnet, sepolia],
  transports: {
    [ogTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL ?? 'https://evmrpc-testnet.0g.ai'),
    [localAnvil.id]: http('http://127.0.0.1:8545'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
})