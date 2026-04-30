'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Navigation } from '@/components/ui/Navigation'
import { usePathname } from 'next/navigation'

// Lazy-load canvas to avoid SSR issues
const PantheonCanvas = dynamic(
  () => import('@/components/r3f/PantheonCanvas'),
  { ssr: false }
)

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="relative min-h-screen bg-nox overflow-x-hidden">

      {/* Persistent 3D canvas — never unmounts between routes */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <PantheonCanvas currentRoute={pathname} />
        </Suspense>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Page content overlaid on canvas */}
      <main className="relative z-10">
        {children}
      </main>

    </div>
  )
}
