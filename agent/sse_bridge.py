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
import logging
from typing import AsyncGenerator

from fastapi import FastAPI, BackgroundTasks, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel

from tee import get_default_tee
import os

logger = logging.getLogger(__name__)

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

        while True:
            # Check for real events
            try:
                event = await queue.get()
                yield {"data": json.dumps(event)}
            except Exception as e:
                logger.error(f"Error in SSE event generator: {e}")
                break

    return EventSourceResponse(event_generator())


@app.post("/battle/{battle_id}/emit")
async def emit_event(battle_id: str, event: dict):
    """Internal endpoint for agent processes to push events."""
    await _push_event(battle_id, event)
    return {"ok": True}


# ── TEE (Trusted Execution Environment) shim endpoints ─────────


@app.get("/tee/status")
async def tee_status():
    try:
        tee = get_default_tee()
        return tee.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SignRequest(BaseModel):
    payload_hex: str


@app.post("/tee/sign")
async def tee_sign(req: SignRequest, request: Request):
    """Sign arbitrary payload via the configured TEE provider.

    Returns raw signature bytes as hex. In production this should be
    restricted and authenticated.
    """
    # Simple API-key ACL for signing. In production replace with mTLS/JWT.
    api_key = os.environ.get("TEE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="TEE signing not configured")

    provided = request.headers.get("x-tee-api-key")
    if not provided:
        raise HTTPException(status_code=401, detail="Missing x-tee-api-key header")

    if provided != api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")

    try:
        tee = get_default_tee()
        payload = bytes.fromhex(req.payload_hex.replace('0x', ''))
        sig = tee.sign(payload)
        # Signature may be bytes or hex-string
        if isinstance(sig, bytes):
            return {"signature": sig.hex()}
        return {"signature": sig if sig.startswith('0x') else f"0x{sig}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
