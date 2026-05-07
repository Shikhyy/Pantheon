// lib/store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type Archetype = 'Strategist' | 'Oracle' | 'Berserker' | 'Diplomat'
export type Rank = 'Demigod' | 'Hero' | 'God' | 'Titan' | 'Olympian'
export type CameraPhase = 'landing' | 'entering' | 'inside'
export type BattlePhase = 'PENDING' | 'PREPARING' | 'ACTIVE' | 'SETTLED' | 'COMPLETE'

export interface Agent {
  tokenId: bigint
  name: string              // e.g. "achilles"
  ensName: string           // "achilles.pantheon.eth"
  archetype: Archetype
  elo: number
  rank: Rank
  wins: number
  losses: number
  storageHash: string
  lineage?: { parent1: bigint; parent2: bigint }
  badges: string[]
  owner?: string
}

export interface AXLMessage {
  id: string
  from: string              // node short ID
  type: 'MOVE' | 'SCORE' | 'VERDICT' | 'ACK'
  content: string
  timestamp: number
  nodeColor: 'sky' | 'hadria' | 'willa'
}

export interface Battle {
  id: string
  agentA: Agent
  agentB: Agent
  round: number
  healthA: number           // 0–100
  healthB: number           // 0–100
  phase: BattlePhase
  wageredA: bigint          // total in pool for A
  wageredB: bigint          // total in pool for B
  startedAt: number
}

export interface RoundScore {
  round: number
  scoreA: number
  scoreB: number
  reasoning: string
}

export interface ForgeState {
  archetype: Archetype | null
  name: string
  nameStatus: 'idle' | 'checking' | 'available' | 'taken'
  directive: string
  stage: 0 | 1 | 2 | 3 | 4 | 5  // wizard step + forge stage
  txHashes: Partial<Record<'storage' | 'mint' | 'ens', string>>
}

interface GameState {
  // ── Wallet ──────────────────────────────
  address: `0x${string}` | null
  ensName: string | null
  setWallet: (address: `0x${string}` | null, ensName?: string) => void

  // ── Agents ──────────────────────────────
  ownedAgents: Agent[]
  selectedAgent: Agent | null
  setOwnedAgents: (agents: Agent[]) => void
  setSelectedAgent: (agent: Agent | null) => void

  // ── Active battle ────────────────────────
  activeBattle: Battle | null
  battleLog: AXLMessage[]
  roundScores: RoundScore[]
  setActiveBattle: (battle: Battle | null) => void
  addBattleEvent: (event: { type: string; data: unknown }) => void

  // ── Forge ────────────────────────────────
  forgeState: ForgeState
  updateForge: (partial: Partial<ForgeState>) => void
  resetForge: () => void

  // ── Scene / Audio ────────────────────────
  cameraPhase: CameraPhase
  setCameraPhase: (phase: CameraPhase) => void
  torchIntensity: number
  masterVolume: number
  setMasterVolume: (v: number) => void
  ambientPlaying: boolean
  setAmbientPlaying: (v: boolean) => void

  // ── Season ───────────────────────────────
  leaderboard: Agent[]
  setLeaderboard: (agents: Agent[]) => void
}

const createDefaultForgeState = (): ForgeState => ({
  archetype: null,
  name: '',
  nameStatus: 'idle',
  directive: '',
  stage: 0,
  txHashes: {},
})

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    immer((set) => ({
      // Wallet
      address: null,
      ensName: null,
      setWallet: (address, ensName) =>
        set((s) => { s.address = address; s.ensName = ensName ?? null }),

      // Agents
      ownedAgents: [],
      selectedAgent: null,
      setOwnedAgents: (agents) => set((s) => { s.ownedAgents = agents }),
      setSelectedAgent: (agent) => set((s) => { s.selectedAgent = agent }),

      // Battle
      activeBattle: null,
      battleLog: [],
      roundScores: [],
      setActiveBattle: (battle) => set((s) => { s.activeBattle = battle }),
      addBattleEvent: (event) => set((s) => {
        switch (event.type) {
          case 'axl_message': {
            const msg = event.data as AXLMessage
            s.battleLog.push(msg)
            if (s.battleLog.length > 50) s.battleLog.shift()
            break
          }
          case 'round_score': {
            const score = event.data as RoundScore
            s.roundScores.push(score)
            if (s.activeBattle) {
              // Update health bars based on cumulative scores
              const totalA = s.roundScores.reduce((acc, r) => acc + r.scoreA, 0)
              const totalB = s.roundScores.reduce((acc, r) => acc + r.scoreB, 0)
              const maxTotal = Math.max(totalA + totalB, 1)
              s.activeBattle.healthA = Math.round((totalA / maxTotal) * 100)
              s.activeBattle.healthB = Math.round((totalB / maxTotal) * 100)
              s.activeBattle.round = score.round
            }
            break
          }
          case 'battle_phase': {
            if (s.activeBattle) {
              s.activeBattle.phase = event.data as BattlePhase
            }
            break
          }
          default:
            break
        }
      }),

      // Forge
      forgeState: createDefaultForgeState(),
      updateForge: (partial) => set((s) => { Object.assign(s.forgeState, partial) }),
      resetForge: () => set((s) => { s.forgeState = createDefaultForgeState() }),

      // Scene
      cameraPhase: 'landing',
      setCameraPhase: (phase) => set((s) => { s.cameraPhase = phase }),
      torchIntensity: 1,
      masterVolume: 0.4,
      setMasterVolume: (v) => set((s) => { s.masterVolume = v }),
      ambientPlaying: false,
      setAmbientPlaying: (v) => set((s) => { s.ambientPlaying = v }),

      // Season
      leaderboard: [],
      setLeaderboard: (agents) => set((s) => { s.leaderboard = agents }),
    }))
  )
)
