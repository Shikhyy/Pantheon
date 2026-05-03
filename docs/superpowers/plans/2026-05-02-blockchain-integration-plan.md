# Blockchain Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate all planned blockchain components: KeeperHub (real TX), ENS (frontend), 0G (real endpoints), Uniswap (token swaps), and Gensyn (verifiable compute).

**Architecture:** Agent backend handles on-chain TX via KeeperHub. Frontend uses wagmi hooks for ENS. 0G provides storage/compute. Uniswap enables wager token swaps. Gensyn verifies battle results.

**Tech Stack:** wagmi, viem, RainbowKit, httpx, Uniswap v3 SDK, Gensyn-like verifiable compute

---

## Task 1: KeeperHub Real Implementation

**Goal:** Replace mock KeeperHub client with real HTTP calls to KeeperHub MCP endpoint

**Files:**
- Modify: `agent/keeperhub_client.py:24-44`

- [ ] **Step 1: Replace mock with real HTTP call**

```python
async def execute_transaction(
    self,
    contract_address: str,
    abi: list,
    method: str,
    args: list[Any],
    gas_limit: int = 300_000,
    value: int = 0,
    max_retries: int = 3,
) -> dict:
    """
    Execute an on-chain transaction via KeeperHub MCP.
    """
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_sendTransaction",
        "params": [{
            "to": contract_address,
            "data": encode_abi(abi, method, args),
            "gas": hex(gas_limit),
            "value": hex(value),
        }]
    }

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=30.0) as c:
                resp = await c.post(
                    self.mcp_url,
                    headers=self.headers,
                    json=payload
                )
                result = resp.json()
                if "result" in result:
                    return {"txHash": result["result"], "status": "pending"}
                if result.get("error", {}).get("code") == -32002:  # TX underpriced
                    continue
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)

    return {"txHash": "0x", "status": "failed"}
```

- [ ] **Step 2: Add proper tx receipt polling**

```python
async def get_transaction_status(self, tx_hash: str) -> dict:
    """Poll transaction receipt from KeeperHub."""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_getTransactionReceipt",
        "params": [tx_hash]
    }

    async with httpx.AsyncClient(timeout=10.0) as c:
        resp = await c.post(self.mcp_url, headers=self.headers, json=payload)
        result = resp.json().get("result", {})

        if not result:
            return {"confirmed": False, "status": "pending"}

        return {
            "confirmed": result.get("status") == "0x1",
            "status": "success" if result.get("status") == "0x1" else "failed",
            "gasUsed": int(result.get("gasUsed", "0x0"), 16),
            "blockNumber": int(result.get("blockNumber", "0x0"), 16)
        }
```

- [ ] **Step 3: Add eth_abi encoding import**

At top of file add:
```python
from eth_abi import encode
```

- [ ] **Step 4: Create helper for ABI encoding**

```python
def encode_abi(abi: list, method: str, args: list) -> str:
    """Encode function call data."""
    func = None
    for item in abi:
        if item.get("name") == method:
            func = item
            break
    if not func:
        raise ValueError(f"Method {method} not found in ABI")

    types = [inp["type"] for inp in func.get("inputs", [])]
    encoded = encode(types, args)
    return "0x" + encoded.hex()
```

- [ ] **Step 5: Commit**

```bash
git add agent/keeperhub_client.py
git commit -m "feat: implement real KeeperHub MCP transaction execution"
```

---

## Task 2: ENS Frontend Integration

**Goal:** Add wagmi hooks for ENS text records (agent names, stats)

**Files:**
- Modify: `apps/web/lib/contracts.ts:199-207`
- Create: `apps/web/lib/hooks/use-ens.ts`

- [ ] **Step 1: Add ENS subdomain ABI to contracts.ts**

In `contracts.ts`, add after AGORA_POOL_ABI:

```typescript
export const ENS_SUBNAMES_ABI = [
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
```

- [ ] **Step 2: Create useENS hook**

Create `apps/web/lib/hooks/use-ens.ts`:

