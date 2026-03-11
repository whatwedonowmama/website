'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import ReviewCard from '@/components/admin/ReviewCard'
import type { PendingContent } from '@/lib/types'

type Filter = 'all' | 'event' | 'resource'

// ── Date helpers ──────────────────────────────────────────────────────────────
const NOW          = new Date()
const THIS_YEAR    = NOW.getFullYear()
const THIS_MONTH   = NOW.getMonth()   // 0-indexed

function parseEventDate(item: PendingContent): Date | null {
  if (item.content_type !== 'event' || !item.event_date) return null
  const d = new Date(item.event_date + 'T12:00:00')
  return isNaN(d.getTime()) ? null : d
}

/** True → show in main queue. False → Save for Later. */
function isCurrentOrPast(item: PendingContent): boolean {
  const d = parseEventDate(item)
  if (!d) return true  // no date (resources, undated events) → always show in main queue
  return d.getFullYear() < THIS_YEAR ||
    (d.getFullYear() === THIS_YEAR && d.getMonth() <= THIS_MONTH)
}

function monthLabel(isoKey: string): string {
  // isoKey = "YYYY-MM"
  const [y, m] = isoKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function currentMonthLabel(): string {
  return NOW.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// ── Quick Add from URL ────────────────────────────────────────────────────────
function QuickAddUrl({ onAdded }: { onAdded: () => void }) {
  const [url, setUrl]       = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [errMsg, setErrMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    setStatus('loading')
    setErrMsg('')
    try {
      const res  = await fetch('/api/admin/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error ?? `Error ${res.status}`); setStatus('err'); return }
      setStatus('ok')
      setUrl('')
      setTimeout(() => { setStatus('idle'); onAdded() }, 1800)
    } catch {
      setErrMsg('Network error — please try again')
      setStatus('err')
    }
  }

  return (
    <div className="mb-8 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
      <p className="text-xs font-semibold text-brand-purple uppercase tracking-wider mb-3">⚡ Quick Add from URL</p>
      <p className="text-sm text-gray-500 mb-4">Paste any event link — Claude will extract the details and drop it into the review queue.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="url" value={url}
          onChange={e => { setUrl(e.target.value); setStatus('idle'); setErrMsg('') }}
          placeholder="https://www.eventbrite.com/e/…"
          required disabled={status === 'loading'}
          className="flex-1 rounded-2xl px-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-brand-purple transition-colors disabled:opacity-50"
        />
        <button type="submit" disabled={status === 'loading' || !url.trim()}
          className={`px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all disabled:opacity-40 ${
            status === 'ok' ? 'bg-green-500 text-white scale-95' : 'bg-brand-purple text-white hover:bg-brand-purple/90'
          }`}>
          {status === 'loading' ? '⏳ Extracting…' : status === 'ok' ? '✓ Added!' : 'Extract event →'}
        </button>
      </form>
      {status === 'err' && <p className="mt-2 text-xs text-red-600">{errMsg}</p>}
    </div>
  )
}

// ── Save for Later accordion section ─────────────────────────────────────────
function SaveForLater({
  byMonth,
  done,
  onDone,
  defaultOpen,
}: {
  byMonth: Map<string, PendingContent[]>
  done: string[]
  onDone: (id: string) => void
  defaultOpen: boolean
}) {
  const [open, setOpen]                         = useState(defaultOpen)
  const [expandedMonths, setExpandedMonths]     = useState<Set<string>>(new Set())

  const totalCount = [...byMonth.values()].flat().filter(i => !done.includes(i.id)).length
  if (totalCount === 0) return null

  function toggleMonth(key: string) {
    setExpandedMonths(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const sortedKeys = [...byMonth.keys()].sort()

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      {/* Section header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between group mb-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-brand-navy font-display">📦 Save for Later</span>
          <span className="text-xs bg-brand-lavender text-brand-purple font-semibold px-2.5 py-0.5 rounded-full">
            {totalCount} event{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <span className={`text-gray-400 text-sm transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="flex flex-col gap-6">
          <p className="text-xs text-gray-400 -mt-2">
            These events are scheduled for future months. They&apos;ll automatically move into your main queue when their month arrives.
          </p>

          {sortedKeys.map(key => {
            const monthItems = byMonth.get(key)!.filter(i => !done.includes(i.id))
            if (monthItems.length === 0) return null
            const isExpanded = expandedMonths.has(key)

            return (
              <div key={key}>
                {/* Month header — click to expand/collapse */}
                <button
                  onClick={() => toggleMonth(key)}
                  className="w-full flex items-center justify-between mb-3 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-navy">{monthLabel(key)}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {monthItems.length} event{monthItems.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className={`text-gray-300 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {isExpanded && (
                  <div className="flex flex-col gap-4">
                    {monthItems
                      .slice()
                      .sort((a, b) => (a.event_date ?? '').localeCompare(b.event_date ?? ''))
                      .map(item => (
                        <ReviewCard
                          key={item.id}
                          item={item}
                          onDone={onDone}
                          onApprove={() => {}}
                        />
                      ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
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

  // ── Split into this month vs. future ───────────────────────────────────────
  const active = items.filter(i => !done.includes(i.id))
  const filtered = active.filter(i => filter === 'all' || i.content_type === filter)

  // Sort by event_date ascending (earliest first), undated last
  const sorted = filtered.slice().sort((a, b) => {
    const da = a.event_date ?? '9999-99-99'
    const db = b.event_date ?? '9999-99-99'
    return da.localeCompare(db)
  })

  const thisMonthItems = sorted.filter(isCurrentOrPast)
  const laterItems     = sorted.filter(i => !isCurrentOrPast(i))

  // Group future items by YYYY-MM
  const laterByMonth = new Map<string, PendingContent[]>()
  for (const item of laterItems) {
    const d = parseEventDate(item)!
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!laterByMonth.has(key)) laterByMonth.set(key, [])
    laterByMonth.get(key)!.push(item)
  }

  const totalPending  = active.length
  const laterCount    = laterItems.length

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <Link href="/admin" className="text-sm text-brand-purple hover:underline">← Admin</Link>
          <h1 className="font-display text-2xl font-bold text-brand-navy mt-1">Content Review</h1>
        </div>
        <div className="flex items-center gap-2">
          {laterCount > 0 && (
            <span className="text-xs bg-brand-lavender text-brand-purple font-medium px-2.5 py-1 rounded-full">
              {laterCount} saved for later
            </span>
          )}
          <span className="text-sm text-gray-400">{totalPending} pending</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Approve to publish live, edit to tweak first, or skip to discard.
      </p>

      {/* Quick Add */}
      <QuickAddUrl onAdded={load} />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'event', 'resource'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-brand-purple text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-purple'
            }`}>
            {f === 'all' ? 'All' : f === 'event' ? '📅 Events' : '📖 Resources'}
          </button>
        ))}
      </div>

      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{apiError}</div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(n => <div key={n} className="bg-white rounded-3xl border border-gray-100 h-48 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 && laterByMonth.size === 0 ? (
        /* Totally empty */
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <span className="text-5xl">🎉</span>
          <p className="font-display text-xl font-bold text-brand-navy">All caught up!</p>
          <p className="text-gray-500 text-sm">No pending content to review right now.</p>
          <Link href="/admin" className="btn-primary text-sm mt-2">Back to dashboard</Link>
        </div>
      ) : (
        <>
          {/* ── This month section ── */}
          {thisMonthItems.length > 0 && (
            <div>
              {/* Month label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-brand-purple uppercase tracking-wider">
                  📅 {currentMonthLabel()}
                </span>
                <span className="text-xs bg-brand-coral/10 text-brand-coral font-medium px-2 py-0.5 rounded-full">
                  {thisMonthItems.length} to review
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {thisMonthItems.map(item => (
                  <ReviewCard
                    key={item.id}
                    item={item}
                    onDone={id => setDone(d => [...d, id])}
                    onApprove={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state for this month only (but future items exist) */}
          {thisMonthItems.length === 0 && laterByMonth.size > 0 && (
            <div className="text-center py-10 flex flex-col items-center gap-2">
              <span className="text-4xl">✅</span>
              <p className="font-semibold text-brand-navy">Nothing to review this month</p>
              <p className="text-sm text-gray-500">Future events are waiting below.</p>
            </div>
          )}

          {/* ── Save for Later section ── */}
          <SaveForLater
            byMonth={laterByMonth}
            done={done}
            onDone={id => setDone(d => [...d, id])}
            defaultOpen={thisMonthItems.length === 0}
          />
        </>
      )}

      {/* Reload */}
      {!loading && totalPending === 0 && items.length > 0 && (
        <div className="mt-8 text-center">
          <button onClick={load} className="text-sm text-brand-purple hover:underline">
            Load fresh batch →
          </button>
        </div>
      )}
    </div>
  )
}
