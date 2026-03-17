import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
      images: craft.hero_image_url ? [{ url: craft.hero_image_url }] : [],
    },
    twitter: { card: 'summary_large_image' },
  }
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
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
    image: craft.hero_image_url ?? undefined,
    tool: craft.materials.map(m => ({ '@type': 'HowToTool', name: m })),
    step: craft.instructions.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: `Step ${i + 1}`,
      text: step,
    })),
    url: `https://whatwedonowmama.com/arts-crafts/${craft.slug}`,
  }

  const related = SEED_CRAFTS.filter(c => c.slug !== craft.slug).slice(0, 3)

  return (
    <div className="bg-[#FDFAF6] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* ── HERO PHOTO ── */}
      <div className="relative w-full h-[380px] md:h-[480px] bg-stone-200 overflow-hidden">
        {craft.hero_image_url ? (
          <Image
            src={craft.hero_image_url}
            alt={craft.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-lavender to-brand-purple/40" />
        )}
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-5 left-5">
          <Link
            href="/arts-crafts"
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
          >
            ← Arts &amp; Crafts
          </Link>
        </div>

        {/* Title block over hero */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-16 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              {CATEGORY_ICON[craft.category]} <span className="capitalize">{craft.category}</span>
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${DIFFICULTY_PILL[craft.difficulty]}`}>
              {craft.difficulty}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow-sm">
            {craft.title}
          </h1>
        </div>
      </div>

      {/* ── RECIPE CARD ── */}
      <div className="max-w-3xl mx-auto px-4 -mt-4 relative z-10">

        {/* Quick-stats strip — floats over the hero bottom */}
        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 px-6 py-4 flex flex-wrap gap-x-8 gap-y-3 mb-8">
          {[
            { icon: '👧', label: 'Age range', value: craft.age_range },
            { icon: '⏱', label: 'Total time', value: formatTime(craft.total_time_minutes) },
            { icon: '🔧', label: 'Prep', value: formatTime(craft.prep_time_minutes) },
            { icon: '📦', label: 'Materials', value: `${craft.materials.length} items` },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2.5">
              <span className="text-xl">{stat.icon}</span>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold leading-none">{stat.label}</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Excerpt */}
        <p className="text-stone-600 text-lg leading-relaxed mb-8 font-light">{craft.excerpt}</p>

        {/* Tags */}
        {craft.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {craft.tags.map(tag => (
              <span key={tag} className="text-xs bg-stone-100 text-stone-500 font-medium rounded-full px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── MATERIALS (ingredients) ── */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden mb-6">
          <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">What you&apos;ll need</h2>
              <p className="text-xs text-stone-400">{craft.materials.length} materials</p>
            </div>
          </div>
          <ul className="p-6 grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {craft.materials.map((material, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-stone-700">
                <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-brand-lavender text-brand-purple text-[11px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{material}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── INSTRUCTIONS ── */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden mb-6">
          <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">Instructions</h2>
              <p className="text-xs text-stone-400">{craft.instructions.length} steps</p>
            </div>
          </div>
          <ol className="p-6 flex flex-col gap-0">
            {craft.instructions.map((step, i) => (
              <li key={i} className={`flex gap-5 ${i < craft.instructions.length - 1 ? 'pb-7 relative' : ''}`}>
                {/* Step number + connector line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="w-9 h-9 rounded-full bg-brand-coral text-white text-sm font-bold flex items-center justify-center shadow-sm z-10">
                    {i + 1}
                  </span>
                  {i < craft.instructions.length - 1 && (
                    <div className="w-px flex-1 bg-stone-100 mt-2" />
                  )}
                </div>
                <div className="pt-1.5 pb-2 flex-1">
                  <p className="text-stone-700 text-sm leading-relaxed">{step}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── TIPS ── */}
        {craft.tips && (
          <div className="relative rounded-3xl overflow-hidden mb-10">
            <div className="bg-amber-50 border border-amber-200 p-6 flex gap-4">
              <span className="text-2xl flex-shrink-0">💡</span>
              <div>
                <h3 className="font-display text-lg font-bold text-amber-900 mb-2">Tips &amp; variations</h3>
                <p className="text-amber-800 text-sm leading-relaxed">{craft.tips}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── MORE CRAFTS ── */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-5">
            More to make
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(c => (
              <Link
                key={c.id}
                href={`/arts-crafts/${c.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative h-32 w-full bg-stone-100 overflow-hidden">
                  {c.hero_image_url && (
                    <Image
                      src={c.hero_image_url}
                      alt={c.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-stone-400 mb-1">{c.age_range} · {formatTime(c.total_time_minutes)}</p>
                  <p className="font-semibold text-stone-800 text-sm group-hover:text-brand-purple transition-colors leading-snug">{c.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── NEWSLETTER ── */}
        <div className="relative overflow-hidden rounded-3xl bg-stone-900 p-8 flex flex-col items-center text-center gap-4 mb-10">
          <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-coral/20 blur-3xl" />
          <p className="font-script text-brand-gold text-2xl relative">stay in the loop</p>
          <h2 className="font-display text-xl font-bold text-white relative max-w-xs leading-snug">
            New crafts &amp; OC family events, every Friday
          </h2>
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
