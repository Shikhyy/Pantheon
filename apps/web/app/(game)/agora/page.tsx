'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOCK_AGENTS } from '@/lib/mock-data'
import type { Agent, Archetype, Rank } from '@/lib/store'
import { cn, getArchetypeColor, getRankClass, winRate, ARCHETYPE_ICONS } from '@/lib/utils'
import Link from 'next/link'

const RANK_FILTERS: (Rank | 'All')[] = ['All', 'Olympian', 'Titan', 'God', 'Hero', 'Demigod']
const SORT_OPTIONS = ['ELO', 'Win Rate', 'Battles', 'Newest']

function AgentCard({ agent, onSelect }: { agent: Agent; onSelect: (a: Agent) => void }) {
  const wr = winRate(agent.wins, agent.losses)
  const archetypeClass = getArchetypeColor(agent.archetype)
  const rankClass = getRankClass(agent.rank)

  return (
    <motion.button
      id={`agent-card-${agent.name}`}
      onClick={() => onSelect(agent)}
      className="stone-card shimmer-line w-full text-left p-5 group"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top gold shimmer (visible on hover via CSS) */}

      {/* Archetype icon + rank */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{ARCHETYPE_ICONS[agent.archetype]}</span>
        <span className={cn('rank-pill', rankClass)}>{agent.rank}</span>
      </div>

      {/* Agent name */}
      <div className="font-cinzel text-sm text-sand mb-0.5 tracking-widest">{agent.name}</div>
      <div className="section-label text-[7px] text-parch/25 mb-4">{agent.ensName}</div>

      {/* Archetype */}
      <div className={cn('font-cinzel text-[8px] tracking-widest uppercase mb-4', archetypeClass)}>
        {agent.archetype}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center border-t border-stone/20 pt-3">
        <div>
          <div className="font-cinzel text-sm text-gold">{agent.elo.toLocaleString()}</div>
          <div className="section-label text-[6px]">ELO</div>
        </div>
        <div>
          <div className="font-cinzel text-sm text-parch/70">{wr}%</div>
          <div className="section-label text-[6px]">Win Rate</div>
        </div>
        <div>
          <div className="font-cinzel text-sm text-parch/70">{agent.wins + agent.losses}</div>
          <div className="section-label text-[6px]">Battles</div>
        </div>
      </div>

      {/* Badges */}
      {agent.badges.length > 0 && (
        <div className="flex gap-1 mt-3 flex-wrap">
          {agent.badges.slice(0, 3).map(b => (
            <span key={b} className="font-cinzel text-[6px] tracking-wide uppercase border border-gold/20 text-gold/50 px-1.5 py-0.5">
              {b}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  )
}

function AgentModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const wr = winRate(agent.wins, agent.losses)

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-nox/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative stone-card max-w-lg w-full p-8 z-10"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 font-cinzel text-[8px] text-parch/30 hover:text-parch/60 tracking-widest"
        >
          ✕ CLOSE
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl">{ARCHETYPE_ICONS[agent.archetype]}</span>
          <div>
            <div className="font-cinzel text-xl text-sand">{agent.name}</div>
            <div className="section-label text-[7px] text-parch/30">{agent.ensName}</div>
            <div className={cn('font-cinzel text-[8px] tracking-widest uppercase mt-1', getArchetypeColor(agent.archetype))}>
              {agent.archetype}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-cinzel text-2xl text-gold">{agent.elo.toLocaleString()}</div>
            <div className="section-label text-[7px]">ELO</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-6 border border-stone/20 p-4">
          <div className="text-center">
            <div className="font-cinzel text-lg text-olivine">{agent.wins}</div>
            <div className="section-label text-[6px]">Wins</div>
          </div>
          <div className="text-center">
            <div className="font-cinzel text-lg text-hadria">{agent.losses}</div>
            <div className="section-label text-[6px]">Losses</div>
          </div>
          <div className="text-center">
            <div className="font-cinzel text-lg text-parch/70">{wr}%</div>
            <div className="section-label text-[6px]">Win Rate</div>
          </div>
        </div>

        {/* Rank + Badges */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className={cn('rank-pill', getRankClass(agent.rank))}>{agent.rank}</span>
          {agent.badges.map(b => (
            <span key={b} className="font-cinzel text-[7px] tracking-wide uppercase border border-gold/20 text-gold/50 px-2 py-0.5">
              {b}
            </span>
          ))}
        </div>

        {/* Lineage */}
        {agent.lineage && (
          <div className="mb-4 text-xs font-josefin text-parch/30">
            Bred from #{agent.lineage.parent1.toString()} × #{agent.lineage.parent2.toString()}
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-3">
          <button
            id={`challenge-${agent.name}`}
            className="btn-gold flex-1"
          >
            <span>⚔ Issue Challenge</span>
          </button>
          <Link href={`/colosseum/demo`} className="btn-ghost">
            Watch Live
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AgoraPage() {
  const [rankFilter, setRankFilter] = useState<Rank | 'All'>('All')
  const [sortBy, setSortBy] = useState('ELO')
  const [myAgents, setMyAgents] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const filtered = MOCK_AGENTS
    .filter(a => rankFilter === 'All' || a.rank === rankFilter)
    .sort((a, b) => {
      if (sortBy === 'ELO') return b.elo - a.elo
      if (sortBy === 'Win Rate') return winRate(b.wins, b.losses) - winRate(a.wins, a.losses)
      if (sortBy === 'Battles') return (b.wins + b.losses) - (a.wins + a.losses)
      return Number(b.tokenId - a.tokenId)
    })

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="section-label mb-3">The Agora</div>
          <h1 className="font-cinzel text-3xl md:text-4xl text-parch mb-2">
            Agent Marketplace
          </h1>
          <p className="font-fell italic text-parch/50">
            {MOCK_AGENTS.length} gods await your challenge
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8 p-4 glass-panel">
          {/* Rank filter chips */}
          <div className="flex flex-wrap gap-2">
            {RANK_FILTERS.map(rank => (
              <button
                key={rank}
                id={`filter-${rank.toLowerCase()}`}
                onClick={() => setRankFilter(rank)}
                className={cn(
                  'font-cinzel text-[7px] tracking-[.15em] uppercase px-3 py-1.5 border transition-all duration-200',
                  rankFilter === rank
                    ? 'border-sand/60 text-sand bg-sand/10'
                    : 'border-stone/30 text-parch/30 hover:border-stone/60 hover:text-parch/50'
                )}
              >
                {rank}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="section-label text-[6px]">Sort:</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={cn(
                  'font-cinzel text-[7px] tracking-[.1em] uppercase px-2 py-1 transition-colors',
                  sortBy === opt ? 'text-sand' : 'text-parch/25 hover:text-parch/50'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(agent => (
            <AgentCard key={agent.tokenId.toString()} agent={agent} onSelect={setSelectedAgent} />
          ))}
        </div>

        {/* Agent modal */}
        <AnimatePresence>
          {selectedAgent && (
            <AgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
