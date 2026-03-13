'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  city: string | null
  location_name: string | null
  price: string | null
  is_free: boolean
  is_pinned: boolean
  slug: string | null
  source_url: string | null
}

function formatDate(d: string) {
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return d }
}

function monthLabel(d: string) {
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'long', year: 'numeric',
    })
  } catch { return d.slice(0, 7) }
}

function monthKey(d: string) {
  return d.slice(0, 7) // YYYY-MM
}

function isPast(d: string) {
  return new Date(d + 'T23:59:59') < new Date()
}

// ── Format event as email-ready copy ─────────────────────────────────────────
function formatForEmail(event: Event): string {
  const lines: string[] = []
  lines.push(`📅 ${event.title}`)
  const dateParts = [
    event.event_date ? formatDate(event.event_date) : null,
    event.event_time,
  ].filter(Boolean)
  if (dateParts.length) lines.push(`🗓  ${dateParts.join(' at ')}`)
  const locParts = [event.location_name, event.city].filter(Boolean)
  if (locParts.length) lines.push(`📍 ${locParts.join(', ')}`)
  lines.push(`💰 ${event.is_free ? 'Free' : event.price || 'Paid'}`)
  if (event.source_url) lines.push(`🔗 ${event.source_url}`)
  if (event.description) lines.push(`\n${event.description}`)
  return lines.join('\n')
}

