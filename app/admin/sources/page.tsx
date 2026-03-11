'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Source {
  id: string
  name: string
  url: string
  frequency: 'weekly' | 'monthly' | 'oneshot'
  enabled: boolean
  tags: string[]
  notes: string | null
  last_scraped_at: string | null
  last_events_count: number | null
  created_at: string
}

const FREQ_LABELS = { weekly: 'Weekly', monthly: 'Monthly', oneshot: 'Once' }

type ScrapeStatus =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'ok'; message: string; runsUrl: string }
  | { type: 'error'; message: string }

// ── Relative time helper ─────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function absoluteTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export default function SourcesPage() {
  const [sources, setSources]           = useState<Source[]>([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [showForm, setShowForm]         = useState(false)
  const [scrapeStatus, setScrapeStatus] = useState<Record<string, ScrapeStatus>>({})

  const [newUrl, setNewUrl]     = useState('')
  const [newName, setNewName]   = useState('')
  const [newFreq, setNewFreq]   = useState<'weekly' | 'monthly'>('weekly')
  const [newNotes, setNewNotes] = useState('')

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

  async function scrapeNow(key: string, siteName?: string) {
    setScrapeStatus(s => ({ ...s, [key]: { type: 'loading' } }))
    const res = await fetch('/api/admin/scrape-now', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ site: siteName ?? '' }),
    })
    const data = await res.json()
    if (res.ok) {
      setScrapeStatus(s => ({ ...s, [key]: { type: 'ok', message: data.message, runsUrl: data.runsUrl } }))
      setTimeout(() => setScrapeStatus(s => ({ ...s, [key]: { type: 'idle' } })), 10000)
    } else {
      setScrapeStatus(s => ({ ...s, [key]: { type: 'error', message: data.error ?? 'Failed to trigger scrape' } }))
    }
  }

  function ScrapeButton({ sourceKey, siteName, small = false }: { sourceKey: string; siteName?: string; small?: boolean }) {
    const status = scrapeStatus[sourceKey] ?? { type: 'idle' }
    const base = small
      ? 'text-xs px-2.5 py-1 rounded-lg font-medium transition-all'
      : 'text-sm px-4 py-2 rounded-xl font-semibold transition-all'

    if (status.type === 'loading') {
      return <button disabled className={`${base} bg-gray-100 text-gray-400 cursor-not-allowed`}><span className="animate-pulse">Triggering…</span></button>
    }
    if (status.type === 'ok') {
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`${small ? 'text-xs' : 'text-sm'} text-green-600 font-medium`}>✓ Triggered</span>
          <a href={status.runsUrl} target="_blank" rel="noopener noreferrer"
            className={`${small ? 'text-xs' : 'text-sm'} text-brand-purple hover:underline`}>View run →</a>
        </div>
      )
    }
    if (status.type === 'error') {
      return (
        <div className="flex flex-col gap-0.5">
          <button onClick={() => scrapeNow(sourceKey, siteName)}
            className={`${base} bg-red-50 text-red-600 border border-red-200 hover:bg-red-100`}>Retry</button>
          <span className={`${small ? 'text-[10px]' : 'text-xs'} text-red-500 max-w-[160px] truncate`} title={status.message}>{status.message}</span>
        </div>
      )
    }
    return (
      <button onClick={() => scrapeNow(sourceKey, siteName)}
        className={`${base} bg-brand-lavender text-brand-purple hover:bg-brand-lavender/80 hover:scale-105`}>
        ⚡ Scrape now
      </button>
    )
  }

  const enabled = sources.filter(s => s.enabled)
  const paused  = sources.filter(s => !s.enabled)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <Link href="/admin" className="text-sm text-brand-purple hover:underline">← Admin</Link>
          <h1 className="font-display text-2xl font-bold text-brand-navy mt-1">Scrape Sources</h1>
        </div>
        <div className="flex gap-2">
          <ScrapeButton sourceKey="all" />
          <button onClick={() => setShowForm(f => !f)} className="btn-primary text-sm">+ Add source</button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1">
        Manage every website the scraper visits. Pause sources that aren&apos;t producing events, or hit ⚡ to run one on demand.
      </p>

      {scrapeStatus['all']?.type === 'ok' && (
        <p className="text-xs text-green-600 mt-3 font-medium">
          ✓ {(scrapeStatus['all'] as { type: 'ok'; message: string; runsUrl: string }).message}{' '}
          <a href={(scrapeStatus['all'] as { type: 'ok'; message: string; runsUrl: string }).runsUrl}
            target="_blank" rel="noopener noreferrer" className="underline">Watch it run →</a>
        </p>
      )}
      {scrapeStatus['all']?.type === 'error' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {(scrapeStatus['all'] as { type: 'error'; message: string }).message}
        </div>
      )}

      <div className="mt-6 mb-6" />

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      {/* Add source form */}
      {showForm && (
        <form onSubmit={addSource} className="mb-6 bg-white border border-brand-purple/20 rounded-3xl p-5 flex flex-col gap-3">
          <h2 className="font-semibold text-brand-navy text-sm">Add a new source</h2>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Website URL <span className="text-red-400">*</span></span>
            <input className="input-field text-sm" type="url" placeholder="https://example.com/events"
              value={newUrl} onChange={e => setNewUrl(e.target.value)} required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Name (optional)</span>
              <input className="input-field text-sm" placeholder="Auto-detected from URL"
                value={newName} onChange={e => setNewName(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Frequency</span>
              <select className="input-field text-sm" value={newFreq}
                onChange={e => setNewFreq(e.target.value as 'weekly' | 'monthly')}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Notes (optional)</span>
            <input className="input-field text-sm" placeholder="e.g. Good source for weekend activities"
              value={newNotes} onChange={e => setNewNotes(e.target.value)} />
          </label>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving || !newUrl.trim()}
              className="flex-1 btn-primary text-sm py-2 justify-center disabled:opacity-50">
              {saving ? 'Adding…' : 'Add source'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 text-sm py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(n => <div key={n} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />)}
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-3xl mb-3">➕</p>
          <p className="font-medium text-sm">No sources yet</p>
          <p className="text-xs mt-1">Hit <strong>+ Add source</strong> to get started.</p>
        </div>
      ) : (
        <>
          {/* Active */}
          {enabled.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active</h2>
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                  {enabled.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {enabled.map(src => (
                  <SourceRow key={src.id} source={src}
                    scrapeButton={<ScrapeButton sourceKey={src.id} siteName={src.name} small />}
                    onToggle={() => toggleEnabled(src)}
                    onDelete={() => deleteSource(src.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Paused */}
          {paused.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paused</h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{paused.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {paused.map(src => (
                  <SourceRow key={src.id} source={src}
                    scrapeButton={<ScrapeButton sourceKey={src.id} siteName={src.name} small />}
                    onToggle={() => toggleEnabled(src)}
                    onDelete={() => deleteSource(src.id)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8 bg-brand-lavender/40 rounded-xl p-4 text-xs text-brand-navy/70 leading-relaxed">
        <strong>⚡ Scrape now</strong> triggers a one-off GitHub Actions run — results appear in Content Review
        in ~2 min. Doesn&apos;t affect the weekly Monday schedule. Requires <code>GITHUB_PAT</code> in Vercel env vars.
      </div>
    </div>
  )
}

// ── Individual source row ─────────────────────────────────────────────────────
function SourceRow({
  source,
  scrapeButton,
  onToggle,
  onDelete,
}: {
  source: Source
  scrapeButton: React.ReactNode
  onToggle: () => void
  onDelete: () => void
}) {
  const [showFullTime, setShowFullTime] = useState(false)

  return (
    <div className={`bg-white rounded-2xl border p-4 transition-opacity ${
      source.enabled ? 'border-gray-100' : 'border-gray-100 opacity-60'
    }`}>
      <div className="flex items-start justify-between gap-4">

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-brand-navy text-sm">{source.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              source.enabled
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {source.enabled ? '● Active' : '○ Paused'}
            </span>
            <span className="text-xs bg-brand-lavender text-brand-purple px-2 py-0.5 rounded-full">
              {FREQ_LABELS[source.frequency]}
            </span>
            {/* Events found badge — shows after first scrape */}
            {source.last_events_count !== null && source.last_events_count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                source.last_events_count > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-orange-50 text-orange-600 border border-orange-200'
              }`}>
                {source.last_events_count > 0 ? `${source.last_events_count} events` : '0 events'}
              </span>
            )}
          </div>

          <a href={source.url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-brand-purple hover:underline truncate block mt-0.5 max-w-sm">
            {source.url}
          </a>

          {source.notes && <p className="text-xs text-gray-400 mt-1">{source.notes}</p>}

          {/* Last ran */}
          <div className="mt-2">
            {source.last_scraped_at ? (
              <button
                onClick={() => setShowFullTime(v => !v)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-left"
              >
                🕐 Last ran {showFullTime
                  ? absoluteTime(source.last_scraped_at)
                  : relativeTime(source.last_scraped_at)}
                <span className="ml-1 text-gray-300">{showFullTime ? '↑' : '↓'}</span>
              </button>
            ) : (
              <span className="text-xs text-gray-300 italic">Never scraped</span>
            )}
          </div>
        </div>

        {/* Right: scrape button + controls */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {scrapeButton}
          <div className="flex items-center gap-1">
            <button onClick={onToggle}
              className="text-xs text-gray-500 hover:text-brand-purple px-2 py-1 rounded-lg hover:bg-brand-lavender/50 transition-colors">
              {source.enabled ? 'Pause' : 'Enable'}
            </button>
            <button onClick={onDelete}
              className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
              Remove
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
