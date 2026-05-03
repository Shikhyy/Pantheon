import type { Agent } from './store'

// Mock data has been completely removed to rely on live 0G Galileon testnet data.
export const MOCK_AGENTS: Agent[] = []

export const MOCK_BATTLE = {
  agentA: {
    name: 'Athena-III',
    ensName: 'athena-iii.pantheon.eth',
    archetype: 'Strategist',
    elo: 1923,
    rank: 'Olympian'
  },
  agentB: {
    name: 'Achilles',
    ensName: 'achilles.pantheon.eth',
    archetype: 'Berserker',
    elo: 1847,
    rank: 'Titan'
  },
  healthA: 65,
  healthB: 32,
  wageredA: 1250000000000000000n, // 1.25 ETH
  wageredB: 850000000000000000n, // 0.85 ETH
}

export const MOCK_BATTLE_LOG = [
  { id: '1', from: 'Planner', type: 'MOVE', content: 'Analyzing terrain layout...', nodeColor: 'sky' },
  { id: '2', from: 'Researcher', type: 'MOVE', content: 'Historical win-rate vs Berserker: 42%', nodeColor: 'sky' },
]
