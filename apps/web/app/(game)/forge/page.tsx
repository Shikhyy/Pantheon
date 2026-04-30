'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, type Archetype } from '@/lib/store'
import { ARCHETYPE_DESCRIPTIONS, ARCHETYPE_ICONS, cn } from '@/lib/utils'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { playSound } from '@/components/audio/SoundEffects'
import { toast } from 'sonner'

const ARCHETYPES: { id: Archetype; title: string; description: string; color: string; border: string }[] = [
  {
    id: 'Strategist',
    title: 'Strategist',
    description: ARCHETYPE_DESCRIPTIONS.Strategist,
    color: 'text-sky',
    border: 'border-sky/30 hover:border-sky/60',
  },
  {
    id: 'Oracle',
    title: 'Oracle',
    description: ARCHETYPE_DESCRIPTIONS.Oracle,
    color: 'text-questa',
    border: 'border-questa/30 hover:border-questa/60',
  },
  {
    id: 'Berserker',
    title: 'Berserker',
    description: ARCHETYPE_DESCRIPTIONS.Berserker,
    color: 'text-hadria',
    border: 'border-hadria/30 hover:border-hadria/60',
  },
  {
    id: 'Diplomat',
    title: 'Diplomat',
    description: ARCHETYPE_DESCRIPTIONS.Diplomat,
    color: 'text-olivine',
    border: 'border-olivine/30 hover:border-olivine/60',
  },
]

const DIRECTIVE_PRESETS = [
  'You are a cold, analytical intelligence. Every response is calculated to maximize accuracy. You never bluff — you win by being right.',
  'You are a visionary seer. You see patterns others miss, and you speak with cryptic conviction. Your predictions are bold, and often correct.',
  'You are an unstoppable force. You attack every problem with maximum confidence and raw power. Nuance is weakness. Victory is everything.',
]

const FORGE_STAGES = [
  { icon: '🔐', label: 'Encrypting soul' },
  { icon: '☁️', label: 'Writing to 0G Storage' },
  { icon: '💎', label: 'Minting iNFT' },
  { icon: '🔗', label: 'Registering ENS' },
  { icon: '✨', label: 'Awakening' },
]

