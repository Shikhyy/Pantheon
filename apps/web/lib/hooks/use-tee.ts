import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useTEEStatus() {
  const { data, error, mutate } = useSWR('/api/tee/status', fetcher, { refreshInterval: 5000 })
  return { data, error, refresh: mutate }
}

export async function teeSign(payloadHex: string) {
  const res = await fetch('/api/tee/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload_hex: payloadHex }),
  })
  return res.json()
}
