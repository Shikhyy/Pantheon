import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name || name.length < 3) {
    return NextResponse.json({ available: false, reason: 'too-short' })
  }

  // Sanitize
  const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '')

  try {
    // In production: call ensjs to check owner of sanitized.pantheon.eth
    // For demo: always available unless in reserved list
    const reserved = ['zeus', 'athena', 'apollo', 'ares', 'hera', 'poseidon', 'admin']
    const taken    = ['achilles', 'athena-iii', 'oracle-7']

    if (reserved.includes(sanitized)) {
      return NextResponse.json({ available: false, reason: 'reserved', ensName: `${sanitized}.pantheon.eth` })
    }
    if (taken.includes(sanitized)) {
      return NextResponse.json({ available: false, reason: 'taken', ensName: `${sanitized}.pantheon.eth` })
    }

    return NextResponse.json({
      available: true,
      ensName: `${sanitized}.pantheon.eth`,
    })
  } catch (error) {
    return NextResponse.json(
      { available: false, reason: 'error', message: String(error) },
      { status: 500 }
    )
  }
}