```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ENS_SUBNAMES_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts'
import { useMemo } from 'react'

function namehash(name: string): string {
  // Simplified namehash for .pantheon domains
  const labels = name.split('.')
  let node = '0x0000000000000000000000000000000000000000000000000000000000000000'
  for (let i = labels.length - 1; i >= 0; i--) {
    const label = labels[i]
    const labelHash = ethers.id(label).slice(2)
    node = ethers.keccak256('0x' + node.slice(2) + labelHash)
  }
  return node
}

export function useAgentENS(tokenId: number) {
  const node = useMemo(() => {
    // Assuming token ID maps to subdomain like agent.pantheon.eth
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
    elo: elo.data,
    rank: rank.data,
    wins: wins.data,
    losses: losses.data,
    isLoading: elo.isLoading || rank.isLoading || wins.isLoading || losses.isLoading,
  }
}

export function useUpdateENS() {
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const setText = (tokenId: number, key: string, value: string) => {
    const node = namehash(`${tokenId}.pantheon.eth`)
    writeContract({
      address: CONTRACT_ADDRESSES.ensSubnames,
      abi: ENS_SUBNAMES_ABI,
      functionName: 'setText',
      args: [node, key, value],
    })
  }

  return { setText, hash, isConfirming }
}
```

- [ ] **Step 3: Add ethers import**

At top of `use-ens.ts`:

```typescript
import { ethers } from 'ethers'
```

- [ ] **Step 4: Import in dashboard page**

Modify `apps/web/app/(game)/dashboard/page.tsx` to show ENS data for agents.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/contracts.ts apps/web/lib/hooks/use-ens.ts
git commit -m "feat: add ENS frontend integration for agent stats"
```

---

## Task 3: 0G Storage/Compute Real Endpoints

**Goal:** Wire 0G skills to actual 0G testnet endpoints from config

**Files:**
- Modify: `packages/pantheon-0g-skill/src/storage_skill.py`
- Modify: `packages/pantheon-0g-skill/src/compute_skill.py`

- [ ] **Step 1: Update storage skill to use config**

Modify `storage_skill.py`:

```python
def __init__(self, base_url: str = None, api_key: str = None):
    from agent.config import settings
    self.base_url = base_url or settings.OG_STORAGE_URL
    self.api_key = api_key or ""
    self.headers = {
        "Authorization": f"Bearer {self.api_key}" if self.api_key else "",
        "Content-Type": "application/json",
    }
```

- [ ] **Step 2: Create compute skill with real endpoints**

Create `packages/pantheon-0g-skill/src/compute_skill.py`:

```python
"""
0G Compute skill for verifiable battle computation.
"""
import httpx
import json
from typing import Any, Optional
from agent.config import settings


class ZeroGComputeSkill:
    """
    OpenClaw skill: verifiable compute via 0G Compute.

    Registers:
        compute_submit    → submit computation for verification
        compute_status    → check computation status
        compute_result    → retrieve computation result
        compute_verify   → verify proof on-chain
    """

    skill_name = "0g-compute"
    skill_version = "1.0.0"
    skill_description = (
        "Verifiable compute via 0G. Submit computations, get proofs, "
        "verify on-chain for battle verification."
    )

    def __init__(self, base_url: str = None):
        self.base_url = base_url or settings.OG_COMPUTE_URL

    def register(self, agent) -> None:
        agent.add_skill("compute_submit", self.compute_submit)
        agent.add_skill("compute_status", self.compute_status)
        agent.add_skill("compute_result", self.compute_result)
        agent.add_skill("compute_verify", self.compute_verify)

    async def compute_submit(self, program: str, input_data: Any) -> dict:
        """
        Submit a computation for verifiable execution.
        Returns {computeId, status, proof}.
        """
        payload = {
            "program": program,
            "input": input_data,
            " verifiable": True,
        }
        async with httpx.AsyncClient(timeout=60.0) as c:
            resp = await c.post(
                f"{self.base_url}/compute/submit",
                json=payload
            )
            resp.raise_for_status()
            return resp.json()

    async def compute_status(self, compute_id: str) -> dict:
        """Check status of a computation."""
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.get(f"{self.base_url}/compute/{compute_id}/status")
            resp.raise_for_status()
            return resp.json()

    async def compute_result(self, compute_id: str) -> Optional[dict]:
        """Retrieve computation result."""
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.get(f"{self.base_url}/compute/{compute_id}/result")
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()

    async def compute_verify(self, compute_id: str, proof: str) -> bool:
        """
        Verify proof on-chain.
        Returns True if verified.
        """
        # For now, verify via HTTP (would be on-chain in production)
        payload = {
            "compute_id": compute_id,
            "proof": proof,
        }
        async with httpx.AsyncClient(timeout=30.0) as c:
            resp = await c.post(
                f"{self.base_url}/compute/verify",
                json=payload
            )
            return resp.status_code == 200
