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

export const CONTRACT_ADDRESSES = {
  pantheonAgent: (process.env.NEXT_PUBLIC_PANTHEON_AGENT ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  battleArena:   (process.env.NEXT_PUBLIC_BATTLE_ARENA   ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  agoraPool:     (process.env.NEXT_PUBLIC_AGORA_POOL      ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  ensSubnames:   (process.env.NEXT_PUBLIC_ENS_SUBNAME_REGISTRAR ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
}