export default function ForgePage() {
  const { isConnected } = useAccount()
  const { forgeState, updateForge, resetForge } = useGameStore()
  const [step, setStep] = useState(0) // 0=archetype, 1=name, 2=directive, 3=forging
  const [forgeProgress, setForgeProgress] = useState(-1)
  const [forgedSuccess, setForgedSuccess] = useState(false)

  const handleArchetypeSelect = (archetype: Archetype) => {
    playSound('stoneClick')
    updateForge({ archetype })
  }

  const checkEnsName = async (name: string) => {
    updateForge({ name, nameStatus: 'checking' })
    // Mock check — in production calls /api/ens/check
    await new Promise(r => setTimeout(r, 600))
    const taken = ['zeus', 'athena', 'apollo'].includes(name.toLowerCase())
    updateForge({ nameStatus: taken ? 'taken' : 'available' })
  }

  const handleForge = async () => {
    playSound('anvilStrike')
    setStep(3)
    // Simulate 5-stage forge sequence
    for (let i = 0; i < 5; i++) {
      setForgeProgress(i)
      await new Promise(r => setTimeout(r, 1200))
    }
    setForgedSuccess(true)
    playSound('apotheosis')
    toast.success(`${forgeState.name || 'Your agent'} has been forged into the blockchain!`)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-4xl mb-6">⚒</div>
          <h2 className="font-cinzel text-xl text-parch mb-3">Connect to Enter the Forge</h2>
          <p className="font-josefin text-parch/40 text-sm mb-8">
            Your wallet is your hammer. Your directive is your fire.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-label mb-3">God-Forge</div>
          <h1 className="font-cinzel text-3xl md:text-4xl text-parch mb-2">
            Forge Your Divine Agent
          </h1>
          <p className="font-fell italic text-parch/50">
            Three steps stand between you and immortality.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {['Archetype', 'Name', 'Directive'].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (step > i) {
                    playSound('stoneClick')
                    setStep(i)
                  }
                }}
                className={cn(
                  'flex items-center gap-2 font-cinzel text-[8px] tracking-[.15em] uppercase transition-colors duration-300',
                  step === i ? 'text-sand' : step > i ? 'text-parch/40 cursor-pointer hover:text-parch/70' : 'text-parch/20 cursor-not-allowed'
                )}
              >
                <span className={cn(
                  'w-6 h-6 flex items-center justify-center border text-[9px]',
                  step === i ? 'border-sand text-sand' : step > i ? 'border-parch/30 text-parch/30 bg-parch/5' : 'border-parch/10 text-parch/10'
                )}>
                  {step > i ? '✓' : (i + 1)}
                </span>
                {label}
              </button>
              {i < 2 && <span className="text-stone text-lg">—</span>}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 0: ARCHETYPE ── */}
          {step === 0 && (
            <motion.div
              key="archetype"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-cinzel text-sm tracking-widest uppercase text-parch/60 text-center mb-8">
                Choose Your Archetype
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {ARCHETYPES.map((a) => (
                  <button
                    key={a.id}
                    id={`archetype-${a.id.toLowerCase()}`}
                    onClick={() => handleArchetypeSelect(a.id)}
                    className={cn(
                      'stone-card shimmer-line p-6 text-left transition-all duration-300 border',
                      a.border,
                      forgeState.archetype === a.id
                        ? 'bg-deep/80 border-opacity-100 scale-[1.02]'
                        : 'opacity-70 hover:opacity-100'
                    )}
                  >
                    <div className="text-3xl mb-3">{ARCHETYPE_ICONS[a.id]}</div>
                    <div className={cn('font-cinzel text-sm tracking-widest uppercase mb-2', a.color)}>
                      {a.title}
                    </div>
                    <p className="font-josefin text-xs text-parch/40 leading-relaxed">
                      {a.description}
                    </p>
                    {forgeState.archetype === a.id && (
                      <div className="mt-3 text-[8px] font-cinzel tracking-widest text-sand/60 uppercase">
                        ✓ Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  id="archetype-next"
                  onClick={() => {
                    playSound('stoneClick')
                    setStep(1)
                  }}
                  disabled={!forgeState.archetype}
                  className={cn(
                    'btn-gold',
                    !forgeState.archetype && 'opacity-30 cursor-not-allowed'
                  )}
                >
                  <span>Next: Name Your God →</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: ENS NAME ── */}
          {step === 1 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-cinzel text-sm tracking-widest uppercase text-parch/60 text-center mb-8">
                Name Your God
              </h2>

              <div className="stone-card p-8 mb-6">
                <div className="mb-6">
                  <label className="section-label block mb-3">Choose Your ENS Name</label>
                  <div className="relative">
                    <input
                      id="ens-name-input"
                      type="text"
                      value={forgeState.name}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                        if (val.length >= 2) checkEnsName(val)
                        else updateForge({ name: val, nameStatus: 'idle' })
                      }}
                      placeholder="achilles"
                      className="w-full bg-nox border border-stone/40 text-parch font-cinzel text-lg px-4 py-3 pr-32 focus:outline-none focus:border-sand/40 placeholder:text-parch/20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-josefin text-xs text-parch/30">
                      .pantheon.eth
                    </span>
                  </div>

                  {/* Status indicators */}
                  <div className="mt-2 h-5 flex items-center">
                    {forgeState.nameStatus === 'checking' && (
                      <span className="font-cinzel text-[8px] text-parch/40 tracking-widest animate-pulse">
                        ◌ Checking the Akashic Ledger...
                      </span>
                    )}
                    {forgeState.nameStatus === 'available' && (
                      <span className="font-cinzel text-[8px] text-olivine tracking-widest">
                        ✓ {forgeState.name}.pantheon.eth is yours to claim
                      </span>
                    )}
                    {forgeState.nameStatus === 'taken' && (
                      <span className="font-cinzel text-[8px] text-hadria tracking-widest">
                        ✗ This name has been claimed by another god
                      </span>
                    )}
                  </div>
                </div>

                {forgeState.nameStatus === 'available' && (
                  <div className="border border-gold/20 bg-gold/5 p-4 text-center">
                    <div className="font-cinzel text-xl text-gold tracking-widest mb-1">
                      {forgeState.name}.pantheon.eth
                    </div>
                    <div className="section-label text-[7px] text-parch/30">
                      This name will be yours forever on the Ethereum Name Service
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button onClick={() => { playSound('stoneClick'); setStep(0) }} className="btn-ghost">
                  ← Back
                </button>
                <button
                  id="name-next"
                  onClick={() => { playSound('stoneClick'); setStep(2) }}
                  disabled={forgeState.nameStatus !== 'available'}
                  className={cn('btn-gold', forgeState.nameStatus !== 'available' && 'opacity-30 cursor-not-allowed')}
                >
                  <span>Next: Write Directive →</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: DIRECTIVE ── */}
          {step === 2 && (
            <motion.div
              key="directive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-cinzel text-sm tracking-widest uppercase text-parch/60 text-center mb-8">
                Write the Directive
              </h2>

              <div className="stone-card p-8 mb-6">
                <div className="flex gap-2 mb-4">
                  {DIRECTIVE_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => { playSound('stoneClick'); updateForge({ directive: preset }) }}
                      className="font-cinzel text-[7px] tracking-widest uppercase border border-stone/30 text-parch/30 px-3 py-1.5 hover:border-sand/30 hover:text-parch/60 transition-all"
                    >
                      Preset {i + 1}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    id="directive-textarea"
                    value={forgeState.directive}
                    onChange={(e) => updateForge({ directive: e.target.value })}
                    placeholder="Define your agent's personality, strategy, and fighting philosophy in 2-3 sentences..."
                    maxLength={500}
                    rows={6}
                    className="w-full bg-nox border border-stone/40 text-parch font-josefin text-sm px-4 py-3 focus:outline-none focus:border-sand/40 placeholder:text-parch/20 resize-none"
                  />
                  {/* Amphora fill counter */}
                  <div className="absolute bottom-3 right-3 font-cinzel text-[8px] text-parch/30">
                    {forgeState.directive.length}/500
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-0.5 bg-stone/20">
                  <div
                    className="h-full bg-gradient-to-r from-stone to-sand transition-all duration-300"
                    style={{ width: `${(forgeState.directive.length / 500) * 100}%` }}
                  />
                </div>

                <div className="mt-4 p-4 border border-stone/20 bg-deep/40">
                  <div className="section-label text-[7px] mb-2">Preview — Your Agent in the Agora</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{ARCHETYPE_ICONS[forgeState.archetype ?? 'Strategist']}</div>
                    <div>
                      <div className="font-cinzel text-xs text-sand">{forgeState.name || 'unnamed'}</div>
                      <div className="section-label text-[7px] text-parch/30">{forgeState.name}.pantheon.eth</div>
                    </div>
                    <div className="ml-auto">
                      <span className={cn('rank-pill rank-demigod')}>Demigod</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => { playSound('stoneClick'); setStep(1) }} className="btn-ghost">← Back</button>
                <button
                  id="forge-submit"
                  onClick={handleForge}
                  disabled={forgeState.directive.length < 20}
                  className={cn('btn-gold px-8', forgeState.directive.length < 20 && 'opacity-30 cursor-not-allowed')}
                >
                  <span>⚒ Forge into Legend</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: FORGING ── */}
          {step === 3 && !forgedSuccess && (
            <motion.div
              key="forging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <h2 className="font-cinzel text-2xl text-parch mb-12">The Forge Burns...</h2>
              <div className="space-y-4 max-w-sm mx-auto">
                {FORGE_STAGES.map((stage, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-4 p-4 border transition-all duration-700',
                      i < forgeProgress ? 'border-olivine/30 bg-olivine/5 text-olivine' :
                      i === forgeProgress ? 'border-sand/50 bg-sand/5 text-sand animate-pulse' :
                      'border-stone/20 text-parch/20'
                    )}
                  >
                    <span className="text-xl">{stage.icon}</span>
                    <span className="font-cinzel text-xs tracking-widest uppercase">{stage.label}</span>
                    {i < forgeProgress && <span className="ml-auto text-olivine">✓</span>}
                    {i === forgeProgress && <span className="ml-auto text-sand">◌</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {forgedSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-6 animate-drift">✨</div>
              <h2 className="font-cinzel-dec text-3xl text-gold mb-2">Apotheosis!</h2>
              <p className="font-fell italic text-parch/60 mb-2">
                {forgeState.name}.pantheon.eth has awakened.
              </p>
              <p className="font-cinzel text-xs text-parch/30 tracking-widest uppercase mb-8">
                Your god now lives forever on the Akashic Ledger
              </p>

              <div className="stone-card p-6 max-w-sm mx-auto mb-8">
                <div className="text-3xl mb-3">{ARCHETYPE_ICONS[forgeState.archetype ?? 'Strategist']}</div>
                <div className="font-cinzel text-lg text-sand mb-1">{forgeState.name}</div>
                <div className="section-label text-[7px] text-parch/30 mb-3">{forgeState.name}.pantheon.eth</div>
                <div className="flex justify-between text-xs font-cinzel">
                  <span className="text-parch/40">ELO</span>
                  <span className="text-gold">1,200</span>
                </div>
                <div className="flex justify-between text-xs font-cinzel mt-1">
                  <span className="text-parch/40">Rank</span>
                  <span className="text-parch/60">Demigod</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <a href="/agora" className="btn-gold">
                  <span>Enter the Agora →</span>
                </a>
                <button
                  onClick={() => { playSound('stoneClick'); resetForge(); setStep(0); setForgeProgress(-1); setForgedSuccess(false) }}
                  className="btn-ghost"
                >
                  Forge Another
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
