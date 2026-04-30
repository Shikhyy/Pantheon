'use client'

import { use, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MOCK_BATTLE, MOCK_BATTLE_LOG } from '@/lib/mock-data'
import type { AXLMessage } from '@/lib/store'
import { ARCHETYPE_ICONS, cn } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

function HealthBar({ label, health, color }: { label: string; health: number; color: string }) {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <span className="font-cinzel text-[8px] tracking-widest uppercase text-parch/60">{label}</span>
        <span className={cn('font-cinzel text-sm', color)}>{health}%</span>
      </div>
      <div className="health-bar-track">
        <div
          className="health-bar-fill"
          style={{
            width: `${health}%`,
            background: color === 'text-sky'
              ? 'linear-gradient(90deg, #2A7A9A, #85D3F2)'
              : 'linear-gradient(90deg, #722020, #8B3A3A)',
          }}
        />
      </div>
    </div>
  )
}

function DivinWhisperLog({ messages }: { messages: AXLMessage[] }) {
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="glass-panel p-4 h-64 overflow-y-auto" ref={logRef}>
      <div className="section-label text-[7px] mb-3">⚡ Hermes Mesh — Divine Whispers</div>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            'whisper-entry',
            msg.type === 'MOVE' && msg.nodeColor === 'sky' ? 'whisper-move border-sky/50' :
            msg.type === 'MOVE' && msg.nodeColor === 'hadria' ? 'whisper-move border-hadria/50' :
            msg.type === 'SCORE' ? 'whisper-score' :
            'whisper-verdict'
          )}
        >
          <span className={cn(
            'font-cinzel text-[8px] tracking-widest mr-2',
            msg.nodeColor === 'sky' ? 'text-sky' :
            msg.nodeColor === 'hadria' ? 'text-hadria' : 'text-willa'
          )}>
            [{msg.from}]
          </span>
          <span className="text-parch/60">{msg.content}</span>
        </div>
      ))}
    </div>
  )
}

function WagerPoolBar({ wageredA, wageredB }: { wageredA: bigint; wageredB: bigint }) {
  const total = wageredA + wageredB
  const pctA = total > 0n ? Number((wageredA * 100n) / total) : 50
  const pctB = 100 - pctA

  return (
    <div className="glass-panel p-4">
      <div className="section-label text-[7px] mb-3">⚱ Agora Pool — Spectator Wagers</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-cinzel text-[8px] text-sky">{pctA}% Athena-III</span>
        <div className="flex-1 h-3 bg-stone/40 overflow-hidden flex">
          <div className="h-full bg-sky/40 transition-all duration-1000" style={{ width: `${pctA}%` }} />
          <div className="h-full bg-hadria/40 transition-all duration-1000" style={{ width: `${pctB}%` }} />
        </div>
        <span className="font-cinzel text-[8px] text-hadria">{pctB}% Achilles</span>
      </div>
      <div className="text-center">
        <span className="font-josefin text-xs text-parch/30">
          Total Pool: {Number(total) / 1e18} ETH
        </span>
      </div>
    </div>
  )
}

export default function ColosseumPage({ params }: Props) {
  const { id } = use(params)
  const [messages, setMessages] = useState<AXLMessage[]>(MOCK_BATTLE_LOG)
  const [battle] = useState(MOCK_BATTLE)
  const [round, setRound] = useState(3)
  const parallaxRef = useRef<HTMLDivElement>(null)

  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rx = ((e.clientY / window.innerHeight) - 0.5) * 8
      const ry = ((e.clientX / window.innerWidth) - 0.5) * 8
      document.documentElement.style.setProperty('--parallax-rx', `${rx}deg`)
      document.documentElement.style.setProperty('--parallax-ry', `${ry}deg`)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Simulate live messages
  useEffect(() => {
    const interval = setInterval(() => {
      const mockMsg: AXLMessage = {
        id: Date.now().toString(),
        from: Math.random() > 0.5 ? 'Athena-III' : 'Achilles',
        type: Math.random() > 0.7 ? 'SCORE' : 'MOVE',
        content: 'Analyzing next round challenge with updated opponent model...',
        timestamp: Date.now(),
        nodeColor: Math.random() > 0.5 ? 'sky' : 'hadria',
      }
      setMessages(prev => [...prev.slice(-30), mockMsg])
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen pt-20 px-6 pb-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="section-label mb-2">The Colosseum · Battle #{id}</div>
          <div className="flex items-center justify-center gap-4">
            <span className="font-cinzel text-xs text-sky tracking-widest">LIVE</span>
            <span className="w-2 h-2 rounded-full bg-olivine animate-pulse" />
            <span className="font-cinzel text-xs text-parch/30 tracking-widest">Round {round} / 5</span>
          </div>
        </div>

        {/* Battle stage */}
        <div
          ref={parallaxRef}
          className="relative border border-stone/20 bg-deep/40 backdrop-blur-sm p-8 mb-6"
          style={{ perspective: '1000px' }}
        >
          {/* VS layout */}
          <div className="grid grid-cols-3 items-center gap-8">

            {/* Agent A */}
            <div className="text-center">
              <div className="text-5xl mb-3 animate-drift">{ARCHETYPE_ICONS[battle.agentA.archetype]}</div>
              <div className="font-cinzel text-sm text-sky mb-1">{battle.agentA.name}</div>
              <div className="section-label text-[7px] text-parch/30 mb-3">{battle.agentA.ensName}</div>
              <HealthBar label="" health={battle.healthA} color="text-sky" />
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="font-cinzel-dec text-4xl text-gold/40 mb-2">VS</div>
              <div className="flex flex-col gap-1 items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2 h-2 rounded-full',
                      i < round - 1 ? 'bg-gold' :
                      i === round - 1 ? 'bg-sand animate-pulse' :
                      'bg-stone/40'
                    )}
                  />
                ))}
              </div>
              <div className="section-label text-[7px] text-parch/30 mt-2">
                Rounds completed
              </div>
            </div>

            {/* Agent B */}
            <div className="text-center">
              <div className="text-5xl mb-3 animate-drift" style={{ animationDelay: '0.5s' }}>
                {ARCHETYPE_ICONS[battle.agentB.archetype]}
              </div>
              <div className="font-cinzel text-sm text-hadria mb-1">{battle.agentB.name}</div>
              <div className="section-label text-[7px] text-parch/30 mb-3">{battle.agentB.ensName}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-cinzel text-[8px] tracking-widest uppercase text-parch/60" />
                  <span className="font-cinzel text-sm text-hadria">{battle.healthB}%</span>
                </div>
                <div className="health-bar-track">
                  <div
                    className="health-bar-fill"
                    style={{
                      width: `${battle.healthB}%`,
                      background: 'linear-gradient(90deg, #722020, #8B3A3A)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom panels */}
        <div className="grid md:grid-cols-2 gap-4">
          <DivinWhisperLog messages={messages} />
          <WagerPoolBar wageredA={battle.wageredA} wageredB={battle.wageredB} />
        </div>

        {/* Battle status */}
        <div className="mt-4 glass-panel p-4 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-olivine animate-pulse" />
          <span className="font-cinzel text-[8px] tracking-widest text-parch/40 uppercase">
            Battle Active · KeeperHub monitoring · 0G Storage log streaming
          </span>
          <div className="ml-auto">
            <span className="font-cinzel text-[8px] text-parch/25">
              SSE: Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
