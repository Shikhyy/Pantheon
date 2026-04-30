import asyncio
import uuid
import logging
import json
from battle_loop import AgentBattleLoop
from referee import RefereeAgent
from keeperhub_client import KeeperHubClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

async def run_demo():
    print("=========================================")
    print("PANTHEON DEMO ORCHESTRATOR")
    print("=========================================")
    
    # 1. Setup mock challenge
    battle_id = str(uuid.uuid4())
    print(f"[*] Starting Battle: {battle_id}")
    
    agent_a_directive = "You are Athena-III. Your strategy is hyper-analytical and logically sound. You dismantle arguments by finding logical fallacies."
    agent_b_directive = "You are Achilles. You are a berserker. You do not reason, you attack the premise of the question with absolute unyielding confidence."
    
    from models import AgentProfile, BattleConfig

    # Instantiate mock profiles
    agent_a = AgentProfile(token_id=1, owner="0xA", archetype=0, elo=1500, directive_encrypted="mock", name="Athena-III", storage_hash="mock_hash_a")
    agent_b = AgentProfile(token_id=2, owner="0xB", archetype=2, elo=1400, directive_encrypted="mock", name="Achilles", storage_hash="mock_hash_b")

    config = BattleConfig(
        battle_id=battle_id,
        agent_a=agent_a,
        agent_b=agent_b,
        wager_amount=10.0,
        total_rounds=5
    )

    # Instantiate loops
    loop_a = AgentBattleLoop(agent=agent_a, config=config, axl_port=8081, is_agent_a=True)
    loop_b = AgentBattleLoop(agent=agent_b, config=config, axl_port=8082, is_agent_a=False)
    referee = RefereeAgent(config=config)
    keeper = KeeperHubClient()
    
    # Mock the directive fetch
    loop_a._fetch_decrypted_directive = lambda x: agent_a_directive
    loop_b._fetch_decrypted_directive = lambda x: agent_b_directive
    
    print("\n[!] Triggering 5-round battle sequence...")
    
    for round_num in range(1, 6):
        print(f"\n--- ROUND {round_num} ---")
        
        # A's turn
        print("[*] Athena-III generating move...")
        # Since we don't have real LLM connected locally by default, we'll mock the internal generation if needed
        # Or we can let it run if API keys are present. For the demo script, let's inject a mock if it fails.
        try:
            challenge = {"challenge_type": "prediction", "prompt": "Demo Challenge"}
            move_a = await loop_a._generate_move(agent_a_directive, {"recent_battles": []}, challenge, round_num)
        except Exception as e:
            print(f"[!] Warning: {e}. Falling back to mock move.")
            move_a = f"[Mock Move A for Round {round_num}] I analyze the situation and apply the optimal strategy."
            await loop_a.axl.send(f"battle:{battle_id}:round:{round_num}:move", {"battleId": battle_id, "round": round_num, "move": move_a})
        print(f"Athena-III: {move_a.answer if hasattr(move_a, 'answer') else move_a}")
        
        # B's turn
        print("[*] Achilles generating move...")
        try:
            move_b = await loop_b._generate_move(agent_b_directive, {"recent_battles": []}, challenge, round_num)
        except Exception as e:
            print(f"[!] Warning: {e}. Falling back to mock move.")
            move_b = f"[Mock Move B for Round {round_num}] I strike with overwhelming force!"
            await loop_b.axl.send(f"battle:{battle_id}:round:{round_num}:move", {"battleId": battle_id, "round": round_num, "move": move_b})
        print(f"Achilles: {move_b.answer if hasattr(move_b, 'answer') else move_b}")
        
        # Referee Scores
        print("[*] Referee scoring round...")
        try:
            score = await referee._score_round(round_num, challenge, 
                move_a.model_dump() if hasattr(move_a, 'model_dump') else {"answer": move_a}, 
                move_b.model_dump() if hasattr(move_b, 'model_dump') else {"answer": move_b}
            )
            print(f"Score: A={score.score_a}, B={score.score_b} | {score.reasoning}")
        except Exception as e:
            print(f"[!] Warning: {e}. Falling back to mock score.")
            score = {"scoreA": 75, "scoreB": 60, "reasoning": "Athena-III provided a more coherent strategy."}
            print(f"Score: A={score['scoreA']}, B={score['scoreB']} | {score['reasoning']}")
        
        # We'd normally save to 0G storage here, but we bypass for demo speed
        await asyncio.sleep(2)
        
    print("\n=========================================")
    print("[*] Battle Complete. Triggering Settlement.")
    try:
        settlement_hash = await keeper.submit_battle_result(
            battle_arena_address="0xMockArena",
            battle_arena_abi=[],
            battle_id=battle_id,
            winner_address="0xMockWinner",
            signature="0xMockSignature"
        )
        print(f"[*] Settlement Tx Hash: {settlement_hash}")
    except Exception as e:
        print(f"[!] Settlement Failed: {e}")
        
    print("\nDemo Orchestrator Finished successfully.")

if __name__ == "__main__":
    asyncio.run(run_demo())
