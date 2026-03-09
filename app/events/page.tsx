import EventListItem from '@/components/EventListItem'
import { getWeekRange } from '@/lib/utils'
import { SEED_EVENTS, type SeedEvent, type EventCategory } from '@/lib/seed-events'
import { createServiceClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'This Week in OC — Free Family Events',
  description: 'Free and affordable family events in Orange County this week. Updated every Friday by whatwedonowmama.',
}

export const revalidate = 3600

const CATEGORIES: { value: EventCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all',       label: 'All events', emoji: '✦' },
  { value: 'outdoor',   label: 'Outdoor',    emoji: '🌳' },
  { value: 'museum',    label: 'Museum',     emoji: '🏛️' },
  { value: 'market',    label: 'Market',     emoji: '🛍️' },
  { value: 'arts',      label: 'Arts',       emoji: '🎨' },
  { value: 'sports',    label: 'Sports',     emoji: '⚽' },
  { value: 'community', label: 'Community',  emoji: '👋' },
]

const GRADIENTS = [
  'from-blue-400 to-cyan-400',
  'from-green-400 to-emerald-500',
  'from-violet-400 to-purple-500',
  'from-orange-400 to-amber-400',
  'from-pink-400 to-rose-400',
  'from-teal-400 to-cyan-400',
]

// Map a Supabase events row to the SeedEvent shape EventListItem expects
function dbEventToSeed(ev: Record<string, unknown>, i: number): SeedEvent {
  const title = String(ev.title ?? '')
  const slug  = String(
    ev.slug ??
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
    `event-${i}`
  )
  return {
    id:                  String(ev.id ?? `db-${i}`),
    slug,
    title,
    description:         String(ev.description ?? ''),
    date:                String(ev.event_date ?? ''),
    time:                String(ev.event_time ?? ''),
    location:            String(ev.location_name ?? ''),
    city:                String(ev.city ?? 'Orange County'),
    price:               String(ev.price ?? 'Free'),
    is_free:             Boolean(ev.is_free ?? true),
    url:                 ev.source_url ? String(ev.source_url) : null,
    category:            'community',
    tags:                [],
    placeholderEmoji:    '📅',
    placeholderGradient: GRADIENTS[i % GRADIENTS.length],
  }
}

async function loadDbEvents(): Promise<SeedEvent[]> {
  try {
    const service = createServiceClient()
    const { data, error } = await service
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .limit(100)

    if (error) {
      console.error('[events page] Supabase error:', error.message)
      return []
    }
    return (data ?? []).map((ev, i) => dbEventToSeed(ev as Record<string, unknown>, i))
  } catch (err) {
    console.error('[events page] Load failed:', err)
    return []
  }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const weekRange = getWeekRange()

  // Primary source: Supabase events table (approved content).
  // Fallback: curated seed events so the page is never empty.
  const dbEvents = await loadDbEvents()
  const baseEvents: SeedEvent[] = dbEvents.length > 0 ? dbEvents : SEED_EVENTS

  const filteredEvents =
    cat && cat !== 'all'
      ? baseEvents.filter(e => e.category === cat)
      : baseEvents

  const cities = [...new Set(baseEvents.map(e => e.city).filter(Boolean))]

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* PAGE HEADER */}
      <section className="bg-white border-b border-gray-100 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="section-label mb-2">Orange County, CA</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold text-brand-navy leading-tight">
                This Week in OC
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <p className="text-gray-500 text-sm">{weekRange}</p>
                <span className="bg-brand-lavender text-brand-purple text-xs font-semibold px-3 py-1 rounded-full">
                  {filteredEvents.length} events
                </span>
              </div>
            </div>
            <div className="bg-brand-lavender/40 rounded-2xl p-4 flex flex-col gap-2 max-w-xs">
              <p className="text-sm font-semibold text-brand-navy">Get these every Friday ✦</p>
              <p className="text-xs text-gray-500">Weekly OC family events in your inbox. Free.</p>
              <form action="/api/subscribe" method="POST" className="flex flex-col gap-2 mt-1">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@email.com"
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

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* CATEGORY FILTER PILLS */}
        <div className="flex gap-2 flex-wrap mb-4">
          {CATEGORIES.map(c => (
            <a
              key={c.value}
              href={c.value === 'all' ? '/events' : `/events?cat=${c.value}`}
              className={`text-sm font-medium px-4 py-2 rounded-full border transition-all min-h-[44px] flex items-center gap-1.5 ${
                (c.value === 'all' && !cat) || cat === c.value
                  ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                  : 'bg-white text-brand-navy border-gray-200 hover:border-brand-purple hover:text-brand-purple'
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </a>
          ))}
        </div>

        {/* CITY PILLS */}
        {cities.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-8 items-center">
            <span className="text-xs text-gray-400 font-medium">Cities:</span>
            {cities.map(city => (
              <span key={city} className="text-xs bg-white border border-gray-200 text-gray-600 rounded-full px-3 py-1">
                {city}
              </span>
            ))}
          </div>
        )}

        {/* EVENTS LIST */}
        {filteredEvents.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredEvents.map(event => (
              <EventListItem key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">📅</span>
            <p className="font-display text-xl text-gray-600">No events in this category this week</p>
            <a href="/events" className="text-sm font-semibold text-brand-purple hover:underline">View all events →</a>
          </div>
        )}

        {/* BOTTOM EMAIL CTA */}
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
              type="email"
              name="email"
              required
              placeholder="you@email.com"
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
