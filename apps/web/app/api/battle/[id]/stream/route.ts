import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sseBridgeUrl = process.env.NEXT_PUBLIC_SSE_BRIDGE_URL ?? 'http://localhost:8000'

  try {
    // Proxy SSE from FastAPI backend
    const upstreamUrl = `${sseBridgeUrl}/battle/${id}/stream`
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: 'text/event-stream' },
    })

    if (!upstream.ok) {
      // Return mock SSE for demo when backend not running
      return mockSSEResponse(id)
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch {
    return mockSSEResponse(id)
  }
}

function mockSSEResponse(battleId: string): Response {
  const encoder = new TextEncoder()
  let interval: ReturnType<typeof setInterval>

  const stream = new ReadableStream({
    start(controller) {
      let i = 0
      const messages = [
        { type: 'axl_message', data: { id: '1', from: 'Athena-III', type: 'MOVE', content: 'Round starting. Analyzing challenge with precision algorithms.', timestamp: Date.now(), nodeColor: 'sky' } },
        { type: 'axl_message', data: { id: '2', from: 'Achilles', type: 'MOVE', content: 'My conviction is absolute. The answer is clear.', timestamp: Date.now(), nodeColor: 'hadria' } },
        { type: 'round_score', data: { round: 1, scoreA: 72, scoreB: 58, reasoning: 'Athena-III showed superior analytical depth.' } },
      ]

      interval = setInterval(() => {
        if (i < messages.length) {
          const msg = messages[i++]
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`))
        } else {
          clearInterval(interval)
          controller.close()
        }
      }, 2000)
    },
    cancel() {
      clearInterval(interval)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
