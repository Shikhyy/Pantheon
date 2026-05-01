'use client'

import type { Metadata } from 'next'
import { usePathname } from 'next/navigation'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'
import OdysseyScene from '@/components/r3f/OdysseyScene'
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
  const pathname = usePathname()

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <OdysseyScene currentRoute={pathname} />
        <Providers>
          <main className="min-h-screen pt-20">
            {children}
          </main>
          <Toaster theme="dark" toastOptions={{ className: 'font-cinzel text-xs tracking-widest uppercase bg-nox border-stone/20 text-parch' }} />
        </Providers>
      </body>
    </html>
  )
}
