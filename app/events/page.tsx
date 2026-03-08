import Link from 'next/link'
import EventCard from '@/components/EventCard'
import { getWeekRange } from '@/lib/utils'
import type { ScrapedEvent } from '@/lib/types'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'This Week in OC — Free Family Events',
  description: 'Free and affordable family events in Orange County this week. Updated every Monday by whatwedonowmama.',
}

// Revalidate every hour so events stay fresh without a full redeploy
export const revalidate = 3600

function loadEvents(): ScrapedEvent[] {
  try {
    const p = path.join(process.cwd(), '..', 'oc_events_latest.json')
    if (!existsSync(p)) return []
    const raw = JSON.parse(readFileSync(p, 'utf-8'))
    return Array.isArray(raw) ? raw : raw.events ?? []
  } catch {
    return []
  }
}

export default function EventsPage() {
  const allEvents = loadEvents()
  const weekRange = getWeekRange()
  const cities = [...new Set(allEvents.map(e => e.city).filter(Boolean))] as string[]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="section-label mb-1">Orange County, CA</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">This Week in OC</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <p className="text-gray-500 text-sm">{weekRange}</p>
          {allEvents.length > 0 && (
            <span className="bg-brand-lavender text-brand-purple text-xs font-semibold px-3 py-1 rounded-full">
              {allEvents.length} events this week
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Last updated: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Filter bar — client component can be extracted later for interactivity */}
      {cities.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <span className="text-sm font-medium text-gray-500 self-center">Filter by city:</span>
          {cities.map(city => (
            <span key={city} className="text-xs bg-white border border-gray-200 text-brand-navy rounded-full px-3 py-1 cursor-pointer hover:border-brand-purple hover:text-brand-purple transition-colors">
              {city}
            </span>
          ))}
        </div>
      )}

      {/* Events grid */}
      {allEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allEvents.map((event, i) => (
            <EventCard key={i} event={event} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">📅</p>
          <p className="font-display text-xl text-gray-500 mb-2">Events are loading…</p>
          <p className="text-sm">Check back Monday — we update every week.</p>
        </div>
      )}

      {/* Email subscribe CTA */}
      <div className="mt-12 bg-brand-purple rounded-2xl p-8 text-white text-center flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">Get these in your inbox every week.</h2>
        <p className="text-brand-lavender">Every Friday, we curate the best OC events for the weekend ahead. Free, forever.</p>
        <Link href="/signup" className="btn-coral mx-auto px-8 py-3">
          Sign up free →
        </Link>
      </div>

      {/* Historical events link (members only) */}
      <div className="mt-6 text-center">
        <Link href="/members/events/history" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
          Browse past events →
        </Link>
        <p className="text-xs text-gray-300 mt-1">Members only</p>
      </div>
    </div>
  )
}
