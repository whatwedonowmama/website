import Link from 'next/link'
import type { Metadata } from 'next'
import {
  FARMERS_MARKETS,
  getAllCities,
  getAllActiveDays,
  type MarketDay,
} from '@/lib/farmers-markets'

export const metadata: Metadata = {
  title: 'Orange County Farmers Markets: Find Markets by Day & City',
  description:
    'Browse 34+ certified farmers markets across Orange County, CA. Filter by day of the week or city to find fresh produce, local artisans, and family-friendly fun near you.',
  openGraph: {
    title: 'Orange County Farmers Markets — whatwedonowmama',
    description:
      'Find Orange County farmers markets by day and city. Fresh produce, artisan goods, and family fun across OC every week.',
    url: 'https://whatwedonowmama.com/orange-county-farmers-market',
  },
}

const DAY_EMOJI: Record<MarketDay, string> = {
  Sunday:    '🌅',
  Monday:    '💼',
  Tuesday:   '🌮',
  Wednesday: '🌿',
  Thursday:  '🎵',
  Friday:    '🎉',
  Saturday:  '☀️',
}

// Build URL preserving current filters
function buildUrl(
  currentDay: string | null,
  currentCity: string | null,
  overrides: { day?: string | null; city?: string | null },
): string {
  const day  = 'day'  in overrides ? overrides.day  : currentDay
  const city = 'city' in overrides ? overrides.city : currentCity
  const p = new URLSearchParams()
  if (day)  p.set('day',  day)
  if (city) p.set('city', city)
  const s = p.toString()
  return s ? `/orange-county-farmers-market?${s}` : '/orange-county-farmers-market'
}

