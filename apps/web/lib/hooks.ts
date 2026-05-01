// lib/hooks.ts
// Contract hooks for Pantheon

import { useReadContract, useWriteContract } from 'wagmi'
import { useAccount, useConnectors, useDisconnect } from 'wagmi'
import { parseEther } from 'viem'
import { PANTHEON_AGENT_ABI, BATTLE_ARENA_ABI, BREEDING_FORGE_ABI, AGORA_POOL_ABI, CONTRACT_ADDRESSES } from './contracts'
import { useGameStore, type Agent, type Archetype, type Rank } from './store'

const RANK_LABELS: Rank[] = ['Demigod', 'Hero', 'God', 'Titan', 'Olympian']
const ARCHETYPE_LABELS: Archetype[] = ['Strategist', 'Oracle', 'Berserker', 'Diplomat']

export function useWallet() {
  const { address, isConnected } = useAccount()
  const connectors = useConnectors()
  const { disconnect } = useDisconnect()
  const setWallet = useGameStore((s) => s.setWallet)

  return {
    address,
    isConnected,
    connect: () => connectors[0]?.connect(),
    disconnect,
    setWallet,
  }
}

export function useTotalSupply() {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESSES.pantheonAgent,
    abi: PANTHEON_AGENT_ABI,
    functionName: 'totalSupply',
  })
  return data ? Number(data) : 0
}

export function useTokensOfOwner(owner: string | undefined) {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESSES.pantheonAgent,
    abi: PANTHEON_AGENT_ABI,
    functionName: 'tokensOfOwner',
    args: owner ? [owner as `0x${string}`] : undefined,
    query: { enabled: !!owner },
  })
  return data?.map((id) => BigInt(id)) ?? []
}

export function useGetAgent(tokenId: bigint | undefined) {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.pantheonAgent,
    abi: PANTHEON_AGENT_ABI,
    functionName: 'getAgent',
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId },
  })
  return { data, isLoading }
}

export function useGetAgentName(tokenId: bigint | undefined) {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESSES.pantheonAgent,
    abi: PANTHEON_AGENT_ABI,
    functionName: 'getNameByTokenId',
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId },
  })
  return data || ''
}

export function useMintAgent() {
  const { writeContract, data, error, isPending } = useWriteContract()

  const mint = async (archetype: number, name: string, storageHash: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.pantheonAgent,
      abi: PANTHEON_AGENT_ABI,
      functionName: 'mint',
      args: [archetype, name, storageHash],
    })
  }

  return { mint, hash: data, isPending, error }
}

export function useChallenge() {
  const { writeContract, data, error, isPending } = useWriteContract()

  const challenge = async (
    challengerTokenId: bigint,
    defenderTokenId: bigint,
    wagerAmount: bigint
  ) => {
    writeContract({
      address: CONTRACT_ADDRESSES.battleArena,
      abi: BATTLE_ARENA_ABI,
      functionName: 'challenge',
      args: [challengerTokenId, defenderTokenId, CONTRACT_ADDRESSES.pantheonAgent, wagerAmount],
      value: wagerAmount,
    })
  }

  return { challenge, hash: data, isPending, error }
}

export function useAccept() {
  const { writeContract, data, error, isPending } = useWriteContract()

  const accept = async (battleId: `0x${string}`, wagerAmount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.battleArena,
      abi: BATTLE_ARENA_ABI,
      functionName: 'accept',
      args: [battleId],
      value: wagerAmount,
    })
  }

  return { accept, hash: data, isPending, error }
}

export function useBattle(battleId: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.battleArena,
    abi: BATTLE_ARENA_ABI,
    functionName: 'battles',
    args: battleId ? [battleId] : undefined,
    query: { enabled: !!battleId },
  })
  return { data, isLoading }
}

export function useBreed() {
  const { writeContract, data, error, isPending } = useWriteContract()

  const breed = async (
    parent1Id: bigint,
    parent2Id: bigint,
    offspringName: string,
    offspringStorageHash: `0x${string}`,
    preimage: `0x${string}`
  ) => {
    writeContract({
      address: CONTRACT_ADDRESSES.breedingForge,
      abi: BREEDING_FORGE_ABI,
      functionName: 'breed',
      args: [parent1Id, parent2Id, offspringName, offspringStorageHash, preimage],
      value: parseEther('0.01'),
    })
  }

  return { breed, hash: data, isPending, error }
}

export function usePlaceWager() {
  const { writeContract, data, error, isPending } = useWriteContract()

  const placeWager = async (battleId: `0x${string}`, amount: bigint, onChallenger: boolean) => {
    writeContract({
      address: CONTRACT_ADDRESSES.agoraPool,
      abi: AGORA_POOL_ABI,
      functionName: 'placeWager',
      args: [battleId, amount, onChallenger],
    })
  }

  return { placeWager, hash: data, isPending, error }
}