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
    // Reject invalid characters after sanitization
    if (sanitized !== name.toLowerCase() || sanitized.length < 3) {
      return NextResponse.json({ available: false, reason: 'invalid-format' })
    }

    // Hard-reserved names that should never be available
    const reserved = ['zeus', 'athena', 'apollo', 'ares', 'hera', 'poseidon', 'admin', 'pantheon', 'oracle', 'owner', 'admin']
    // Demo-taken names for testing
    const taken    = ['achilles', 'athena-iii', 'oracle-7']

    if (reserved.includes(sanitized)) {
      return NextResponse.json({
        available: false,
        reason: 'reserved',
        ensName: `${sanitized}.pantheon.eth`,
        message: 'This name is reserved by Pantheon'
      })
    }

    if (taken.includes(sanitized)) {
      return NextResponse.json({
        available: false,
        reason: 'taken',
        ensName: `${sanitized}.pantheon.eth`,
        message: 'This name is already registered'
      })
    }

    // TODO: In production, call ensjs/viem to check actual ENS subname ownership
    // const resolver = await getEnsResolver(publicClient, { name: `${sanitized}.pantheon.eth` })
    // const owner = await resolver?.getAddress()
    // if (owner) return { available: false, reason: 'taken' }

    return NextResponse.json({
      available: true,
      ensName: `${sanitized}.pantheon.eth`,
    })
  } catch (error) {
    console.error('ENS check error:', error)
    return NextResponse.json(
      {
        available: false,
        reason: 'error',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
