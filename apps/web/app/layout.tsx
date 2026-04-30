import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pantheon — Where Mortal Code Becomes Immortal Legend',
  description: 'On-chain AI agent battle league. Forge your god. Enter the arena. Claim apotheosis. Built for ETHGlobal OpenAgents 2026.',
  keywords: ['AI agents', 'blockchain', 'battle', 'ENS', '0G', 'Uniswap', 'Web3 game'],
  authors: [{ name: 'Pantheon Team' }],
  openGraph: {
    title: 'Pantheon',
    description: 'On-chain AI agent battle league',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pantheon',
    description: 'On-chain AI agent battle league',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
