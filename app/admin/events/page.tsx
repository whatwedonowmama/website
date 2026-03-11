'use client'

import { useEffect, useState } from 'react'
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
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return d }
}

// ── Format an event as email-ready copy ──────────────────────────────────────
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

  // Keep textarea in sync when entries are added/removed
  useEffect(() => {
    setText(draft.join('\n\n---\n\n'))
  }, [draft])

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
              copied
                ? 'bg-green-500 text-white scale-95'
                : 'bg-brand-purple text-white hover:bg-brand-purple/90'
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

      {/* Individual entry cards */}
      <div className="flex flex-col gap-2 mb-5">
        {draft.map((entry, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 relative group shadow-sm">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed pr-6">
              {entry}
            </pre>
            <button
              onClick={() => onRemove(i)}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm leading-none"
              title="Remove from draft"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Editable combined textarea */}
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

export default function AdminEventsPage() {
  const [events, setEvents]         = useState<Event[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState<string[]>([])
  const [justAdded, setJustAdded]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/events')
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false) })
  }, [])

  async function togglePin(event: Event) {
    setSaving(event.id)
    const newPinned = !event.is_pinned
    const currentPinned = events.filter(e => e.is_pinned && e.id !== event.id).length
    if (newPinned && currentPinned >= 4) {
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

  const pinned   = events.filter(e => e.is_pinned)
  const unpinned = events.filter(e => !e.is_pinned)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link href="/admin" className="text-sm text-brand-purple hover:underline">← Admin</Link>
          <h1 className="font-display text-2xl font-bold text-brand-navy mt-1">Live Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            Toggle ⭐ to feature on the home page · ✉️ Email to build your newsletter draft.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {emailDraft.length > 0 && (
            <span className="text-xs bg-brand-coral text-white font-semibold px-3 py-1.5 rounded-full">
              ✉️ {emailDraft.length} in draft ↓
            </span>
          )}
          <span className="text-sm bg-brand-lavender text-brand-purple font-semibold px-3 py-1 rounded-full">
            {pinned.length}/4 featured
          </span>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400">Loading events…</div>
      )}

      {!loading && events.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
          No live events yet. Approve some from the{' '}
          <a href="/admin/review" className="text-brand-purple font-semibold hover:underline">review queue</a>.
        </div>
      )}

      {/* Featured section */}
      {pinned.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-wider mb-3">
            ⭐ Featured on home page
          </p>
          <div className="flex flex-col gap-3">
            {pinned.map(event => (
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

      {/* All other events */}
      {unpinned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            All live events
          </p>
          <div className="flex flex-col gap-3">
            {unpinned.map(event => (
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

      {/* Email Draft Panel — appears below the list, no auto-scroll */}
      <EmailDraftPanel
        draft={emailDraft}
        onRemove={i => setEmailDraft(prev => prev.filter((_, idx) => idx !== i))}
        onClear={() => setEmailDraft([])}
      />
    </div>
  )
}

function EventRow({
  event,
  saving,
  justAdded,
  onTogglePin,
  onDelete,
  onAddToEmail,
}: {
  event: Event
  saving: boolean
  justAdded: boolean
  onTogglePin: () => void
  onDelete: () => void
  onAddToEmail: () => void
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all ${
      event.is_pinned ? 'border-brand-purple/40 shadow-sm' : 'border-gray-100'
    }`}>

      {/* Pin toggle */}
      <button
        onClick={onTogglePin}
        disabled={saving}
        title={event.is_pinned ? 'Remove from home page' : 'Feature on home page'}
        className={`text-2xl leading-none flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-40 ${
          event.is_pinned ? 'opacity-100' : 'opacity-25 hover:opacity-60'
        }`}
      >
        ⭐
      </button>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-brand-navy text-sm truncate">{event.title}</p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
          <span>📅 {formatDate(event.event_date)}</span>
          {event.event_time && <span>🕐 {event.event_time}</span>}
          {event.city && <span>📍 {event.city}</span>}
          <span className={event.is_free ? 'text-green-600 font-medium' : ''}>
            {event.is_free ? '✓ Free' : event.price}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Convert to Email */}
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
