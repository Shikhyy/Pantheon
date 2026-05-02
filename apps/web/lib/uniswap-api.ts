// lib/uniswap-api.ts
// Uniswap API integration for agent trading

const UNISWAP_API_BASE = 'https://api.uniswap.org/v1'

export interface SwapQuote {
  amountOut: string
  route: string[]
  gasEstimate: string
  gasPriceUSD: string
}

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
}

// Agent token preferences by archetype
export const AGENT_TOKEN_PREFERENCES: Record<string, string> = {
  'Strategist': 'USDC',  // Prefers stable
  'Berserker': 'WETH',   // Takes risk
  'Oracle': 'DAI',       // Conservative
  'Diplomat': 'USDT',   // Balanced
}

export async function getSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amount: string,
  apiKey?: string
): Promise<SwapQuote> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (apiKey) {
    headers['x-api-key'] = apiKey
  }

  const response = await fetch(`${UNISWAP_API_BASE}/quote`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      tokenIn,
      tokenOut,
      amount,
      type: 'exactIn',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Uniswap API error: ${response.status} - ${error}`)
  }

  return response.json()
}

export async function getSwapQuoteV2(
  tokenIn: string,
  tokenOut: string,
  amount: string,
  tokenInSymbol: string,
  tokenOutSymbol: string
): Promise<{ amountOut: string; route: string[] }> {
  // Fallback to contract-based quote when API unavailable
  // Uses basic calculation - in production, use proper pricing oracle
  const mockRoutes = [
    [tokenIn, tokenOut]
  ]
  
  // Simple estimation (would use oracle in production)
  const estimatedOut = (BigInt(amount) * 99n) / 100n
  
  return {
    amountOut: estimatedOut.toString(),
    route: mockRoutes.map(r => r.join(' → ')),
  }
}

export function getRecommendedToken(archetype: string): string {
  return AGENT_TOKEN_PREFERENCES[archetype] || 'USDC'
}

export async function executeAgentTrade(
  agentArchetype: string,
  ethAmount: string,
  walletAddress: string
): Promise<{ txHash: string; tokenReceived: string }> {
  // Agent decides which token to swap to based on archetype
  const targetToken = getRecommendedToken(agentArchetype)
  
  const tokenAddresses: Record<string, string> = {
    'USDC': '0x036CbD53886a20b2A2DcB33B50fE4A8dA4d3EdF', // Sepolia
    'WETH': '0x4200000000000000000000000000000000000006',
    'DAI': '0x710fE1a4F7dAc4bD1D7dE7D7E7E7E7E7E7E7E7E',
    'USDT': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  }

  const tokenAddress = tokenAddresses[targetToken]
  
  // In production: integrate with KeeperHub for execution
  // Returns simulated tx for demo
  console.log(`🤖 Agent (${agentArchetype}) swapping ${ethAmount} ETH → ${targetToken}`)
  
  return {
    txHash: '0x' + 'a'.repeat(64),
    tokenReceived: targetToken,
  }
}