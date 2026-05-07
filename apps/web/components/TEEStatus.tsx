'use client'

import { useEffect, useState } from 'react'

type TeeStatus = {
  provider?: string
  ready?: boolean
  public_key?: string | null
  error?: string
}

export default function TEEStatus() {
  const [data, setData] = useState<TeeStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    const load = async () => {
      try {
        const response = await fetch('/api/tee/status')
        const json = await response.json()
        if (!alive) return
        setData(json)
        setError(null)
      } catch (err) {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Unable to load TEE status')
      }
    }

    load()
    const timer = window.setInterval(load, 5000)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [])

  if (error) return <div className="text-sm text-red-500">TEE status: error</div>
  if (!data) return <div className="text-sm text-yellow-400">TEE status: loading...</div>

  return (
    <div className="rounded-2xl border border-gold/20 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 shadow-lg shadow-black/10 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-gold/70">TEE</div>
          <div className="mt-1 text-base text-parch">{data.provider ?? 'unknown'}</div>
        </div>
        <div className={`rounded-full px-3 py-1 text-[10px] tracking-[0.2em] uppercase ${data.ready ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
          {data.ready ? 'Ready' : 'Offline'}
        </div>
      </div>
      {data.public_key ? <div className="mt-2 break-all text-xs text-parch/50">{data.public_key}</div> : null}
    </div>
  )
}
