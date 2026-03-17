import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SEED_CRAFTS, getSeedCraft, formatTime } from '@/lib/seed-crafts'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return SEED_CRAFTS.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const craft = getSeedCraft(slug)
  if (!craft) return {}
  return {
    title: craft.meta_title ?? craft.title,
    description: craft.meta_description ?? craft.excerpt,
    openGraph: {
      title: craft.meta_title ?? craft.title,
      description: craft.meta_description ?? craft.excerpt,
      url: `https://whatwedonowmama.com/arts-crafts/${craft.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: craft.meta_title ?? craft.title,
      description: craft.meta_description ?? craft.excerpt ?? undefined,
    },
  }
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
}

const CATEGORY_LABELS: Record<string, string> = {
  household: '🏠 Household',
  nature:    '🌿 Nature',
  seasonal:  '🍂 Seasonal',
  sensory:   '✋ Sensory',
}

export default async function CraftPage({ params }: Props) {
  const { slug } = await params
  const craft = getSeedCraft(slug)
  if (!craft) notFound()

  // ── HowTo JSON-LD schema ──────────────────────────────────────────
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: craft.title,
    description: craft.excerpt,
    totalTime: `PT${craft.total_time_minutes}M`,
    prepTime: `PT${craft.prep_time_minutes}M`,
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    tool: craft.materials.map(m => ({
      '@type': 'HowToTool',
      name: m,
    })),
    step: craft.instructions.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: `Step ${i + 1}`,
      text: step,
    })),
    url: `https://whatwedonowmama.com/arts-crafts/${craft.slug}`,
  }

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* ── ARTICLE HEADER ── */}
      <section className="bg-white border-b border-gray-100 px-4 py-10">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/arts-crafts" className="hover:text-brand-purple transition-colors">
              Arts &amp; Crafts
            </Link>
            <span>/</span>
            <span className="capitalize text-gray-500">{CATEGORY_LABELS[craft.category] ?? craft.category}</span>
          </nav>

          {/* Category + difficulty badges */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="text-2xl">🎨</span>
            <span className="section-label capitalize">{CATEGORY_LABELS[craft.category]}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${DIFFICULTY_STYLES[craft.difficulty]}`}>
              {craft.difficulty}
            </span>
            <span className="badge-free">Free</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy leading-tight mb-4">
            {craft.title}
          </h1>

          {/* Excerpt */}
          <p className="text-gray-600 text-lg leading-relaxed mb-6 max-w-2xl">
            {craft.excerpt}
          </p>

          {/* Tags */}
          {craft.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {craft.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs bg-brand-lavender/60 text-brand-purple font-medium rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick-stats strip */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">👧</span>
              <div>
                <p className="text-xs text-gray-400 leading-none">Age range</p>
                <p className="text-sm font-semibold text-brand-navy">{craft.age_range}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⏱</span>
              <div>
                <p className="text-xs text-gray-400 leading-none">Total time</p>
                <p className="text-sm font-semibold text-brand-navy">{formatTime(craft.total_time_minutes)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔧</span>
              <div>
                <p className="text-xs text-gray-400 leading-none">Prep time</p>
                <p className="text-sm font-semibold text-brand-navy">{formatTime(craft.prep_time_minutes)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📦</span>
              <div>
                <p className="text-xs text-gray-400 leading-none">Materials</p>
                <p className="text-sm font-semibold text-brand-navy">{craft.materials.length} items</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── RECIPE BODY ── */}
      <section className="px-4 py-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          {/* ── MATERIALS (like ingredients) ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-brand-lavender flex items-center justify-center text-lg">
                📦
              </div>
              <h2 className="font-display text-xl font-bold text-brand-navy">
                What you&apos;ll need
              </h2>
            </div>
            <ul className="flex flex-col gap-2.5">
              {craft.materials.map((material, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-lavender/60 text-brand-purple text-xs flex items-center justify-center font-semibold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{material}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── INSTRUCTIONS (like steps) ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-brand-coral/15 flex items-center justify-center text-lg">
                📋
              </div>
              <h2 className="font-display text-xl font-bold text-brand-navy">
                Instructions
              </h2>
            </div>
            <ol className="flex flex-col gap-6">
              {craft.instructions.map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-coral text-white text-sm font-bold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed pt-0.5 flex-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* ── TIPS ── */}
          {craft.tips && (
            <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💡</span>
                <h2 className="font-display text-lg font-bold text-brand-navy">Tips &amp; variations</h2>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{craft.tips}</p>
            </div>
          )}

        </div>
      </section>

      {/* ── MORE CRAFTS ── */}
      <section className="px-4 pb-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-brand-gold text-lg select-none">✦ ✦ ✦</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <h2 className="font-display text-xl font-bold text-brand-navy mb-4">More crafts to try</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SEED_CRAFTS.filter(c => c.slug !== craft.slug).slice(0, 4).map(related => (
              <Link
                key={related.id}
                href={`/arts-crafts/${related.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{CATEGORY_LABELS[related.category]}</span>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400">{related.age_range}</span>
                </div>
                <p className="font-semibold text-brand-navy text-sm group-hover:text-brand-purple transition-colors leading-snug">
                  {related.title}
                </p>
                <p className="text-xs text-gray-500">{formatTime(related.total_time_minutes)} · {related.materials.length} materials</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMAIL SUBSCRIBE ── */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-brand-navy rounded-3xl p-8 flex flex-col items-center text-center gap-4">
            <p className="font-script text-brand-gold text-2xl">stay in the loop</p>
            <h2 className="font-display text-2xl font-bold text-white">
              New crafts &amp; OC family events every week
            </h2>
            <p className="text-gray-400 text-sm max-w-xs">
              We publish new craft ideas and hand-pick the best family events in Orange County every week. Free, no spam.
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

          <div className="mt-8 flex items-center justify-between">
            <Link href="/arts-crafts" className="text-sm font-semibold text-brand-purple hover:underline">
              ← All crafts
            </Link>
            <Link href="/events" className="text-sm font-semibold text-brand-purple hover:underline">
              This week in OC →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
