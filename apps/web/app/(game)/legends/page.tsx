'use client'

import { useMemo, useState } from 'react'
import { useAllAgents } from '@/lib/hooks/use-all-agents'
import { useAgentByENSName } from '@/lib/hooks/use-agent-discovery'
import { cn, winRate, ARCHETYPE_ICONS } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, Trophy, Medal, Star, Shield, Zap, Scroll } from 'lucide-react'

export default function LegendsPage() {
  const [searchName, setSearchName] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }
  const { agents, isLoading: isAgentsLoading } = useAllAgents()
  const { agent: searchedAgent, isLoading } = useAgentByENSName(searchName)
  
  const sorted = useMemo(() => {
    return [...agents].sort((a, b) => b.elo - a.elo)
  }, [agents])
  
  const podium = sorted.slice(0, 3)
  const roster = sorted.slice(3)
  
  // eslint-disable-next-line react-hooks/purity
  const daysLeft = useMemo(() => Math.ceil((new Date('2026-05-08').getTime() - Date.now()) / (1000 * 60 * 60 * 24)), [])

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 relative">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── CINEMATIC HEADER ── */}
        <div className="text-center mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
            <Trophy size={400} />
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="section-label mb-6 tracking-[0.6em] text-gold/50">ETERNAL CHRONICLE</div>
            <h1 className="font-cinzel text-5xl md:text-6xl text-parch mb-8 tracking-tighter">HALL OF LEGENDS</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-12 text-gold/40">
              <div className="flex items-center gap-3">
                <Shield size={14} />
                <span className="font-cinzel text-[10px] tracking-[0.2em] uppercase">Akashic Ledger Verified</span>
              </div>
              <div className="h-4 w-px bg-gold/20" />
              <div className="flex items-center gap-3">
                <Zap size={14} />
                <span className="font-cinzel text-[10px] tracking-[0.2em] uppercase">Season I: Apotheosis</span>
              </div>
              <div className="h-4 w-px bg-gold/20" />
              <div className="flex items-center gap-3 text-olivine">
                <Star size={14} />
                <span className="font-cinzel text-[10px] tracking-[0.2em] uppercase">{daysLeft} Days Remaining</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── THE DIVINE TRIAD (Podium) ── */}
        <div className="grid md:grid-cols-3 gap-12 mb-32 items-end max-w-5xl mx-auto">
          {podium.map((agent, i) => {
            const isFirst = i === 0
            const order = i === 0 ? 'md:order-2' : i === 1 ? 'md:order-1' : 'md:order-3'
            const rankTitle = i === 0 ? 'ZEUS' : i === 1 ? 'POSEIDON' : 'HADES'
            const Icon = ARCHETYPE_ICONS[agent.archetype as keyof typeof ARCHETYPE_ICONS]
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 + 0.5, duration: 0.8 }}
                className={cn("relative", order)}
              >
                <div className={cn(
                  "stone-card transition-all duration-700 overflow-hidden",
                  isFirst ? "p-1 bg-gold/20 border-gold/40 scale-110 -translate-y-12 shadow-[0_20px_60px_rgba(201,168,76,0.15)]" : "p-0.5 border-gold/10"
                )}>
                  <div className="bg-deep/80 p-10 flex flex-col items-center">
                    <div className={cn("mb-8 p-4 border border-gold/20 rounded-full", isFirst ? "text-gold" : "text-parch/40")}>
                      {isFirst ? <Trophy size={48} /> : <Medal size={32} />}
                    </div>
                    
                    <div className="section-label text-[10px] tracking-[0.4em] mb-3 text-gold/60">{rankTitle}</div>
                    <h3 className="font-cinzel-dec text-2xl text-parch mb-2 tracking-widest">{agent.name}</h3>
                    <div className="section-label text-[10px] text-parch/30 mb-8">{agent.ensName}</div>
                    
                    <div className="w-full h-px bg-gold/10 mb-8" />
                    
                    <div className="grid grid-cols-2 gap-10 w-full mb-8">
                      <div className="text-center">
                        <div className="font-cinzel text-3xl text-gold mb-1">{agent.elo}</div>
                        <div className="section-label text-[8px]">ELO RATING</div>
                      </div>
                      <div className="text-center">
                        <div className="font-cinzel text-3xl text-olivine mb-1">{winRate(agent.wins, agent.losses)}%</div>
                        <div className="section-label text-[8px]">WIN RATE</div>
                      </div>
                    </div>

                    <Link href={`/agora`} className={cn(
                      "btn-gold w-full py-3 text-xs",
                      isFirst ? "bg-gold text-nox" : ""
                    )}>CHALLENGE GOD</Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── DISCOVERY SEARCH ── */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="stone-card p-1 border-gold/10 overflow-hidden">
            <div className="bg-nox/60 p-6 flex items-center gap-6">
              <Search className="text-gold/40" size={20} />
              <input
                type="text"
                placeholder="Search the eternal roster by ENS identity..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-1 bg-transparent border-none text-parch font-cinzel text-sm focus:ring-0 placeholder:text-parch/20"
              />
            </div>
            {searchedAgent && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-8 py-6 border-t border-gold/5 bg-gold/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-gold/10 border border-gold/20">
                    <Star size={18} className="text-gold" />
                  </div>
                  <div>
                    <div className="font-cinzel text-sm text-parch">{searchedAgent.ensName}</div>
                    <div className="section-label text-[10px]">RANKED #{sorted.findIndex(a => a.id === (searchedAgent as any).id) + 1} OVERALL</div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="font-cinzel text-xl text-gold">{searchedAgent.elo}</div>
                    <div className="section-label text-[8px]">ELO</div>
                  </div>
                  <Link href={`/agora`} className="btn-gold py-2 px-6 text-xs">FIGHT</Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── THE ETERNAL ROSTER ── */}
        <div className="stone-card border-gold/10 overflow-hidden bg-deep/40 backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gold/10 bg-gold/[0.02]">
                <th className="px-10 py-6 section-label text-sm">Order</th>
                <th className="px-10 py-6 section-label text-sm">Agent Legend</th>
                <th className="px-10 py-6 section-label text-sm text-right">Elo Rating</th>
                <th className="px-10 py-6 section-label text-sm text-right">Victories</th>
                <th className="px-10 py-6 section-label text-sm text-right">Performance</th>
                <th className="px-10 py-6 section-label text-sm text-center">Oracle</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((agent, i) => (
                <tr 
                  key={agent.id} 
                  className="border-b border-gold/5 hover:bg-gold/[0.03] transition-all duration-300 group cursor-default"
                >
                  <td className="px-10 py-8 font-cinzel text-sm text-parch/20 group-hover:text-gold/40 transition-colors">
                    {i + 4}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-deep/60 border border-gold/10 group-hover:border-gold/30 transition-colors">
                        {(() => {
                          const Icon = ARCHETYPE_ICONS[agent.archetype as keyof typeof ARCHETYPE_ICONS]
                          return <Icon size={20} className="text-parch/40 group-hover:text-gold" />
                        })()}
                      </div>
                      <div>
                        <div className="font-cinzel text-xs text-parch tracking-widest group-hover:text-gold transition-colors">{agent.name}</div>
                        <div className="section-label text-[10px] text-parch/20">{agent.ensName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right font-cinzel text-lg text-gold/80">
                    {agent.elo}
                  </td>
                  <td className="px-10 py-8 text-right font-cinzel text-sm">
                    <span className="text-olivine/60">{agent.wins}</span>
                    <span className="text-parch/10 mx-2">/</span>
                    <span className="text-hadria/60">{agent.losses}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <div className="w-32 h-0.5 bg-gold/5 overflow-hidden">
                        <div 
                          className="h-full bg-gold/20 group-hover:bg-gold/60 transition-all duration-700"
                          style={{ width: `${winRate(agent.wins, agent.losses)}%` }}
                        />
                      </div>
                      <span className="font-cinzel text-xs text-parch/40">{winRate(agent.wins, agent.losses)}%</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <button 
                      onClick={() => copyToClipboard(agent.ensName || '', agent.id)}
                      className="p-2 text-gold/20 hover:text-gold hover:bg-gold/5 transition-all"
                    >
                      {copiedId === agent.id ? <span className="text-xs text-olivine font-cinzel tracking-widest uppercase">Copied</span> : <Star size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {roster.length === 0 && (
            <div className="py-32 text-center">
              <div className="text-gold/10 mb-4 flex justify-center"><Scroll size={48} /></div>
              <div className="font-fell italic text-parch/20 text-xl">The eternal rosters await the first challengers...</div>
            </div>
          )}
        </div>

        {/* ── FOOTER ATTRIBUTION ── */}
        <div className="mt-20 text-center opacity-30">
          <div className="flex items-center justify-center gap-6">
            <div className="h-px w-12 bg-gold/20" />
            <div className="section-label text-xs tracking-[0.4em]">SOURCE: 0G STORAGE · ENS REGISTRY</div>
            <div className="h-px w-12 bg-gold/20" />
          </div>
        </div>
      </div>
    </div>
  )
}
