import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Manifest } from '../types/quiz'

type LoadState = 'loading' | 'error' | 'success'

export function LandingPage() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')

  useEffect(() => {
    let cancelled = false

    async function loadManifest() {
      try {
        const response = await fetch('./data/manifest.json')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        if (!cancelled) {
          setManifest(data)
          setLoadState('success')
        }
      } catch (err) {
        console.error('Failed to load manifest:', err)
        if (!cancelled) {
          setLoadState('error')
        }
      }
    }

    loadManifest()
    return () => {
      cancelled = true
    }
  }, [])

  if (loadState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-rose-50 to-amber-50">
        <div className="animate-pulse text-amber-800 text-lg">載入中...</div>
      </div>
    )
  }

  if (loadState === 'error' || !manifest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">無法載入題庫</h1>
          <p className="text-slate-600 mb-6">請檢查網路連線後重試</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            重新整理
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="landing-page min-h-screen bg-gradient-to-b from-rose-50 to-amber-50">
      {/* Noren header */}
      <header className="noren-header text-center pt-0 pb-10">
        <div className="noren flex justify-center gap-2 mb-4">
          {'文法練習'.split('').map((char, i) => (
            <div
              key={i}
              className="noren-part w-16 h-20 bg-red-700 text-white flex items-center justify-center text-2xl font-bold rounded-b-lg shadow-md"
            >
              {char}
            </div>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-amber-900 mt-4">
          國中英文解憂雜貨店
        </h1>
        <p className="text-amber-700 mt-2 text-sm">
          分類學習，釐清邏輯，戰勝會考文法失分陷阱
        </p>
      </header>

      {/* Category sections */}
      <main className="max-w-4xl mx-auto px-4 pb-16 space-y-10">
        {manifest.categories.map((cat, ci) => (
          <section key={ci} className="category-section">
            <h2 className="category-title text-lg font-bold text-amber-800 mb-4 border-b-2 border-amber-200 pb-2">
              {cat.categoryTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.topics.map((topic, ti) => (
                <Link
                  key={ti}
                  to={`/quiz/${topic.topicId}`}
                  className="topic-card block p-4 rounded-xl bg-white/80 backdrop-blur border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all duration-200"
                >
                  <span className="topic-name text-sm font-medium text-slate-700">
                    {topic.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="text-center py-6 text-xs text-amber-600">
        國中英文解憂雜貨店 — 文法練習區
      </footer>
    </div>
  )
}
