'use client'

import { useReadContract } from 'wagmi'
import { ENS_SUBNAMES_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts'
import { namehash } from 'viem'

export interface DiscoveredAgent {
  tokenId: number
  name: string
  ensName: string
  elo: number
  rank: string
  archetype: string
  wins: number
  losses: number
}

const AGENT_INDEX_NODE = namehash('agents.pantheon.eth')

export function useAgentDiscovery(archetype?: string, minElo?: number) {
  const { data: agentCountStr } = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [AGENT_INDEX_NODE, 'count'],
  })

  const agentCount = agentCountStr ? parseInt(agentCountStr) : 0

  // Return filtered agents based on criteria
  // In production, would query from a proper index
  return {
    agents: [] as DiscoveredAgent[],
    totalCount: agentCount,
    isLoading: false,
  }
}

export function useAgentByENSName(name: string) {
  const node = namehash(`${name}.pantheon.eth`)
  
  const { data: elo } = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'elo'],
  })

  const { data: rank } = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'rank'],
  })

  const { data: archetype } = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'archetype'],
  })

  const { data: wins } = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'wins'],
  })

  const { data: losses } = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'losses'],
  })

  const agent: DiscoveredAgent | null = (elo || rank) ? {
    tokenId: 0,
    name,
    ensName: `${name}.pantheon.eth`,
    elo: elo ? parseInt(elo) : 0,
    rank: rank || 'Challenger',
    archetype: archetype || 'Unknown',
    wins: wins ? parseInt(wins) : 0,
    losses: losses ? parseInt(losses) : 0,
  } : null

  return { 
    agent, 
    isLoading: !elo && !rank 
  }
}

export function useAgentSearch(query: string) {
  // Search agents by ENS name
  // Returns matching agents for discovery
  return useAgentByENSName(query)
}