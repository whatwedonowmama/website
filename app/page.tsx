import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Family Events & Parenting Resources for Orange County Parents | whatwedonowmama',
  description: 'Weekly family events and honest parenting resources for Orange County parents. Browse free events, farmers markets, and local guides. Free to join.',
  openGraph: {
    title: 'Family Events & Resources for Orange County Parents | whatwedonowmama',
    description: 'Weekly family events and honest parenting resources for OC parents. Free events, farmers markets, and local guides.',
    url: 'https://whatwedonowmama.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Events & Resources for Orange County Parents',
    description: 'Weekly family events and honest parenting resources for OC parents. Free to join.',
  },
}
import ResourceCard from '@/components/ResourceCard'
import EventListItem from '@/components/EventListItem'
import { getWeekRange } from '@/lib/utils'
import type { Resource } from '@/lib/types'
import { SEED_RESOURCES, type SeedResource } from '@/lib/seed-resources'
import { SEED_EVENTS, type SeedEvent } from '@/lib/seed-events'
import { createServiceClient } from '@/lib/supabase/server'

const GRADIENTS = [
  'from-blue-400 to-cyan-400', 'from-green-400 to-emerald-500',
  'from-violet-400 to-purple-500', 'from-orange-400 to-amber-400',
]

async function getFeaturedEvents(): Promise<SeedEvent[]> {
  try {
    const { data } = await createServiceClient()
      .from('events')
      .select('*')
      .eq('is_pinned', true)
      .order('event_date', { ascending: true })
      .limit(4)
    if (!data || data.length === 0) return SEED_EVENTS.slice(0, 3)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((ev: Record<string, any>, i: number): SeedEvent => ({
      id: String(ev.id), slug: String(ev.slug ?? `event-${i}`),
      title: String(ev.title ?? ''), description: String(ev.description ?? ''),
      date: String(ev.event_date ?? ''), time: String(ev.event_time ?? ''),
      location: String(ev.location_name ?? ''), city: String(ev.city ?? 'Orange County'),
      price: String(ev.price ?? 'Free'), is_free: Boolean(ev.is_free ?? true),
      url: ev.source_url ? String(ev.source_url) : null,
      category: 'community', tags: [],
      placeholderEmoji: '📅', placeholderGradient: GRADIENTS[i % GRADIENTS.length],
    }))
  } catch {
    return SEED_EVENTS.slice(0, 3)
  }
}

async function getFeaturedResources(): Promise<Resource[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('resources')
    .select('*')
    .eq('status', 'published')
    .eq('access_level', 'free')
    .order('featured', { ascending: false })
    .limit(3)
  return data ?? []
}