// ── Email Draft Panel ─────────────────────────────────────────────────────────
function EmailDraftPanel({
  draft,
  onRemove,
  onClear,
}: {
  draft: string[]
  onRemove: (i: number) => void
  onClear: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [text, setText]     = useState(draft.join('\n\n---\n\n'))

  useEffect(() => { setText(draft.join('\n\n---\n\n')) }, [draft])

  function copyAll() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (draft.length === 0) return null

  return (
    <div className="mt-14 border-t border-gray-100 pt-10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-navy">✉️ Email Draft</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {draft.length} event{draft.length !== 1 ? 's' : ''} — ready to paste into Beehiiv
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyAll}
            className={`text-sm px-4 py-2 rounded-xl font-semibold transition-all ${
              copied ? 'bg-green-500 text-white scale-95' : 'bg-brand-purple text-white hover:bg-brand-purple/90'
            }`}
          >
            {copied ? '✓ Copied!' : '📋 Copy all'}
          </button>
          <button
            onClick={() => { if (confirm('Clear the email draft?')) onClear() }}
            className="text-sm px-3 py-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        {draft.map((entry, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 relative group shadow-sm">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed pr-6">
              {entry}
            </pre>
            <button
              onClick={() => onRemove(i)}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
              title="Remove from draft"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="bg-brand-cream border border-brand-gold/30 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand-gold/20">
          <span className="text-xs font-medium text-brand-navy/60">Editable draft — tweak before you copy</span>
          <button onClick={copyAll} className="text-xs text-brand-purple hover:underline font-medium">
            {copied ? '✓ Copied' : 'Copy →'}
          </button>
        </div>
        <textarea
          className="w-full text-sm font-mono text-gray-700 bg-transparent p-4 resize-none focus:outline-none"
          rows={Math.max(draft.length * 8, 8)}
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Paste into Beehiiv → New Post → paste this as your event roundup draft
      </p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminEventsPage() {
  const [events, setEvents]         = useState<Event[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState<string[]>([])
  const [justAdded, setJustAdded]   = useState<string | null>(null)

  // ── Filters / sort ──
  const [search,     setSearch]     = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('asc')
  const [showPast,   setShowPast]   = useState(false)

  useEffect(() => {
    fetch('/api/admin/events')
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false) })
  }, [])

  async function togglePin(event: Event) {
    setSaving(event.id)
    const newPinned = !event.is_pinned
    if (newPinned && events.filter(e => e.is_pinned && e.id !== event.id).length >= 4) {
      alert('You already have 4 featured events. Unfeature one first.')
      setSaving(null)
      return
    }
    await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: event.id, is_pinned: newPinned }),
    })
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_pinned: newPinned } : e))
    setSaving(null)
  }

  async function deleteEvent(id: string) {
    if (!confirm('Remove this event from the site?')) return
    setSaving(id)
    await fetch('/api/admin/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setEvents(prev => prev.filter(e => e.id !== id))
    setSaving(null)
  }

  function addToEmailDraft(event: Event) {
    setEmailDraft(prev => [...prev, formatForEmail(event)])
    setJustAdded(event.id)
    setTimeout(() => setJustAdded(null), 2000)
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const cities = useMemo(() => {
    const cs = [...new Set(events.map(e => e.city).filter(Boolean))] as string[]
    return cs.sort()
  }, [events])

  const pinned = useMemo(() => events.filter(e => e.is_pinned), [events])

  // Apply search + city + past filter, then sort
  const filtered = useMemo(() => {
    let list = events.filter(e => !e.is_pinned)
    if (!showPast)     list = list.filter(e => !isPast(e.event_date))
    if (search)        list = list.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
    if (cityFilter !== 'all') list = list.filter(e => e.city === cityFilter)
    list = [...list].sort((a, b) => {
      const cmp = a.event_date.localeCompare(b.event_date)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [events, search, cityFilter, sortDir, showPast])

  // Group by month
  const monthGroups = useMemo(() => {
    const map = new Map<string, { label: string; events: Event[] }>()
    for (const e of filtered) {
      const key = monthKey(e.event_date)
      if (!map.has(key)) map.set(key, { label: monthLabel(e.event_date), events: [] })
      map.get(key)!.events.push(e)
    }
    const entries = [...map.entries()].sort(([a], [b]) =>
      sortDir === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    )
    return entries.map(([key, val]) => ({ key, ...val }))
  }, [filtered, sortDir])

  const pastCount = useMemo(
    () => events.filter(e => !e.is_pinned && isPast(e.event_date)).length,
    [events]
  )

  const todayKey = new Date().toISOString().slice(0, 7)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link href="/admin" className="text-sm text-brand-purple hover:underline">← Admin</Link>
          <h1 className="font-display text-2xl font-bold text-brand-navy mt-1">Live Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            ⭐ Feature on home page · ✉️ Add to newsletter draft
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {emailDraft.length > 0 && (
            <span className="text-xs bg-brand-coral text-white font-semibold px-3 py-1.5 rounded-full">
              ✉️ {emailDraft.length} in draft ↓
            </span>
          )}
          <span className="text-xs bg-brand-lavender text-brand-purple font-semibold px-3 py-1.5 rounded-full">
            {pinned.length}/4 featured
          </span>
          <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-3 py-1.5 rounded-full">
            {events.length} total
          </span>
        </div>
      </div>

      {/* ── Filter / sort bar ── */}
      {!loading && events.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-3 mb-6 flex flex-wrap gap-2 items-center">

          {/* Search */}
          <input
            type="text"
            placeholder="Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[160px] text-sm px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-purple placeholder-gray-400 text-brand-navy"
          />

          {/* City filter */}
          {cities.length > 1 && (
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-purple text-brand-navy bg-white"
            >
              <option value="all">All cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {/* Sort direction */}
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border border-gray-200 hover:border-brand-purple text-brand-navy font-medium transition-all"
            title="Toggle sort order"
          >
            📅 Date {sortDir === 'asc' ? '↑ Oldest first' : '↓ Newest first'}
          </button>

          {/* Show past toggle */}
          <button
            onClick={() => setShowPast(v => !v)}
            className={`text-sm px-3 py-1.5 rounded-xl border font-medium transition-all ${
              showPast
                ? 'bg-gray-100 border-gray-300 text-gray-600'
                : 'border-gray-200 text-gray-400 hover:border-gray-300'
            }`}
          >
            {showPast ? '🕐 Hiding past' : `🕐 Show past (${pastCount})`}
          </button>

          {/* Clear filters */}
          {(search || cityFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setCityFilter('all') }}
              className="text-xs text-brand-purple hover:underline font-semibold"
            >
              Clear ×
            </button>
          )}
        </div>
      )}

      {loading && <div className="text-center py-16 text-gray-400">Loading events…</div>}

      {!loading && events.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
          No live events yet. Approve some from the{' '}
          <a href="/admin/review" className="text-brand-purple font-semibold hover:underline">review queue</a>.
        </div>
      )}

      {/* ── Featured ── */}
      {pinned.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-wider">
              ⭐ Featured on home page
            </p>
            <span className="text-xs text-brand-purple/60">{pinned.length}/4</span>
          </div>
          <div className="flex flex-col gap-2">
            {[...pinned]
              .sort((a, b) => sortDir === 'asc'
                ? a.event_date.localeCompare(b.event_date)
                : b.event_date.localeCompare(a.event_date)
              )
              .map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  saving={saving === event.id}
                  justAdded={justAdded === event.id}
                  onTogglePin={() => togglePin(event)}
                  onDelete={() => deleteEvent(event.id)}
                  onAddToEmail={() => addToEmailDraft(event)}
                />
              ))}
          </div>
        </div>
      )}

      {/* ── Month groups ── */}
      {!loading && monthGroups.length === 0 && events.length > 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          No events match your filters.{' '}
          <button onClick={() => { setSearch(''); setCityFilter('all'); setShowPast(true) }} className="text-brand-purple hover:underline">
            Clear filters
          </button>
        </div>
      )}

      <div className="space-y-8">
        {monthGroups.map(group => {
          const isCurrentMonth = group.key === todayKey
          const isPastMonth    = group.key < todayKey

          return (
            <div key={group.key}>
              {/* Month header */}
              <div className={`flex items-center gap-3 mb-3 pb-2 border-b ${
                isPastMonth ? 'border-gray-100' : 'border-brand-purple/20'
              }`}>
                <h2 className={`font-display text-base font-bold ${
                  isPastMonth ? 'text-gray-400' : 'text-brand-navy'
                }`}>
                  {group.label}
                </h2>
                {isCurrentMonth && (
                  <span className="text-xs bg-brand-purple text-white font-semibold px-2 py-0.5 rounded-full">
                    This month
                  </span>
                )}
                {isPastMonth && (
                  <span className="text-xs bg-gray-100 text-gray-400 font-medium px-2 py-0.5 rounded-full">
                    Past
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {group.events.length} event{group.events.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {group.events.map(event => (
                  <EventRow
                    key={event.id}
                    event={event}
                    saving={saving === event.id}
                    justAdded={justAdded === event.id}
                    onTogglePin={() => togglePin(event)}
                    onDelete={() => deleteEvent(event.id)}
                    onAddToEmail={() => addToEmailDraft(event)}
                    dimmed={isPast(event.event_date)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Email Draft Panel ── */}
      <EmailDraftPanel
        draft={emailDraft}
        onRemove={i => setEmailDraft(prev => prev.filter((_, idx) => idx !== i))}
        onClear={() => setEmailDraft([])}
      />
    </div>
  )
}

// ── Event Row ─────────────────────────────────────────────────────────────────
function EventRow({
  event,
  saving,
  justAdded,
  onTogglePin,
  onDelete,
  onAddToEmail,
  dimmed = false,
}: {
  event: Event
  saving: boolean
  justAdded: boolean
  onTogglePin: () => void
  onDelete: () => void
  onAddToEmail: () => void
  dimmed?: boolean
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all ${
      event.is_pinned
        ? 'border-brand-purple/40 shadow-sm'
        : dimmed
          ? 'border-gray-100 opacity-50 hover:opacity-80'
          : 'border-gray-100 hover:border-gray-200'
    }`}>

      {/* Pin toggle */}
      <button
        onClick={onTogglePin}
        disabled={saving}
        title={event.is_pinned ? 'Remove from home page' : 'Feature on home page'}
        className={`text-xl leading-none flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-40 ${
          event.is_pinned ? 'opacity-100' : 'opacity-20 hover:opacity-60'
        }`}
      >
        ⭐
      </button>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-brand-navy text-sm truncate">{event.title}</p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
          <span className="font-medium text-gray-600">📅 {formatDate(event.event_date)}</span>
          {event.event_time && <span>🕐 {event.event_time}</span>}
          {event.city && <span>📍 {event.city}</span>}
          <span className={event.is_free ? 'text-green-600 font-medium' : ''}>
            {event.is_free ? '✓ Free' : event.price}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onAddToEmail}
          disabled={saving}
          title="Add to email draft"
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all disabled:opacity-40 ${
            justAdded
              ? 'bg-green-500 text-white scale-95'
              : 'bg-brand-lavender text-brand-purple hover:bg-brand-lavender/70'
          }`}
        >
          {justAdded ? '✓ Added' : '✉️ Email'}
        </button>

        {event.slug && (
          <a
            href={`/events/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-purple hover:underline"
          >
            View ↗
          </a>
        )}
        <button
          onClick={onDelete}
          disabled={saving}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
