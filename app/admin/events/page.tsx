'use client'

import { useEffect, useState } from 'react'

interface Event {
  id: string
  title: string
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

export default function AdminEventsPage() {
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/events')
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false) })
  }, [])

  async function togglePin(event: Event) {
    setSaving(event.id)
    const newPinned = !event.is_pinned

    // Cap at 4 featured events
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

  const pinned   = events.filter(e => e.is_pinned)
  const unpinned = events.filter(e => !e.is_pinned)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Live Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            Toggle ⭐ to feature up to 4 events on the home page.
          </p>
        </div>
        <span className="text-sm bg-brand-lavender text-brand-purple font-semibold px-3 py-1 rounded-full">
          {pinned.length}/4 featured
        </span>
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
                onTogglePin={() => togglePin(event)}
                onDelete={() => deleteEvent(event.id)}
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
                onTogglePin={() => togglePin(event)}
                onDelete={() => deleteEvent(event.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EventRow({
  event,
  saving,
  onTogglePin,
  onDelete,
}: {
  event: Event
  saving: boolean
  onTogglePin: () => void
  onDelete: () => void
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
