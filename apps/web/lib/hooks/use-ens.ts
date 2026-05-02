'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ENS_SUBNAMES_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts'
import { useMemo } from 'react'
import { namehash } from 'viem'

export function useAgentENS(tokenId: number) {
  const node = useMemo(() => {
    return namehash(`${tokenId}.pantheon.eth`)
  }, [tokenId])

  const elo = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'elo'],
  })

  const rank = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'rank'],
  })

  const wins = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'wins'],
  })

  const losses = useReadContract({
    address: CONTRACT_ADDRESSES.ensSubnames,
    abi: ENS_SUBNAMES_ABI,
    functionName: 'text',
    args: [node, 'losses'],
  })

  return {
    elo: elo.data as string | undefined,
    rank: rank.data as string | undefined,
    wins: wins.data as string | undefined,
    losses: losses.data as string | undefined,
    isLoading: elo.isLoading || rank.isLoading || wins.isLoading || losses.isLoading,
  }
}

export function useUpdateENS() {
  const { writeContract, data: hash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ 
    hash: hash ?? '0x' 
  })

  const setText = (tokenId: number, key: string, value: string) => {
    const node = namehash(`${tokenId}.pantheon.eth`)
    writeContract({
      address: CONTRACT_ADDRESSES.ensSubnames,
      abi: ENS_SUBNAMES_ABI,
      functionName: 'setText',
      args: [node, key, value],
    })
  }

  return { 
    setText, 
    hash: hash ?? undefined, 
    isWriting,
    isConfirming 
  }
}