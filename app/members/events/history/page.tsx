import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EventCard from '@/components/EventCard'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import type { ScrapedEvent } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Past Events in OC' }

function loadHistoricalEvents(month?: string): { date: string; events: ScrapedEvent[] }[] {
  try {
    const outputDir = path.join(process.cwd(), '..', 'output')
    if (!existsSync(outputDir)) return []

    const files = readdirSync(outputDir)
      .filter(f => f.startsWith('oc_events_') && f.endsWith('.json'))
      .sort()
      .reverse() // most recent first

    const results: { date: string; events: ScrapedEvent[] }[] = []

    for (const file of files) {
      const dateMatch = file.match(/oc_events_(\d{4}-\d{2}-\d{2})\.json/)
      if (!dateMatch) continue

      const fileDate = dateMatch[1]
      // Filter by month if provided (format: YYYY-MM)
      if (month && !fileDate.startsWith(month)) continue

      try {
        const raw = JSON.parse(readFileSync(path.join(outputDir, file), 'utf-8'))
        const events: ScrapedEvent[] = Array.isArray(raw) ? raw : raw.events ?? []
        if (events.length > 0) {
          results.push({ date: fileDate, events })
        }
      } catch { continue }
    }

    return results.slice(0, 8) // max 8 archive dates
  } catch {
    return []
  }
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const user = await getUser()
  if (!user) redirect('/login?redirect=/members/events/history')

  const { month } = await searchParams
  const archives = loadHistoricalEvents(month)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="section-label mb-1">Past Events</p>
        <h1 className="font-display text-3xl font-bold text-brand-navy">Events archive</h1>
        <p className="text-gray-500 text-sm mt-1">Browse past OC events by week.</p>
      </div>

      {archives.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-4">📦</p>
          <p className="font-display text-xl text-gray-500 mb-2">No archived events yet</p>
          <p className="text-sm">Historical events appear here as the scraper builds up weekly archives. Check back soon.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {archives.map(({ date, events }) => (
            <section key={date}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-display text-xl font-bold text-brand-navy">
                  Week of {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                  Past
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((e, i) => (
                  <EventCard key={i} event={e} past />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
