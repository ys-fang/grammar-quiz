import { useState, useEffect } from 'react'
import { fetchGlobalStats, type GlobalStats } from '../lib/gas-client'

export function useGlobalStats(gasUrl: string, topic: string) {
  const [stats, setStats] = useState<GlobalStats | null>(null)

  useEffect(() => {
    fetchGlobalStats(gasUrl, topic).then(setStats)
  }, [gasUrl, topic])

  return stats
}
