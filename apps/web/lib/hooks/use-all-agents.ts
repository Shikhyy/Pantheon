import { useReadContract, useReadContracts } from 'wagmi'
import { CONTRACT_ADDRESSES, PANTHEON_AGENT_ABI } from '../contracts'

export interface LiveAgent {
  id: string
  name: string
  archetype: string
  elo: number
  rank: number
  wins: number
  losses: number
  xp: number
  battleCount: number
  storageHash: string
  directiveHash: string
  owner: string
}

const ARCHETYPES = ['Unknown', 'Strategist', 'Berserker', 'Oracle', 'Diplomat']

export function useAllAgents() {
  const { data: totalSupplyRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.pantheonAgent,
    abi: PANTHEON_AGENT_ABI,
    functionName: 'totalSupply',
  })

  const totalSupply = Number(totalSupplyRaw || 0n)
  
  const contracts = []
  for (let i = 1; i <= totalSupply; i++) {
    contracts.push({
      address: CONTRACT_ADDRESSES.pantheonAgent,
      abi: PANTHEON_AGENT_ABI,
      functionName: 'getAgent',
      args: [BigInt(i)],
    })
    contracts.push({
      address: CONTRACT_ADDRESSES.pantheonAgent,
      abi: PANTHEON_AGENT_ABI,
      functionName: 'getNameByTokenId',
      args: [BigInt(i)],
    })
  }

  const { data: results, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: totalSupply > 0,
    }
  })

  const agents: LiveAgent[] = []
  
  if (results) {
    for (let i = 0; i < totalSupply; i++) {
      const agentDataResult = results[i * 2]
      const nameResult = results[i * 2 + 1]

      if (agentDataResult?.status === 'success' && nameResult?.status === 'success') {
        const agentData = agentDataResult.result as any
        agents.push({
          id: (i + 1).toString(),
          name: nameResult.result as string,
          archetype: ARCHETYPES[Number(agentData.archetype)] || 'Unknown',
          elo: Number(agentData.elo),
          rank: Number(agentData.rank),
          wins: Number(agentData.wins),
          losses: Number(agentData.losses),
          xp: Number(agentData.xp),
          battleCount: Number(agentData.battleCount),
          storageHash: agentData.storageHash,
          directiveHash: agentData.directiveHash,
          owner: '0x', // Owner fetch requires ownerOf which is standard ERC721
        })
      }
    }
  }

  return { agents, isLoading }
}
