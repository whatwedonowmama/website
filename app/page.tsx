import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ResourceCard from '@/components/ResourceCard'
import EventCard from '@/components/EventCard'
import { getWeekRange } from '@/lib/utils'
import type { Resource, ScrapedEvent } from '@/lib/types'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

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

function getPreviewEvents(): ScrapedEvent[] {
  try {
    const p = path.join(process.cwd(), '..', 'oc_events_latest.json')
    if (!existsSync(p)) return []
    const raw = JSON.parse(readFileSync(p, 'utf-8'))
    const events: ScrapedEvent[] = Array.isArray(raw) ? raw : raw.events ?? []
    return events.slice(0, 3)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [resources, events] = await Promise.all([
    getFeaturedResources(),
    Promise.resolve(getPreviewEvents()),
  ])
  const weekRange = getWeekRange()

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-brand-purple px-4 py-14 md:py-20">
        {/* Background decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-brand-coral/20 blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-64 h-64 rounded-full bg-brand-gold/15 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Left: Text */}
            <div className="flex-1 text-center md:text-left flex flex-col gap-5">
              {/* Script accent */}
              <p className="font-script text-brand-gold text-2xl">
                for Orange County mamas
              </p>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                What do we do<br />
                <span className="italic text-brand-gold">now</span>, mama?
              </h1>

              <p className="text-brand-lavender/90 text-lg leading-relaxed max-w-md">
                Free weekly events, honest parenting guides, and a community of OC parents who get it.
                No judgment. No fluff. Just good stuff.
              </p>

              {/* Funnel CTA: lead with resources, not membership */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link href="/resources" className="btn-coral text-base px-8 py-4 text-center">
                  Browse free guides ✦
                </Link>
                <Link href="/events" className="btn-outline-white text-base px-6 py-4 text-center">
                  This week in OC →
                </Link>
              </div>

              <p className="text-brand-lavender/50 text-sm">
                Free forever · No credit card needed
              </p>
            </div>

            {/* Right: Circular image + floating stat cards */}
            <div className="flex-shrink-0 relative w-72 h-72 md:w-80 md:h-80">
              {/* Circle image placeholder */}
              <div className="w-full h-full rounded-full bg-brand-lavender/20 border-4 border-white/20 overflow-hidden flex items-center justify-center">
                {/* Placeholder pattern — replace with real photo */}
                <div className="w-full h-full bg-gradient-to-br from-brand-coral/30 via-brand-gold/20 to-brand-lavender/30 flex items-center justify-center">
                  <span className="text-7xl select-none">👩‍👧</span>
                </div>
              </div>

              {/* Floating stat card — top left */}
              <div className="absolute -top-2 -left-6 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">This week</p>
                  <p className="text-sm font-bold text-brand-navy">20+ events</p>
                </div>
              </div>

              {/* Floating stat card — bottom right */}
              <div className="absolute -bottom-2 -right-4 bg-brand-gold rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2">
                <span className="text-xl">👨‍👩‍👧</span>
                <div>
                  <p className="text-xs text-brand-navy/60 font-medium">OC parents</p>
                  <p className="text-sm font-bold text-brand-navy">3,000+</p>
                </div>
              </div>

              {/* Sparkle decorations */}
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
            { icon: '📖', label: 'Honest guides', sub: 'written for real parents' },
            { icon: '👩‍👧‍👦', label: '3,000+ parents', sub: 'in OC & counting' },
            { icon: '💬', label: 'No judgment zone', sub: 'just good people' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-brand-gold text-xl">{icon}</span>
              <p className="text-sm font-semibold text-brand-navy">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── RESOURCES — primary above-fold CTA ── */}
      <section className="px-4 py-14 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
          <div>
            <p className="section-label mb-2">Free guides & resources</p>
            <h2 className="font-display text-3xl font-bold text-brand-navy leading-tight">
              Honestly written for<br />
              <span className="italic text-brand-purple">OC parents</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm max-w-sm">
              Real advice. No filler. Every guide is free — just grab an account to save your favorites.
            </p>
          </div>
          <Link href="/resources" className="text-sm font-semibold text-brand-purple hover:underline whitespace-nowrap">
            See all guides →
          </Link>
        </div>

        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        ) : (
          /* Empty state — soft signup prompt */
          <div className="bg-brand-lavender/30 rounded-3xl p-10 text-center flex flex-col items-center gap-4">
            <span className="text-4xl">📖</span>
            <h3 className="font-display text-xl font-bold text-brand-navy">Guides dropping soon</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              We&apos;re finishing our first round of OC parent guides. Sign up free and we&apos;ll send them straight to your inbox.
            </p>
            <Link href="/signup" className="btn-primary mt-1">
              Get notified free →
            </Link>
          </div>
        )}
      </section>

      {/* ── EMAIL SIGNUP CTA ── */}
      <section className="bg-brand-navy px-4 py-14">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          {/* Decorative sparkles */}
          <div className="flex gap-3 text-brand-gold text-xl select-none">
            <span>✦</span><span>✦</span><span>✦</span>
          </div>
          <p className="font-script text-brand-gold text-3xl">stay in the loop</p>
          <h2 className="font-display text-3xl font-bold text-white leading-tight">
            The best OC family events,<br />every week. Free.
          </h2>
          <p className="text-gray-400 text-base max-w-sm">
            Our Friday newsletter rounds up the top kid-friendly events in Orange County — parks, museums, pop-ups, and more.
          </p>

          {/* Inline email form (posts to Beehiiv embed / API route) */}
          <form
            action="/api/subscribe"
            method="POST"
            className="w-full max-w-sm flex flex-col sm:flex-row gap-3 mt-2"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@email.com"
              className="flex-1 rounded-2xl px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-brand-gold"
            />
            <button
              type="submit"
              className="btn-coral px-6 py-3 whitespace-nowrap"
            >
              Get the newsletter
            </button>
          </form>

          <p className="text-gray-600 text-xs">No spam. Unsubscribe any time.</p>
        </div>
      </section>

      {/* ── EVENTS PREVIEW ── */}
      <section className="px-4 py-14 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
          <div>
            <p className="section-label mb-2">This Week in OC</p>
            <h2 className="font-display text-3xl font-bold text-brand-navy">{weekRange}</h2>
            <p className="text-gray-500 mt-1 text-sm">Hand-picked family events across Orange County.</p>
          </div>
          <Link href="/events" className="text-sm font-semibold text-brand-purple hover:underline whitespace-nowrap">
            See all events →
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((e, i) => <EventCard key={i} event={e} />)}
          </div>
        ) : (
          <div className="bg-brand-lavender/30 rounded-3xl p-10 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">📅</span>
            <p className="text-brand-navy font-semibold">Events go live every Friday</p>
            <p className="text-gray-500 text-sm">Check back Friday morning or sign up to get them by email.</p>
            <Link href="/events" className="text-brand-purple text-sm font-semibold mt-1 hover:underline">
              Browse the events page →
            </Link>
          </div>
        )}
      </section>

      {/* ── COMMUNITY — soft, no hard upsell ── */}
      <section className="bg-brand-lavender/30 px-4 py-14">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">

          {/* Left: Text */}
          <div className="flex-1 flex flex-col gap-5">
            <p className="section-label">Community</p>
            <h2 className="font-display text-3xl font-bold text-brand-navy leading-tight">
              You don&apos;t have to<br />
              <span className="italic text-brand-purple">figure this out alone.</span>
            </h2>
            <p className="text-gray-600 text-base leading-relaxed max-w-md">
              3,000+ OC parents sharing what actually works — sleep schedules, toddler tantrums, the best parks, and everything in between. Real talk, no judgment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="btn-primary">
                Join free →
              </Link>
              <Link href="/about" className="btn-secondary">
                Our story
              </Link>
            </div>
            <p className="text-xs text-gray-400">
              Free forever · Discord community available with Plus membership
            </p>
          </div>

          {/* Right: Warm testimonial cards */}
          <div className="flex-shrink-0 flex flex-col gap-4 w-full md:w-72">
            {[
              { name: 'Jess T.', text: 'Finally a newsletter that actually has events I want to go to with my kids.', emoji: '🌟' },
              { name: 'Maria L.', text: 'The toddler tantrums guide saved us. Honest, funny, and actually useful.', emoji: '💛' },
              { name: 'Amanda K.', text: 'Love having a place to ask questions without feeling judged.', emoji: '✨' },
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

      {/* ── PLUS — soft mention, bottom of page ── */}
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