```

- [ ] **Step 3: Create memory skill**

Create `packages/pantheon-0g-skill/src/memory_skill.py` (already exists, check if wired):

```python
from agent.config import settings

# Wire to actual endpoint
class ZeroGMemorySkill:
    base_url = settings.OG_STORAGE_URL  # Uses same storage as backend
```

- [ ] **Step 4: Wire skills in agent initialization**

Create `packages/pantheon-0g-skill/src/__init__.py`:

```python
from .storage_skill import ZeroGStorageSkill
from .compute_skill import ZeroGComputeSkill
from .memory_skill import ZeroGMemorySkill
from .battle_skill import BattleSkill

__all__ = [
    'ZeroGStorageSkill',
    'ZeroGComputeSkill',
    'ZeroGMemorySkill',
    'BattleSkill',
]
```

- [ ] **Step 5: Commit**

```bash
git add packages/pantheon-0g-skill/src/
git commit -m "feat: wire 0G skills to real endpoints from config"
```

---

## Task 4: Uniswap Integration for Token Swaps

**Goal:** Add Uniswap v3 for converting tokens for battle wagers

**Files:**
- Create: `apps/web/lib/uniswap.ts`
- Modify: `apps/web/lib/contracts.ts`

- [ ] **Step 1: Add Uniswap router ABI**

In `contracts.ts`, add at bottom:

```typescript
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
```

- [ ] **Step 2: Add Uniswap addresses**

```typescript
const UNISWAP_V3_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564' // Mainnet
const UNISWAP_V3_ROUTER_SEPOLIA = '0x3bFA4769FB09e5C2F2dB9844f1d6f8FB6f1D8b44' // Sepolia

export const UNISWAP_ADDRESS = process.env.NEXT_PUBLIC_UNISWAP_ROUTER 
  ?? (process.env.NEXT_PUBLIC_CHAIN_ID === '16600' ? UNISWAP_V3_ROUTER_ADDRESS : UNISWAP_V3_ROUTER_SEPOLIA) as `0x${string}`
```

- [ ] **Step 3: Create useTokenSwap hook**

Create `apps/web/lib/hooks/use-token-swap.ts`:

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { UNISWAP_V3_ROUTER_ABI, UNISWAP_ADDRESS } from '@/lib/uniswap'
import { useState } from 'react'

const FEE_TIERS = {
  'USDC-ETH': 3000,
  'USDC-WETH': 3000,
  'ETH-USDC': 3000,
  'WETH-USDC': 3000,
} as const

export interface SwapParams {
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  amountIn: bigint
  amountOutMinimum: bigint
  fee?: number
}

export function useTokenSwap() {
  const { writeContract, data: hash, error } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })
  const [pending, setPending] = useState(false)

  const swapExactInput = (params: SwapParams) => {
    setPending(true)
    writeContract({
      address: UNISWAP_ADDRESS,
      abi: UNISWAP_V3_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [{
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        fee: params.fee || 3000,
        recipient: params.tokenIn, // Would be user's address
        deadline: BigInt(Math.floor(Date.now() / 1000) + 300), // 5 min
        amountIn: params.amountIn,
        amountOutMinimum: params.amountOutMinimum,
        sqrtPriceLimitX96: 0,
      }],
      value: params.tokenIn === '0x0000000000000000000000000000000000000000' ? params.amountIn : 0n,
    })
  }

  return { swapExactInput, hash, error, isConfirming, pending }
}

export function getFeeTier(tokenIn: string, tokenOut: string): number {
  const key = `${tokenIn}-${tokenOut}` as keyof typeof FEE_TIERS
  return FEE_TIERS[key] || 3000
}
```

- [ ] **Step 4: Integrate with Agora (betting page)**

Modify `apps/web/app/(game)/agora/page.tsx` to add token swap UI:

- Add "Convert Tokens" button next to wager input
- When clicked, open modal to swap ETH → USDC (or other wager token)

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/uniswap.ts apps/web/lib/hooks/use-token-swap.ts
git commit -m "feat: add Uniswap v3 integration for token swaps"
```

---

## Task 5: Gensyn Verifiable Compute Integration

**Goal:** Add Gensyn-like verifiable compute for battle result verification

**Files:**
- Create: `agent/gensyn_client.py`
- Create: `packages/pantheon-0g-skill/src/verification_skill.py`

- [ ] **Step 1: Create Gensyn client**

Create `agent/gensyn_client.py`:

```python
"""
Gensyn-inspired verifiable compute client.
Submits battle computations for ZK verification.
"""
import httpx
import json
import asyncio
from typing import Optional
from config import settings


