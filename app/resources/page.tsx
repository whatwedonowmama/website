import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import ResourceCard from '@/components/ResourceCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Resource } from '@/lib/types'
import { SEED_RESOURCES, type SeedResource } from '@/lib/seed-resources'

export const metadata: Metadata = {
  title: 'Parenting Resources — OC Parent Guides',
  description: 'Honest parenting guides for Orange County families. Sleep, feeding, milestones, and OC-specific guides. Free and Plus content.',
}

const CATEGORIES = [
  { value: 'all',         label: 'All',        emoji: '✦' },
  { value: 'sleep',       label: 'Sleep',      emoji: '🌙' },
  { value: 'feeding',     label: 'Feeding',    emoji: '🥑' },
  { value: 'development', label: 'Development',emoji: '🌱' },
  { value: 'activities',  label: 'Activities', emoji: '🏃' },
  { value: 'milestones',  label: 'Milestones', emoji: '⭐' },
  { value: 'oc-guides',   label: 'OC Guides',  emoji: '📍' },
]

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const supabase = await createClient()
  const user = await getUser()
  const isPlus = user?.tier === 'plus'

  // Try Supabase first
  let query = supabase
    .from('resources')
    .select('*')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })

  if (cat && cat !== 'all') {
    query = query.eq('category', cat)
  }

  const { data: dbResources } = await query

  // Fall back to seed data if Supabase returns nothing
  const allResources: (Resource | SeedResource)[] =
    dbResources && dbResources.length > 0
      ? dbResources
      : cat && cat !== 'all'
        ? SEED_RESOURCES.filter(r => r.category === cat)
        : SEED_RESOURCES

  const featured = allResources.find(r => r.featured)
  const rest = allResources.filter(r => !r.featured)

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* ── PAGE HEADER ── */}
      <section className="bg-white border-b border-gray-100 px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-2">Resources</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold text-brand-navy leading-tight">
                Parenting guides,<br />
                <span className="italic text-brand-purple">honestly written.</span>
              </h1>
              <p className="text-gray-500 mt-3 max-w-sm">
                Curated guides, expert insights, and real-world tips — vetted by families who've been through it.
              </p>
            </div>
            {!user && (
              <div className="bg-brand-lavender/40 rounded-2xl p-4 flex flex-col gap-2 max-w-xs">
                <p className="text-sm font-semibold text-brand-navy">Get new guides by email ✦</p>
                <p className="text-xs text-gray-500">Fresh articles in your inbox every month. Free.</p>
                <form action="/api/subscribe" method="POST" className="flex flex-col gap-2 mt-1">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@email.com"
                    className="w-full rounded-xl px-3 py-2.5 text-sm bg-white border border-brand-purple/20 text-brand-navy placeholder-gray-400 focus:outline-none focus:border-brand-purple"
                  />
                  <button type="submit" className="btn-primary text-sm px-4 py-2.5 w-full justify-center">
                    Subscribe free →
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORIES.map(c => (
            <a
              key={c.value}
              href={c.value === 'all' ? '/resources' : `/resources?cat=${c.value}`}
              className={`text-sm font-medium px-4 py-2 rounded-full border transition-all min-h-[44px] flex items-center gap-1.5 ${
                (c.value === 'all' && !cat) || cat === c.value
                  ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                  : 'bg-white text-brand-navy border-gray-200 hover:border-brand-purple hover:text-brand-purple'
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </a>
          ))}
        </div>

        {/* Featured article — full-width hero card */}
        {featured && (
          <div className="mb-10">
            <p className="section-label mb-3">✦ Featured</p>
            <Link
              href={!isPlus && featured.access_level === 'plus' ? '/signup?plan=plus' : `/resources/${featured.slug}`}
              className="group flex flex-col md:flex-row rounded-3xl bg-white border border-gray-100 hover:border-brand-purple/30 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Accent side panel */}
              <div className="bg-brand-lavender/40 md:w-48 flex-shrink-0 flex items-center justify-center p-8 md:p-0">
                <span className="text-6xl">
                  {featured.category === 'sleep' ? '🌙'
                    : featured.category === 'feeding' ? '🥑'
                    : featured.category === 'development' ? '🌱'
                    : featured.category === 'milestones' ? '⭐'
                    : featured.category === 'oc-guides' ? '📍'
                    : '📖'}
                </span>
              </div>

              <div className="flex flex-col gap-3 p-6 flex-1">
                <div className="flex items-center gap-2">
                  <p className="section-label capitalize">{featured.category.replace('-', ' ')}</p>
                  {featured.access_level === 'plus'
                    ? <span className="badge-plus">✦ Plus</span>
                    : <span className="badge-free">Free</span>}
                </div>
                <h2 className="font-display font-bold text-2xl text-brand-navy group-hover:text-brand-purple transition-colors leading-snug">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-gray-600 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                )}
                {'tags' in featured && featured.tags && (
                  <div className="flex flex-wrap gap-1.5">
                    {(featured.tags as string[]).slice(0, 4).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{featured.read_time_minutes} min read</span>
                  <span className="text-sm font-semibold text-brand-purple">Read guide →</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Article grid */}
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map(r => (
              <ResourceCard
                key={r.id}
                resource={r}
                locked={!isPlus && r.access_level === 'plus'}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12 text-gray-400">
            <p className="text-4xl mb-4">📖</p>
            <p className="font-display text-xl text-gray-500 mb-2">No guides in this category yet</p>
            <p className="text-sm">
              <a href="/resources" className="text-brand-purple font-semibold hover:underline">View all guides →</a>
            </p>
          </div>
        )}

        {/* Bottom email CTA */}
        <div className="mt-14 bg-brand-navy rounded-3xl p-8 text-center flex flex-col items-center gap-4">
          <p className="font-script text-brand-gold text-2xl">want more like this?</p>
          <h2 className="font-display text-2xl font-bold text-white">
            New guides in your inbox. Free.
          </h2>
          <p className="text-gray-400 text-sm max-w-sm">
            We publish new parenting guides every month. Sign up free and we&apos;ll send them straight to you.
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
              Get guides →
            </button>
          </form>
          <p className="text-gray-600 text-xs">No spam. Unsubscribe any time.</p>
        </div>
      </div>
    </div>
  )
}
