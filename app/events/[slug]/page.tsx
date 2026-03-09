import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SEED_EVENTS, getSeedEvent } from '@/lib/seed-events'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

const GRADIENTS = [
  'from-blue-400 to-cyan-400',
  'from-green-400 to-emerald-500',
  'from-violet-400 to-purple-500',
  'from-orange-400 to-amber-400',
  'from-pink-400 to-rose-400',
  'from-teal-400 to-cyan-400',
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadDbEvent(slug: string): Promise<Record<string, any> | null> {
  try {
    const { data } = await createServiceClient()
      .from('events').select('*').eq('slug', slug).single()
    return data ?? null
  } catch { return null }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToEvent(ev: Record<string, any>, i = 0) {
  return {
    id: String(ev.id ?? ''), slug: String(ev.slug ?? ''),
    title: String(ev.title ?? ''), description: String(ev.description ?? ''),
    date: String(ev.event_date ?? ''), time: String(ev.event_time ?? ''),
    location: String(ev.location_name ?? ''), city: String(ev.city ?? 'Orange County'),
    price: String(ev.price ?? 'Free'), is_free: Boolean(ev.is_free ?? true),
    url: ev.source_url ? String(ev.source_url) : null,
    category: 'community' as const, tags: [] as string[],
    placeholderEmoji: '📅', placeholderGradient: GRADIENTS[i % GRADIENTS.length],
  }
}

export async function generateStaticParams() {
  const seeds = SEED_EVENTS.map(e => ({ slug: e.slug }))
  try {
    const { data } = await createServiceClient()
      .from('events').select('slug').not('slug', 'is', null)
    const dbSlugs = (data ?? [])
      .filter((r: { slug: string }) => r.slug)
      .map((r: { slug: string }) => ({ slug: r.slug }))
    return [...seeds, ...dbSlugs]
  } catch { return seeds }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const db = await loadDbEvent(slug)
  const event = db ? dbToEvent(db) : getSeedEvent(slug)
  if (!event) return {}
  return {
    title: `${event.title} | whatwedonowmama`,
    description: event.description.slice(0, 160),
  }
}

function formatFullDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  } catch { return dateStr }
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params

  // Supabase first, seed fallback
  const db    = await loadDbEvent(slug)
  const event = db ? dbToEvent(db) : getSeedEvent(slug)

  if (!event) notFound()

  const fullDate = formatFullDate(event.date)

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* ── HERO BANNER ── */}
      <section className={`bg-gradient-to-br ${event.placeholderGradient} px-4 py-16 md:py-20`}>
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <span>/</span>
            <span className="text-white/90 capitalize">{event.category}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Large emoji icon */}
            <div className="flex-shrink-0 w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl">
              <span className="text-6xl md:text-7xl select-none">{event.placeholderEmoji}</span>
            </div>

            {/* Title + key meta */}
            <div className="flex flex-col gap-3 text-center md:text-left">
              <span className={`self-center md:self-start inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                event.is_free
                  ? 'bg-green-500/20 text-white border border-white/30'
                  : 'bg-white/20 text-white border border-white/30'
              }`}>
                {event.is_free ? '✓ Free' : event.price}
              </span>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow-sm">
                {event.title}
              </h1>

              <div className="flex flex-col gap-1.5 text-white/80 text-sm">
                <span className="flex items-center gap-2 justify-center md:justify-start">
                  <span>📅</span>
                  <strong className="text-white">{fullDate}</strong>
                  {event.time && <span className="text-white/70">· {event.time}</span>}
                </span>
                <span className="flex items-center gap-2 justify-center md:justify-start">
                  <span>📍</span>
                  {event.location ? `${event.location}, ${event.city}` : event.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main: description + tags ── */}
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-brand-navy mb-4">About this event</h2>
            <p className="text-gray-700 leading-relaxed text-base">{event.description}</p>

            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {event.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-brand-lavender/60 text-brand-purple font-medium rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar: detail card + CTAs ── */}
          <div className="lg:w-72 flex-shrink-0 flex flex-col gap-4">

            {/* Detail card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
              <h3 className="font-display text-lg font-bold text-brand-navy">Event details</h3>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-lg flex-shrink-0">📅</span>
                  <div>
                    <p className="font-medium text-brand-navy">{fullDate}</p>
                    {event.time && <p className="text-gray-500">{event.time}</p>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg flex-shrink-0">📍</span>
                  <div>
                    <p className="font-medium text-brand-navy">{event.location || event.city}</p>
                    {event.location && <p className="text-gray-500">{event.city}, CA</p>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg flex-shrink-0">🎟️</span>
                  <div>
                    <p className="font-medium text-brand-navy">
                      {event.is_free ? 'Free admission' : event.price}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                {/* External event link */}
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-coral w-full justify-center text-sm"
                  >
                    Visit event website →
                  </a>
                )}

              </div>
            </div>


          </div>
        </div>

        {/* ── STAY IN THE LOOP ── */}
        <div className="mt-14 bg-brand-navy rounded-3xl p-8 text-center flex flex-col items-center gap-4">
          <p className="font-script text-brand-gold text-2xl">stay in the loop</p>
          <h2 className="font-display text-2xl font-bold text-white">
            Get the best OC events in your inbox.
          </h2>
          <p className="text-gray-400 text-sm max-w-sm">
            Every Friday we send a hand-picked list of family events happening across Orange County. Free, always.
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
              Subscribe free →
            </button>
          </form>
          <p className="text-gray-600 text-xs">No spam. Unsubscribe any time.</p>
        </div>

        {/* Back nav */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link href="/events" className="text-sm font-semibold text-brand-purple hover:underline">
            ← Back to all events
          </Link>
        </div>
      </div>
    </div>
  )
}
