'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAgentENS } from '@/lib/hooks/use-ens'
import { ARCHETYPE_ICONS } from '@/lib/utils'
import { useTokensOfOwner, useGetAgent, useGetAgentName } from '@/lib/hooks'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Trophy, Star, Hammer, Shield, Scroll } from 'lucide-react'

function RealAgentCard({ tokenId }: { tokenId: bigint }) {
  const { data: agent, isLoading: agentLoading } = useGetAgent(tokenId)
  const name = useGetAgentName(tokenId)
  const { elo, wins, losses, isLoading: ensLoading } = useAgentENS(Number(tokenId))
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (agentLoading) return (
    <div className="stone-card p-8 animate-pulse border-gold/10 bg-gold/5 min-h-[160px]">
      <div className="h-4 w-3/4 bg-gold/10 mb-4" />
      <div className="h-8 w-1/4 bg-gold/10" />
    </div>
  )

  const ARCHETYPES = ['Strategist', 'Oracle', 'Berserker', 'Diplomat']
  const agentArchetype = agent && 'archetype' in agent ? ARCHETYPES[agent.archetype as number] || 'Strategist' : 'Strategist'
  const agentElo = agent && 'elo' in agent ? Number(agent.elo) : 1200
  const agentWins = agent && 'wins' in agent ? Number(agent.wins) : 0
  const agentLosses = agent && 'losses' in agent ? Number(agent.losses) : 0

  const displayElo = mounted && elo ? parseInt(elo) : agentElo
  const displayWins = mounted && wins ? parseInt(wins) : agentWins
  const displayLosses = mounted && losses ? parseInt(losses) : agentLosses

  const Icon = ARCHETYPE_ICONS[agentArchetype as keyof typeof ARCHETYPE_ICONS]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <div className="stone-card p-6 border-gold/20 hover:border-gold/50 transition-all duration-500 overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
          <Icon size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-gold/5 border border-gold/10 group-hover:border-gold/30 transition-colors">
              <Icon size={24} className="text-gold" />
            </div>
            <div className="text-right">
              <div className="section-label text-[10px] tracking-[0.3em] mb-1">ELO RATING</div>
              <div className="font-cinzel text-2xl text-gold">{ensLoading ? '...' : displayElo}</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="section-label text-[8px] mb-1">ENS IDENTITY</div>
            <h3 className="font-cinzel text-sm text-parch tracking-widest uppercase truncate">{name || `Agent #${tokenId.toString()}`}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gold/5 pt-6">
            <div className="flex items-center gap-4">
              <div className="text-left">
                <div className="font-cinzel text-sm text-olivine">{displayWins}</div>
                <div className="section-label text-[8px]">VICTORIES</div>
              </div>
              <div className="h-6 w-px bg-gold/10" />
              <div className="text-left">
                <div className="font-cinzel text-sm text-hadria">{displayLosses}</div>
                <div className="section-label text-[8px]">DEFEATS</div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Link href="/agora" className="btn-gold py-1.5 px-3 text-xs min-w-[70px]">FIGHT</Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { isConnected, address } = useAccount()
  const tokenIds = useTokensOfOwner(address)

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-12 stone-card border-gold/20 max-w-md mx-6">
          <div className="mb-8 text-gold flex justify-center">
            <Shield size={48} className="animate-pulse" />
          </div>
          <h2 className="font-cinzel text-2xl text-parch mb-4 tracking-widest">COMMANDER IDENTITY REQUIRED</h2>
          <p className="font-fell italic text-parch/40 text-sm mb-10 leading-relaxed">
            "Only those who hold the keys to the digital vault may enter the sanctum of the gods."
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-8 relative">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── MAJESTIC HEADER ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20">
          <div>
            <div className="section-label mb-4 tracking-[0.5em] text-gold/60">DIVINE OVERSEER</div>
            <h1 className="font-cinzel text-5xl md:text-6xl text-parch mb-6 tracking-tight">MY PANTHEON</h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-gold/5 border border-gold/20">
                <Shield size={14} className="text-gold/60" />
                <span className="font-mono text-xs text-gold tracking-widest">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
              <div className="h-4 w-px bg-gold/10" />
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-parch/30" />
                <span className="font-cinzel text-[10px] text-parch/60 tracking-[0.2em]">{tokenIds.length} AGENTS FORGED</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:text-right border-l lg:border-l-0 lg:border-r border-gold/10 px-8">
            <div>
              <div className="section-label text-[6px] mb-1">NETWORK DOMAIN</div>
              <div className="font-cinzel text-xl text-gold">0G TESTNET</div>
            </div>
            <div>
              <div className="section-label text-[6px] mb-1">REPUTATION</div>
              <div className="font-cinzel text-xl text-parch tracking-widest uppercase">Initiate</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* ── LEFT: AGENTS ── */}
          <div className="lg:col-span-8 space-y-12">
            <div>
              <div className="flex items-center justify-between mb-10 pb-4 border-b border-gold/10">
                <div className="flex items-center gap-4">
                  <div className="h-px w-8 bg-gold/40" />
                  <h2 className="font-cinzel-dec text-xl text-parch tracking-widest uppercase">Active Gods</h2>
                </div>
                <Link href="/forge" className="btn-gold py-2 px-6 text-[8px] flex items-center gap-2">
                  <Hammer size={12} />
                  SUMMON AGENT
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tokenIds.length > 0 ? (
                  tokenIds.map(id => (
                    <RealAgentCard key={id.toString()} tokenId={id} />
                  ))
                ) : (
                  <div className="col-span-2 py-32 stone-card border-dashed border-gold/10 text-center">
                    <div className="text-gold/20 mb-6 flex justify-center"><Scroll size={48} /></div>
                    <div className="font-fell italic text-parch/40 text-lg mb-2">The halls are silent...</div>
                    <p className="font-cinzel text-[8px] tracking-[0.3em] text-gold/30">FORGE YOUR FIRST LEGEND TO BEGIN</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── LOGS (More Cinematic) ── */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-8 bg-gold/40" />
                <h2 className="font-cinzel-dec text-lg text-parch tracking-widest uppercase">Akashic Chronicle</h2>
              </div>
              <div className="stone-card bg-nox/80 p-8 border-gold/10 min-h-[200px] flex items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gold/[0.02] group-hover:bg-gold/[0.04] transition-colors duration-1000" />
                <div className="relative z-10">
                  <div className="font-fell italic text-parch/20 text-xl mb-4">"The quill of destiny awaits your command."</div>
                  <div className="section-label text-[6px] text-gold/30 tracking-[0.5em]">AWAITING REAL-TIME BATTLE DATA</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SIDEBAR: ACHIEVEMENTS ── */}
          <div className="lg:col-span-4 space-y-12">
            <div className="stone-card p-1 border-gold/20">
              <div className="bg-gold/5 p-8 border border-gold/10 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gold/10 rounded-full border border-gold/30">
                    <Star size={32} className="text-gold" />
                  </div>
                </div>
                <h3 className="font-cinzel text-lg text-parch mb-2">Divine Deeds</h3>
                <p className="font-fell italic text-parch/40 text-sm mb-8 leading-relaxed">
                  Earn favor by proving your agent's worth in the Colosseum.
                </p>
                <div className="space-y-4">
                  {['First Blood', 'Titan Slayer', 'Immortal Name'].map(ach => (
                    <div key={ach} className="flex items-center justify-between py-3 border-b border-gold/5 last:border-0 opacity-30 grayscale">
                      <span className="font-cinzel text-[10px] text-parch tracking-widest uppercase">{ach}</span>
                      <Shield size={12} className="text-gold/50" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="stone-card p-8 border-gold/10">
              <div className="flex items-center gap-3 mb-8">
                <Zap size={16} className="text-gold" />
                <h3 className="font-cinzel text-sm text-parch tracking-widest uppercase">Apotheosis Progress</h3>
              </div>
              <div className="space-y-10">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="section-label text-[6px]">FAVOR (XP)</span>
                    <span className="font-cinzel text-sm text-parch">0 / 5000</span>
                  </div>
                  <div className="w-full h-px bg-gold/10 relative">
                    <div className="absolute inset-y-0 left-0 bg-gold/50 w-0" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="section-label text-[6px]">RANK STATUS</span>
                    <span className="font-cinzel text-sm text-gold uppercase tracking-tighter">Initiate</span>
                  </div>
                  <div className="w-full h-px bg-gold/10" />
                </div>
                <Link href="/agora" className="btn-gold w-full py-4 text-[9px] text-center">ENTER THE AGORA</Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
