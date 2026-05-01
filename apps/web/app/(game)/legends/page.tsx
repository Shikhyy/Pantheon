'use client'

import { useMemo } from 'react'
import { MOCK_AGENTS } from '@/lib/mock-data'
import { cn, winRate, ARCHETYPE_ICONS } from '@/lib/utils'
import Link from 'next/link'

export default function LegendsPage() {
  const sorted = useMemo(() => [...MOCK_AGENTS].sort((a, b) => b.elo - a.elo), [])
  const champion = sorted[0]
  const daysLeft = useMemo(() => Math.ceil((new Date('2026-05-08').getTime() - Date.now()) / (1000 * 60 * 60 * 24)), [])

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-label mb-3">Hall of Legends</div>
          <h1 className="font-cinzel text-3xl md:text-4xl text-parch mb-2">The Eternal Champions</h1>
          <p className="font-fell italic text-parch/50">
            Carved forever on the Akashic Ledger — 0G Storage · ENS Records
          </p>
        </div>

        {/* Season countdown */}
        <div className="glass-panel p-5 text-center mb-10">
          <div className="section-label mb-2">Season I — Ends In</div>
          <div className="font-cinzel text-3xl text-gold">{daysLeft} Days</div>
          <div className="font-josefin text-xs text-parch/30 mt-1">
            Champion will be inscribed as zeus.pantheon.eth
          </div>
        </div>

        {/* Champion spotlight */}
        <div className="border border-gold/30 bg-gold/5 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-3 right-4 section-label text-[7px] text-gold/40">SEASON CHAMPION</div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <div className="flex items-center gap-6">
            <div className="text-6xl">{ARCHETYPE_ICONS[champion.archetype]}</div>
            <div className="flex-1">
              <div className="font-cinzel-dec text-2xl text-gold mb-1">{champion.name}</div>
              <div className="font-cinzel text-xs text-parch/40 tracking-widest mb-3">{champion.ensName}</div>
              <div className="flex gap-6">
                <div>
                  <div className="font-cinzel text-2xl text-gold">{champion.elo.toLocaleString()}</div>
                  <div className="section-label text-[6px]">ELO</div>
                </div>
                <div>
                  <div className="font-cinzel text-2xl text-olivine">{champion.wins}</div>
                  <div className="section-label text-[6px]">Wins</div>
                </div>
                <div>
                  <div className="font-cinzel text-2xl text-parch/60">{winRate(champion.wins, champion.losses)}%</div>
                  <div className="section-label text-[6px]">Win Rate</div>
                </div>
              </div>
            </div>
            <div className="text-4xl opacity-30">🏆</div>
          </div>
        </div>

        {/* Full leaderboard */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-4 px-4 py-2">
            <div className="col-span-1 section-label text-[6px]">Rank</div>
            <div className="col-span-4 section-label text-[6px]">Agent</div>
            <div className="col-span-2 section-label text-[6px] text-right">ELO</div>
            <div className="col-span-2 section-label text-[6px] text-right">W/L</div>
            <div className="col-span-2 section-label text-[6px] text-right">Win Rate</div>
            <div className="col-span-1 section-label text-[6px] text-right">Action</div>
          </div>

          {sorted.map((agent, i) => (
            <div
              key={agent.tokenId.toString()}
              className={cn(
                'grid grid-cols-12 gap-4 items-center px-4 py-4 border transition-all duration-200 hover:border-sand/20',
                i === 0 ? 'border-gold/30 bg-gold/5' : 'border-stone/20 bg-deep/30 hover:bg-deep/60'
              )}
            >
              {/* Rank */}
              <div className="col-span-1">
                <span className={cn(
                  'font-cinzel text-sm',
                  i === 0 ? 'text-gold' : i <= 2 ? 'text-willa' : 'text-parch/30'
                )}>
                  #{i + 1}
                </span>
              </div>

              {/* Agent */}
              <div className="col-span-4 flex items-center gap-3">
                <span className="text-xl">{ARCHETYPE_ICONS[agent.archetype]}</span>
                <div>
                  <div className="font-cinzel text-xs text-sand">{agent.name}</div>
                  <div className="section-label text-[6px] text-parch/25">{agent.rank}</div>
                </div>
              </div>

              {/* ELO */}
              <div className="col-span-2 text-right font-cinzel text-sm text-gold">
                {agent.elo.toLocaleString()}
              </div>

              {/* W/L */}
              <div className="col-span-2 text-right font-cinzel text-xs">
                <span className="text-olivine">{agent.wins}</span>
                <span className="text-parch/20 mx-1">/</span>
                <span className="text-hadria">{agent.losses}</span>
              </div>

              {/* Win Rate */}
              <div className="col-span-2 text-right">
                <div className="font-cinzel text-xs text-parch/60">{winRate(agent.wins, agent.losses)}%</div>
                <div className="h-1 bg-stone/20 mt-1 overflow-hidden">
                  <div
                    className="h-full bg-olivine/40"
                    style={{ width: `${winRate(agent.wins, agent.losses)}%` }}
                  />
                </div>
              </div>

              {/* Challenge */}
              <div className="col-span-1 flex justify-end">
                <Link
                  href="/colosseum/demo"
                  className="font-cinzel text-[7px] tracking-widest text-parch/25 hover:text-sand transition-colors uppercase"
                >
                  Watch
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Storage attribution */}
        <div className="mt-8 glass-panel p-4 text-center">
          <div className="section-label text-[7px] text-parch/25">
            Leaderboard sourced from 0G Storage KV · ENS text records · Updated in real-time
          </div>
        </div>
      </div>
    </div>
  )
}
