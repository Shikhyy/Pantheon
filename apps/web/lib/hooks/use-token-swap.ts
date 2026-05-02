'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { IERC20_ABI, UNISWAP_V3_ROUTER_ABI, getUniswapRouterAddress } from '@/lib/contracts'
import { useAccount } from 'wagmi'
import { useState, useCallback } from 'react'

export function useTokenApproval() {
  const { writeContract, data: hash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ 
    hash: hash ?? '0x' 
  })
  const { chainId } = useAccount()

  const approve = useCallback(async (
    token: `0x${string}`, 
    spender: `0x${string}`, 
    amount: bigint
  ) => {
    writeContract({
      address: token,
      abi: IERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
    })
  }, [writeContract])

  return { 
    approve, 
    hash: hash ?? undefined, 
    isWriting,
    isConfirming 
  }
}

export interface SwapParams {
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  amountIn: bigint
  amountOutMinimum: bigint
  fee?: number
}

const DEFAULT_FEE = 3000

export function useTokenSwap() {
  const { writeContract, data: hash, isPending: isWriting, error } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ 
    hash: hash ?? '0x' 
  })
  const { chainId } = useAccount()
  const [pending, setPending] = useState(false)

  const swapExactInput = useCallback((params: SwapParams) => {
    setPending(true)
    const routerAddress = getUniswapRouterAddress(chainId ?? 31337)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300)
    
    writeContract({
      address: routerAddress,
      abi: UNISWAP_V3_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [{
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        fee: params.fee || DEFAULT_FEE,
        recipient: params.tokenIn,
        deadline,
        amountIn: params.amountIn,
        amountOutMinimum: params.amountOutMinimum,
        sqrtPriceLimitX96: 0n,
      }],
      value: params.tokenIn === '0x0000000000000000000000000000000000000000' ? params.amountIn : 0n,
    })
    setPending(false)
  }, [writeContract, chainId])

  return { swapExactInput, hash: hash ?? undefined, error, isWriting, isConfirming, pending }
}

export function getFeeTier(_tokenIn: string, _tokenOut: string): number {
  return DEFAULT_FEE
}