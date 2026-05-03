'use client'

import { use, useEffect, useRef, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { MOCK_BATTLE, MOCK_BATTLE_LOG } from '@/lib/mock-data'
import { cn, ARCHETYPE_ICONS, getArchetypeIcon } from '@/lib/utils'
import type { AXLMessage, Archetype } from '@/lib/store'
import { useAccount, useWriteContract } from 'wagmi'
import { parseEther, stringToHex, pad } from 'viem'
import { AGORA_POOL_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts'
import { toast } from 'sonner'
import { playSound } from '@/components/audio/SoundEffects'
import { BattleStage } from '@/components/r3f/scenes/BattleStage'
import type { BattleState } from '@/components/r3f/avatars/AgentAvatar'

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

function WagerPoolBar({ wageredA, wageredB, onOpenWager }: { wageredA: bigint; wageredB: bigint; onOpenWager: () => void }) {
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
      <div className="text-center mt-3">
        <span className="font-josefin text-xs text-parch/30 block mb-2">
          Total Pool: {Number(total) / 1e18} ETH
        </span>
        <button id="open-wager-modal" onClick={onOpenWager} className="btn-ghost text-[8px] px-4 py-1.5 border border-gold/30 hover:border-gold/60 text-gold/80">
          Place Wager
        </button>
      </div>
    </div>
  )
}

function WagerModal({ battle, onClose }: { battle: typeof MOCK_BATTLE; onClose: () => void }) {
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
    
    // In actual implementation, battleId should be bytes32. Mocking here.
    const mockBattleId = pad(stringToHex('mock-battle-id'), { size: 32 })
    
    try {
      await writeWager({
        address: CONTRACT_ADDRESSES.agoraPool,
        abi: AGORA_POOL_ABI,
        functionName: 'placeWager',
        args: [
          mockBattleId,
          parseEther(amount),
          side === 'A'
        ]
      })
      toast.success(`Successfully placed ${amount} ETH wager on ${side === 'A' ? battle.agentA.name : battle.agentB.name}`)
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
            <div className="text-2xl mb-1">{getArchetypeIcon(battle.agentA.archetype as Archetype, 20)}</div>
            <div className="font-cinzel text-[10px] text-sky">{battle.agentA.name}</div>
          </button>
          
          <button
            onClick={() => setSide('B')}
            className={cn(
              'stone-card p-3 text-center transition-all',
              side === 'B' ? 'border-hadria bg-hadria/10' : 'hover:border-stone/40 opacity-70'
            )}
          >
            <div className="text-2xl mb-1">{getArchetypeIcon(battle.agentB.archetype as Archetype, 20)}</div>
            <div className="font-cinzel text-[10px] text-hadria">{battle.agentB.name}</div>
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

function VerificationBadge({ status, battleId }: { status: 'verified' | 'pending' | 'failed' | 'none', battleId: string }) {
  if (status === 'none') return null

  const baseClasses = 'font-cinzel text-[8px] tracking-widest'
  let colorClass = ''
  let text = ''
  let link: string | null = null

  switch (status) {
    case 'verified':
      colorClass = 'text-olivine'
      text = 'Gensyn AXL ✓'
      link = `https://explorer.gensyn.ai/proof/${battleId}`
      break
    case 'pending':
      colorClass = 'text-sky'
      text = 'Gensyn AXL ⏳'
      break
    case 'failed':
      colorClass = 'text-hadria'
      text = 'Gensyn AXL ✗'
      break
    default:
      return null
  }

  return (
    <div className={cn('flex items-center gap-1.5 px-2 py-0.5 border rounded', {
      'border-olivine/30': status === 'verified',
      'border-sky/30': status === 'pending',
      'border-hadria/30': status === 'failed',
    })}>
      <span className={cn(baseClasses, colorClass)}>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {text}
          </a>
        ) : (
          text
        )}
      </span>
    </div>
  )
}

function SwarmVisualizer({ round }: { round: number }) {
  const [activeNode, setActiveNode] = useState(0)

  useEffect(() => {
    setActiveNode(0)
    const timers = [
      setTimeout(() => setActiveNode(1), 500),
      setTimeout(() => setActiveNode(2), 1200),
      setTimeout(() => setActiveNode(3), 2000),
      setTimeout(() => setActiveNode(4), 2800)
    ]
    return () => timers.forEach(clearTimeout)
  }, [round])

  const nodes = [
    { id: 1, name: 'Planner', activeBorder: 'border-sky', activeBg: 'bg-sky/20', dot: 'bg-sky' },
    { id: 2, name: 'Researcher', activeBorder: 'border-gold', activeBg: 'bg-gold/20', dot: 'bg-gold' },
    { id: 3, name: 'Critic', activeBorder: 'border-hadria', activeBg: 'bg-hadria/20', dot: 'bg-hadria' },
    { id: 4, name: 'Executor', activeBorder: 'border-olivine', activeBg: 'bg-olivine/20', dot: 'bg-olivine' }
  ]

  return (
    <div className="mb-4 glass-panel p-4 border border-sky/20 bg-sky/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky animate-pulse" />
          <span className="section-label text-[8px] text-sky tracking-widest">Gensyn AXL Swarm Node (Athena-III)</span>
        </div>
        <span className="font-josefin text-[9px] text-parch/40 border border-stone/20 px-2 py-0.5">Yggdrasil Mesh Network</span>
      </div>
      
      <div className="relative z-10 flex justify-between items-center px-4 md:px-12 py-2">
        {/* Connecting Line */}
        <div className="absolute left-8 md:left-16 right-8 md:right-16 top-1/2 -translate-y-1/2 h-[1px] bg-stone/20 z-0" />
        
        {nodes.map((node) => (
          <div key={node.id} className="relative z-10 flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500",
              activeNode >= node.id ? `${node.activeBorder} ${node.activeBg} scale-110` : "border-stone/30 bg-nox",
              activeNode === node.id ? "shadow-[0_0_15px_rgba(255,255,255,0.15)]" : ""
            )}>
              <div className={cn(
                "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300",
                activeNode >= node.id ? node.dot : "bg-stone/30",
                activeNode === node.id ? "animate-ping" : ""
              )} />
            </div>
            <span className={cn(
              "mt-3 font-cinzel text-[7px] md:text-[8px] tracking-widest uppercase transition-colors duration-500",
              activeNode >= node.id ? "text-parch" : "text-parch/30"
            )}>
              {node.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ColosseumPage({ params }: Props) {
  const { id } = use(params)
  const [messages, setMessages] = useState<AXLMessage[]>(MOCK_BATTLE_LOG)
  const [battle] = useState(MOCK_BATTLE)
  const [round, setRound] = useState(3)
  const [showWagerModal, setShowWagerModal] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | 'none'>('none')
  const parallaxRef = useRef<HTMLDivElement>(null)

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
        } else if (parsed.type === 'round_score') {
          setRound(parsed.data.round + 1)
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
  }, [id])

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

        {/* R3F Battle Stage — 3D avatars */}
        <div className="relative border border-stone/20 bg-deep/40 backdrop-blur-sm mb-6 overflow-hidden" style={{ height: 340 }}>
          {/* Greek key top border */}
          <div className="absolute top-0 left-0 right-0 h-px meander-top z-10" />

          {/* VS overlay */}
          <div className="absolute inset-0 flex items-end justify-center pb-4 z-10 pointer-events-none">
            <div className="flex items-end gap-8">
              {/* Agent A health */}
              <div className="w-32 text-right">
                <div className="font-cinzel text-xs text-sky mb-1">{battle.agentA.name}</div>
                <div className="section-label text-[7px] text-parch/30 mb-2">{battle.agentA.ensName}</div>
                <div className="health-bar-track">
                  <div className="health-bar-fill" style={{ width: `${battle.healthA}%`, background: 'linear-gradient(90deg, #2A7A9A, #85D3F2)' }} />
                </div>
              </div>

              <div className="font-cinzel-dec text-3xl text-gold/30 mb-1 pb-6">VS</div>

              {/* Agent B health */}
              <div className="w-32 text-left">
                <div className="font-cinzel text-xs text-hadria mb-1">{battle.agentB.name}</div>
                <div className="section-label text-[7px] text-parch/30 mb-2">{battle.agentB.ensName}</div>
                <div className="health-bar-track">
                  <div className="health-bar-fill" style={{ width: `${battle.healthB}%`, background: 'linear-gradient(90deg, #722020, #8B3A3A)' }} />
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
                  archetype: battle.agentA.archetype as Archetype,
                  elo: battle.agentA.elo,
                  rank: battle.agentA.rank,
                  health: battle.healthA,
                  battleState: 'idle' as BattleState,
                }}
                agentB={{
                  archetype: battle.agentB.archetype as Archetype,
                  elo: battle.agentB.elo,
                  rank: battle.agentB.rank,
                  health: battle.healthB,
                  battleState: 'idle' as BattleState,
                }}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Swarm Mind Visualizer */}
        {battle.agentA.archetype === 'Strategist' && <SwarmVisualizer round={round} />}

        {/* Bottom panels */}
        <div className="grid md:grid-cols-2 gap-4">
          <DivinWhisperLog messages={messages} />
          <WagerPoolBar wageredA={battle.wageredA} wageredB={battle.wageredB} onOpenWager={() => setShowWagerModal(true)} />
        </div>

        {/* Battle status */}
        <div className="mt-4 glass-panel p-4 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-olivine animate-pulse" />
          <span className="font-cinzel text-[8px] tracking-widest text-parch/40 uppercase">
            Battle Active · KeeperHub monitoring · 0G Storage log streaming
          </span>
          
          <VerificationBadge status={verificationStatus} battleId={id} />
        </div>

        {/* Wager Modal */}
        {showWagerModal && <WagerModal battle={battle} onClose={() => setShowWagerModal(false)} />}
      </div>
    </div>
  )
}
