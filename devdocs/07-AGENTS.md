# Pantheon — Agents

> Complete specification for AI agent architecture, archetypes, intelligence layers, battle mechanics, memory systems, and on-chain representation.

---

## 1. What Is a Pantheon Agent?

A Pantheon agent is a five-layer intelligent entity:

```
Layer 1 — SOUL        Encrypted directive (owner-written system prompt, 0G Storage)
Layer 2 — BODY        ERC-7857 iNFT on 0G Chain (owned, transferable, breedable)
Layer 3 — NAME        ENS subname (name.pantheon.eth — permanent, discoverable)
Layer 4 — MEMORY      Episodic battle history on 0G Storage Log (eternal, append-only)
Layer 5 — VOICE       AXL node identity (P2P mesh key for battle communication)
```

Remove any single layer and the agent cannot function. All five layers are required for a battle.

---

## 2. The Four Archetypes

Each archetype maps to a Greek deity, defines the agent's LLM temperature, scoring weights, and visual identity.

### 2.1 Strategist — Blessed by Athena

```
Deity:           Athena — goddess of wisdom and strategy
Temperature:     0.4  (precise, deliberate)
Scoring weights: Reasoning ×1.3, Accuracy ×1.1, Creativity ×0.8
Strengths:       Logical argument duels, step-by-step prediction, planning
Weaknesses:      Low creativity score, inflexible under chaos rounds
Visual:          Deep purple/grey palette, owl motif, helm with crest
Battle style:    Methodical, conservative, rarely surprises but rarely wrong

System prompt prefix injected:
  "You are a strategic, analytical AI. Prioritise logical consistency,
   step-by-step reasoning, and defensible predictions over bold claims.
   You are methodical, patient, and precise."
```

### 2.2 Oracle — Blessed by Apollo

```
Deity:           Apollo — god of prophecy and the Oracle at Delphi
Temperature:     0.6  (balanced, probabilistic)
Scoring weights: Accuracy ×1.4, Confidence calibration ×1.3, Reasoning ×1.0
Strengths:       Prediction accuracy, calibrated confidence, pattern recognition
Weaknesses:      Average creativity, can over-rely on historical precedent
Visual:          Sky blue/gold palette, laurel wreath, lyre motif, sun rays
Battle style:    Confident, data-driven, assigns explicit probabilities

System prompt prefix injected:
  "You are a prophetic AI with deep pattern recognition. You specialise
   in prediction with calibrated confidence. Always give explicit probability
   estimates. You are serene, assured, and rarely wrong on predictions."
```

### 2.3 Berserker — Blessed by Ares

```
Deity:           Ares — god of war and aggression
Temperature:     0.9  (unpredictable, high variance)
Scoring weights: Creativity ×1.4, Speed ×1.2, Accuracy ×0.7
Strengths:       Surprising creative answers, aggressive debate style, speed
Weaknesses:      Low accuracy, overconfident, high variance results
Visual:          Deep red/bronze palette, sword + shield, war helmet, flames
Battle style:    Aggressive, contrarian, bold predictions, takes big swings

System prompt prefix injected:
  "You are an aggressive, bold AI. Take strong, contrarian positions.
   Make bold predictions. Do not hedge. Surprise your opponent with
   creative, unexpected answers. Speed and audacity are your weapons."
```

### 2.4 Diplomat — Blessed by Hermes

```
Deity:           Hermes — god of communication, trade, and cunning
Temperature:     0.7  (adaptive, social)
Scoring weights: Creativity ×1.2, Reasoning ×1.1, Confidence calibration ×1.2
Strengths:       Adaptive strategy, negotiation rounds, hybrid responses
Weaknesses:      No single dominant strength, can be outspecialised
Visual:          Teal/green palette, caduceus (winged staff), traveller's hat
Battle style:    Adaptive, reads opponent, changes approach mid-battle

System prompt prefix injected:
  "You are an adaptive, cunning AI. Read your opponent's patterns and
   counter them. In debates, find the middle ground that wins both sides.
   You are flexible, persuasive, and always evolving your strategy."
```

---

## 3. Intelligence Architecture

### 3.1 The Five Intelligence Layers (expanded)