export default async function FarmersMarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; city?: string }>
}) {
  const sp   = await searchParams
  const day  = sp.day  ?? null
  const city = sp.city ?? null

  const allCities = getAllCities()
  const allDays   = getAllActiveDays()

  let markets = FARMERS_MARKETS
  if (day)  markets = markets.filter(m => m.day  === day)
  if (city) markets = markets.filter(m => m.city === city)

  // Group by day for the display
  const grouped: Record<string, typeof markets> = {}
  for (const m of markets) {
    if (!grouped[m.day]) grouped[m.day] = []
    grouped[m.day].push(m)
  }
  const orderedDays = allDays.filter(d => grouped[d]?.length)

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-white border-b border-gray-100 px-4 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-3">Orange County, CA</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-navy leading-tight max-w-3xl">
            Orange County Farmers Markets
          </h1>
          <p className="text-gray-500 mt-4 text-lg max-w-2xl leading-relaxed">
            Fresh produce, local artisans, and family fun — every day of the week across OC.
            Browse all {FARMERS_MARKETS.length} markets by day or city.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-6 flex-wrap">
            {[
              { label: 'Markets', value: FARMERS_MARKETS.length },
              { label: 'Cities', value: allCities.length },
              { label: 'Days a week', value: allDays.length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-bold text-brand-purple">{s.value}</p>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── DAY FILTER ── */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">Filter by day</p>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={buildUrl(day, city, { day: null })}
              className={`text-sm font-medium px-4 py-2 rounded-full border transition-all ${
                !day
                  ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                  : 'bg-white text-brand-navy border-gray-200 hover:border-brand-purple hover:text-brand-purple'
              }`}
            >
              All days
            </Link>
            {allDays.map(d => (
              <Link
                key={d}
                href={buildUrl(day, city, { day: day === d ? null : d })}
                className={`text-sm font-medium px-4 py-2 rounded-full border transition-all flex items-center gap-1.5 ${
                  day === d
                    ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                    : 'bg-white text-brand-navy border-gray-200 hover:border-brand-purple hover:text-brand-purple'
                }`}
              >
                <span>{DAY_EMOJI[d]}</span>
                {d}
              </Link>
            ))}
          </div>
        </div>

        {/* ── CITY FILTER ── */}
        <div className="mb-10">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">Filter by city</p>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={buildUrl(day, city, { city: null })}
              className={`text-xs rounded-full px-3 py-1.5 border transition-all font-medium ${
                !city
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy'
              }`}
            >
              All cities
            </Link>
            {allCities.map(c => (
              <Link
                key={c}
                href={buildUrl(day, city, { city: city === c ? null : c })}
                className={`text-xs rounded-full px-3 py-1.5 border transition-all font-medium ${
                  city === c
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy'
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>

        {/* ── RESULTS HEADER ── */}
        {(day || city) && (
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-gray-500 text-sm">
              Showing <span className="font-semibold text-brand-navy">{markets.length}</span> market{markets.length !== 1 ? 's' : ''}
              {day  && <> on <span className="font-semibold text-brand-navy">{day}s</span></>}
              {city && <> in <span className="font-semibold text-brand-navy">{city}</span></>}
            </p>
            <Link
              href="/orange-county-farmers-market"
              className="text-xs font-semibold text-brand-purple hover:underline"
            >
              Clear filters ×
            </Link>
          </div>
        )}

        {/* ── MARKET CARDS (grouped by day) ── */}
        {orderedDays.length > 0 ? (
          <div className="space-y-10">
            {orderedDays.map(d => (
              <section key={d}>
                {/* Day heading — only when showing multiple days */}
                {!day && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{DAY_EMOJI[d]}</span>
                    <h2 className="font-display text-2xl font-bold text-brand-navy">{d}</h2>
                    <span className="text-sm text-gray-400">
                      {grouped[d].length} market{grouped[d].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[d].map(market => (
                    <Link
                      key={market.slug}
                      href={`/orange-county-farmers-market/${market.slug}`}
                      className="group bg-white rounded-3xl border border-gray-100 hover:border-brand-purple/30 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative h-40 bg-gradient-to-br from-green-100 to-emerald-50 overflow-hidden">
                        {market.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={market.image}
                            alt={market.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={undefined}
                          />
                        )}
                        {!market.image && (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl">🥦</span>
                          </div>
                        )}
                        {/* Day badge */}
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-navy text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                          {DAY_EMOJI[market.day]} {market.day}
                        </span>
                        {market.notes && (
                          <span className="absolute top-3 right-3 bg-brand-gold/90 text-brand-navy text-xs font-semibold px-2.5 py-1 rounded-full">
                            Seasonal
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col gap-1.5 flex-1">
                        <h3 className="font-display font-bold text-brand-navy text-base leading-snug group-hover:text-brand-purple transition-colors line-clamp-2">
                          {market.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                          <span>📍</span> {market.city}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>🕐</span> {market.startTime} – {market.endTime}
                        </p>
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mt-1">
                          {market.description}
                        </p>

                        {/* Tags */}
                        {market.tags && market.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-auto pt-2">
                            {market.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="text-xs bg-brand-lavender text-brand-purple px-2 py-0.5 rounded-full font-medium capitalize"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">🥕</span>
            <p className="font-display text-xl text-gray-600">No markets match your filters</p>
            <Link href="/orange-county-farmers-market" className="text-sm font-semibold text-brand-purple hover:underline">
              Clear filters →
            </Link>
          </div>
        )}

        {/* ── SEO COPY ── */}
        <div className="mt-16 bg-white rounded-3xl border border-gray-100 p-8 md:p-10">
          <h2 className="font-display text-2xl font-bold text-brand-navy mb-4">
            Your Guide to Orange County Farmers Markets
          </h2>
          <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
            <p>
              Orange County is home to more than 34 certified farmers markets spread across {allCities.length} cities —
              and they run nearly every day of the week. Whether you&apos;re looking for a{' '}
              <strong>Saturday morning farmers market in Irvine</strong>, an{' '}
              <strong>evening market in Huntington Beach</strong>, or the{' '}
              <strong>oldest farmers market in Orange County</strong> (that&apos;s Fullerton, by the way),
              this guide has you covered.
            </p>
            <p>
              Many OC farmers markets are <strong>certified by the Orange County Farm Bureau</strong> or the{' '}
              <strong>California Federation of Certified Farmers Markets</strong>, which means you&apos;re buying
              directly from the farmers who grew your food — no middlemen. Look for the &quot;certified&quot; tag on
              markets to find these authentic farm-direct experiences.
            </p>
            <p>
              Several markets run <strong>year-round, rain or shine</strong> — great news for OC families who
              want a reliable weekly routine. Others, like the Fullerton Downtown Market, are seasonal
              (April–August), so check the notes on individual market pages before you go.
            </p>
            <p>
              <strong>Tip for families:</strong> Markets like the Irvine Great Park, Orange Home Grown, and
              Huntington Beach&apos;s Surf City Nights combine fresh shopping with live music, food trucks, and
              open space — making them a full family outing, not just a grocery run.
            </p>
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="mt-10 bg-brand-navy rounded-3xl p-8 text-center flex flex-col items-center gap-4">
          <p className="font-script text-brand-gold text-2xl">never miss a market</p>
          <h2 className="font-display text-2xl font-bold text-white">
            OC family events, every Friday. Free.
          </h2>
          <p className="text-gray-400 text-sm max-w-sm">
            We round up the best kid-friendly events and markets across Orange County — straight to your inbox.
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
