import { createClient, getUser } from '@/lib/supabase/server'
import UpgradeCTA from '@/components/UpgradeCTA'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SEED_RESOURCES, getSeedResource, type SeedResource } from '@/lib/seed-resources'
import type { Resource } from '@/lib/types'
import ShareButtons from '@/components/ShareButtons'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return SEED_RESOURCES.map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  // Try Supabase first
  const supabase = await createClient()
  const { data } = await supabase
    .from('resources')
    .select('meta_title,meta_description,title,excerpt')
    .eq('slug', slug)
    .single()

  if (data) {
    return {
      title: data.meta_title ?? data.title,
      description: data.meta_description ?? data.excerpt ?? '',
    }
  }

  // Fall back to seed
  const seed = getSeedResource(slug)
  if (seed) {
    return {
      title: seed.meta_title ?? seed.title,
      description: seed.meta_description ?? seed.excerpt ?? '',
    }
  }

  return {}
}

const CATEGORY_EMOJI: Record<string, string> = {
  sleep:       '🌙',
  feeding:     '🥑',
  development: '🌱',
  activities:  '🏃',
  milestones:  '⭐',
  'oc-guides': '📍',
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const user = await getUser()
  const isPlus = user?.tier === 'plus'

  // Try Supabase
  const { data: dbResource } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  // Fall back to seed data
  const resource: Resource | SeedResource | null = dbResource ?? getSeedResource(slug) ?? null

  if (!resource) notFound()

  const isLocked = resource.access_level === 'plus' && !isPlus
  const tags = ('tags' in resource ? (resource.tags as string[]) : null) ?? []
  const author = ('author' in resource ? resource.author : null) ?? 'whatwedonowmama team'
  const emoji = CATEGORY_EMOJI[resource.category] ?? '📖'
  const categoryLabel = resource.category.replace('-', ' ')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatwedonowmama.com'
  const articleUrl = `${siteUrl}/resources/${slug}`

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* ── ARTICLE HEADER ── */}
      <section className="bg-white border-b border-gray-100 px-4 py-10">
        <div className="max-w-2xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/resources" className="hover:text-brand-purple transition-colors">
              Resources
            </Link>
            <span>/</span>
            <span className="capitalize text-gray-500">{categoryLabel}</span>
          </nav>

          {/* Category emoji + label + badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{emoji}</span>
            <span className="section-label capitalize">{categoryLabel}</span>
            {resource.access_level === 'plus'
              ? <span className="badge-plus">✦ Plus</span>
              : <span className="badge-free">Free</span>}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy leading-tight mb-4">
            {resource.title}
          </h1>

          {/* Description */}
          {resource.excerpt && (
            <p className="text-gray-600 text-lg leading-relaxed mb-5">
              {resource.excerpt}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs bg-brand-lavender/60 text-brand-purple font-medium rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author + read time + share */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                W
              </div>
              <div>
                <p className="text-sm font-medium text-brand-navy">{author}</p>
                <p className="text-xs text-gray-400">{resource.read_time_minutes} min read</p>
              </div>
            </div>
            <ShareButtons url={articleUrl} title={resource.title} />
          </div>

        </div>
      </section>

      {/* ── ARTICLE BODY ── */}
      <section className="px-4 py-10">
        <div className="max-w-2xl mx-auto">
          {!isLocked ? (
            <div
              className="prose prose-lg max-w-none
                text-brand-navy
                prose-headings:font-display prose-headings:text-brand-navy
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:font-bold
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-semibold
                prose-p:leading-relaxed prose-p:text-gray-700 prose-p:mb-5
                prose-li:text-gray-700 prose-li:leading-relaxed
                prose-ul:space-y-2 prose-ul:my-4
                prose-a:text-brand-purple prose-a:no-underline hover:prose-a:underline
                prose-strong:text-brand-navy
                [&_.lead]:text-xl [&_.lead]:text-gray-600 [&_.lead]:leading-relaxed [&_.lead]:mb-8 [&_.lead]:font-normal"
              dangerouslySetInnerHTML={{ __html: resource.body ?? '' }}
            />
          ) : (
            <div className="flex flex-col gap-6">
              <div className="relative">
                <p className="text-gray-600 leading-relaxed text-lg">{resource.excerpt}</p>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-cream to-transparent" />
              </div>
              <UpgradeCTA variant="card" context="resource" />
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM SECTION: share + email subscribe ── */}
      {!isLocked && (
        <section className="px-4 pb-16">
          <div className="max-w-2xl mx-auto">

            {/* Divider with sparkles */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-brand-gold text-lg select-none">✦ ✦ ✦</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Share prompt */}
            <div className="text-center mb-10">
              <p className="font-display text-xl font-bold text-brand-navy mb-1">
                Was this helpful?
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Share it with another parent who might need it.
              </p>
              <ShareButtons url={articleUrl} title={resource.title} large />
            </div>

            {/* Email subscribe box */}
            <div className="bg-brand-navy rounded-3xl p-8 flex flex-col items-center text-center gap-4">
              <p className="font-script text-brand-gold text-2xl">stay in the loop</p>
              <h2 className="font-display text-2xl font-bold text-white">
                Get new guides straight to your inbox
              </h2>
              <p className="text-gray-400 text-sm max-w-xs">
                We publish honest parenting guides for OC families every month. Join free — no spam, ever.
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

            {/* Nav links */}
            <div className="mt-8 flex items-center justify-between">
              <Link href="/resources" className="text-sm font-semibold text-brand-purple hover:underline">
                ← All guides
              </Link>
              <Link href="/events" className="text-sm font-semibold text-brand-purple hover:underline">
                This week in OC →
              </Link>
            </div>

          </div>
        </section>
      )}
    </div>
  )
}
