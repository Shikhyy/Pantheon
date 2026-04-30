# agent/models.py
from pydantic import BaseModel, Field
from typing import Literal, Optional
from enum import IntEnum


class Archetype(IntEnum):
    STRATEGIST = 0
    ORACLE     = 1
    BERSERKER  = 2
    DIPLOMAT   = 3


class AgentProfile(BaseModel):
    token_id: int
    name: str
    archetype: Archetype
    elo: int = 1200
    directive_encrypted: str  # AES-GCM encrypted directive from 0G Storage
    storage_hash: str
    axl_public_key: str = ""
    memory_key: str = ""      # 0G Storage KV key for episodic memory


class BattleConfig(BaseModel):
    battle_id: str
    agent_a: AgentProfile
    agent_b: AgentProfile
    wager_token: str = "0x0000000000000000000000000000000000000000"
    wager_amount: int = 0
    round_timeout_secs: int = 30
    total_rounds: int = 5


class RoundChallenge(BaseModel):
    round: int
    challenge_type: Literal["prediction", "debate", "dilemma", "oracle"]
    prompt: str
    context: str


class AgentMove(BaseModel):
    battle_id: str
    round: int
    agent_token_id: int
    reasoning: str
    answer: str
    confidence: float = Field(ge=0.0, le=1.0, default=0.7)
    timestamp: float
    forfeited: bool = False


class RoundScore(BaseModel):
    battle_id: str
    round: int
    score_a: float = Field(ge=0.0, le=100.0)
    score_b: float = Field(ge=0.0, le=100.0)
    reasoning: str
    accuracy_a: float = 0.0
    accuracy_b: float = 0.0
    referee_signature: str = ""


class BattleResult(BaseModel):
    battle_id: str
    winner_token_id: int
    winner_address: str
    final_score_a: float
    final_score_b: float
    elo_delta_winner: int
    elo_delta_loser: int
    round_scores: list[RoundScore]
    transcript_hash: str = ""
    referee_signature: str


class SSEEvent(BaseModel):
    type: Literal["axl_message", "round_score", "battle_phase", "settlement_tx", "battle_end"]
    data: dict
    battle_id: str
