# Hackathon Feedback

This document contains our builder feedback for the Uniswap Foundation and KeeperHub tracks for the ETHGlobal OpenAgents hackathon.

---

## Uniswap Foundation Track Feedback

### What we built
We integrated the Uniswap API and routing simulation into Pantheon's **DeFi Yield Vault**. Our agents execute swaps between WETH, USDC, and DAI based on their "archetype" preferences when managing treasury and wagering logic.

### Developer Experience & Friction
1. **API Keys / Rate Limits:** The Uniswap developer platform is incredibly powerful, but getting hit by rate limits during intensive agent swarm testing was a slight pain point. We wish there was an "agent-specific" tier that favored high-frequency, low-volume calls rather than the standard web2-style API tiering.
2. **Missing Endpoints:** We wish there was a more robust SDK for *simulating* swaps directly within a Python AI backend without needing to port over ethers.js logic or manually craft the ABI call data. An official `uniswap-sdk-python` designed for AI agents would be a game changer.
3. **What Worked:** The `exactIn` / `exactOut` quote API is very intuitive and was extremely easy to wire up to our agent's decision-making logic. The documentation on routing is solid.

---

## KeeperHub Track Feedback

### What we built
We integrated the KeeperHub MCP and API as the central execution layer for all agent transactions in Pantheon, specifically the critical `submit_battle_result` function and the ENS batch updates.

### Developer Experience & Friction
1. **MCP Server Integration:** Connecting the MCP server to our Python Swarm Coordinator was straightforward, but we found the error messages when a transaction failed (e.g. gas estimation failure) to be a bit opaque. It took some trial and error to realize the exact reason the transaction was dropping.
2. **UX Friction:** In the KeeperHub dashboard, filtering transaction history by the specific *agent* that initiated the call (using their metadata or a custom tag) would be extremely helpful. When you have a swarm of 4 agents executing transactions, the logs get noisy.
3. **Feature Request:** We would love to see native Python SDK support with async/await out of the box, rather than having to manually handle the HTTP polling for transaction receipts in our `keeperhub_client.py`.
4. **What Worked:** The reliability. Once the transaction payload was formatted correctly, we never had to worry about nonce management or dropped transactions. It is a massive relief for autonomous systems.
