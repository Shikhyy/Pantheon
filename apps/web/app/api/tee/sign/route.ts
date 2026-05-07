import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.payload_hex) {
      return NextResponse.json({ error: 'Missing payload_hex' }, { status: 400 })
    }

    const upstream = `${process.env.NEXT_PUBLIC_SSE_BRIDGE_URL || 'http://localhost:8000'}/tee/sign`
    const res = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Server-only env var — do NOT expose this to the browser
        'x-tee-api-key': process.env.TEE_API_KEY || '',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error(`TEE sign upstream error: ${res.status} ${res.statusText}`)
      return NextResponse.json(
        { error: `TEE service error: ${res.statusText}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    if (!data.signature) {
      console.error('TEE sign returned missing signature field', data)
      return NextResponse.json(
        { error: 'Invalid TEE response: missing signature' },
        { status: 500 }
      )
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error('TEE sign error:', e)
    return NextResponse.json(
      { error: `TEE signing failed: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    )
  }
}
