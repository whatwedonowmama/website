import Link from 'next/link'
import type { Metadata } from 'next'
import { SEED_CRAFTS, formatTime } from '@/lib/seed-crafts'

export const metadata: Metadata = {
  title: 'Arts & Crafts Ideas for Kids | whatwedonowmama',
  description: 'Easy arts and crafts for toddlers, preschoolers, and early elementary kids — recipe-style with materials list and step-by-step instructions. All projects use household or nature materials.',
  openGraph: {
    title: 'Arts & Crafts Ideas for Kids — Recipes with Materials & Instructions',
    description: 'Easy arts and crafts for toddlers through elementary kids. Materials list + step-by-step directions, like a recipe.',
    url: 'https://whatwedonowmama.com/arts-crafts',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arts & Crafts Ideas for Kids | whatwedonowmama',
    description: 'Recipe-style craft projects for toddlers, preschoolers, and early elementary kids.',
  },
}

const AGE_FILTERS = [
  { label: 'All ages',  min: 0,  max: 99 },
  { label: 'Toddlers (2–3)',    min: 2,  max: 3  },
  { label: 'Preschool (3–5)',   min: 3,  max: 5  },
  { label: 'Elementary (5–8)', min: 5,  max: 8  },
]

const CATEGORY_LABELS: Record<string, string> = {
  household: '🏠 Household',
  nature:    '🌿 Nature',
  seasonal:  '🍂 Seasonal',
  sensory:   '✋ Sensory',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
}

export default function ArtsCraftsPage() {
  const crafts = SEED_CRAFTS

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-white border-b border-gray-100 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎨</span>
            <span className="section-label">Arts &amp; Crafts</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-navy leading-tight mb-4">
            Arts &amp; Crafts Ideas for Kids
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mb-6">
            Every project has a materials list and step-by-step instructions — just like a recipe.
            Made for toddlers, preschoolers, and early elementary kids using stuff you already have at home
            or can find outside.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="text-brand-purple font-semibold">{crafts.length}</span> projects
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-brand-purple font-semibold">All free</span> to try
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-brand-purple font-semibold">Ages 2–8</span> covered
            </span>
          </div>
        </div>
      </section>

      {/* ── AGE FILTER CHIPS ── */}
      <section className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {AGE_FILTERS.map(f => (
              <Link
                key={f.label}
                href={f.min === 0 ? '/arts-crafts' : `/arts-crafts?age_min=${f.min}&age_max=${f.max}`}
                className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-brand-purple hover:text-brand-purple transition-colors"
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CRAFT GRID ── */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {crafts.map(craft => (
            <Link
              key={craft.id}
              href={`/arts-crafts/${craft.slug}`}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              {/* Card top — color band based on category */}
              <div className={`h-3 w-full ${
                craft.category === 'nature'   ? 'bg-green-400' :
                craft.category === 'sensory'  ? 'bg-violet-400' :
                craft.category === 'seasonal' ? 'bg-amber-400' :
                'bg-brand-coral'
              }`} />

              <div className="p-6 flex flex-col gap-3 flex-1">
                {/* Category + difficulty */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 font-medium">
                    {CATEGORY_LABELS[craft.category] ?? craft.category}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${DIFFICULTY_COLORS[craft.difficulty]}`}>
                    {craft.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-display text-xl font-bold text-brand-navy leading-snug group-hover:text-brand-purple transition-colors">
                  {craft.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 flex-1">
                  {craft.excerpt}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-50">
                  <span className="flex items-center gap-1">
                    <span>👧</span> {craft.age_range}
                  </span>
                  <span className="flex items-center gap-1">
                    <span>⏱</span> {formatTime(craft.total_time_minutes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span>📦</span> {craft.materials.length} materials
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 bg-brand-navy rounded-3xl p-8 flex flex-col items-center text-center gap-4">
          <p className="font-script text-brand-gold text-2xl">stay in the loop</p>
          <h2 className="font-display text-2xl font-bold text-white">
            Get new craft ideas straight to your inbox
          </h2>
          <p className="text-gray-400 text-sm max-w-xs">
            We add new craft projects every week — plus local family events across Orange County.
          </p>
          <form
            action="/api/subscribe"
            method="POST"
            className="w-full max-w-sm flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@email.com"
              className="flex-1 rounded-2xl px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-brand-gold"
            />
            <button type="submit" className="btn-coral px-5 py-3 whitespace-nowrap">
              Subscribe free
            </button>
          </form>
          <p className="text-gray-600 text-xs">Unsubscribe any time.</p>
        </div>
      </section>

    </div>
  )
}
