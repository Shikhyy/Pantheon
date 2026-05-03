'use client'

import { Navigation } from '@/components/ui/Navigation'
import AxlStatus from '@/components/AxlStatus'

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-nox overflow-x-hidden">
      {/* Navigation */}
      <Navigation />

      {/* Page content */}
      <main className="relative">
        {children}
      </main>
      <AxlStatus />
    </div>
  )
}
