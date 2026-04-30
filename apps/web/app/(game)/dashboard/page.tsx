'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { MOCK_AGENTS } from '@/lib/mock-data'
import { cn, ARCHETYPE_ICONS, getRankClass, winRate } from '@/lib/utils'
import Link from 'next/link'

const MOCK_KEEPER_TXS = [
  { hash: '0x1234...abcd', method: 'submitResult', status: 'confirmed', timestamp: Date.now() - 3600000 },
  { hash: '0x5678...efgh', method: 'updateRecords', status: 'confirmed', timestamp: Date.now() - 3600500 },
  { hash: '0xijkl...mnop', method: 'settle', status: 'confirmed', timestamp: Date.now() - 3601000 },
]

const MOCK_ACHIEVEMENTS = [
  { id: 'first-blood', icon: '🗡️', name: 'First Blood', description: 'Won your first battle', earned: true },
  { id: 'titan-slayer', icon: '⚡', name: 'Titan Slayer', description: 'Defeated a Titan-rank agent', earned: true },
  { id: 'undefeated', icon: '🏆', name: 'Undefeated', description: 'Win 10 battles in a row', earned: false },
  { id: 'oracle', icon: '🔮', name: 'True Oracle', description: '5 perfect round predictions', earned: false },
]

export default function DashboardPage() {
  const { isConnected, address } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-4xl mb-6">⚡</div>
          <h2 className="font-cinzel text-xl text-parch mb-3">Connect to View Your Pantheon</h2>
          <p className="font-josefin text-parch/40 text-sm mb-8">
            Your agents, wagers, and achievements await.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  const myAgents = MOCK_AGENTS.slice(0, 2) // Simulate owned agents

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="section-label mb-2">My Pantheon</div>
          <h1 className="font-cinzel text-2xl text-parch">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </h1>
          <p className="font-josefin text-xs text-parch/30 mt-1">
            Divine Commander · {myAgents.length} agents
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* My Agents */}
          <div className="md:col-span-2">
            <div className="section-label mb-4">My Agents</div>
            <div className="space-y-3">
              {myAgents.map(agent => (
                <div key={agent.tokenId.toString()} className="stone-card p-5 flex items-center gap-4">
                  <span className="text-3xl">{ARCHETYPE_ICONS[agent.archetype]}</span>
                  <div className="flex-1">
                    <div className="font-cinzel text-sm text-sand">{agent.name}</div>
                    <div className="section-label text-[7px] text-parch/30">{agent.ensName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-cinzel text-lg text-gold">{agent.elo.toLocaleString()}</div>
                    <div className="section-label text-[6px]">ELO</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/agora" className="btn-ghost text-[7px] px-3 py-1.5">
                      Challenge
                    </Link>
                    <Link href="/colosseum/demo" className="btn-ghost text-[7px] px-3 py-1.5">
                      Watch
                    </Link>
                  </div>
                </div>
              ))}
              <Link href="/forge" className="flex items-center justify-center gap-2 border border-dashed border-stone/30 text-parch/20 hover:text-parch/40 hover:border-stone/50 transition-all p-4 font-cinzel text-[8px] tracking-widest uppercase">
                + Forge New Agent
              </Link>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="section-label mb-4">Achievements</div>
            <div className="space-y-2">
              {MOCK_ACHIEVEMENTS.map(a => (
                <div
                  key={a.id}
                  className={cn(
                    'flex items-center gap-3 p-3 border transition-opacity',
                    a.earned ? 'border-gold/20 bg-gold/5' : 'border-stone/20 opacity-40'
                  )}
                >
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <div className={cn('font-cinzel text-[9px] tracking-widest uppercase', a.earned ? 'text-gold' : 'text-parch/30')}>
                      {a.name}
                    </div>
                    <div className="font-josefin text-[8px] text-parch/30">{a.description}</div>
                  </div>
                  {a.earned && <span className="ml-auto text-gold text-xs">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KeeperHub TX Log */}
        <div className="mt-8">
          <div className="section-label mb-4">KeeperHub Execution Log</div>
          <div className="glass-panel p-4">
            <div className="space-y-2">
              {MOCK_KEEPER_TXS.map(tx => (
                <div key={tx.hash} className="flex items-center gap-4 border-b border-stone/10 pb-2 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-olivine flex-shrink-0" />
                  <span className="font-cinzel text-[8px] tracking-widest text-parch/40 flex-1">{tx.method}</span>
                  <span className="font-josefin text-[9px] text-parch/25 font-mono">{tx.hash}</span>
                  <span className="font-cinzel text-[7px] text-olivine uppercase tracking-widest">{tx.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
