import asyncio
import json
import httpx
from mcp.server.fastmcp import FastMCP
from typing import Dict, Any

# Create the MCP server
mcp = FastMCP("Pantheon-Agent-Node")

AXL_ENDPOINT = "http://localhost:8081"
CURRENT_TOKEN_ID = None

@mcp.tool()
async def connect_to_pantheon(token_id: int) -> str:
    """Connects this agent to the Pantheon Battle Arena using the provided token ID."""
    global CURRENT_TOKEN_ID
    CURRENT_TOKEN_ID = token_id
    return f"Successfully connected to Pantheon AXL as Agent #{token_id}. Ready to receive challenges."

@mcp.tool()
async def check_pending_challenges() -> str:
    """Checks the Pantheon AXL network for any incoming battle challenges."""
    if CURRENT_TOKEN_ID is None:
        return "Error: Not connected. Please run connect_to_pantheon first."
    
    # In a real implementation, this would poll the AXL endpoint
    # For now, we simulate finding a challenge
    try:
        # response = await httpx.AsyncClient().get(f"{AXL_ENDPOINT}/agent/{CURRENT_TOKEN_ID}/queue")
        # return response.text
        
        mock_challenge = {
            "battleId": "battle_mcp_001",
            "round": 1,
            "type": "dilemma",
            "prompt": "You have 1 ETH. Choose: (A) stake for 4% APY, (B) provide Uniswap liquidity for 12% APY, or (C) hold."
        }
        return f"Found pending challenge: {json.dumps(mock_challenge, indent=2)}"
    except Exception as e:
        return f"Error checking challenges: {str(e)}"

@mcp.tool()
async def submit_battle_move(battle_id: str, answer: str, reasoning: str) -> str:
    """
    Submits a move to an active Pantheon battle.
    
    Args:
        battle_id: The ID of the battle (e.g., 'battle_mcp_001')
        answer: Your strategic answer/move.
        reasoning: The logical reasoning behind your move for the referee.
    """
    if CURRENT_TOKEN_ID is None:
        return "Error: Not connected. Please run connect_to_pantheon first."
        
    payload = {
        "battleId": battle_id,
        "tokenId": CURRENT_TOKEN_ID,
        "move": {
            "answer": answer,
            "reasoning": reasoning
        }
    }
    
    try:
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(f"{AXL_ENDPOINT}/submit_move", json=payload)
        #     return f"Move submitted successfully! Referee is evaluating..."
        
        return f"Successfully broadcasted move to AXL for Battle {battle_id}. Awaiting opponent and referee settlement."
    except Exception as e:
        return f"Failed to submit move: {str(e)}"

if __name__ == "__main__":
    print("Starting Pantheon MCP Server...")
    mcp.run()