export default async function HomePage() {
  const [dbResources, previewEvents] = await Promise.all([
    getFeaturedResources(),
    getFeaturedEvents(),
  ])
  const resources: (Resource | SeedResource)[] =
    dbResources.length > 0 ? dbResources : SEED_RESOURCES.slice(0, 3)

  const weekRange = getWeekRange()

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-brand-purple px-4 py-14 md:py-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-brand-coral/20 blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-64 h-64 rounded-full bg-brand-gold/15 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Left: Text */}
            <div className="flex-1 text-center md:text-left flex flex-col gap-5">
              {/* SEO H1 — keyword-rich, visually de-emphasised vs tagline below */}
              <h1 className="font-display text-xl md:text-2xl font-semibold text-white/70 leading-snug tracking-wide">
                Family Events &amp; Resources for Orange County Parents
              </h1>

              {/* Brand tagline — visual hero, demoted from H1 for SEO */}
              <p className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                What we do<br />
                <span className="italic text-brand-gold">now</span>, mama?
              </p>

              <p className="text-brand-lavender/90 text-lg leading-relaxed max-w-md">
                Free weekly events, honest parenting guides, and a community of OC parents who get it.
                No judgment. No fluff. Just good stuff.
              </p>

              {/* ③ CTAs swapped — events first in coral, guides second outline */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link href="/events" className="btn-coral text-base px-8 py-4 text-center">
                  This week in OC →
                </Link>
                <Link href="/resources" className="btn-outline-white text-base px-6 py-4 text-center">
                  Browse free guides ✦
                </Link>
              </div>
              {/* ① Removed 'Free forever · No credit card needed' */}
            </div>

            {/* Right: Circular image + floating stat cards */}
            <div className="flex-shrink-0 relative w-72 h-72 md:w-80 md:h-80">
              <div className="w-full h-full rounded-full border-4 border-white/20 overflow-hidden relative shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1484665754804-74b091211472?auto=format&fit=crop&w=640&h=640&q=85"
                  alt="Mom lifting her laughing child up in the air outdoors"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="320px"
                />
              </div>
              <div className="absolute -top-2 -left-6 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">This week</p>
                  <p className="text-sm font-bold text-brand-navy">20+ events</p>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-4 bg-brand-gold rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2">
                <span className="text-xl">👨‍👩‍👧</span>
                <div>
                  <p className="text-xs text-brand-navy/60 font-medium">OC parents</p>
                  <p className="text-sm font-bold text-brand-navy">3,000+</p>
                </div>
              </div>
              <span className="absolute top-10 -right-8 text-brand-gold text-2xl select-none">✦</span>
              <span className="absolute bottom-16 -left-10 text-white/40 text-xl select-none">✦</span>
              <span className="absolute -top-6 right-16 text-brand-coral/60 text-sm select-none">✦</span>
            </div>

          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-white px-4 py-8 border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '✦', label: 'Free weekly events', sub: 'curated every Friday' },
            { icon: '📖', label: 'Honest guides',      sub: 'written for real parents' },
            { icon: '👩‍👧‍👦', label: '3,000+ parents',  sub: 'in OC & counting' },
            { icon: '💬', label: 'No judgment zone',   sub: 'just good people' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-brand-gold text-xl">{icon}</span>
              <p className="text-sm font-semibold text-brand-navy">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ④ EVENTS — moved above resources */}
      <section className="px-4 py-14 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <p className="section-label mb-2">This Week in OC</p>
            <h2 className="font-display text-3xl font-bold text-brand-navy">{weekRange}</h2>
            <p className="text-gray-500 mt-1 text-sm">Hand-picked family events across Orange County.</p>
          </div>
          <Link href="/events" className="text-sm font-semibold text-brand-purple hover:underline whitespace-nowrap">
            See all events →
          </Link>
        </div>

        {/* ⑤ EventListItem — same component as events page */}
        <div className="flex flex-col gap-4">
          {previewEvents.map(event => (
            <EventListItem key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* ⑥ RESOURCES — below events, uses ResourceCard same as resources page */}
      <section className="bg-white px-4 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
            <div>
              <p className="section-label mb-2">Free guides & resources</p>
              <h2 className="font-display text-3xl font-bold text-brand-navy leading-tight">
                Honestly written for<br />
                <span className="italic text-brand-purple">OC parents</span>
              </h2>
              <p className="text-gray-500 mt-2 text-sm max-w-sm">
                Real advice. No filler. Every guide is free — no account needed.
              </p>
            </div>
            <Link href="/resources" className="text-sm font-semibold text-brand-purple hover:underline whitespace-nowrap">
              See all guides →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      <section className="bg-brand-lavender/30 px-4 py-14">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">

          <div className="flex-1 flex flex-col gap-5">
            <p className="section-label">Community</p>
            <h2 className="font-display text-3xl font-bold text-brand-navy leading-tight">
              You don&apos;t have to<br />
              <span className="italic text-brand-purple">figure this out alone.</span>
            </h2>
            <p className="text-gray-600 text-base leading-relaxed max-w-md">
              3,000+ OC parents sharing what actually works — sleep schedules, toddler tantrums, the best parks, and everything in between. Real talk, no judgment.
            </p>
            <form action="/api/subscribe" method="POST" className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className="flex-1 rounded-2xl px-4 py-3 text-sm bg-white border border-gray-200 text-brand-navy placeholder-gray-400 focus:outline-none focus:border-brand-purple"
              />
              <button type="submit" className="btn-primary px-5 py-3 whitespace-nowrap">
                Join the newsletter
              </button>
            </form>
            <p className="text-xs text-gray-400">
              Free weekly events + guides · No spam · <Link href="/about" className="underline hover:text-brand-purple">Our story</Link>
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-4 w-full md:w-72">
            {[
              { name: 'Jess T.',    text: 'Finally a newsletter that actually has events I want to go to with my kids.', emoji: '🌟' },
              { name: 'Maria L.',   text: 'The toddler tantrums guide saved us. Honest, funny, and actually useful.',    emoji: '💛' },
              { name: 'Amanda K.', text: 'Love having a place to ask questions without feeling judged.',                  emoji: '✨' },
            ].map(({ name, text, emoji }) => (
              <div key={name} className="card-warm flex gap-3 items-start">
                <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{text}&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">— {name}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── PLUS — soft mention ── */}
      <section className="px-4 py-14 max-w-2xl mx-auto text-center">
        <p className="font-script text-brand-purple text-2xl mb-2">want even more?</p>
        <h2 className="font-display text-2xl font-bold text-brand-navy mb-3">
          Plus unlocks everything.
        </h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
          Unlock the full resource library, downloadable guides, and our private Discord — for parents who want to go deeper.
        </p>
        <div className="bg-white rounded-3xl border border-brand-purple/20 p-6 flex flex-col items-center gap-4 shadow-sm">
          <p className="text-3xl font-display font-bold text-brand-purple">
            $7<span className="text-lg font-normal text-gray-400">/month</span>
          </p>
          {[
            'Everything free members get',
            'Full resource library + downloadable PDFs',
            'Private Discord community',
            '#founding-parents channel',
          ].map(f => (
            <p key={f} className="text-sm flex items-center gap-2 text-gray-700">
              <span className="text-brand-gold">✦</span>{f}
            </p>
          ))}
          <Link href="/signup?plan=plus" className="btn-primary w-full justify-center mt-2">
            Start 7-day free trial
          </Link>
          <p className="text-xs text-gray-400">Cancel any time · No charge for 7 days</p>
        </div>
      </section>
    </>
  )
}
