export interface GlobalStats {
  count: number
  avg: number
}

const FALLBACK: GlobalStats = { count: 0, avg: 0 }

export async function fetchGlobalStats(
  gasUrl: string,
  topic: string
): Promise<GlobalStats> {
  if (!gasUrl) return FALLBACK
  try {
    const res = await fetch(`${gasUrl}?topic=${topic}&t=${Date.now()}`)
    const data = await res.json()
    return { count: data.count || 0, avg: data.avg || 0 }
  } catch {
    return FALLBACK
  }
}

export async function postScore(
  gasUrl: string,
  topic: string,
  score: number
): Promise<void> {
  if (!gasUrl) return
  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ topic, score }),
    })
  } catch {
    // Silently fail - analytics should never block the user
  }
}
