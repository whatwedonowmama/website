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
      <section className="bg-brand-purple text-white px-4 py-14 md:py-20">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-5">
          <p className="section-label text-brand-gold">Orange County, CA</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            What do we do<br className="hidden md:block" /> now, mama?
          </h1>
          <p className="text-brand-lavender text-lg leading-relaxed max-w-xl mx-auto">
            Free weekly events, honest parenting guides, and a community of OC parents who get it.
            No judgment. No fluff. Just good stuff.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
            <Link href="/signup" className="btn-coral text-base px-8 py-4 text-center">
              Join Free — it takes 30 seconds
            </Link>
            <Link href="/events" className="btn-secondary border-white text-white hover:bg-white/10 text-base px-6 py-4 text-center">
              This Week in OC →
            </Link>
          </div>
          <p className="text-brand-lavender/60 text-sm">No credit card needed · Free forever</p>
        </div>
      </section>

      {/* ── BENEFITS ROW ── */}
      <section className="bg-white px-4 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '📅', label: 'Free weekly events' },
            { icon: '📖', label: 'Parenting resources' },
            { icon: '👨‍👩‍👧', label: '3,000+ OC parents' },
            { icon: '💬', label: 'No judgment zone' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{icon}</span>
              <p className="text-sm font-semibold text-brand-navy">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EVENTS PREVIEW ── */}
      <section className="px-4 py-12 max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="section-label mb-1">This Week in OC</p>
            <h2 className="font-display text-2xl font-bold text-brand-navy">{weekRange}</h2>
          </div>
          <Link href="/events" className="text-sm font-semibold text-brand-purple hover:underline">
            See all events →
          </Link>
        </div>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((e, i) => <EventCard key={i} event={e} />)}
          </div>
        ) : (
          <div className="card text-center text-gray-400 py-10">
            <p>Events loading soon — check back Friday.</p>
            <Link href="/events" className="text-brand-purple text-sm font-semibold mt-2 inline-block">View events page →</Link>
          </div>
        )}
      </section>

      {/* ── RESOURCES PREVIEW ── */}
      <section className="bg-white px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="section-label mb-1">Resources</p>
              <h2 className="font-display text-2xl font-bold text-brand-navy">Honestly written guides for OC parents</h2>
            </div>
            <Link href="/resources" className="text-sm font-semibold text-brand-purple hover:underline">
              Explore all →
            </Link>
          </div>
          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
            </div>
          ) : (
            <div className="card text-center text-gray-400 py-10">
              <p>Guides coming soon. <Link href="/signup" className="text-brand-purple font-semibold">Sign up</Link> and we'll let you know when they drop.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── COMMUNITY SECTION ── */}
      <section className="px-4 py-14 max-w-5xl mx-auto">
        <div className="bg-brand-navy rounded-3xl p-8 md:p-12 text-white text-center flex flex-col gap-5">
          <p className="text-4xl">👋</p>
          <h2 className="font-display text-3xl font-bold">You don't have to figure this out alone.</h2>
          <p className="text-gray-300 text-lg max-w-xl mx-auto leading-relaxed">
            3,000+ OC parents sharing what actually works — sleep schedules, toddler tantrums, the best parks, and everything in between. Real talk, no judgment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
            <Link href="/signup" className="btn-coral text-base px-8 py-4">Join the community</Link>
            <Link href="/about" className="btn-secondary border-white text-white hover:bg-white/10 text-base px-6 py-4">Our story →</Link>
          </div>
          <p className="text-gray-500 text-sm">Discord community is a Plus benefit · $7/mo after 7-day free trial</p>
        </div>
      </section>

      {/* ── MEMBERSHIP COMPARISON ── */}
      <section className="bg-brand-lavender/40 px-4 py-14">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="section-label mb-2">Membership</p>
          <h2 className="font-display text-3xl font-bold text-brand-navy">Free is genuinely free.</h2>
          <p className="text-gray-600 mt-2">Plus is for parents who want everything — and to support what we're building.</p>
        </div>
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card flex flex-col gap-3">
            <p className="font-bold text-lg text-brand-navy">Free</p>
            <p className="text-2xl font-display font-bold text-brand-purple">$0</p>
            {['This Week in OC events', 'Free resource articles', 'Member dashboard'].map(f => (
              <p key={f} className="text-sm flex items-center gap-2"><span className="text-green-500">✓</span>{f}</p>
            ))}
            <Link href="/signup" className="btn-secondary mt-2 text-center">Get started free</Link>
          </div>
          <div className="card border-2 border-brand-purple flex flex-col gap-3 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-coral text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</span>
            <p className="font-bold text-lg text-brand-navy">Plus</p>
            <p className="text-2xl font-display font-bold text-brand-purple">$7<span className="text-base font-normal text-gray-400">/mo</span></p>
            {['Everything in Free', 'All Plus resources + guides', 'Discord community access', 'Downloadable PDFs', '#founding-parents channel'].map(f => (
              <p key={f} className="text-sm flex items-center gap-2"><span className="text-brand-purple">⭐</span>{f}</p>
            ))}
            <Link href="/signup?plan=plus" className="btn-primary mt-2 text-center">Start 7-day free trial</Link>
            <p className="text-xs text-center text-gray-400">Cancel anytime · No charge for 7 days</p>
          </div>
        </div>
      </section>
    </>
  )
}