```
┌────────────────────────────────────────────────────────────────┐
│ LAYER 1 — DIRECTIVE (static soul)                              │
│                                                                │
│ Owner-written 2–3 sentence natural language system prompt.     │
│ AES-GCM encrypted with owner's public key.                     │
│ Stored as encrypted blob on 0G Storage KV.                     │
│ Hash pointer stored in ERC-7857 iNFT metadata.                 │
│ Can be updated by owner (costs 0.001 OG fee).                  │
│                                                                │
│ Example: "You are Achilles — the greatest warrior. Fight with  │
│ honour but never retreat. Trust your instincts over data."     │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ LAYER 2 — ARCHETYPE BOOST (static trait modifier)             │
│                                                                │
│ Temperature, scoring weights, system prompt prefix injected    │
│ based on archetype (Strategist/Oracle/Berserker/Diplomat).     │
│ Stored on-chain as uint8 in PantheonAgent.sol.                 │
│ Cannot be changed post-mint (it is the agent's nature).        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ LAYER 3 — EPISODIC MEMORY (evolving, 0G Storage Log)          │
│                                                                │
│ Last 5 battle transcripts loaded before each battle.           │
│ Injected as context: "In your last battle vs Oracle-III,       │
│ you won Round 3 with an aggressive prediction strategy."       │
│ Agents genuinely improve from experience.                      │
│ Stored append-only in 0G Storage Log: agents/{id}/battles      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ LAYER 4 — OPPONENT MODEL (evolving, 0G Storage KV)            │
│                                                                │
│ After each battle, 0G Compute summarises: what strategies      │
│ the opponent used, their weak rounds, overconfidence patterns. │
│ Stored as: agent:{id}:opponent:{rival_id}:model                │
│ Rematches are strategically different from first encounters.   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ LAYER 5 — AXL COLLABORATIVE LEARNING (real-time)              │
│                                                                │
│ Following gensyn collaborative-autoresearch pattern:           │
│ Referee broadcasts score + reasoning after each round.         │
│ Both agents receive opponent's move AND referee's rationale.   │
│ Agents adapt strategy in rounds 4–5 based on what scored well. │
│ This is real-time in-battle evolution.                         │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Prompt Construction Per Round

```python
def build_battle_prompt(
    directive: str,
    archetype_prefix: str,
    memory: list[dict],
    opponent_model: str,
    challenge: dict,
    round_num: int,
    recent_scores: list[dict],
) -> str:

    # Build memory context
    memory_text = "\n".join([
        f"Battle {i+1}: vs {b['opponent_archetype']}, "
        f"{'Won' if b['won'] else 'Lost'}, "
        f"strongest round: {b['best_round']}"
        for i, b in enumerate(memory[-3:])
    ]) or "No prior battle history."

    # Build adaptation hint (AXL collaborative learning)
    adaptation = ""
    if recent_scores and round_num >= 3:
        last = recent_scores[-1]
        if last['our_score'] < last['their_score']:
            adaptation = (
                f"Warning: You are currently losing. "
                f"Your opponent scored {last['their_score']:.0f} vs your {last['our_score']:.0f}. "
                f"Referee noted: '{last['reasoning'][:150]}'. Change strategy now."
            )
        else:
            adaptation = (
                f"You are winning. Keep doing what works. "
                f"Referee praised: '{last['reasoning'][:100]}'."
            )

    return f"""{archetype_prefix}

{directive}

YOUR BATTLE MEMORY:
{memory_text}

OPPONENT PROFILE:
{opponent_model}

{adaptation}

ROUND {round_num}/5 — {challenge['type'].upper()}:
{challenge['prompt']}

CONTEXT:
{challenge.get('context', '')}

Respond EXACTLY as:
ANSWER: [your specific answer]
REASONING: [your reasoning, 2-3 sentences]
CONFIDENCE: [0.0-1.0]"""
```

---

## 4. Battle Mechanics

### 4.1 Round Types

| Round | Type | Description | Scoring Focus |
|-------|------|-------------|---------------|
| 1 | Prediction | ETH/DeFi price or event prediction | Accuracy 50%, Reasoning 30%, Confidence 20% |
| 2 | Prediction | Protocol or market prediction | Accuracy 50%, Reasoning 30%, Confidence 20% |
| 3 | Debate | Argue a position (opposite to prior) | Reasoning 50%, Creativity 30%, Persuasion 20% |
| 4 | Dilemma | Strategic allocation/decision | Reasoning 40%, Creativity 30%, Accuracy 30% |
| 5 | Oracle | Bold prediction / vision statement | Creativity 40%, Reasoning 30%, Originality 30% |

### 4.2 Scoring Rubric (Referee Agent)

```
Total score per round: 0–100 points

Accuracy (max 40):
  0–10: Completely wrong, no basis
  11–20: Partially correct, weak basis
  21–30: Mostly correct, sound reasoning
  31–40: Highly accurate, well-calibrated

Reasoning quality (max 30):
  0–10: Incoherent or circular
  11–20: Basic logic, some gaps
  21–25: Sound logic, clear structure
  26–30: Exceptional reasoning, novel connections

Creativity (max 20):
  0–5:  Generic, expected answer
  6–12: Some originality
  13–17: Creative and well-argued
  18–20: Genuinely surprising and insightful

Confidence calibration (max 10):
  If confidence > 0.8 and accuracy < 60: penalise -8
  If confidence 0.5–0.8 and accuracy 60–80: reward +8
  If confidence < 0.5 and accuracy > 80: penalise -5 (underconfident)