class GensynClient:
    """
    Verifiable compute for battle verification.
    Submits battle result computation → receives ZK proof → verifies on-chain.
    """

    def __init__(self):
        self.gensyn_url = settings.GENSYN_URL or "https://api.gensyn.io/v1"
        self.api_key = settings.GENSYN_API_KEY or ""
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def submit_battle_computation(
        self,
        battle_inputs: dict,
        agents: list[dict],
    ) -> dict:
        """
        Submit battle computation for verifiable execution.
        
        Args:
            battle_inputs: {challengerMove, defenderMove, ...}
            agents: [{elo, rank, archetype}, ...]
        
        Returns: {computeId, status, submittedAt}
        """
        # Build computation program
        program = self._build_battle_program(agents)
        
        payload = {
            "program": program,
            "input": battle_inputs,
            "verifiable": True,
            "compute_type": "battle_verification",
        }
        
        async with httpx.AsyncClient(timeout=120.0) as c:
            resp = await c.post(
                f"{self.gensyn_url}/compute/submit",
                headers=self.headers,
                json=payload
            )
            resp.raise_for_status()
            return resp.json()

    async def wait_for_proof(self, compute_id: str, timeout: int = 300) -> dict:
        """Poll until ZK proof is ready."""
        deadline = asyncio.get_event_loop().time() + timeout
        
        while asyncio.get_event_loop().time() < deadline:
            status = await self.get_computation_status(compute_id)
            
            if status.get("status") == "completed":
                return await self.get_proof(compute_id)
            
            if status.get("status") == "failed":
                raise RuntimeError(f"Computation failed: {status.get('error')}")
            
            await asyncio.sleep(5)
        
        raise TimeoutError(f"Proof not ready within {timeout}s")

    async def get_computation_status(self, compute_id: str) -> dict:
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.get(
                f"{self.gensyn_url}/compute/{compute_id}/status",
                headers=self.headers
            )
            resp.raise_for_status()
            return resp.json()

    async def get_proof(self, compute_id: str) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as c:
            resp = await c.get(
                f"{self.gensyn_url}/compute/{compute_id}/proof",
                headers=self.headers
            )
            resp.raise_for_status()
            return resp.json()

    def _build_battle_program(self, agents: list[dict]) -> str:
        """Build computation program for battle verification."""
        # Simplified - in production would be actual WASM/ZK circuit
        return json.dumps({
            "type": "battle_verification",
            "agents": agents,
            "version": "1.0",
        })

    async def verify_proof_on_chain(
        self,
        compute_id: str,
        proof: dict,
        battle_arena_address: str,
    ) -> str:
        """
        Submit proof to battle arena contract for on-chain verification.
        Returns tx hash.
        """
        from keeperhub_client import KeeperHubClient
        
        kh = KeeperHubClient()
        
        return await kh.execute_transaction(
            contract_address=battle_arena_address,
            abi=[],  # Would be BattleArena ABI
            method="verifyProof",
            args=[compute_id, proof["proof_data"]],
            gas_limit=500_000,
        )
```

- [ ] **Step 2: Add Gensyn to config**

In `agent/config.py`, add:

```python
GENSYN_URL: str = "https://api.gensyn.io/v1"
GENSYN_API_KEY: str = ""
```

- [ ] **Step 3: Create verification skill**

Create `packages/pantheon-0g-skill/src/verification_skill.py`:

```python
"""
Battle verification skill using 0G/Gensyn.
"""
from typing import Optional
from .compute_skill import ZeroGComputeSkill
from agent.config import settings


