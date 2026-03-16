import EventListItem from '@/components/EventListItem'
import { SEED_EVENTS, type SeedEvent, type EventCategory } from '@/lib/seed-events'
import { createServiceClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Family Events in Orange County This Week | whatwedonowmama',
  description: 'Free and affordable family events in Orange County, updated every week. Filter by city — Huntington Beach, Newport Beach, Tustin, and more.',
}

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES: { value: EventCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all',       label: 'All',       emoji: '✦'  },
  { value: 'outdoor',   label: 'Outdoor',   emoji: '🌳' },
  { value: 'museum',    label: 'Museum',    emoji: '🏛️' },
  { value: 'market',    label: 'Market',    emoji: '🛍️' },
  { value: 'arts',      label: 'Arts',      emoji: '🎨' },
  { value: 'sports',    label: 'Sports',    emoji: '⚽' },
  { value: 'community', label: 'Community', emoji: '👋' },
]

const GRADIENTS = [
  'from-blue-400 to-cyan-400',
  'from-green-400 to-emerald-500',
  'from-violet-400 to-purple-500',
  'from-orange-400 to-amber-400',
  'from-pink-400 to-rose-400',
  'from-teal-400 to-cyan-400',
]

// ── Category + tag inference ──────────────────────────────────────────────────
function inferCategory(title: string, desc: string): EventCategory {
  const text = (title + ' ' + desc).toLowerCase()
  if (/\b(hike|hiking|trail|nature|outdoors?|garden|zoo|aquarium|beach|camp|picnic|farm|wildlife|botanical)\b/.test(text)) return 'outdoor'
  if (/\b(museum|science|history|exhibit|gallery|discover|planetarium|library|archive|natural history)\b/.test(text)) return 'museum'
  if (/\b(market|fair|festival|bazaar|vendor|farmers|swap meet|flea market)\b/.test(text)) return 'market'
  if (/\b(art|craft|paint|draw|music|theater|theatre|dance|perform|concert|show|choir|band|recital|improv|puppet)\b/.test(text)) return 'arts'
  if (/\b(sport|soccer|baseball|basketball|swim|gym|yoga|run|race|tournament|martial|karate|tennis|football|volleyball|gymnastics)\b/.test(text)) return 'sports'
  return 'community'
}

function inferTags(title: string, desc: string, category: EventCategory, city: string): string[] {
  const tags: string[] = [category]
  const text = (title + ' ' + desc).toLowerCase()
  if (city && city !== 'Orange County') tags.push(city.split(',')[0].trim())
  if (/\bfree\b|no cost|no charge/.test(text)) tags.push('free')
  if (/toddler|infant|baby|preschool/.test(text)) tags.push('toddlers')
  if (/teen|tween/.test(text)) tags.push('teens')
  if (/\bindoor\b/.test(text)) tags.push('indoor')
  if (/\boutdoor\b/.test(text) && category !== 'outdoor') tags.push('outdoor')
  if (/weekend|saturday|sunday/.test(text)) tags.push('weekend')
  return [...new Set(tags)].slice(0, 4)
}

// ── DB event → SeedEvent ──────────────────────────────────────────────────────
function dbEventToSeed(ev: Record<string, unknown>, i: number): SeedEvent {
  const title = String(ev.title ?? '')
  const desc  = String(ev.description ?? '')
  const city  = String(ev.city ?? 'Orange County')
  const slug  = String(
    ev.slug ?? (title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `event-${i}`)
  )
  const category = inferCategory(title, desc)
  return {
    id:                  String(ev.id ?? `db-${i}`),
    slug,
    title,
    description:         desc,
    date:                String(ev.event_date ?? ''),
    time:                String(ev.event_time ?? ''),
    location:            String(ev.location_name ?? ''),
    city,
    price:               String(ev.price ?? 'Free'),
    is_free:             Boolean(ev.is_free ?? true),
    url:                 ev.source_url ? String(ev.source_url) : null,
    category,
    tags:                inferTags(title, desc, category, city),
    placeholderEmoji:    '📅',
    placeholderGradient: GRADIENTS[i % GRADIENTS.length],
  }
}

