'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import ReviewCard from '@/components/admin/ReviewCard'
import type { PendingContent } from '@/lib/types'

type Filter = 'all' | 'event' | 'resource'

export default function ReviewPage() {
  const [items, setItems]       = useState<PendingContent[]>([])
  const [filter, setFilter]     = useState<Filter>('all')
  const [loading, setLoading]   = useState(true)
  const [done, setDone]         = useState<string[]>([])
  const [apiError, setApiError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    const res  = await fetch('/api/admin/pending')
    const data = await res.json()
    if (!res.ok) {
      setApiError(`API ${res.status}: ${data.error ?? 'Unknown error'}`)
      setItems([])
    } else {
      setItems(data.items ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const visible = items
    .filter(i => !done.includes(i.id))
    .filter(i => filter === 'all' || i.content_type === filter)

  const remaining = items.filter(i => !done.includes(i.id)).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <Link href="/admin" className="text-sm text-brand-purple hover:underline">← Admin</Link>
          <h1 className="font-display text-2xl font-bold text-brand-navy mt-1">Content Review</h1>
        </div>
        <span className="text-sm text-gray-400">
          {remaining} pending
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Review scraped events and resources. Approve to publish live, edit to tweak first, or skip to discard.
      </p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'event', 'resource'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-brand-purple text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-purple'
            }`}
          >
            {f === 'all' ? 'All' : f === 'event' ? '📅 Events' : '📖 Resources'}
          </button>
        ))}
      </div>

      {/* API Error */}
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-3xl border border-gray-100 h-48 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-3">
          <span className="text-5xl">🎉</span>
          <p className="font-display text-xl font-bold text-brand-navy">All caught up!</p>
          <p className="text-gray-500 text-sm">No pending content to review right now.</p>
          <Link href="/admin" className="btn-primary text-sm mt-2">Back to dashboard</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map(item => (
            <ReviewCard
              key={item.id}
              item={item}
              onDone={(id) => setDone(d => [...d, id])}
            />
          ))}
        </div>
      )}

      {/* Reload button */}
      {!loading && remaining === 0 && items.length > 0 && (
        <div className="mt-8 text-center">
          <button onClick={load} className="text-sm text-brand-purple hover:underline">
            Load fresh batch →
          </button>
        </div>
      )}
    </div>
  )
}