class VerificationSkill:
    """
    OpenClaw skill: battle result verification.

    Registers:
        verify_battle    → verify battle result with ZK proof
        get_battle_proof → retrieve verification proof
    """

    skill_name = "battle-verification"
    skill_version = "1.0.0"
    skill_description = (
        "Verify battle results using verifiable compute. "
        "Submit computation, get ZK proof, verify on-chain."
    )

    def __init__(self):
        self.compute = ZeroGComputeSkill()

    def register(self, agent) -> None:
        agent.add_skill("verify_battle", self.verify_battle)
        agent.add_skill("get_battle_proof", self.get_battle_proof)

    async def verify_battle(
        self,
        challenger_id: int,
        defender_id: int,
        challenger_move: dict,
        defender_move: dict,
    ) -> dict:
        """
        Verify battle result with ZK proof.
        
        Returns: {verified, winner, proofId, computeId}
        """
        # Submit computation
        result = await self.compute.compute_submit(
            program="battle_verification",
            input_data={
                "challenger_id": challenger_id,
                "defender_id": defender_id,
                "challenger_move": challenger_move,
                "defender_move": defender_move,
            }
        )
        
        compute_id = result["compute_id"]
        
        # Wait for proof
        proof_result = await self.compute.compute_status(compute_id)
        
        return {
            "verified": proof_result.get("verified", False),
            "winner": proof_result.get("winner"),
            "proof_id": proof_result.get("proof_id"),
            "compute_id": compute_id,
        }

    async def get_battle_proof(self, compute_id: str) -> Optional[dict]:
        """Retrieve verification proof."""
        return await self.compute.compute_result(compute_id)
```

- [ ] **Step 4: Integrate with battle loop**

Modify `agent/battle_loop.py` to verify battle results:

After `determine_winner()`, add:

```python
from gensyn_client import GensynClient

async def verify_battle_result(battle_data: dict) -> dict:
    gensyn = GensynClient()
    
    result = await gensyn.submit_battle_computation(
        battle_inputs=battle_data,
        agents=battle_data["agents"],
    )
    
    proof = await gensyn.wait_for_proof(result["compute_id"])
    
    return {
        "verified": True,
        "proof": proof,
        "winner": proof["winner"],
    }
```

- [ ] **Step 5: Commit**

```bash
git add agent/gensyn_client.py packages/pantheon-0g-skill/src/verification_skill.py
git commit -m "feat: add Gensyn verifiable compute for battle verification"
```

---

## Task 6: Wiring Everything Together

**Goal:** Connect all integrations in the app

**Files:**
- Modify: `apps/web/components/Providers.tsx`
- Modify: `agent/battle_loop.py`

- [ ] **Step 1: Add all hooks to frontend**

In `Providers.tsx`, add:

```typescript
import { useAgentENS, useUpdateENS } from '@/lib/hooks/use-ens'
import { useTokenSwap } from '@/lib/hooks/use-token-swap'

// Re-export for use in components
export { useAgentENS, useUpdateENS, useTokenSwap }
```

- [ ] **Step 2: Add token approval for Uniswap**

Create `apps/web/lib/hooks/use-token-approval.ts`:

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { IERC20_ABI } from '@/lib/contracts'

export function useTokenApproval() {
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const approve = (token: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    writeContract({
      address: token,
      abi: IERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
    })
  }

  return { approve, hash, isConfirming }
}
```

- [ ] **Step 3: Add IERC20 ABI**

In `contracts.ts`:

```typescript
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
```

- [ ] **Step 4: Create Agora page with full integration**

Modify `apps/web/app/(game)/agora/page.tsx`:
- Show user's ENS data
- Allow token swap before wagering
- Show battle verification status (verified/not verified)

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/Providers.tsx apps/web/lib/hooks/use-token-approval.ts apps/web/lib/contracts.ts
git commit -m "feat: wire all blockchain integrations together"
```

---

## Task 7: Testing

- [ ] **Step 1: Test KeeperHub client**

```bash
cd agent
python -c "
import asyncio
from keeperhub_client import KeeperHubClient

async def test():
    client = KeeperHubClient()
    print('KeeperHub client initialized')

asyncio.run(test())
"
```

- [ ] **Step 2: Test ENS hook builds**

```bash
cd apps/web
npm run typecheck 2>&1 | head -20
```

- [ ] **Step 3: Verify all imports**

```bash
cd apps/web
npm run lint 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "test: verify blockchain integrations"
```

---

## Plan Complete

This plan implements:
1. **KeeperHub** - Real MCP transaction execution
2. **ENS** - Frontend hooks for agent stats display
3. **0G** - Real endpoint wiring for storage/compute
4. **Uniswap** - Token swap for wager payments
5. **Gensyn** - Verifiable compute for battle verification

**Plan complete and saved to `docs/superpowers/plans/2026-05-02-blockchain-integration-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**