import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SEED_CRAFTS, formatTime } from '@/lib/seed-crafts'

export const metadata: Metadata = {
  title: 'Arts & Crafts for Kids | whatwedonowmama',
  description: 'Easy arts and crafts for toddlers, preschoolers, and early elementary kids — recipe-style with a materials list and step-by-step instructions. All using household or nature materials.',
  openGraph: {
    title: 'Arts & Crafts for Kids — Materials + Step-by-Step',
    description: 'Recipe-style craft projects for toddlers through elementary kids using stuff you already have at home.',
    url: 'https://whatwedonowmama.com/arts-crafts',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const DIFFICULTY_PILL: Record<string, string> = {
  easy:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
}

const CATEGORY_ICON: Record<string, string> = {
  household: '🏠',
  nature:    '🌿',
  seasonal:  '🍂',
  sensory:   '✋',
}

const featured = SEED_CRAFTS.find(c => c.featured) ?? SEED_CRAFTS[0]
const rest = SEED_CRAFTS.filter(c => c.id !== featured.id)

export default function ArtsCraftsPage() {
  return (
    <div className="bg-[#FDFAF6] min-h-screen">

      {/* ── PAGE HEADER ── */}
      <section className="bg-white border-b border-stone-100 px-4 pt-12 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-coral">
              🎨 Arts &amp; Crafts
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-900 leading-tight">
                Make something<br />
                <span className="italic text-brand-purple">together.</span>
              </h1>
              <p className="text-stone-500 mt-3 text-base leading-relaxed max-w-lg">
                Every project has a materials list and step-by-step directions — like a recipe.
                All made with things you already have at home or can find outside.
              </p>
            </div>
            <div className="flex gap-6 text-sm text-stone-400 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-800">{SEED_CRAFTS.length}</p>
                <p>projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-800">Ages 2–8</p>
                <p>covered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-800">100%</p>
                <p>free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-12">

        {/* ── FEATURED CRAFT ── */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-4">
            ✦ Featured project
          </p>
          <Link
            href={`/arts-crafts/${featured.slug}`}
            className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100"
          >
            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="relative h-64 md:h-auto min-h-[280px] overflow-hidden">
                {featured.hero_image_url ? (
                  <Image
                    src={featured.hero_image_url}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-lavender to-brand-purple/30" />
                )}
                {/* Overlay badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-brand-purple">
                  Featured
                </div>
              </div>
              {/* Content */}
              <div className="p-8 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm">{CATEGORY_ICON[featured.category]}</span>
                  <span className="text-xs text-stone-400 font-medium capitalize">{featured.category}</span>
                  <span className="text-stone-200">·</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${DIFFICULTY_PILL[featured.difficulty]}`}>
                    {featured.difficulty}
                  </span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 leading-snug group-hover:text-brand-purple transition-colors">
                  {featured.title}
                </h2>
                <p className="text-stone-500 text-sm leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-5 text-xs text-stone-400 pt-2 border-t border-stone-100">
                  <span>👧 {featured.age_range}</span>
                  <span>⏱ {formatTime(featured.total_time_minutes)}</span>
                  <span>📦 {featured.materials.length} materials</span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-purple group-hover:gap-2 transition-all">
                  See full instructions →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* ── ALL CRAFTS GRID ── */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-6">
            All projects
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {rest.map(craft => (
              <Link
                key={craft.id}
                href={`/arts-crafts/${craft.slug}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100 flex flex-col"
              >
                {/* Photo */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                  {craft.hero_image_url ? (
                    <Image
                      src={craft.hero_image_url}
                      alt={craft.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className={`w-full h-full ${
                      craft.category === 'nature'   ? 'bg-gradient-to-br from-green-100 to-emerald-200' :
                      craft.category === 'sensory'  ? 'bg-gradient-to-br from-violet-100 to-purple-200' :
                      'bg-gradient-to-br from-orange-100 to-rose-200'
                    }`} />
                  )}
                  {/* Category pill */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium text-stone-600 flex items-center gap-1">
                    <span>{CATEGORY_ICON[craft.category]}</span>
                    <span className="capitalize">{craft.category}</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${DIFFICULTY_PILL[craft.difficulty]}`}>
                      {craft.difficulty}
                    </span>
                    <span className="text-xs text-stone-400">{craft.age_range}</span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-stone-900 leading-snug group-hover:text-brand-purple transition-colors">
                    {craft.title}
                  </h2>
                  <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 flex-1">
                    {craft.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-stone-400 pt-3 border-t border-stone-50">
                    <span>⏱ {formatTime(craft.total_time_minutes)}</span>
                    <span>📦 {craft.materials.length} items</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── NEWSLETTER ── */}
        <div className="relative overflow-hidden rounded-3xl bg-stone-900 p-10 text-center flex flex-col items-center gap-5">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-coral/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-brand-purple/20 blur-3xl" />

          <p className="font-script text-brand-gold text-3xl relative">new crafts every week</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white relative max-w-sm leading-snug">
            Get fresh ideas straight to your inbox
          </h2>
          <p className="text-stone-400 text-sm max-w-xs relative">
            New craft projects plus the best OC family events — every Friday, free.
          </p>
          <form
            action="/api/subscribe"
            method="POST"
            className="relative w-full max-w-sm flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              className="flex-1 rounded-2xl px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-brand-gold"
            />
            <button type="submit" className="btn-coral px-5 py-3 whitespace-nowrap font-semibold">
              Subscribe free
            </button>
          </form>
          <p className="text-stone-600 text-xs relative">No spam. Unsubscribe any time.</p>
        </div>

      </div>
    </div>
  )
}
