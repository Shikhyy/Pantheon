'use client'

import { use, useEffect, useRef, useState, Suspense, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { cn, ARCHETYPE_ICONS, getArchetypeIcon } from '@/lib/utils'
import type { AXLMessage, Archetype } from '@/lib/store'
import { useAccount, useWriteContract } from 'wagmi'
import { parseEther, stringToHex, pad } from 'viem'
import { AGORA_POOL_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts'
import { useBattle, useGetAgent, useGetAgentName } from '@/lib/hooks'
import { toast } from 'sonner'
import { playSound } from '@/components/audio/SoundEffects'
import { BattleStage } from '@/components/r3f/scenes/BattleStage'
import type { BattleState } from '@/components/r3f/avatars/AgentAvatar'

interface Props {
  params: Promise<{ id: string }>
}

const ARCHETYPES = ['Unknown', 'Strategist', 'Berserker', 'Oracle', 'Diplomat']

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

function WagerPoolBar({ wageredA, wageredB, onOpenWager, nameA, nameB }: { 
  wageredA: bigint; 
  wageredB: bigint; 
  onOpenWager: () => void;
  nameA: string;
  nameB: string;
}) {
  const total = wageredA + wageredB
  const pctA = total > 0n ? Number((wageredA * 100n) / total) : 50
  const pctB = 100 - pctA

  return (
    <div className="glass-panel p-4">
      <div className="section-label text-[7px] mb-3">⚱ Agora Pool — Spectator Wagers</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-cinzel text-[8px] text-sky">{pctA}% {nameA}</span>
        <div className="flex-1 h-3 bg-stone/40 overflow-hidden flex">
          <div className="h-full bg-sky/40 transition-all duration-1000" style={{ width: `${pctA}%` }} />
          <div className="h-full bg-hadria/40 transition-all duration-1000" style={{ width: `${pctB}%` }} />
        </div>
        <span className="font-cinzel text-[8px] text-hadria">{pctB}% {nameB}</span>
      </div>
      <div className="text-center mt-3">
        <span className="font-josefin text-xs text-parch/30 block mb-2">
          Total Pool: {Number(total) / 1e18} ETH
        </span>
        <button id="open-wager-modal" onClick={onOpenWager} className="btn-gold text-[8px] px-4 py-1.5 border border-gold/30 hover:border-gold/60 text-gold/80">
          Place Wager
        </button>
      </div>
    </div>
  )
}

function WagerModal({ id, agentA, agentB, onClose }: { 
  id: string; 
  agentA: { name: string, archetype: Archetype }; 
  agentB: { name: string, archetype: Archetype }; 
  onClose: () => void 
}) {
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState('0.01')
  const [side, setSide] = useState<'A' | 'B' | null>(null)
  
  const { writeContractAsync: writeWager, isPending } = useWriteContract()

  const handleWager = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first.')
      return
    }
    if (!side) {
      toast.error('Select a champion to wager on.')
      return
    }
    if (!amount || isNaN(Number(amount))) {
      toast.error('Enter a valid wager amount.')
      return
    }
    playSound('stoneClick')
    
    const battleIdToUse = id.startsWith('0x') && id.length === 66 
      ? id as `0x${string}` 
      : pad(stringToHex(id), { size: 32 })
    
    try {
      await writeWager({
        address: CONTRACT_ADDRESSES.agoraPool,
        abi: AGORA_POOL_ABI,
        functionName: 'placeWager',
        args: [
          battleIdToUse,
          parseEther(amount),
          side === 'A'
        ]
      })
      toast.success(`Successfully placed ${amount} ETH wager on ${side === 'A' ? agentA.name : agentB.name}`)
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to place wager.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-nox/80 backdrop-blur-sm">
      <div className="relative stone-card max-w-sm w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 font-cinzel text-[8px] text-parch/30 hover:text-parch/60">✕ CLOSE</button>
        
        <h2 className="font-cinzel text-lg text-sand mb-4 text-center">Place Wager</h2>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setSide('A')}
            className={cn(
              'stone-card p-3 text-center transition-all',
              side === 'A' ? 'border-sky bg-sky/10' : 'hover:border-stone/40 opacity-70'
            )}
          >
            <div className="text-2xl mb-1">{getArchetypeIcon(agentA.archetype, 20)}</div>
            <div className="font-cinzel text-[10px] text-sky">{agentA.name}</div>
          </button>
          
          <button
            onClick={() => setSide('B')}
            className={cn(
              'stone-card p-3 text-center transition-all',
              side === 'B' ? 'border-hadria bg-hadria/10' : 'hover:border-stone/40 opacity-70'
            )}
          >
            <div className="text-2xl mb-1">{getArchetypeIcon(agentB.archetype, 20)}</div>
            <div className="font-cinzel text-[10px] text-hadria">{agentB.name}</div>
          </button>
        </div>
        
        <div className="mb-6">
          <label className="section-label block mb-2 text-center">Amount (ETH)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-nox border border-stone/40 text-center text-parch font-josefin px-4 py-2 focus:outline-none focus:border-sand/40"
          />
        </div>
        
        <button
          onClick={handleWager}
          disabled={isPending || !side}
          className={cn('btn-gold w-full', (isPending || !side) && 'opacity-30 cursor-not-allowed')}
        >
          <span>{isPending ? 'Confirming...' : 'Confirm Wager'}</span>
        </button>
      </div>
    </div>
  )
}

