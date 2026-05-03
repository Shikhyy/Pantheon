// lib/contracts.ts
// wagmi contract hooks for Pantheon contracts

export const PANTHEON_AGENT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'archetype', type: 'uint8' },
      { name: 'name', type: 'string' },
      { name: 'storageHash', type: 'bytes32' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    name: 'getAgent',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'archetype', type: 'uint8' },
          { name: 'elo', type: 'uint16' },
          { name: 'xp', type: 'uint32' },
          { name: 'rank', type: 'uint8' },
          { name: 'battleCount', type: 'uint32' },
          { name: 'wins', type: 'uint32' },
          { name: 'losses', type: 'uint32' },
          { name: 'storageHash', type: 'bytes32' },
          { name: 'directiveHash', type: 'bytes32' },
          { name: 'parent1', type: 'uint256' },
          { name: 'parent2', type: 'uint256' },
          { name: 'mintedAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'tokensOfOwner',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getNameByTokenId',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'AgentMinted',
    type: 'event',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'archetype', type: 'uint8', indexed: false },
    ],
  },
] as const

export const BATTLE_ARENA_ABI = [
  {
    name: 'challenge',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'challengerTokenId', type: 'uint256' },
      { name: 'defenderTokenId', type: 'uint256' },
      { name: 'wagerToken', type: 'address' },
      { name: 'wagerAmount', type: 'uint256' },
    ],
    outputs: [{ name: 'battleId', type: 'bytes32' }],
  },
  {
    name: 'accept',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'battleId', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'battles',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'battleId', type: 'bytes32' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'challengerTokenId', type: 'uint256' },
          { name: 'defenderTokenId', type: 'uint256' },
          { name: 'challengerOwner', type: 'address' },
          { name: 'defenderOwner', type: 'address' },
          { name: 'wagerToken', type: 'address' },
          { name: 'wagerAmount', type: 'uint256' },
          { name: 'phase', type: 'uint8' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'startedAt', type: 'uint256' },
          { name: 'winner', type: 'address' },
          { name: 'transcriptHash', type: 'bytes32' },
        ],
      },
    ],
  },
  {
    name: 'BattleCreated',
    type: 'event',
    inputs: [
      { name: 'battleId', type: 'bytes32', indexed: true },
      { name: 'challenger', type: 'uint256', indexed: false },
      { name: 'defender', type: 'uint256', indexed: false },
      { name: 'wagerAmount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'BattleSettled',
    type: 'event',
    inputs: [
      { name: 'battleId', type: 'bytes32', indexed: true },
      { name: 'winner', type: 'address', indexed: true },
      { name: 'winnerEloGain', type: 'uint256', indexed: false },
    ],
  },
] as const

export const BREEDING_FORGE_ABI = [
  {
    name: 'breed',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'parent1Id', type: 'uint256' },
      { name: 'parent2Id', type: 'uint256' },
      { name: 'offspringName', type: 'string' },
      { name: 'offspringStorageHash', type: 'bytes32' },
      { name: 'preimage', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'commitBreed',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'commitHash', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'OffspringMinted',
    type: 'event',
    inputs: [
      { name: 'offspringId', type: 'uint256', indexed: true },
      { name: 'parent1', type: 'uint256', indexed: false },
      { name: 'parent2', type: 'uint256', indexed: false },
      { name: 'legendary', type: 'bool', indexed: false },
    ],
  },
] as const

export const AGORA_POOL_ABI = [
  {
    name: 'placeWager',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'battleId', type: 'bytes32' },
      { name: 'amount', type: 'uint256' },
      { name: 'onChallenger', type: 'bool' },
    ],
    outputs: [],
  },
  {
    name: 'claimWinnings',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'battleId', type: 'bytes32' }],
    outputs: [],
  },
] as const

export const ENS_SUBNAMES_ABI = [
  {
    name: 'registerSubname',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'setText',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'text',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'string' }],
  },
] as const

export const IERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const UNISWAP_V3_ROUTER_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'params', type: 'tuple', components: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'fee', type: 'uint24' },
        { name: 'recipient', type: 'address' },
        { name: 'deadline', type: 'uint256' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'amountOutMinimum', type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ]},
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
  {
    name: 'exactOutputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'params', type: 'tuple', components: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'fee', type: 'uint24' },
        { name: 'recipient', type: 'address' },
        { name: 'deadline', type: 'uint256' },
        { name: 'amountOut', type: 'uint256' },
        { name: 'amountInMaximum', type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ]},
    ],
    outputs: [{ name: 'amountIn', type: 'uint256' }],
  },
] as const

const UNISWAP_V3_ROUTER_MAINNET = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
const UNISWAP_V3_ROUTER_SEPOLIA = '0x3bFA4769FB09e5C2F2dB9844f1d6f8FB6f1D8b44'

export function getUniswapRouterAddress(chainId: number): `0x${string}` {
  if (chainId === 16602 || chainId === 1) return UNISWAP_V3_ROUTER_MAINNET
  return UNISWAP_V3_ROUTER_SEPOLIA as `0x${string}`
}

// Contract addresses - Deployed on 0G Galileon Testnet
// For production, these would come from env vars
const PANTHEON_AGENT_ADDRESS = '0x5F119f1bC1C67c41f4e045B46065933Ea4A7bbEE'
const BATTLE_ARENA_ADDRESS = '0xE53e1Ba2105f1c6bC88Af523652E0938eccb7945'
const AGORA_POOL_ADDRESS = '0xb73A2Da54734D227747e5BD837498172853740ba'
const BREEDING_FORGE_ADDRESS = '0x07e3998E05DC4A5CCADae9979E539397D92B794E'
const ENS_SUBNAMES_ADDRESS = '0x39CF69380C8D66037305655Ebb7B4C9163aE4E18'

export const CONTRACT_ADDRESSES = {
  pantheonAgent: (process.env.NEXT_PUBLIC_PANTHEON_AGENT ?? PANTHEON_AGENT_ADDRESS) as `0x${string}`,
  battleArena:   (process.env.NEXT_PUBLIC_BATTLE_ARENA   ?? BATTLE_ARENA_ADDRESS) as `0x${string}`,
  agoraPool:     (process.env.NEXT_PUBLIC_AGORA_POOL      ?? AGORA_POOL_ADDRESS) as `0x${string}`,
  ensSubnames:   (process.env.NEXT_PUBLIC_ENS_SUBNAME_REGISTRAR ?? ENS_SUBNAMES_ADDRESS) as `0x${string}`,
  breedingForge: (process.env.NEXT_PUBLIC_BREEDING_FORGE ?? BREEDING_FORGE_ADDRESS) as `0x${string}`,
}
