'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/',          label: 'Temple',    romanNumeral: 'I'   },
  { href: '/forge',     label: 'God-Forge', romanNumeral: 'II'  },
  { href: '/agora',     label: 'Agora',     romanNumeral: 'III' },
  { href: '/colosseum', label: 'Colosseum', romanNumeral: 'IV'  },
  { href: '/legends',   label: 'Legends',   romanNumeral: 'V'   },
  { href: '/dashboard', label: 'My Pantheon', romanNumeral: 'VI' },
  { href: '/about',     label: 'About',     romanNumeral: 'VII' },
]

export function Navigation() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glass background with Greek border */}
      <div className="absolute inset-0 bg-nox/60 backdrop-blur-md border-b border-stone/20" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative flex items-center justify-between px-6 py-4">
        {/* Logo - preserved original style */}
        <Link
          href="/"
          className="font-cinzel-dec text-sm tracking-[.2em] text-gold hover:text-gold-b transition-colors duration-300"
        >
          PANTHEON
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {NAV_LINKS.map(({ href, label, romanNumeral }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'font-cinzel text-[8px] lg:text-[9px] tracking-[.15em] lg:tracking-[.2em] uppercase transition-colors duration-300 relative whitespace-nowrap',
                  isActive
                    ? 'text-sand'
                    : 'text-parch/40 hover:text-parch/80'
                )}
              >
                <span className="text-gold/50 mr-1">{romanNumeral}</span>
                {label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Wallet connect */}
        <div className="relative">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted
              const connected = ready && account && chain

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                  })}
                >
                  {!connected ? (
                    <button
                      onClick={openConnectModal}
                      className="font-cinzel text-[10px] tracking-[.2em] uppercase border border-gold/40 text-gold bg-gold/[0.05] px-6 py-3 relative overflow-hidden hover:bg-gold/10 hover:border-gold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    >
                      <span>Connect Wallet</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={openChainModal}
                        className="font-cinzel text-[10px] tracking-[.15em] uppercase text-sand/50 hover:text-sand transition-colors"
                      >
                        {chain?.name}
                      </button>
                      <button
                        onClick={openAccountModal}
                        className="font-cinzel text-[10px] tracking-[.15em] uppercase border border-gold/30 text-parch/80 px-5 py-2.5 bg-gold/[0.03] hover:border-gold/60 hover:text-parch transition-all duration-300 shadow-[inset_0_0_10px_rgba(212,175,55,0.05)] hover:shadow-[inset_0_0_15px_rgba(212,175,55,0.1)]"
                      >
                        {account.displayName}
                      </button>
                    </div>
                  )}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-sand/60 hover:text-sand transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile slide-out panel */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-nox/95 backdrop-blur-md border-b border-stone/20 py-4">
          {NAV_LINKS.map(({ href, label, romanNumeral }) => (
            <Link
              key={href}
              href={href}
              className="block px-6 py-3 font-cinzel text-[9px] tracking-[.2em] uppercase text-parch/60 hover:text-sand transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-gold/50 mr-2">{romanNumeral}</span>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
