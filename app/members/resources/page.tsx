import { getUser, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ResourceCard from '@/components/ResourceCard'
import UpgradeCTA from '@/components/UpgradeCTA'
import type { Resource } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Resource Library' }

export default async function MemberResourcesPage() {
  const user = await getUser()
  if (!user) redirect('/login?redirect=/members/resources')

  const isPlus  = user.tier === 'plus'
  const supabase = await createClient()

  const { data } = await supabase
    .from('resources')
    .select('*')
    .eq('status', 'published')
    .order('access_level', { ascending: true }) // free first
    .order('published_at', { ascending: false })

  const resources: Resource[] = data ?? []
  const freeResources = resources.filter(r => r.access_level === 'free')
  const plusResources = resources.filter(r => r.access_level === 'plus')

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <p className="section-label mb-1">Library</p>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Your resource library</h1>
        </div>
        <span className={isPlus ? 'badge-plus' : 'badge-free'}>
          {isPlus ? '⭐ Plus' : 'Free'}
        </span>
      </div>

      {/* Free resources */}
      {freeResources.length > 0 && (
        <section className="mb-10">
          <h2 className="font-semibold text-brand-navy mb-4">Free resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {freeResources.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </section>
      )}

      {/* Plus resources */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold text-brand-navy">Plus resources</h2>
          <span className="badge-plus">⭐ Plus only</span>
        </div>
        {isPlus ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plusResources.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {plusResources.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plusResources.slice(0, 3).map(r => (
                  <ResourceCard key={r.id} resource={r} locked />
                ))}
              </div>
            )}
            <UpgradeCTA variant="banner" context="resource" />
          </div>
        )}
      </section>
    </div>
  )
}
