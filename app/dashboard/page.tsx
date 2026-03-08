import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EventCard from '@/components/EventCard'
import ResourceCard from '@/components/ResourceCard'
import type { Resource, ScrapedEvent } from '@/lib/types'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

function getPreviewEvents(): ScrapedEvent[] {
  try {
    const p = path.join(process.cwd(), '..', 'oc_events_latest.json')
    if (!existsSync(p)) return []
    const raw = JSON.parse(readFileSync(p, 'utf-8'))
    const events: ScrapedEvent[] = Array.isArray(raw) ? raw : raw.events ?? []
    return events.slice(0, 4)
  } catch { return [] }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; upgraded?: string }>
}) {
  const user = await getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const { welcome, upgraded } = await searchParams
  const isPlus = user.tier === 'plus'
  const isTrial = user.subscription_status === 'trialing'

  const supabase = await createClient()
  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('status', 'published')
    .eq('access_level', isPlus ? 'plus' : 'free')
    .order('published_at', { ascending: false })
    .limit(3)

  const events = getPreviewEvents()
  const latestResources: Resource[] = resources ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Welcome modal banners */}
      {welcome === '1' && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold text-green-800">You're in, {user.first_name || 'friend'}!</p>
            <p className="text-sm text-green-700">Browse this week's events, explore free resources, and make yourself at home.</p>
          </div>
        </div>
      )}
      {upgraded === '1' && (
        <div className="bg-brand-lavender border border-brand-purple/30 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="font-semibold text-brand-navy">You're a Plus member now!</p>
            <p className="text-sm text-gray-600">
              {isTrial
                ? 'Your 7-day free trial has started. Discord access unlocks on your first payment (day 8).'
                : 'Welcome to Plus. All resources and Discord access are unlocked.'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">
            Hey {user.first_name || 'there'} 👋
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {isPlus
              ? <span className="badge-plus">{isTrial ? '⭐ Plus (Trial)' : '⭐ Plus'}</span>
              : <span className="badge-free">Free</span>}
          </div>
        </div>
      </div>

      {/* Events */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-brand-navy">This week in OC</h2>
          <Link href="/events" className="text-sm font-semibold text-brand-purple hover:underline">See all →</Link>
        </div>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.map((e, i) => <EventCard key={i} event={e} />)}
          </div>
        ) : (
          <div className="card text-gray-400 text-center py-8">
            <p>Events update every Monday. Check back soon.</p>
          </div>
        )}
      </section>

      {/* Resources */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-brand-navy">New resources</h2>
          <Link href="/resources" className="text-sm font-semibold text-brand-purple hover:underline">See all →</Link>
        </div>
        {latestResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {latestResources.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        ) : (
          <div className="card text-gray-400 text-center py-8">
            <p>Resources coming soon — <Link href="/resources" className="text-brand-purple font-semibold">browse the library</Link>.</p>
          </div>
        )}
      </section>

      {/* Community card */}
      {isPlus && !isTrial ? (
        <section className="card border-2 border-brand-purple/30 bg-brand-lavender/30 flex flex-col md:flex-row items-center gap-5 p-6">
          <div className="flex-1">
            <p className="font-display text-xl font-bold text-brand-navy">You're in the community 🎉</p>
            <p className="text-sm text-gray-600 mt-1">3,000+ OC parents in Discord. Jump in anytime.</p>
          </div>
          <Link href="/members/community" className="btn-primary shrink-0">Open Discord →</Link>
        </section>
      ) : (
        <section className="card border border-gray-200 flex flex-col md:flex-row items-center gap-5 p-6">
          <div className="flex-1">
            <p className="font-display text-xl font-bold text-brand-navy">
              {isTrial ? 'Discord unlocks when you become a paying member' : '3,000+ OC parents are in there.'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {isTrial
                ? 'Your trial is active. On day 8 when your card is charged, Discord access unlocks automatically.'
                : 'Real talk, no judgment. The Discord community is a Plus benefit.'}
            </p>
          </div>
          {!isTrial && (
            <Link href="/signup?plan=plus" className="btn-primary shrink-0">Go Plus for $7/mo →</Link>
          )}
        </section>
      )}
    </div>
  )
}
