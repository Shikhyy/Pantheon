import asyncio
import uuid
import logging
import json
from battle_loop import AgentBattleLoop
from referee import RefereeAgent
from keeperhub_client import KeeperHubClient
from swarm_coordinator import SwarmCoordinator, AgentRole
from web3 import Web3

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

async def run_demo():
    print("=========================================")
    print("PANTHEON DEMO ORCHESTRATOR")
    print("=========================================")
    
    # 1. Setup mock challenge
    battle_id = Web3.keccak(text=str(uuid.uuid4())).hex()
    print(f"[*] Starting Battle: {battle_id}")
    
    agent_a_directive = "You are Athena-III. Your strategy is hyper-analytical and logically sound. You dismantle arguments by finding logical fallacies."
    agent_b_directive = "You are Achilles. You are a berserker. You do not reason, you attack the premise of the question with absolute unyielding confidence."
    
    from models import AgentProfile, BattleConfig

    # Instantiate mock profiles
    agent_a = AgentProfile(token_id=1, owner="0x1111111111111111111111111111111111111111", archetype=0, elo=1500, directive_encrypted="mock", name="Athena-III", storage_hash="mock_hash_a")
    agent_b = AgentProfile(token_id=2, owner="0x2222222222222222222222222222222222222222", archetype=2, elo=1400, directive_encrypted="mock", name="Achilles", storage_hash="mock_hash_b")

    config = BattleConfig(
        battle_id=battle_id,
        agent_a=agent_a,
        agent_b=agent_b,
        wager_amount=10,
        total_rounds=5
    )

    from config import settings

    # Instantiate loops
    loop_a = AgentBattleLoop(agent=agent_a, config=config, axl_port=9002, is_agent_a=True)
    loop_b = AgentBattleLoop(agent=agent_b, config=config, axl_port=9003, is_agent_a=False)
    referee = RefereeAgent(config=config, axl_port=9004)
    keeper = KeeperHubClient()
    
    # Initialize Swarm for Agent A
    coordinator = SwarmCoordinator({
        AgentRole.PLANNER: 9002,
        AgentRole.RESEARCHER: 9003,
        AgentRole.CRITIC: 9004,
        AgentRole.EXECUTOR: 9005,
    })
    
    print("\n[!] Triggering 5-round battle sequence...")
    
    # Start the actual loops in background
    asyncio.create_task(loop_a.run())
    asyncio.create_task(loop_b.run())
    
    # Run referee as the main driver
    result = await referee.run()
    
    print("\n=========================================")
    print(f"[*] Battle Complete. Winner: {result.winner_address}")
    print(f"[*] Transcript Hash: {result.transcript_hash}")
    
    await coordinator.shutdown()
    print("\nDemo Orchestrator Finished successfully.")

if __name__ == "__main__":
    asyncio.run(run_demo())
