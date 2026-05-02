'use client'

import { useReadContract } from 'wagmi'
import { BATTLE_ARENA_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts'
import { useEffect, useState } from 'react'
import { pad, stringToHex, decodeFunctionResult } from 'viem'

export interface BattleState {
  challengerTokenId: bigint
  defenderTokenId: bigint
  challengerOwner: string
  defenderOwner: string
  wagerToken: string
  wagerAmount: bigint
  phase: number
  createdAt: bigint
  startedAt: bigint
  winner: string
  transcriptHash: string
}

export function useBattle(battleId: string) {
  const [battleIdBytes, setBattleIdBytes] = useState<`0x${string}`>('0x0000000000000000000000000000000000000000000000000000000000000000')

  useEffect(() => {
    if (battleId && battleId.length > 2) {
      setBattleIdBytes(pad(stringToHex(battleId), { size: 32 }))
    }
  }, [battleId])

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.battleArena,
    abi: BATTLE_ARENA_ABI,
    functionName: 'battles',
    args: [battleIdBytes],
    query: { enabled: battleId !== undefined }
  })

  const battle = data as unknown as BattleState | undefined

  return { battle: battle ?? null, isLoading, error, refetch }
}

export function useBattlePhase(phase: number): string {
  const phases = ['None', 'Created', 'Accepted', 'InProgress', 'Settled', 'Cancelled']
  return phases[phase] || 'Unknown'
}