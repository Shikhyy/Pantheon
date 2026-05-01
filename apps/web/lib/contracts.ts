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

// Contract addresses - hardcoded for local Anvil demo
// For production, these would come from env vars
const PANTHEON_AGENT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const BATTLE_ARENA_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
const AGORA_POOL_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
const BREEDING_FORGE_ADDRESS = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
const ENS_SUBNAMES_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

export const CONTRACT_ADDRESSES = {
  pantheonAgent: (process.env.NEXT_PUBLIC_PANTHEON_AGENT ?? PANTHEON_AGENT_ADDRESS) as `0x${string}`,
  battleArena:   (process.env.NEXT_PUBLIC_BATTLE_ARENA   ?? BATTLE_ARENA_ADDRESS) as `0x${string}`,
  agoraPool:     (process.env.NEXT_PUBLIC_AGORA_POOL      ?? AGORA_POOL_ADDRESS) as `0x${string}`,
  ensSubnames:   (process.env.NEXT_PUBLIC_ENS_SUBNAME_REGISTRAR ?? ENS_SUBNAMES_ADDRESS) as `0x${string}`,
  breedingForge: (process.env.NEXT_PUBLIC_BREEDING_FORGE ?? BREEDING_FORGE_ADDRESS) as `0x${string}`,
}
