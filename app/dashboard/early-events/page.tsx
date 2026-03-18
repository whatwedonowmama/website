import { getUser } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SEED_EVENTS, type SeedEvent } from '@/lib/seed-events'

export const metadata: Metadata = { title: 'Early Events | OC Insider Dashboard' }

const GRADIENTS = [
  'from-blue-400 to-cyan-400', 'from-green-400 to-emerald-500',
  'from-violet-400 to-purple-500', 'from-orange-400 to-amber-400',
  'from-pink-400 to-rose-400', 'from-teal-400 to-green-400',
]

async function getAllEvents(): Promise<SeedEvent[]> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .limit(30)

    if (data && data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((ev: Record<string, any>, i: number): SeedEvent => ({
        id: String(ev.id),
        slug: String(ev.slug ?? `event-${i}`),
        title: String(ev.title ?? ''),
        description: String(ev.description ?? ''),
        date: String(ev.event_date ?? ''),
        time: String(ev.event_time ?? ''),
        location: String(ev.location_name ?? ''),
        city: String(ev.city ?? 'Orange County'),
        price: String(ev.price ?? 'Free'),
        is_free: Boolean(ev.is_free ?? true),
        url: ev.source_url ? String(ev.source_url) : null,
        category: 'community',
        tags: [],
        placeholderEmoji: '📅',
        placeholderGradient: GRADIENTS[i % GRADIENTS.length],
      }))
    }
    return SEED_EVENTS
  } catch {
    return SEED_EVENTS
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    })
  } catch { return dateStr }
}

export default async function EarlyEventsPage() {
  const user = await getUser()
  if (!user) redirect('/login?redirect=/dashboard/early-events')

  const isPaid = user.tier === 'plus' || user.tier === 'oc-insider'

  if (!isPaid) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 flex flex-col items-center gap-5">
        <span className="text-5xl">🔒</span>
        <h1 className="font-display text-2xl font-bold text-brand-navy">Early Events is an OC Insider perk</h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
          OC Insiders and Plus members see all upcoming events 24 hours before they hit the free newsletter — so you can actually grab spots.
        </p>
        <Link href="/join" className="bg-brand-gold text-brand-navy font-bold px-6 py-3 rounded-2xl hover:bg-brand-gold/90 transition-colors">
          Become a Founding Member ✦
        </Link>
      </div>
    )
  }

  const events = await getAllEvents()

  // Group by date
  const grouped = events.reduce<Record<string, SeedEvent[]>>((acc, ev) => {
    const key = ev.date || 'Upcoming'
    if (!acc[key]) acc[key] = []
    acc[key].push(ev)
    return acc
  }, {})

  const dateKeys = Object.keys(grouped).sort()

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-brand-gold font-semibold text-xs uppercase tracking-wider">OC Insider</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-400 text-xs">Early Access</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-brand-navy">Upcoming Events</h1>
        <p className="text-gray-500 text-sm mt-1">
          All upcoming events — released to you first, 24 hrs before the free newsletter.
        </p>
      </div>

      {/* Early access badge */}
      <div className="bg-brand-navy rounded-2xl px-5 py-4 mb-8 flex items-center gap-3">
        <span className="text-2xl shrink-0">⚡</span>
        <div>
          <p className="text-brand-gold font-semibold text-sm">You&apos;re seeing this early</p>
          <p className="text-gray-400 text-xs mt-0.5">
            Free members get this list Friday morning. You have it now — grab your spots before they fill up.
          </p>
        </div>
      </div>

      {/* Events grouped by date */}
      {dateKeys.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p>New events drop every Monday. Check back soon.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {dateKeys.map(dateKey => (
            <div key={dateKey}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-3">
                <span>{formatDate(dateKey) || dateKey}</span>
                <span className="flex-1 border-t border-gray-100" />
              </h2>
              <div className="flex flex-col gap-3">
                {grouped[dateKey].map((event, i) => (
                  <div key={event.id ?? i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start">
                    {/* Color dot */}
                    <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${event.placeholderGradient ?? 'from-violet-400 to-purple-500'} flex items-center justify-center text-lg`}>
                      {event.placeholderEmoji ?? '📅'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-navy text-sm leading-snug">{event.title}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-400">
                        {event.time && <span>🕒 {event.time}</span>}
                        {event.location && <span>📍 {event.location}{event.city ? `, ${event.city}` : ''}</span>}
                        <span className={event.is_free ? 'text-green-600 font-medium' : 'text-gray-500'}>
                          {event.is_free ? 'Free' : event.price}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{event.description}</p>
                      )}
                    </div>
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-semibold text-brand-purple hover:underline"
                      >
                        Details →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
