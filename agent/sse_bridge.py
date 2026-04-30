# agent/sse_bridge.py
"""
FastAPI SSE bridge.
Subscribes to 0G Storage KV battle state and AXL message feed,
forwards as Server-Sent Events to the Next.js frontend.
"""
import asyncio
import json
import time
import uuid
from typing import AsyncGenerator

from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel

app = FastAPI(title="Pantheon SSE Bridge", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory battle event queues: battle_id -> list[dict]
_event_queues: dict[str, asyncio.Queue] = {}


def get_or_create_queue(battle_id: str) -> asyncio.Queue:
    if battle_id not in _event_queues:
        _event_queues[battle_id] = asyncio.Queue(maxsize=100)
    return _event_queues[battle_id]


async def _push_event(battle_id: str, event: dict) -> None:
    queue = get_or_create_queue(battle_id)
    try:
        queue.put_nowait(event)
    except asyncio.QueueFull:
        pass  # Drop oldest if full


# ── Routes ────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": time.time(), "service": "pantheon-sse-bridge"}


@app.get("/battle/{battle_id}/stream")
async def battle_stream(battle_id: str) -> EventSourceResponse:
    """
    SSE endpoint. Client subscribes here to receive live battle events.
    Events: axl_message, round_score, battle_phase, settlement_tx, battle_end
    """
    queue = get_or_create_queue(battle_id)

    async def event_generator() -> AsyncGenerator[dict, None]:
        # Send initial connection event
        yield {
            "data": json.dumps({
                "type": "connected",
                "data": {"battle_id": battle_id},
                "battle_id": battle_id,
            })
        }

        # For demo: emit mock events if no real battle
        demo_events = _mock_battle_events(battle_id)
        demo_idx = 0
        last_demo_time = time.time()

        while True:
            # Check for real events first
            try:
                event = queue.get_nowait()
                yield {"data": json.dumps(event)}
                continue
            except asyncio.QueueEmpty:
                pass

            # Emit mock events for demo
            now = time.time()
            if demo_idx < len(demo_events) and now - last_demo_time > 3.0:
                yield {"data": json.dumps(demo_events[demo_idx])}
                demo_idx += 1
                last_demo_time = now

            await asyncio.sleep(0.5)

    return EventSourceResponse(event_generator())


class BattleStartRequest(BaseModel):
    battle_id: str
    agent_a_token_id: int
    agent_b_token_id: int
    wager_amount: float = 0.0


@app.post("/battle/start")
async def start_battle(req: BattleStartRequest, background_tasks: BackgroundTasks):
    """Spawn agent processes for a new battle."""
    background_tasks.add_task(_run_mock_battle, req.battle_id)
    return {"status": "started", "battle_id": req.battle_id}


@app.post("/battle/{battle_id}/emit")
async def emit_event(battle_id: str, event: dict):
    """Internal endpoint for agent processes to push events."""
    await _push_event(battle_id, event)
    return {"ok": True}


# ── Mock battle for demo ──────────────────────────────────────

def _mock_battle_events(battle_id: str) -> list[dict]:
    return [
        {
            "type": "axl_message",
            "battle_id": battle_id,
            "data": {
                "id": str(uuid.uuid4()),
                "from": "Athena-III",
                "type": "MOVE",
                "content": "Round 1: Analyzing ETH price momentum. My prediction: $3,650 in 48h. Confidence: 0.78",
                "timestamp": time.time() * 1000,
                "nodeColor": "sky",
            }
        },
        {
            "type": "axl_message",
            "battle_id": battle_id,
            "data": {
                "id": str(uuid.uuid4()),
                "from": "Achilles",
                "type": "MOVE",
                "content": "BOLD PREDICTION: $3,800. The momentum is undeniable. Confidence: 0.91",
                "timestamp": time.time() * 1000,
                "nodeColor": "hadria",
            }
        },
        {
            "type": "round_score",
            "battle_id": battle_id,
            "data": {
                "round": 1,
                "scoreA": 72,
                "scoreB": 58,
                "reasoning": "Athena-III showed superior analytical calibration."
            }
        },
        {
            "type": "axl_message",
            "battle_id": battle_id,
            "data": {
                "id": str(uuid.uuid4()),
                "from": "Referee",
                "type": "SCORE",
                "content": "Round 1 complete. Athena-III: 72pts | Achilles: 58pts",
                "timestamp": time.time() * 1000,
                "nodeColor": "willa",
            }
        },
    ]


async def _run_mock_battle(battle_id: str):
    """Simulate a full 5-round battle for demo purposes."""
    rounds = [
        ("prediction", "ETH price in 48h?"),
        ("prediction", "Uniswap vs Aave TVL growth?"),
        ("debate", "Will AI replace traders by 2028?"),
        ("dilemma", "Stake, LP, or hold 1 ETH?"),
        ("oracle", "Most important Web3 development in 6 months?"),
    ]

    agents = ["Athena-III", "Achilles"]
    colors = ["sky", "hadria"]

    for i, (ctype, prompt) in enumerate(rounds):
        round_num = i + 1

        # Broadcast challenge
        await _push_event(battle_id, {
            "type": "battle_phase",
            "battle_id": battle_id,
            "data": f"ROUND_{round_num}",
        })

        await asyncio.sleep(2)

        # Agent A move
        await _push_event(battle_id, {
            "type": "axl_message",
            "battle_id": battle_id,
            "data": {
                "id": str(uuid.uuid4()),
                "from": agents[0],
                "type": "MOVE",
                "content": f"Round {round_num} [{ctype}]: {prompt} — My analysis points to a clear answer. Proceeding with precision.",
                "timestamp": time.time() * 1000,
                "nodeColor": colors[0],
            }
        })

        await asyncio.sleep(2)

        # Agent B move
        await _push_event(battle_id, {
            "type": "axl_message",
            "battle_id": battle_id,
            "data": {
                "id": str(uuid.uuid4()),
                "from": agents[1],
                "type": "MOVE",
                "content": f"Round {round_num}: I answer with absolute conviction. My directive demands boldness.",
                "timestamp": time.time() * 1000,
                "nodeColor": colors[1],
            }
        })

        await asyncio.sleep(2)

        # Round score
        score_a = 60 + (round_num * 3)
        score_b = 55 + (round_num * 2)
        await _push_event(battle_id, {
            "type": "round_score",
            "battle_id": battle_id,
            "data": {
                "round": round_num,
                "scoreA": score_a,
                "scoreB": score_b,
                "reasoning": f"Round {round_num} judged. Athena-III shows consistent precision.",
            }
        })

        await asyncio.sleep(3)

    # Battle end
    await _push_event(battle_id, {
        "type": "battle_end",
        "battle_id": battle_id,
        "data": {
            "winner": "Athena-III",
            "winner_token_id": 2,
            "elo_delta": 24,
        }
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