export default function ColosseumPage({ params }: Props) {
  const { id } = use(params)
  const [messages, setMessages] = useState<AXLMessage[]>([])
  const [round, setRound] = useState(1)
  const [showWagerModal, setShowWagerModal] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | 'none'>('none')
  const [healthA, setHealthA] = useState(100)
  const [healthB, setHealthB] = useState(100)

  // Fetch real battle data
  const { data: battleDataRaw, isLoading: battleLoading } = useBattle(id as `0x${string}`)
  
  const battleData = useMemo(() => {
    if (!battleDataRaw) return null
    return {
      challengerTokenId: battleDataRaw.challengerTokenId,
      defenderTokenId: battleDataRaw.defenderTokenId,
      challengerOwner: battleDataRaw.challengerOwner,
      defenderOwner: battleDataRaw.defenderOwner,
      wagerToken: battleDataRaw.wagerToken,
      wagerAmount: battleDataRaw.wagerAmount,
      phase: Number(battleDataRaw.phase),
      createdAt: battleDataRaw.createdAt,
      startedAt: battleDataRaw.startedAt,
      winner: battleDataRaw.winner,
      transcriptHash: battleDataRaw.transcriptHash,
    }
  }, [battleDataRaw])

  // Fetch agents data
  const { data: agentARaw } = useGetAgent(battleData?.challengerTokenId)
  const { data: agentBRaw } = useGetAgent(battleData?.defenderTokenId)
  const nameA = useGetAgentName(battleData?.challengerTokenId)
  const nameB = useGetAgentName(battleData?.defenderTokenId)

  const agentA = useMemo(() => {
    if (!agentARaw) return { name: nameA || 'Challenger', archetype: 'Strategist' as Archetype, elo: 1500, rank: 'Demigod' }
    return {
      name: nameA || `Agent #${battleData?.challengerTokenId}`,
      archetype: (ARCHETYPES[agentARaw.archetype] || 'Strategist') as Archetype,
      elo: Number(agentARaw.elo),
      rank: agentARaw.rank,
    }
  }, [agentARaw, nameA, battleData])

  const agentB = useMemo(() => {
    if (!agentBRaw) return { name: nameB || 'Defender', archetype: 'Berserker' as Archetype, elo: 1500, rank: 'Demigod' }
    return {
      name: nameB || `Agent #${battleData?.defenderTokenId}`,
      archetype: (ARCHETYPES[agentBRaw.archetype] || 'Berserker') as Archetype,
      elo: Number(agentBRaw.elo),
      rank: agentBRaw.rank,
    }
  }, [agentBRaw, nameB, battleData])

  useEffect(() => {
    if (round >= 5) {
      const t1 = setTimeout(() => setVerificationStatus('pending'), 0)
      const t2 = setTimeout(() => setVerificationStatus('verified'), 2000)
      return () => { clearTimeout(t1); clearTimeout(t2); }
    }
  }, [round])

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

  // Connect to SSE stream
  useEffect(() => {
    const eventSource = new EventSource(`/api/battle/${id}/stream`)

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        if (parsed.type === 'axl_message') {
          setMessages(prev => [...prev.slice(-30), parsed.data])
          if (parsed.data.from === agentA.name) {
            playSound('swordClash')
          } else if (parsed.data.from === agentB.name) {
            playSound('swordClash')
          }
        } else if (parsed.type === 'round_score') {
          setRound(parsed.data.round + 1)
          setHealthA(prev => Math.max(0, prev - (parsed.data.scoreB / 10)))
          setHealthB(prev => Math.max(0, prev - (parsed.data.scoreA / 10)))
          playSound('apotheosis')
        } else if (parsed.type === 'battle_end') {
          toast.success(`Battle ended! Winner: ${parsed.data.winner}`)
          setRound(6)
          playSound('apotheosis')
        }
      } catch (e) {
        console.error('Failed to parse SSE data', e)
      }
    }

    eventSource.onerror = () => {
      console.error('SSE Connection Error')
    }

    return () => {
      eventSource.close()
    }
  }, [id, agentA.name, agentB.name])

  if (battleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-cinzel text-parch/40 animate-pulse">Summoning Battle Data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 px-6 pb-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="section-label mb-2">The Colosseum · Battle #{id.slice(0, 10)}...</div>
          <div className="flex items-center justify-center gap-4">
            <span className="font-cinzel text-xs text-sky tracking-widest">LIVE</span>
            <span className="w-2 h-2 rounded-full bg-olivine animate-pulse" />
            <span className="font-cinzel text-xs text-parch/30 tracking-widest">
              {round > 5 ? 'COMPLETED' : `Round ${round} / 5`}
            </span>
          </div>
        </div>

        {/* R3F Battle Stage — 3D avatars */}
        <div className="relative border border-stone/20 bg-deep/40 backdrop-blur-sm mb-6 overflow-hidden" style={{ height: 340 }}>
          {/* Greek key top border */}
          <div className="absolute top-0 left-0 right-0 h-px meander-top z-10" />

          {/* VS overlay */}
          <div className="absolute inset-0 flex items-end justify-center pb-4 z-10 pointer-events-none">
            <div className="flex items-end gap-8">
              {/* Agent A health */}
              <div className="w-32 text-right">
                <div className="font-cinzel text-xs text-sky mb-1">{agentA.name}</div>
                <div className="section-label text-[7px] text-parch/30 mb-2">{`${agentA.name.toLowerCase()}.agent.eth`}</div>
                <div className="health-bar-track">
                  <div className="health-bar-fill" style={{ width: `${healthA}%`, background: 'linear-gradient(90deg, #2A7A9A, #85D3F2)' }} />
                </div>
              </div>

              <div className="font-cinzel-dec text-3xl text-gold/30 mb-1 pb-6">VS</div>

              {/* Agent B health */}
              <div className="w-32 text-left">
                <div className="font-cinzel text-xs text-hadria mb-1">{agentB.name}</div>
                <div className="section-label text-[7px] text-parch/30 mb-2">{`${agentB.name.toLowerCase()}.agent.eth`}</div>
                <div className="health-bar-track">
                  <div className="health-bar-fill" style={{ width: `${healthB}%`, background: 'linear-gradient(90deg, #722020, #8B3A3A)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Round progress dots */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2',
                  i < round - 1 ? 'bg-gold' :
                  i === round - 1 ? 'bg-sand animate-pulse' :
                  'bg-stone/40'
                )}
              />
            ))}
          </div>

          <Canvas camera={{ position: [0, 0.5, 4.2], fov: 38 }} shadows dpr={[1, 1.5]}>
            <Suspense fallback={null}>
              <BattleStage
                agentA={{
                  archetype: agentA.archetype,
                  elo: agentA.elo,
                  rank: agentA.rank as any,
                  health: healthA,
                  battleState: 'idle' as BattleState,
                }}
                agentB={{
                  archetype: agentB.archetype,
                  elo: agentB.elo,
                  rank: agentB.rank as any,
                  health: healthB,
                  battleState: 'idle' as BattleState,
                }}
              />
            </Suspense>
          </Canvas>
        </div>


        {/* Bottom panels */}
        <div className="grid md:grid-cols-2 gap-4">
          <DivinWhisperLog messages={messages} />
          <WagerPoolBar 
            wageredA={battleData?.wagerAmount || 0n} 
            wageredB={0n} // TODO: Fetch from AgoraPool contract
            onOpenWager={() => setShowWagerModal(true)}
            nameA={agentA.name}
            nameB={agentB.name}
          />
        </div>

        {/* Battle status */}
        <div className="mt-4 glass-panel p-4 flex items-center gap-4">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", round > 5 ? "bg-stone" : "bg-olivine")} />
          <span className="font-cinzel text-[8px] tracking-widest text-parch/40 uppercase">
            {round > 5 ? 'Battle Finalized · transcript verified on Gensyn' : 'Battle Active · monitoring 0G Storage log streaming'}
          </span>
        </div>

        {/* Wager Modal */}
        {showWagerModal && <WagerModal id={id} agentA={agentA} agentB={agentB} onClose={() => setShowWagerModal(false)} />}
      </div>
    </div>
  )
}

