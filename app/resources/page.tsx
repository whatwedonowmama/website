import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import ResourceCard from '@/components/ResourceCard'
import type { Metadata } from 'next'
import type { Resource } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Parenting Resources — OC Parent Guides',
  description: 'Honest parenting guides for Orange County families. Sleep, feeding, milestones, and OC-specific guides. Free and Plus content.',
}

const CATEGORIES = [
  { value: 'all',         label: 'All' },
  { value: 'sleep',       label: 'Sleep' },
  { value: 'feeding',     label: 'Feeding' },
  { value: 'development', label: 'Development' },
  { value: 'activities',  label: 'Activities' },
  { value: 'milestones',  label: 'Milestones' },
  { value: 'oc-guides',   label: 'OC Guides' },
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

  let query = supabase
    .from('resources')
    .select('*')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })

  if (cat && cat !== 'all') {
    query = query.eq('category', cat)
  }

  const { data: resources } = await query
  const allResources: Resource[] = resources ?? []

  const featured = allResources.find(r => r.featured)
  const rest = allResources.filter(r => !r.featured)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="section-label mb-1">Resources</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">
          Parenting guides, honestly written.
        </h1>
        <p className="text-gray-500 mt-2">No fluff. No sponsored content. Just what actually works.</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map(c => (
          <a
            key={c.value}
            href={c.value === 'all' ? '/resources' : `/resources?cat=${c.value}`}
            className={`text-sm font-medium px-4 py-2 rounded-full border transition-colors min-h-[44px] flex items-center ${
              (c.value === 'all' && !cat) || cat === c.value
                ? 'bg-brand-purple text-white border-brand-purple'
                : 'bg-white text-brand-navy border-gray-200 hover:border-brand-purple hover:text-brand-purple'
            }`}
          >
            {c.label}
          </a>
        ))}
      </div>

      {/* Featured article */}
      {featured && (
        <div className="mb-8">
          <p className="section-label mb-3">Featured</p>
          <ResourceCard resource={featured} locked={!isPlus && featured.access_level === 'plus'} />
        </div>
      )}

      {/* Article grid */}
      {rest.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <p className="font-display text-xl text-gray-500 mb-2">Resources coming soon</p>
          <p className="text-sm">We're working on them. Sign up to get notified when they drop.</p>
        </div>
      )}
    </div>
  )
}
