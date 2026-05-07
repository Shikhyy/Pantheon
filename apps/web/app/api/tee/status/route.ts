import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url = `${process.env.NEXT_PUBLIC_SSE_BRIDGE_URL || 'http://localhost:8000'}/tee/status`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })

    if (!res.ok) {
      console.warn(`TEE status upstream error: ${res.status} ${res.statusText}`)
      return NextResponse.json(
        { provider: 'unknown', ready: false, error: `HTTP ${res.status}` },
        { status: 200 }
      )
    }

    const data = await res.json()
    if (typeof data !== 'object' || !('provider' in data) || !('ready' in data)) {
      console.error('TEE status returned invalid schema', data)
      return NextResponse.json(
        { provider: 'unknown', ready: false, error: 'Invalid response schema' },
        { status: 200 }
      )
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error('TEE status error:', e)
    return NextResponse.json(
      { provider: 'unknown', ready: false, error: String(e) },
      { status: 200 }
    )
  }
}
