'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
// MOCK_AGENTS removed
import { useAgentENS } from '@/lib/hooks/use-ens'
import { cn, getRankClass, winRate, ARCHETYPE_ICONS } from '@/lib/utils'
import { useTokensOfOwner, useGetAgent, useGetAgentName } from '@/lib/hooks'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Swords, Zap, Trophy, Eye, Check, Hammer, Star } from 'lucide-react'

// AgentCard removed in favor of RealAgentCard
const ARCHETYPES = ['Strategist', 'Oracle', 'Berserker', 'Diplomat']

function RealAgentCard({ tokenId }: { tokenId: bigint }) {
  const { data: agent, isLoading: agentLoading } = useGetAgent(tokenId)
  const name = useGetAgentName(tokenId)
  const { elo, rank, wins, losses, isLoading: ensLoading } = useAgentENS(Number(tokenId))
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])
  
  if (agentLoading) return <div className="stone-card p-5 animate-pulse h-24 border border-stone/10 bg-stone/5"></div>

  // Wagmi returns named tuple fields as an object
  const agentArchetype = agent && 'archetype' in agent ? ARCHETYPES[agent.archetype as number] || 'Strategist' : 'Strategist'
  const agentElo = agent && 'elo' in agent ? Number(agent.elo) : 1200
  const agentWins = agent && 'wins' in agent ? Number(agent.wins) : 0
  const agentLosses = agent && 'losses' in agent ? Number(agent.losses) : 0

  const displayElo = mounted && elo ? parseInt(elo) : agentElo
  const displayWins = mounted && wins ? parseInt(wins) : agentWins
  const displayLosses = mounted && losses ? parseInt(losses) : agentLosses

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
      }}
      className="stone-card p-5 flex items-center gap-4"
    >
      <span className="text-3xl">
        {(() => {
          const Icon = ARCHETYPE_ICONS[agentArchetype as keyof typeof ARCHETYPE_ICONS]
          return Icon ? <Icon size={24} /> : <span />
        })()}
      </span>
      <div className="flex-1">
        <div className="font-cinzel text-sm text-sand">{name || `Agent #${tokenId.toString()}`}</div>
      </div>
      <div className="text-right">
        <div className="font-cinzel text-lg text-gold">
          {ensLoading ? '...' : displayElo.toLocaleString()}
        </div>
        <div className="section-label text-[6px]">ELO</div>
          <div className="font-josefin text-[8px]">
            <span className="text-olivine">{displayWins}W</span> - <span className="text-hadria">{displayLosses}L</span>
          </div>
      </div>
      <div className="flex gap-2">
        <Link href="/agora" className="btn-ghost text-[7px] px-3 py-1.5">
          Challenge
        </Link>
        <Link href={`/colosseum/demo?tokenId=${tokenId.toString()}`} className="btn-ghost text-[7px] px-3 py-1.5">
          Watch
        </Link>
      </div>
    </div>
  )
}

const MOCK_KEEPER_TXS = [
  { hash: '0x1234...abcd', method: 'submitResult', status: 'confirmed', timestamp: Date.now() - 3600000 },
  { hash: '0x5678...efgh', method: 'updateRecords', status: 'confirmed', timestamp: Date.now() - 3600500 },
  { hash: '0xijkl...mnop', method: 'settle', status: 'confirmed', timestamp: Date.now() - 3601000 },
]

const MOCK_ACHIEVEMENTS = [
  { id: 'first-blood', Icon: Swords, name: 'First Blood', description: 'Won your first battle', earned: true },
  { id: 'titan-slayer', Icon: Zap, name: 'Titan Slayer', description: 'Defeated a Titan-rank agent', earned: true },
  { id: 'undefeated', Icon: Trophy, name: 'Undefeated', description: 'Win 10 battles in a row', earned: false },
  { id: 'oracle', Icon: Eye, name: 'True Oracle', description: '5 perfect round predictions', earned: false },
]

export default function DashboardPage() {
  const { isConnected, address } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
<div className="text-center">
  <div className="mb-6 text-gold">
    <Zap size={36} />
  </div>
  <h2 className="font-cinzel text-xl text-parch mb-3">Connect to View Your Pantheon</h2>
  <p className="font-josefin text-parch/40 text-sm mb-8">
    Your agents, wagers, and achievements await.
  </p>
  <ConnectButton />
</div>
      </div>
    )
  }

  const tokenIds = useTokensOfOwner(address)

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
            Divine Commander · {tokenIds.length} agents
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* My Agents */}
          <div className="md:col-span-2">
            <div className="section-label mb-4">My Agents</div>
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {tokenIds.length > 0 ? (
                tokenIds.map(id => (
                  <RealAgentCard key={id.toString()} tokenId={id} />
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-parch/40 font-josefin text-xs border border-dashed border-stone/20">
                  You do not own any agents.
                </div>
              )}
              <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
                <Link href="/forge" className="flex h-full items-center justify-center gap-2 border border-dashed border-stone/30 text-parch/20 hover:text-parch/40 hover:border-stone/50 transition-all p-4 font-cinzel text-[8px] tracking-widest uppercase rounded-sm">
                  + Forge New Agent
                </Link>
              </motion.div>
            </motion.div>
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
                  <span className="text-xl">
  <a.Icon size={16} />
</span>
                  <div>
                    <div className={cn('font-cinzel text-[9px] tracking-widest uppercase', a.earned ? 'text-gold' : 'text-parch/30')}>
                      {a.name}
                    </div>
                    <div className="font-josefin text-[8px] text-parch/30">{a.description}</div>
                  </div>
                  {a.earned && <span className="ml-auto text-gold"><Check size={14} /></span>}
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
