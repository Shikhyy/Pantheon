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
]

export function Navigation() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      {/* Glass background */}
      <div className="absolute inset-0 bg-nox/60 backdrop-blur-md border-b border-stone/20" />

      {/* Logo */}
      <Link
        href="/"
        className="relative font-cinzel-dec text-sm tracking-[.2em] text-gold hover:text-gold-b transition-colors duration-300"
      >
        PANTHEON
      </Link>

      {/* Desktop nav links */}
      <div className="relative hidden md:flex items-center gap-8">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'font-cinzel text-[9px] tracking-[.2em] uppercase transition-colors duration-300',
                isActive
                  ? 'text-sand'
                  : 'text-parch/40 hover:text-parch/80'
              )}
            >
              {label}
              {isActive && (
                <span className="block h-px bg-sand mt-0.5" />
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
                    id="wallet-connect-btn"
                    className="btn-gold text-[8px] tracking-[.18em]"
                  >
                    <span>Connect Wallet</span>
                  </button>
                ) : chain?.unsupported ? (
                  <button
                    onClick={openChainModal}
                    className="font-cinzel text-[8px] tracking-[.15em] uppercase border border-hadria/50 text-hadria px-4 py-2 hover:bg-hadria/10 transition-colors"
                  >
                    Wrong Network
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openChainModal}
                      className="font-cinzel text-[8px] tracking-[.12em] uppercase text-sand/50 hover:text-sand transition-colors"
                    >
                      {chain?.name}
                    </button>
                    <button
                      onClick={openAccountModal}
                      className="font-cinzel text-[8px] tracking-[.12em] uppercase border border-stone/40 text-parch/60 px-4 py-2 hover:border-sand/40 hover:text-parch transition-all duration-300"
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
    </nav>
  )
}
