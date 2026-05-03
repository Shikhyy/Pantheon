'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, type Agent } from '@/lib/store'
import { ARCHETYPE_ICONS, getArchetypeIcon, cn } from '@/lib/utils'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { playSound } from '@/components/audio/SoundEffects'
import { toast } from 'sonner'
import { BREEDING_FORGE_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts'
import { parseEther, keccak256, toBytes, stringToHex, pad } from 'viem'

export default function BreedingForgePage() {
  const { isConnected } = useAccount()
  const ownedAgents = useGameStore(s => s.ownedAgents)
  const [parent1, setParent1] = useState<Agent | null>(null)
  const [parent2, setParent2] = useState<Agent | null>(null)
  const [offspringName, setOffspringName] = useState('')
  const [step, setStep] = useState<0 | 1 | 2>(0) // 0: select, 1: commit, 2: breed
  const [commitHash, setCommitHash] = useState<`0x${string}` | null>(null)
  const [preimage, setPreimage] = useState<string>('')

  // Filter for eligible agents (ELO >= 1400, Battles >= 5)
  const eligibleAgents = ownedAgents.filter(a => a.elo >= 1400 && a.wins + a.losses >= 5)

  const { writeContractAsync: writeCommit, isPending: isCommitting } = useWriteContract()
  const { writeContractAsync: writeBreed, isPending: isBreeding } = useWriteContract()

  const handleSelect = (agent: Agent) => {
    playSound('stoneClick')
    if (!parent1) setParent1(agent)
    else if (!parent2 && agent.tokenId !== parent1.tokenId) setParent2(agent)
    else if (parent1 && parent2) {
      // replace parent 2 if both selected
      setParent2(agent)
    }
  }

  const handleCommit = async () => {
    if (!parent1 || !parent2 || !offspringName) return
    playSound('anvilStrike')
    try {
      // Generate random preimage for legendary roll
      const randomPreimage = Math.random().toString(36).substring(2, 15)
      setPreimage(randomPreimage)
      const hash = keccak256(toBytes(randomPreimage))
      setCommitHash(hash)

      const txHash = await writeCommit({
        address: CONTRACT_ADDRESSES.breedingForge,
        abi: BREEDING_FORGE_ABI,
        functionName: 'commitBreed',
        args: [hash],
      })
      toast.success('Commitment submitted. Waiting for confirmation...')
      setStep(2)
    } catch (err) {
      console.error(err)
      toast.error('Failed to commit breeding transaction.')
    }
  }

  const handleBreed = async () => {
    if (!parent1 || !parent2 || !offspringName || !preimage) return
    playSound('apotheosis')
    try {
      const txHash = await writeBreed({
        address: CONTRACT_ADDRESSES.breedingForge,
        abi: BREEDING_FORGE_ABI,
        functionName: 'breed',
        args: [
          parent1.tokenId,
          parent2.tokenId,
          offspringName,
          '0x0000000000000000000000000000000000000000000000000000000000000000', // Mock storage hash
          pad(stringToHex(preimage), { size: 32 })
        ],
        value: parseEther('0.005'), // BREED_FEE
      })
      toast.success('Breeding successful! Offspring minted.')
      // Reset
      setStep(0)
      setParent1(null)
      setParent2(null)
      setOffspringName('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to execute breeding.')
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-4xl mb-6">⚒</div>
          <h2 className="font-cinzel text-xl text-parch mb-3">Connect to the Breeding Forge</h2>
          <p className="font-josefin text-parch/40 text-sm mb-8">
            Combine the essence of Gods to forge a new legacy.
          </p>
          <div className="flex justify-center scale-110">
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="section-label mb-3">Breeding Forge</div>
          <h1 className="font-cinzel text-3xl md:text-4xl text-parch mb-2">
            Combine Divine Essences
          </h1>
          <p className="font-fell italic text-parch/50">
            Only Gods may pass their lineage to the next generation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left Column: Parents */}
          <div className="space-y-6">
            <h2 className="font-cinzel text-xl text-sand text-center">The Parents</h2>
            <div className="flex gap-4">
              {/* Parent 1 */}
              <div className="flex-1 stone-card p-6 min-h-[160px] flex flex-col items-center justify-center border-dashed border-2 border-stone/30">
                {parent1 ? (
                  <>
                    <div className="text-3xl mb-2">{getArchetypeIcon(parent1.archetype, 20)}</div>
                    <div className="font-cinzel text-sand text-center">{parent1.name}</div>
                    <div className="text-xs text-parch/50 mt-1">ELO: {parent1.elo}</div>
                  </>
                ) : (
                  <span className="font-cinzel text-parch/30 text-xs">Select Parent 1</span>
                )}
              </div>
              <div className="flex items-center text-stone text-2xl">+</div>
              {/* Parent 2 */}
              <div className="flex-1 stone-card p-6 min-h-[160px] flex flex-col items-center justify-center border-dashed border-2 border-stone/30">
                {parent2 ? (
                  <>
                    <div className="text-3xl mb-2">{getArchetypeIcon(parent2.archetype, 20)}</div>
                    <div className="font-cinzel text-sand text-center">{parent2.name}</div>
                    <div className="text-xs text-parch/50 mt-1">ELO: {parent2.elo}</div>
                  </>
                ) : (
                  <span className="font-cinzel text-parch/30 text-xs">Select Parent 2</span>
                )}
              </div>
            </div>

            {/* Agent Selection List */}
            {step === 0 && (
              <div className="mt-8">
                <h3 className="section-label mb-4">Eligible Agents (Gods+)</h3>
                <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                  {eligibleAgents.length === 0 ? (
                    <div className="col-span-2 text-center text-parch/40 font-josefin italic py-4">
                      No eligible agents found. Your agents must reach God rank (ELO 1400+) and complete 5 battles.
                    </div>
                  ) : (
                    eligibleAgents.map(agent => (
                      <button
                        key={agent.tokenId.toString()}
                        onClick={() => handleSelect(agent)}
                        className={cn(
                          'stone-card p-4 text-left transition-all text-xs',
                          (parent1?.tokenId === agent.tokenId || parent2?.tokenId === agent.tokenId)
                            ? 'border-sand bg-deep shadow-[0_0_10px_rgba(217,167,139,0.2)]'
                            : 'hover:border-stone'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getArchetypeIcon(agent.archetype, 20)}</span>
                          <span className="font-cinzel text-parch truncate">{agent.name}</span>
                        </div>
                        <div className="text-parch/50 font-josefin">ELO {agent.elo} | Rank {agent.rank}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Offspring / Action */}
          <div className="stone-card p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <h2 className="font-cinzel text-xl text-olivine mb-6">The Offspring</h2>
            
            {step === 0 && (
              <div className="w-full">
                <label className="section-label block mb-3 text-center">Name the Offspring</label>
                <div className="relative mb-8 max-w-xs mx-auto">
                  <input
                    type="text"
                    value={offspringName}
                    onChange={(e) => setOffspringName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="achilles-jr"
                    className="w-full bg-nox border border-stone/40 text-parch font-cinzel text-lg px-4 py-3 focus:outline-none focus:border-sand/40 text-center"
                  />
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleCommit}
                    disabled={!parent1 || !parent2 || !offspringName || isCommitting}
                    className={cn(
                      'btn-gold w-full max-w-xs',
                      (!parent1 || !parent2 || !offspringName || isCommitting) && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    <span>{isCommitting ? 'Committing...' : 'Commit Lineage (Step 1)'}</span>
                  </button>
                  <p className="mt-4 text-xs font-josefin text-parch/40">Fee: 0.005 ETH</p>
                </div>
              </div>
            )}

            {step === 2 && (
               <div className="w-full text-center">
                 <div className="mb-6">
                    <span className="text-4xl animate-pulse inline-block mb-4">🔮</span>
                    <h3 className="font-cinzel text-sand">Lineage Committed</h3>
                    <p className="text-xs text-parch/50 mt-2 font-josefin">
                      The Fates are weaving the offspring&apos;s directive. Reveal to finalize.
                    </p>
                 </div>
                 <button
                    onClick={handleBreed}
                    disabled={isBreeding}
                    className={cn(
                      'btn-gold w-full max-w-xs',
                      isBreeding && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    <span>{isBreeding ? 'Forging...' : 'Reveal & Breed (Step 2)'}</span>
                  </button>
               </div>
            )}
            
            {/* Ambient Background Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at center, rgba(154, 170, 96, 0.4) 0%, transparent 70%)' }} />
          </div>
        </div>

      </div>
    </div>
  )
}
