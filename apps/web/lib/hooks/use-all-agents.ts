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
  ensName?: string
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
    contracts.push({
      address: CONTRACT_ADDRESSES.pantheonAgent,
      abi: [
        {
          name: 'ownerOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'tokenId', type: 'uint256' }],
          outputs: [{ name: '', type: 'address' }],
        },
      ] as const,
      functionName: 'ownerOf',
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
      const agentDataResult = results[i * 3]
      const nameResult = results[i * 3 + 1]
      const ownerResult = results[i * 3 + 2]

      if (agentDataResult?.status === 'success' && nameResult?.status === 'success') {
        const agentData = agentDataResult.result as any
        agents.push({
          id: (i + 1).toString(),
          name: nameResult.result as unknown as string,
          archetype: ARCHETYPES[Number(agentData.archetype)] || 'Unknown',
          elo: Number(agentData.elo),
          rank: Number(agentData.rank),
          wins: Number(agentData.wins),
          losses: Number(agentData.losses),
          xp: Number(agentData.xp),
          battleCount: Number(agentData.battleCount),
          storageHash: agentData.storageHash,
          directiveHash: agentData.directiveHash,
          owner: (ownerResult?.result as string) || '0x0000000000000000000000000000000000000000',
        })
      }
    }
  }

  return { agents, isLoading }
}
