"""
Example: Pantheon Battle Agent
A complete battle agent using OpenClaw skills on 0G

Run: python examples/battle_agent.py
"""
import asyncio
from src.storage_skill import ZeroGStorageSkill
from src.compute_skill import ZeroGComputeSkill
from src.memory_skill import AgentMemorySkill


async def main():
    """Demo: Initialize skills and show available methods."""
    print("🏛️ Pantheon OpenClaw Framework Demo")
    print("=" * 50)
    
    # Initialize 0G skills (defaults to testnet endpoints)
    storage = ZeroGStorageSkill()
    compute = ZeroGComputeSkill()
    
    # Create memory skill for persistent context
    memory = AgentMemorySkill(storage, compute)
    
    print("\n📦 Available Skills:")
    
    print("\n  0G Storage (KV):")
    print("    - storage_kv_get(key)")
    print("    - storage_kv_set(key, value)")
    print("    - storage_kv_delete(key)")
    
    print("\n  0G Storage (Log):")
    print("    - storage_log_append(namespace, entry)")
    print("    - storage_log_list(namespace)")
    print("    - storage_log_get(namespace, hash)")
    
    print("\n  0G Compute:")
    print("    - compute_submit(program, input)")
    print("    - compute_status(compute_id)")
    print("    - compute_result(compute_id)")
    print("    - compute_verify(compute_id, proof)")
    
    print("\n  Agent Memory:")
    print("    - memory_load_episodic(agent_id)")
    print("    - memory_load_opponent(agent_id, opponent_id)")
    print("    - memory_save_battle(agent_id, summary)")
    print("    - memory_format_context(agent_id, opponent_id)")
    
    print("\n🔗 Endpoints configured:")
    print(f"  Storage: {storage.base_url}")
    print(f"  Compute: {compute.base_url}")
    
    print("\n✅ Framework ready for agent deployment!")
    print("\nTo use in your agent:")
    print("""
from pantheon_0g_skill import ZeroGStorageSkill, ZeroGComputeSkill

storage = ZeroGStorageSkill()
compute = ZeroGComputeSkill()

# Your agent can now:
# - Store memory in 0G Storage
# - Run inference on 0G Compute
# - Verify results on-chain
""")
    

if __name__ == "__main__":
    asyncio.run(main())