'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'
import OdysseyScene from '@/components/r3f/OdysseyScene'
import './globals.css'

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <OdysseyScene currentRoute={pathname} />
      <Providers>
        <main className="min-h-screen pt-20 relative z-10 bg-transparent">
          {children}
        </main>
        <Toaster theme="dark" toastOptions={{ className: 'font-cinzel text-xs tracking-widest uppercase bg-nox border-stone/20 text-parch' }} />
      </Providers>
    </>
  )
}