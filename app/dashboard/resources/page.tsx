import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ResourceCard from '@/components/ResourceCard'
import type { Resource } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Resource Library | OC Insider Dashboard' }

const CATEGORY_LABELS: Record<string, string> = {
  sleep:       '😴 Sleep',
  feeding:     '🍼 Feeding',
  development: '🧠 Development',
  activities:  '🎨 Activities',
  milestones:  '🌟 Milestones',
  'oc-guides': '📍 OC Guides',
}

export default async function ResourceLibraryPage() {
  const user = await getUser()
  if (!user) redirect('/login?redirect=/dashboard/resources')

  const isPaid    = user.tier === 'plus' || user.tier === 'oc-insider'
  const isInsider = user.tier === 'oc-insider'

  // Locked — free users see a teaser
  if (!isPaid) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16 flex flex-col items-center gap-5">
          <span className="text-5xl">📚</span>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Full Resource Library</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            OC Insiders and Plus members get access to every guide we publish — including downloadable PDFs and OC-specific content.
          </p>
          <Link href="/join" className="bg-brand-gold text-brand-navy font-bold px-6 py-3 rounded-2xl hover:bg-brand-gold/90 transition-colors">
            Become a Founding Member ✦
          </Link>
          <p className="text-xs text-gray-400">or <Link href="/signup?plan=plus" className="underline text-brand-purple">try Plus for $7/month →</Link></p>
        </div>
      </div>
    )
  }

  // Fetch all published resources for paid members
  const supabase = await createClient()
  const { data } = await supabase
    .from('resources')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const allResources: Resource[] = data ?? []

  // Separate free vs plus resources
  const freeResources = allResources.filter(r => r.access_level === 'free')
  const plusResources = allResources.filter(r => r.access_level === 'plus')

  // Group all resources by category
  const grouped = allResources.reduce<Record<string, Resource[]>>((acc, r) => {
    const cat = r.category ?? 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  const categories = Object.keys(grouped)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {isInsider && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-gold font-semibold text-xs uppercase tracking-wider">OC Insider</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 text-xs">Full Access</span>
          </div>
        )}
        <h1 className="font-display text-2xl font-bold text-brand-navy">Resource Library</h1>
        <p className="text-gray-500 text-sm mt-1">
          Every guide we publish — yours to read, download, and save.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total guides', value: allResources.length },
          { label: 'Free guides', value: freeResources.length },
          { label: 'Members-only', value: plusResources.length },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="font-display text-2xl font-bold text-brand-purple">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Members-only section */}
      {plusResources.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-lg font-bold text-brand-navy">Members-only guides</h2>
            <span className="text-xs bg-brand-gold/20 text-brand-navy font-semibold px-2 py-0.5 rounded-full border border-brand-gold/40">
              ✦ Exclusive
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plusResources.map(r => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>
      )}

      {/* By category */}
      {categories.length > 0 ? (
        <div className="flex flex-col gap-10">
          {categories.map(cat => (
            <section key={cat}>
              <h2 className="font-display text-lg font-bold text-brand-navy mb-4">
                {CATEGORY_LABELS[cat] ?? cat}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[cat].map(r => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <p className="text-2xl mb-2">📚</p>
          <p className="font-medium text-brand-navy">Library growing weekly</p>
          <p className="text-sm mt-1">New guides drop every week. Check back soon — or{' '}
            <Link href="/resources" className="text-brand-purple underline">browse published resources</Link>.
          </p>
        </div>
      )}
    </div>
  )
}