// ── Date range helpers ────────────────────────────────────────────────────────
function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getWeekDates(offset: number): { start: string; end: string; label: string; heading: string } {
  const now    = new Date()
  const dow    = now.getDay() // 0=Sun
  const toMon  = dow === 0 ? -6 : 1 - dow
  const monday = new Date(now)
  monday.setDate(now.getDate() + toMon + offset * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt     = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const fmtFull = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const range   = Math.abs(offset) <= 1 ? `${fmt(monday)} – ${fmt(sunday)}` : `${fmtFull(monday)} – ${fmtFull(sunday)}`

  let heading: string
  if (offset === 0)       heading = 'Family Events in Orange County This Week'
  else if (offset === 1)  heading = 'Family Events in Orange County Next Week'
  else if (offset === -1) heading = 'Family Events in Orange County Last Week'
  else                    heading = 'Family Events in Orange County'

  return { start: isoDate(monday), end: isoDate(sunday), label: range, heading }
}

function getMonthDates(offset: number): { start: string; end: string; label: string; heading: string } {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)

  const monthName = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  let heading: string
  if (offset === 0)      heading = `Family Events in Orange County This Month`
  else if (offset === 1) heading = `Family Events in Orange County Next Month`
  else                   heading = `Family Events in Orange County`

  return { start: isoDate(start), end: isoDate(end), label: monthName, heading }
}

// ── Load DB events for a date range ──────────────────────────────────────────
async function loadDbEvents(start: string, end: string): Promise<SeedEvent[]> {
  try {
    const service = createServiceClient()
    const { data, error } = await service
      .from('events')
      .select('*')
      .gte('event_date', start)
      .lte('event_date', end)
      .order('event_date', { ascending: true })
      .limit(500)

    if (error) {
      console.error('[events page] Supabase error:', error.message)
      return []
    }
    return (data ?? []).map((ev: Record<string, unknown>, i: number) => dbEventToSeed(ev, i))
  } catch (err) {
    console.error('[events page] Load failed:', err)
    return []
  }
}

// ── URL builder ───────────────────────────────────────────────────────────────
type BaseParams = { view: 'week' | 'month'; offset: number; cat: string | null; city: string | null }
type UrlOverrides = Partial<{ view: 'week' | 'month' | null; offset: number | null; cat: string | null; city: string | null; page: number | null }>

function buildUrl(base: BaseParams, overrides: UrlOverrides = {}): string {
  const v  = overrides.view  !== undefined ? overrides.view  : base.view
  const o  = overrides.offset !== undefined ? overrides.offset : base.offset
  const c  = overrides.cat   !== undefined ? overrides.cat   : base.cat
  const ci = overrides.city  !== undefined ? overrides.city  : base.city
  const pg = overrides.page !== undefined ? overrides.page : null

  const p = new URLSearchParams()
  if (v && v !== 'week')              p.set('view',   v)
  if (o !== null && o !== 0)          p.set('offset', String(o))
  if (c && c !== 'all')               p.set('cat',    c)
  if (ci)                             p.set('city',   ci)
  if (pg !== null && pg > 1)          p.set('page',   String(pg))

  const str = p.toString()
  return str ? `/events?${str}` : '/events'
}

