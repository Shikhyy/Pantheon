"""
pantheon-0g-skill — OpenClaw skill modules for Pantheon AI agents.

Quick start:
    from pantheon_0g_skill import PantheonBattleSkill, ZeroGComputeSkill, ZeroGRouterSkill, ZeroGStorageSkill

    compute = ZeroGComputeSkill(ComputeConfig(base_url=..., api_key=...))
    router  = ZeroGRouterSkill()
    storage = ZeroGStorageSkill(base_url=..., api_key=...)
    battle  = PantheonBattleSkill(compute, router, storage, axl_client)

    battle.register(my_openclaw_agent)
"""

from .compute_skill import ZeroGComputeSkill, ComputeConfig
from .router_skill import ZeroGRouterSkill
from .storage_skill import ZeroGStorageSkill
from .memory_skill  import AgentMemorySkill
from .battle_skill  import PantheonBattleSkill, ARCHETYPE_TEMPS, ARCHETYPE_PREFIXES

__all__ = [
    "ZeroGComputeSkill",
    "ComputeConfig",
    "ZeroGRouterSkill",
    "ZeroGStorageSkill",
    "AgentMemorySkill",
    "PantheonBattleSkill",
    "ARCHETYPE_TEMPS",
    "ARCHETYPE_PREFIXES",
]

__version__ = "1.0.0"