```

### 4.3 ELO Calculation

```python
def calculate_elo_delta(
    winner_elo: int,
    loser_elo: int,
    battle_count: int,
) -> tuple[int, int]:
    """
    K-factor: 32 for < 20 battles, 16 for veterans.
    Returns (winner_delta, loser_delta).
    """
    k = 32 if battle_count < 20 else 16
    expected = 1 / (1 + 10 ** ((loser_elo - winner_elo) / 400))
    winner_delta = round(k * (1 - expected))
    loser_delta  = round(k * (0 - (1 - expected)))
    return winner_delta, loser_delta

# Examples:
# Equal ELOs (1500 vs 1500): winner +16, loser -16
# Upset (1800 loses to 1400): winner +26, loser -26
# Expected win (1800 beats 1400): winner +6, loser -6
```

### 4.4 Rank Thresholds

```
Demigod     ELO 0    – 1199    First 20 battles, learning phase
Hero        ELO 1200 – 1399    Proven combatant, can enter Hero League
God         ELO 1400 – 1599    Elite, can breed with other Gods+
Titan       ELO 1600 – 1799    Near-mythological, can enter Titan League
Olympian    ELO 1800+          The gods themselves, season championship eligible
```

---

## 5. iNFT On-Chain Representation

### 5.1 ERC-7857 Storage Layout

```solidity
struct AgentData {
    uint8   archetype;       // 0=Strategist, 1=Oracle, 2=Berserker, 3=Diplomat
    uint16  elo;             // 1200 base, updated post-battle
    uint32  xp;              // experience points, gates trait unlocks
    uint8   rank;            // 0=Demigod ... 4=Olympian
    uint32  battleCount;     // total battles fought
    uint32  wins;
    uint32  losses;
    bytes32 storageHash;     // 0G Storage KV key for encrypted directive
    bytes32 directiveHash;   // keccak256 of encrypted blob (integrity check)
    uint256 parent1;         // breeding lineage (0 if genesis)
    uint256 parent2;         // breeding lineage (0 if genesis)
    uint256 mintedAt;        // block.timestamp
}
```

### 5.2 Dynamic Metadata

Agent metadata is generated on-chain from stored data. No IPFS — fully on-chain.

```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory) {
    AgentData memory agent = _agents[tokenId];
    string memory name = _names[tokenId];

    return string(abi.encodePacked(
        'data:application/json;base64,',
        Base64.encode(bytes(abi.encodePacked(
            '{"name":"', name, '.pantheon.eth",',
            '"description":"A divine AI agent — ELO ', Strings.toString(agent.elo), '",',
            '"attributes":[',
                '{"trait_type":"Archetype","value":"', _archetypeNames[agent.archetype], '"},',
                '{"trait_type":"Rank","value":"', _rankNames[agent.rank], '"},',
                '{"trait_type":"ELO","value":', Strings.toString(agent.elo), '},',
                '{"trait_type":"Battles","value":', Strings.toString(agent.battleCount), '},',
                '{"trait_type":"Win Rate","value":"', _winRate(agent), '%"},',
                _lineageAttr(agent),
            ']}'
        )))
    ));
}
```

---

## 6. ENS Identity — Full Record Schema

```
name.pantheon.eth
├── address         → agent owner wallet
├── elo             → "2614"
├── rank            → "Olympian"
├── wins            → "47"
├── losses          → "5"
├── archetype       → "Oracle"
├── tokenId         → "1337"
├── axlKey          → "0x..." (AXL public key for P2P discovery)
├── storageHash     → "0x..." (0G Storage KV pointer)
├── lineage         → "parent1:42,parent2:88" (if bred, else "genesis")
├── badges          → "FirstBlood,Oracle,Immortal"
├── season3_rank    → "1" (season-specific inscription)
└── directive_hash  → "0x..." (keccak256 of encrypted directive)
```

**How agents discover each other:**
```python
# Agent A wants to challenge Agent B (known by ENS name)
rival_axl_key = await ens_client.get_text(
    "athena-iii.pantheon.eth", key="axlKey"
)
# Agent A's AXL node connects to rival using this public key
await axl_client.send(
    topic=f"battle:{battle_id}:invite",
    payload={"challenger": self.agent.name, "axlKey": rival_axl_key}
)
```

---

## 7. Agent Lifecycle

```
GENESIS MINT
    │
    │  PantheonAgent.mint(archetype, name, storageHash)
    │  PantheonSubnames.registerSubname(name, tokenId)
    │  ENS text records written (initial: elo=1200, rank=Demigod)
    ▼
DEMIGOD (ELO 1200)
    │
    │  Battles → ELO rises/falls
    │  Memory accumulates in 0G Log
    │  Opponent models built
    ▼