// ── Page ──────────────────────────────────────────────────────────────────────
const PER_PAGE = 12

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; offset?: string; cat?: string; city?: string; page?: string }>
}) {
  const sp = await searchParams

  const view   = sp.view === 'month' ? 'month' : 'week' as 'week' | 'month'
  const offset = (() => { const n = parseInt(sp.offset ?? '0', 10); return isNaN(n) ? 0 : n })()
  const cat    = (sp.cat && sp.cat !== 'all') ? sp.cat : null
  const city   = sp.city ?? null
  const page   = (() => { const n = parseInt(sp.page ?? '1', 10); return (isNaN(n) || n < 1) ? 1 : n })()

  const { start, end, label, heading } =
    view === 'month' ? getMonthDates(offset) : getWeekDates(offset)

  const dbEvents = await loadDbEvents(start, end)
  // Use seed events only as fallback for the current week
  const baseEvents: SeedEvent[] =
    dbEvents.length > 0 ? dbEvents : (view === 'week' && offset === 0 ? SEED_EVENTS : [])

  // Filter
  let filtered = baseEvents
  if (cat)  filtered = filtered.filter(e => e.category === cat)
  if (city) filtered = filtered.filter(e => e.city === city)

  // Cities from unfiltered events
  const cities = [...new Set(baseEvents.map(e => e.city).filter(Boolean))].sort() as string[]

  // Paginate
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pageEvents  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const base: BaseParams = { view, offset, cat, city }

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* ── PAGE HEADER ── */}
      <section className="bg-white border-b border-gray-100 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="section-label mb-2">Orange County, CA</p>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

            <div>
              <h1 className="font-display text-4xl font-bold text-brand-navy leading-tight">
                {heading}
              </h1>

              {/* Period label + count */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <p className="text-gray-500 text-sm">{label}</p>
                <span className="bg-brand-lavender text-brand-purple text-xs font-semibold px-3 py-1 rounded-full">
                  {filtered.length} event{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* View toggle + navigation row */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">

                {/* Week / Month toggle */}
                <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
                  <a
                    href={buildUrl(base, { view: 'week', offset: 0, page: null })}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-[10px] transition-all ${
                      view === 'week'
                        ? 'bg-white text-brand-navy shadow-sm'
                        : 'text-gray-500 hover:text-brand-navy'
                    }`}
                  >
                    Week
                  </a>
                  <a
                    href={buildUrl(base, { view: 'month', offset: 0, page: null })}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-[10px] transition-all ${
                      view === 'month'
                        ? 'bg-white text-brand-navy shadow-sm'
                        : 'text-gray-500 hover:text-brand-navy'
                    }`}
                  >
                    Month
                  </a>
                </div>

                {/* Prev / Today / Next */}
                <div className="flex items-center gap-1">
                  <a
                    href={buildUrl(base, { offset: offset - 1, page: null })}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-brand-purple hover:text-brand-purple transition-all font-semibold"
                  >
                    ‹
                  </a>
                  <a
                    href={buildUrl(base, { offset: 0, page: null })}
                    className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
                      offset === 0
                        ? 'bg-brand-purple/10 border-brand-purple/30 text-brand-purple'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-brand-purple hover:text-brand-purple'
                    }`}
                  >
                    Today
                  </a>
                  <a
                    href={buildUrl(base, { offset: offset + 1, page: null })}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-brand-purple hover:text-brand-purple transition-all font-semibold"
                  >
                    ›
                  </a>
                </div>
              </div>
            </div>

            {/* Email signup */}
            <div className="bg-brand-lavender/40 rounded-2xl p-4 flex flex-col gap-2 shrink-0 w-full md:max-w-xs">
              <p className="text-sm font-semibold text-brand-navy">Get these every Friday ✦</p>
              <p className="text-xs text-gray-500">Weekly OC family events in your inbox. Free.</p>
              <form action="/api/subscribe" method="POST" className="flex flex-col gap-2 mt-1">
                <input
                  type="email" name="email" required placeholder="you@email.com"
                  className="w-full rounded-xl px-3 py-2.5 text-sm bg-white border border-brand-purple/20 text-brand-navy placeholder-gray-400 focus:outline-none focus:border-brand-purple"
                />
                <button type="submit" className="btn-primary text-sm px-4 py-2.5 w-full justify-center">
                  Subscribe free →
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── CATEGORY PILLS ── */}
        <div className="flex gap-2 flex-wrap mb-4">
          {CATEGORIES.map(c => (
            <a
              key={c.value}
              href={buildUrl(base, { cat: c.value === 'all' ? null : c.value, page: null })}
              className={`text-sm font-medium px-4 py-2 rounded-full border transition-all flex items-center gap-1.5 ${
                (!cat && c.value === 'all') || cat === c.value
                  ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                  : 'bg-white text-brand-navy border-gray-200 hover:border-brand-purple hover:text-brand-purple'
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </a>
          ))}
        </div>

        {/* ── CITY PILLS ── */}
        {cities.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-8 items-center">
            <span className="text-xs text-gray-400 font-medium">Cities:</span>
            <a
              href={buildUrl(base, { city: null, page: null })}
              className={`text-xs rounded-full px-3 py-1 border transition-all ${
                !city
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy'
              }`}
            >
              All
            </a>
            {cities.map(c => (
              <a
                key={c}
                href={buildUrl(base, { city: city === c ? null : c, page: null })}
                className={`text-xs rounded-full px-3 py-1 border transition-all ${
                  city === c
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy'
                }`}
              >
                {c}
              </a>
            ))}
          </div>
        )}

        {/* ── EVENTS LIST ── */}
        {pageEvents.length > 0 ? (
          <div className="flex flex-col gap-4">
            {pageEvents.map(event => (
              <EventListItem key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">📅</span>
            <p className="font-display text-xl text-gray-600">No events found</p>
            <p className="text-sm text-gray-400">
              {offset !== 0
                ? 'Try a different week or month using the navigation above.'
                : 'Check back soon — we update events regularly!'}
            </p>
            <a href="/events" className="text-sm font-semibold text-brand-purple hover:underline">
              View current week →
            </a>
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
            {currentPage > 1 && (
              <a
                href={buildUrl(base, { page: currentPage - 1 })}
                className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-xl hover:border-brand-purple hover:text-brand-purple text-brand-navy transition-all"
              >
                ← Prev
              </a>
            )}

            {totalPages <= 10 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={buildUrl(base, { page: p })}
                  className={`w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-xl border transition-all ${
                    p === currentPage
                      ? 'bg-brand-purple text-white border-brand-purple'
                      : 'bg-white border-gray-200 text-brand-navy hover:border-brand-purple hover:text-brand-purple'
                  }`}
                >
                  {p}
                </a>
              ))
            ) : (
              <span className="text-sm text-gray-500 px-2">
                Page {currentPage} of {totalPages}
              </span>
            )}

            {currentPage < totalPages && (
              <a
                href={buildUrl(base, { page: currentPage + 1 })}
                className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-xl hover:border-brand-purple hover:text-brand-purple text-brand-navy transition-all"
              >
                Next →
              </a>
            )}
          </div>
        )}

        {/* ── BOTTOM EMAIL CTA ── */}
        <div className="mt-12 bg-brand-navy rounded-3xl p-8 text-center flex flex-col items-center gap-4">
          <p className="font-script text-brand-gold text-2xl">never miss an event</p>
          <h2 className="font-display text-2xl font-bold text-white">
            OC family events, every Friday. Free.
          </h2>
          <p className="text-gray-400 text-sm max-w-sm">
            We hand-pick the best kid-friendly events across Orange County and send them straight to your inbox each week.
          </p>
          <form action="/api/subscribe" method="POST" className="w-full max-w-sm flex flex-col sm:flex-row gap-3">
            <input
              type="email" name="email" required placeholder="you@email.com"
              className="flex-1 rounded-2xl px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-brand-gold"
            />
            <button type="submit" className="btn-coral px-5 py-3 whitespace-nowrap">
              Subscribe free
            </button>
          </form>
          <p className="text-gray-600 text-xs">No spam. Unsubscribe any time.</p>
        </div>

      </div>
    </div>
  )
}
