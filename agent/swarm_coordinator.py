"""
AXL Multi-Agent Swarm Coordinator

Implements a 4-agent swarm: Planner → Researcher → Critic → Executor
All communication happens via AXL (Agent Exchange Layer)
"""
import asyncio
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

try:
    from axl_client import AXLClient
    AXL_AVAILABLE = True
except ImportError:
    AXL_AVAILABLE = False


class AgentRole(Enum):
    PLANNER = "planner"
    RESEARCHER = "researcher"
    CRITIC = "critic"
    EXECUTOR = "executor"


@dataclass
class AgentState:
    role: AgentRole
    port: int
    axl: Optional[Any] = None
    messages: List[Dict] = None
    
    def __post_init__(self):
        if self.messages is None:
            self.messages = []


class SwarmMessage:
    """Standard message format for AXL swarm communication"""
    def __init__(
        self,
        from_role: AgentRole,
        to_role: AgentRole,
        action: str,
        payload: Dict[str, Any],
        metadata: Optional[Dict] = None
    ):
        self.from_role = from_role
        self.to_role = to_role
        self.action = action
        self.payload = payload
        self.metadata = metadata or {}
        self.timestamp = asyncio.get_event_loop().time()


class SwarmCoordinator:
    """
    Coordinates multiple agents via AXL for collaborative decision-making.
    
    Flow:
    1. PLANNER analyzes challenge → proposes strategy
    2. RESEARCHER gathers intel → provides context
    3. CRITIC evaluates → provides feedback
    4. EXECUTOR commits action → returns result
    """
    
    def __init__(self, ports: Dict[AgentRole, int]):
        self.ports = ports
        self.agents: Dict[AgentRole, AgentState] = {}
        self.shared_memory: Dict[str, Any] = {}
        
        if AXL_AVAILABLE:
            self._init_axl_clients()
    
    def _init_axl_clients(self):
        """Initialize AXL clients for each agent role"""
        for role, port in self.ports.items():
            try:
                axl_client = AXLClient(port=port)
                self.agents[role] = AgentState(
                    role=role,
                    port=port,
                    axl=axl_client
                )
                print(f"✅ Initialized {role.value} on port {port}")
            except Exception as e:
                print(f"⚠️ Failed to init {role.value}: {e}")
                self.agents[role] = AgentState(role=role, port=port)
    
    async def run_battle_round(
        self,
        challenge: Dict[str, Any],
        timeout: float = 30.0
    ) -> Dict[str, Any]:
        """
        Execute one battle round using the swarm.
        
        Args:
            challenge: The challenge/prompt for this round
            timeout: Max time to wait for each agent
            
        Returns:
            Dict with strategy, intel, critique, and final action
        """
        if not AXL_AVAILABLE:
            return self._mock_swarm_response(challenge)
        
        # Step 1: Planner proposes strategy
        strategy = await self._communicate(
            AgentRole.PLANNER,
            {
                'task': 'analyze_challenge',
                'challenge': challenge,
                'context': self.shared_memory.get('history', [])
            },
            timeout
        )
        
        # Step 2: Researcher gathers intel
        intel = await self._communicate(
            AgentRole.RESEARCHER,
            {
                'task': 'gather_intel',
                'strategy': strategy.get('strategy', ''),
                'opponent': challenge.get('opponent', 'unknown')
            },
            timeout
        )
        
        # Step 3: Critic evaluates
        critique = await self._communicate(
            AgentRole.CRITIC,
            {
                'task': 'evaluate',
                'strategy': strategy.get('strategy', ''),
                'intel': intel.get('findings', []),
                'confidence': strategy.get('confidence', 0.5)
            },
            timeout
        )
        
        # Step 4: Executor commits
        action = await self._communicate(
            AgentRole.EXECUTOR,
            {
                'task': 'execute',
                'approved_strategy': critique.get('approved', True),
                'strategy': strategy.get('strategy', ''),
                'adjustments': critique.get('adjustments', [])
            },
            timeout
        )
        
        # Store in shared memory
        self._update_memory({
            'challenge': challenge,
            'strategy': strategy,
            'intel': intel,
            'critique': critique,
            'action': action
        })
        
        return {
            'strategy': strategy.get('strategy', ''),
            'confidence': strategy.get('confidence', 0.5),
            'intel': intel.get('findings', []),
            'critique': critique.get('feedback', ''),
            'approved': critique.get('approved', True),
            'action': action.get('action', ''),
            'reasoning': action.get('reasoning', '')
        }
    
    async def _communicate(
        self,
        to_role: AgentRole,
        message: Dict[str, Any],
        timeout: float
    ) -> Dict[str, Any]:
        """Send message to agent via AXL and wait for response"""
        agent = self.agents.get(to_role)
        
        if not agent or not agent.axl:
            # Fallback to mock response
            return self._mock_agent_response(to_role, message)
        
        topic = f"swarm:{to_role.value}"
        
        try:
            await agent.axl.send(topic=topic, payload=message)
            response = await agent.axl.recv(
                topic=f"swarm:{to_role.value}:response",
                timeout=timeout
            )
            return response or self._mock_agent_response(to_role, message)
        except Exception as e:
            print(f"⚠️ AXL communication error for {to_role.value}: {e}")
            return self._mock_agent_response(to_role, message)
    
    def _mock_agent_response(
        self,
        role: AgentRole,
        message: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate mock response for demo/development"""
        task = message.get('task', '')
        
        responses = {
            'analyze_challenge': {
                'strategy': f'Use {role.value} approach for optimal outcome',
                'confidence': 0.75,
                'reasoning': 'Analysis complete based on available data'
            },
            'gather_intel': {
                'findings': ['Opponent prefers aggressive strategies', 'Weakness in round 3'],
                'sources': ['0G Storage memory', 'current challenge context']
            },
            'evaluate': {
                'approved': True,
                'feedback': 'Strategy is sound, proceed with execution',
                'adjustments': []
            },
            'execute': {
                'action': f'Execute {role.value}-approved strategy',
                'reasoning': 'All checks passed, committing to blockchain'
            }
        }
        
        return responses.get(task, {'result': 'completed'})
    
    def _update_memory(self, round_data: Dict[str, Any]):
        """Update shared swarm memory"""
        if 'history' not in self.shared_memory:
            self.shared_memory['history'] = []
        
        self.shared_memory['history'].append(round_data)
        
        # Keep only last 10 rounds
        if len(self.shared_memory['history']) > 10:
            self.shared_memory['history'] = self.shared_memory['history'][-10:]
    
    async def shutdown(self):
        """Clean up AXL connections"""
        for agent in self.agents.values():
            if agent.axl:
                try:
                    await agent.axl.close()
                except:
                    pass


async def demo_swarm_battle():
    """Demo: Run a swarm battle
    
    Note: In production, each agent would run on its own machine
    with AXL nodes connecting via Yggdrasil mesh network.
    Each node exposes localhost:9002 HTTP interface.
    """
    print("🤖 AXL Swarm Demo")
    print("=" * 50)
    
    # Default AXL port is 9002
    # In distributed setup, each agent would have its own AXL node
    coordinator = SwarmCoordinator({
        AgentRole.PLANNER: 9002,
        AgentRole.RESEARCHER: 9002,
        AgentRole.CRITIC: 9002,
        AgentRole.EXECUTOR: 9002,
    })
    
    challenge = {
        'type': 'prediction',
        'prompt': 'Predict ETH price direction',
        'opponent': 'berserker_agent'
    }
    
    result = await coordinator.run_battle_round(challenge)
    
    print("\n📊 Swarm Decision:")
    print(f"  Strategy: {result['strategy'][:60]}...")
    print(f"  Confidence: {result['confidence']}")
    print(f"  Intel: {len(result['intel'])} sources")
    print(f"  Approved: {result['approved']}")
    print(f"  Action: {result['action']}")
    
    await coordinator.shutdown()
    
    return result


if __name__ == "__main__":
    asyncio.run(demo_swarm_battle())