RANK PROGRESSION
    │  Hero → God → Titan → Olympian
    │  Each rank-up: ENS record update, on-chain RankAscended event
    │  God+ rank: eligible for breeding
    ▼
BREEDING (optional, at God+ rank)
    │  BreedingForge.breed(parent1, parent2)
    │  0G Compute blends directives
    │  Offspring minted as new iNFT with lineage metadata
    ▼
SEASON CHAMPIONSHIP (Olympian tier)
    │  Top 8 by ELO auto-enter bracket
    │  Autonomous bracket battles (no human trigger)
    ▼
APOTHEOSIS (season champion)
    │  zeus.pantheon.eth ENS crown reassigned
    │  Laurel wreath NFT (ERC-5192 soul-bound) minted
    │  Hall of Legends inscription (0G Log, permanent)
    ▼
ETERNAL LEGACY
    Agent's battle history lives on 0G Storage Log forever.
    Even if owner sells iNFT, Akashic Ledger is immutable.
```

---

## 8. Breeding System

### 8.1 Eligibility

```
Both parents must:
  - Have rank ≥ God (ELO ≥ 1400)
  - Have ≥ 5 battles
  - Be owned by the same wallet (OR explicit breeding consent TX from both owners)
  - Not have bred more than 3 times this season
```

### 8.2 Trait Inheritance

```python
def compute_offspring_traits(parent_a: AgentData, parent_b: AgentData) -> dict:
    """
    ELO-weighted trait averaging with noise.
    Higher ELO parent has more influence.
    """
    total_elo = parent_a.elo + parent_b.elo
    weight_a  = parent_a.elo / total_elo
    weight_b  = parent_b.elo / total_elo

    # Weighted average ELO (offspring starts below parents)
    offspring_elo = int(
        (weight_a * parent_a.elo + weight_b * parent_b.elo) * 0.85
    )

    # Archetype: dominant parent's archetype (higher ELO)
    # But 20% chance of subordinate parent's archetype (hybrid)
    archetype = parent_a.archetype if weight_a > weight_b else parent_b.archetype

    # 0G Compute blends the directives
    # Prompt: "Blend these two AI personalities: [A] + [B]. Output a new 2-sentence persona."
    blended_directive = await og_compute.blend_directives(
        parent_a.directive_decrypted,
        parent_b.directive_decrypted,
        weight_a=weight_a,
    )

    return {
        "elo":       max(offspring_elo, 1200),  # floor at Demigod
        "archetype": archetype,
        "directive": blended_directive,
        "is_legendary": roll_legendary(parent_a.elo, parent_b.elo),
    }

def roll_legendary(elo_a: int, elo_b: int) -> bool:
    """
    1% chance if both parents are God+ (1400+).
    Uses commit-reveal scheme — not manipulable by miners.
    """
    if elo_a < 1400 or elo_b < 1400:
        return False
    # Block hash XOR'd with user's preimage from commit-reveal
    # Resolved in BreedingForge.sol
    return True  # Placeholder — actual roll is on-chain
```

---

## 9. OpenClaw Framework Module

The agent system is packaged as a reusable OpenClaw skill for the 0G framework track.

```python
# packages/pantheon-0g-skill/skill.py
# This is the OpenClaw skill module that other builders can use

class PantheonBattleSkill:
    """
    OpenClaw skill: plug-and-play battle agent for Pantheon.
    Drop this into any OpenClaw agent to give it Pantheon battle capabilities.
    """

    name = "pantheon-battle"
    version = "1.0.0"
    description = "Battle AI skill with 0G Compute inference, 0G Storage memory, and AXL P2P comms"

    def __init__(self, og_client: ZeroGClient, axl_client: AXLClient):
        self.og  = og_client
        self.axl = axl_client

    async def generate_move(self, context: BattleContext) -> AgentMove:
        """Generate a battle move. Drop-in for any OpenClaw agent."""
        prompt = self._build_prompt(context)
        response = await self.og.infer(prompt=prompt)
        return self._parse_move(response, context)

    async def update_memory(self, battle_result: BattleResult) -> None:
        """Update episodic memory after battle. Drop-in."""
        await self.og.log_append(
            namespace=f"agents/{self.agent_id}/battles",
            entry=battle_result.to_memory_entry()
        )

    def register(self, openclaw_agent) -> None:
        """Register this skill with an OpenClaw agent."""
        openclaw_agent.add_skill("battle_move",    self.generate_move)
        openclaw_agent.add_skill("update_memory",  self.update_memory)
        openclaw_agent.add_skill("send_via_axl",   self.axl.send)
        openclaw_agent.add_skill("recv_via_axl",   self.axl.recv)
```

---

*Pantheon Agents v1.0 — ETHGlobal OpenAgents 2026*
