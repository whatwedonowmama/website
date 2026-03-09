'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// These are hardcoded in scraper/sites.yaml and always active
const BUILTIN_SOURCES = [
  {
    name:      'Eventbrite OC',
    url:       'https://www.eventbrite.com/d/ca--orange-county/family-events/',
    frequency: 'weekly' as const,
    notes:     'Main Eventbrite OC family events page. Updates constantly.',
  },
  {
    name:      'Meetup OC Families',
    url:       'https://www.meetup.com/find/?keywords=family+kids&location=Orange+County%2C+CA&source=EVENTS',
    frequency: 'weekly' as const,
    notes:     'OC family meetup groups.',
  },
  {
    name:      'OC Parks & Recreation',
    url:       'https://ocparks.com/parks-trails/special-events',
    frequency: 'monthly' as const,
    notes:     'OC Parks seasonal & special events.',
  },
]

interface Source {
  id: string
  name: string
  url: string
  frequency: 'weekly' | 'monthly' | 'oneshot'
  enabled: boolean
  tags: string[]
  notes: string | null
  last_scraped_at: string | null
  created_at: string
}

const FREQ_LABELS = { weekly: 'Weekly', monthly: 'Monthly', oneshot: 'Once' }

export default function SourcesPage() {
  const [sources, setSources]     = useState<Source[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [showForm, setShowForm]   = useState(false)

  // New source form fields
  const [newUrl, setNewUrl]         = useState('')
  const [newName, setNewName]       = useState('')
  const [newFreq, setNewFreq]       = useState<'weekly' | 'monthly'>('weekly')
  const [newNotes, setNewNotes]     = useState('')

  async function load() {
    setLoading(true)
    const res  = await fetch('/api/admin/sources')
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Failed to load')
    else setSources(data.sources ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addSource(e: React.FormEvent) {
    e.preventDefault()
    if (!newUrl.trim()) return
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/sources', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url: newUrl.trim(), name: newName.trim(), frequency: newFreq, notes: newNotes.trim() || null }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to add'); setSaving(false); return }
    setNewUrl(''); setNewName(''); setNewFreq('weekly'); setNewNotes('')
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function toggleEnabled(source: Source) {
    await fetch('/api/admin/sources', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: source.id, enabled: !source.enabled }),
    })
    setSources(s => s.map(x => x.id === source.id ? { ...x, enabled: !x.enabled } : x))
  }

  async function deleteSource(id: string) {
    if (!confirm('Remove this source? It will no longer be scraped.')) return
    await fetch('/api/admin/sources', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    })
    setSources(s => s.filter(x => x.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <Link href="/admin" className="text-sm text-brand-purple hover:underline">← Admin</Link>
          <h1 className="font-display text-2xl font-bold text-brand-navy mt-1">Scrape Sources</h1>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="btn-primary text-sm"
        >
          + Add URL
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Websites the scraper visits each week. Add a new URL and it will be picked up on the next Monday run.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {/* Add source form */}
      {showForm && (
        <form
          onSubmit={addSource}
          className="mb-6 bg-white border border-brand-purple/20 rounded-3xl p-5 flex flex-col gap-3"
        >
          <h2 className="font-semibold text-brand-navy text-sm">Add a new source</h2>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Website URL <span className="text-red-400">*</span></span>
            <input
              className="input-field text-sm"
              type="url"
              placeholder="https://example.com/events"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Name (optional)</span>
              <input
                className="input-field text-sm"
                placeholder="Auto-detected from URL"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Frequency</span>
              <select
                className="input-field text-sm"
                value={newFreq}
                onChange={e => setNewFreq(e.target.value as 'weekly' | 'monthly')}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Notes (optional)</span>
            <input
              className="input-field text-sm"
              placeholder="e.g. Good source for weekend activities"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
            />
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving || !newUrl.trim()}
              className="flex-1 btn-primary text-sm py-2 justify-center disabled:opacity-50"
            >
              {saving ? 'Adding…' : 'Add source'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 text-sm py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Built-in sources (from sites.yaml — always active) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Built-in sources</h2>
          <span className="text-xs bg-brand-lavender text-brand-purple px-2 py-0.5 rounded-full font-medium">Always active</span>
        </div>
        <div className="flex flex-col gap-2">
          {BUILTIN_SOURCES.map(src => (
            <div key={src.url} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-brand-navy text-sm">{src.name}</span>
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                    ● Active
                  </span>
                  <span className="text-xs bg-brand-lavender text-brand-purple px-2 py-0.5 rounded-full capitalize">
                    {src.frequency === 'weekly' ? 'Weekly' : 'Monthly'}
                  </span>
                </div>
                <a href={src.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-brand-purple hover:underline truncate block mt-0.5">
                  {src.url}
                </a>
                <p className="text-xs text-gray-400 mt-1">{src.notes}</p>
              </div>
              <span className="text-xs text-gray-300 shrink-0 mt-1">Built-in</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom sources (added via UI) */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom sources</h2>
        {!loading && sources.length > 0 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{sources.length}</span>
        )}
      </div>

      {/* Sources list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-3xl mb-3">➕</p>
          <p className="font-medium text-sm">No custom sources yet</p>
          <p className="text-xs mt-1">Hit <strong>+ Add URL</strong> above to add any website you want scraped.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sources.map(src => (
            <div
              key={src.id}
              className={`bg-white rounded-2xl border p-4 flex items-start justify-between gap-4 transition-opacity ${
                src.enabled ? 'border-gray-100' : 'border-gray-100 opacity-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-brand-navy text-sm">{src.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    src.enabled
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {src.enabled ? '● Active' : '○ Paused'}
                  </span>
                  <span className="text-xs bg-brand-lavender text-brand-purple px-2 py-0.5 rounded-full">
                    {FREQ_LABELS[src.frequency]}
                  </span>
                </div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-brand-purple hover:underline truncate block mt-0.5"
                >
                  {src.url}
                </a>
                {src.notes && (
                  <p className="text-xs text-gray-400 mt-1">{src.notes}</p>
                )}
                {src.last_scraped_at && (
                  <p className="text-xs text-gray-300 mt-1">
                    Last scraped {new Date(src.last_scraped_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleEnabled(src)}
                  className="text-xs text-gray-500 hover:text-brand-purple px-2 py-1 rounded-lg hover:bg-brand-lavender/50 transition-colors"
                >
                  {src.enabled ? 'Pause' : 'Enable'}
                </button>
                <button
                  onClick={() => deleteSource(src.id)}
                  className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note */}
      <div className="mt-6 bg-brand-lavender/40 rounded-xl p-4 text-xs text-brand-navy/70 leading-relaxed">
        Custom sources are merged with the built-in ones at scrape time.
        The scraper runs every <strong>Monday at 6am PT</strong> via GitHub Actions.
      </div>
    </div>
  )
}
