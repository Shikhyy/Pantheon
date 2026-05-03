'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import './globals.css'

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <Providers>
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="min-h-screen pt-20 relative z-10 bg-transparent"
          >
            {children}
          </motion.main>
        </AnimatePresence>
        <Toaster theme="dark" toastOptions={{ className: 'font-cinzel text-xs tracking-widest uppercase bg-nox border-stone/20 text-parch' }} />
      </Providers>
    </>
  )
}