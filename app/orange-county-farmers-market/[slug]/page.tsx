import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  FARMERS_MARKETS,
  getMarketBySlug,
  getMarketsByCity,
  type FarmersMarket,
} from '@/lib/farmers-markets'

// ── Static generation ─────────────────────────────────────────────────────────
export function generateStaticParams() {
  return FARMERS_MARKETS.map(m => ({ slug: m.slug }))
}

// ── Dynamic metadata ──────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const market = getMarketBySlug(slug)
  if (!market) return { title: 'Market Not Found' }

  const title = `${market.name} — ${market.city} Farmers Market | whatwedonowmama`
  const description = `Visit ${market.name} in ${market.city} every ${market.day} from ${market.startTime} to ${market.endTime}. ${market.description}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://whatwedonowmama.com/orange-county-farmers-market/${market.slug}`,
      images: market.image ? [{ url: market.image, alt: market.name }] : undefined,
    },
  }
}

// ── Schema.org structured data ─────────────────────────────────────────────────
function MarketSchema({ market }: { market: FarmersMarket }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: market.name,
    description: market.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: market.location,
      addressLocality: market.city,
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    openingHours: `${market.day.substring(0, 2)} ${market.startTime}-${market.endTime}`,
    ...(market.image ? { image: market.image } : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

const DAY_EMOJI: Record<string, string> = {
  Sunday:    '🌅',
  Tuesday:   '🌮',
  Wednesday: '🌿',
  Thursday:  '🎵',
  Friday:    '🎉',
  Saturday:  '☀️',
}

// ── Page component ─────────────────────────────────────────────────────────────
export default async function MarketPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const market = getMarketBySlug(slug)
  if (!market) notFound()

  const otherMarketsInCity = getMarketsByCity(market.city).filter(m => m.slug !== market.slug)

  return (
    <>
      <MarketSchema market={market} />
      <div className="bg-brand-cream min-h-screen">

        {/* ── HERO IMAGE ── */}
        <div className="relative h-64 md:h-80 bg-gradient-to-br from-green-400 to-emerald-500 overflow-hidden">
          {market.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={market.image}
              alt={`${market.name} in ${market.city}`}
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">🥦</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Breadcrumb back link */}
          <div className="absolute top-4 left-4">
            <Link
              href="/orange-county-farmers-market"
              className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/30 transition-all"
            >
              ← All Markets
            </Link>
          </div>

          {/* Day badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-white/90 backdrop-blur-sm text-brand-navy text-sm font-bold px-3 py-1.5 rounded-full shadow">
              {DAY_EMOJI[market.day] ?? '📅'} {market.day}s
            </span>
          </div>

          {/* Market name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-green-300 text-sm font-semibold uppercase tracking-wider mb-1">
              {market.city} · Orange County Farmers Market
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
              {market.name}
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── MAIN CONTENT ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Seasonal notice */}
              {market.notes && (
                <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">Seasonal Market</p>
                    <p className="text-gray-600 text-sm mt-0.5">{market.notes}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8">
                <h2 className="font-display text-xl font-bold text-brand-navy mb-3">About this Market</h2>
                <p className="text-gray-600 leading-relaxed">
                  {market.longDescription ?? market.description}
                </p>

                {market.affiliate && (
                  <p className="mt-4 text-sm text-gray-400">
                    <span className="font-medium text-gray-500">Affiliated with:</span>{' '}
                    {market.affiliate}
                  </p>
                )}
              </div>

              {/* What to Expect */}
              {market.tags && market.tags.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8">
                  <h2 className="font-display text-xl font-bold text-brand-navy mb-4">What to Expect</h2>
                  <div className="flex gap-2 flex-wrap">
                    {market.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-brand-lavender text-brand-purple px-3 py-1.5 rounded-full text-sm font-medium capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips for visiting */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8">
                <h2 className="font-display text-xl font-bold text-brand-navy mb-4">
                  Tips for Visiting with Kids
                </h2>
                <ul className="space-y-3">
                  {[
                    'Arrive early for the best selection — produce goes fast on busy market days.',
                    'Bring reusable bags and small cash for vendors that don\'t take cards.',
                    'Let kids pick one piece of produce or treat to make it fun for them.',
                    'Check the market\'s social pages before heading out to confirm hours and vendor lineup.',
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600">
                      <span className="text-brand-purple font-bold flex-shrink-0">✦</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Other markets in same city */}
              {otherMarketsInCity.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8">
                  <h2 className="font-display text-xl font-bold text-brand-navy mb-4">
                    More Markets in {market.city}
                  </h2>
                  <div className="space-y-3">
                    {otherMarketsInCity.map(m => (
                      <Link
                        key={m.slug}
                        href={`/orange-county-farmers-market/${m.slug}`}
                        className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-gray-100 hover:border-brand-purple/30 hover:bg-brand-lavender/20 transition-all group"
                      >
                        <div>
                          <p className="font-semibold text-brand-navy text-sm group-hover:text-brand-purple transition-colors">
                            {m.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {DAY_EMOJI[m.day] ?? '📅'} {m.day}s · {m.startTime} – {m.endTime}
                          </p>
                        </div>
                        <span className="text-brand-purple text-sm flex-shrink-0">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── SIDEBAR: DETAILS CARD ── */}
            <div className="space-y-4">

              {/* Key details */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-4">
                <h2 className="font-display text-lg font-bold text-brand-navy mb-4">Market Details</h2>
                <div className="space-y-4">

                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">📍</span>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Location</p>
                      <p className="text-brand-navy text-sm font-medium mt-0.5">{market.location}</p>
                      {market.address && (
                        <p className="text-gray-500 text-xs mt-0.5">{market.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">📅</span>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Day</p>
                      <p className="text-brand-navy text-sm font-medium mt-0.5">Every {market.day}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">🕐</span>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Hours</p>
                      <p className="text-brand-navy text-sm font-medium mt-0.5">
                        {market.startTime} – {market.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">🏙️</span>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">City</p>
                      <Link
                        href={`/orange-county-farmers-market?city=${encodeURIComponent(market.city)}`}
                        className="text-brand-purple text-sm font-medium mt-0.5 hover:underline block"
                      >
                        {market.city} markets →
                      </Link>
                    </div>
                  </div>

                  {market.notes && (
                    <div className="flex gap-3">
                      <span className="text-xl flex-shrink-0">📌</span>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Note</p>
                        <p className="text-gray-500 text-sm mt-0.5">{market.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Maps CTA */}
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(market.address ?? `${market.name} ${market.city} CA`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full flex items-center justify-center gap-2 btn-primary py-3 text-sm"
                >
                  <span>🗺️</span>
                  Get Directions
                </a>
              </div>

              {/* Email CTA sidebar */}
              <div className="bg-brand-lavender/40 rounded-3xl p-6">
                <p className="font-semibold text-brand-navy text-sm mb-1">Get OC events weekly ✦</p>
                <p className="text-xs text-gray-500 mb-3">Markets, events, and family fun every Friday. Free.</p>
                <form action="/api/subscribe" method="POST" className="flex flex-col gap-2">
                  <input
                    type="email" name="email" required placeholder="you@email.com"
                    className="w-full rounded-xl px-3 py-2.5 text-sm bg-white border border-brand-purple/20 text-brand-navy placeholder-gray-400 focus:outline-none focus:border-brand-purple"
                  />
                  <button type="submit" className="btn-primary text-sm py-2.5 justify-center">
                    Subscribe free →
                  </button>
                </form>
              </div>

            </div>
          </div>

          {/* ── BACK LINK ── */}
          <div className="mt-12 text-center">
            <Link
              href="/orange-county-farmers-market"
              className="inline-flex items-center gap-2 text-brand-purple font-semibold hover:underline text-sm"
            >
              ← Browse all Orange County Farmers Markets
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
