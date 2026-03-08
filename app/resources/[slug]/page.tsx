import { createClient, getUser } from '@/lib/supabase/server'
import UpgradeCTA from '@/components/UpgradeCTA'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('resources').select('meta_title,meta_description,title,excerpt').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: data.meta_title ?? data.title,
    description: data.meta_description ?? data.excerpt ?? '',
  }
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const user = await getUser()
  const isPlus = user?.tier === 'plus'

  const { data: resource } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!resource) notFound()

  const isLocked = resource.access_level === 'plus' && !isPlus

  return (
    <article className="max-w-2xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/resources" className="hover:text-brand-purple">Resources</Link>
        <span>/</span>
        <span className="capitalize">{resource.category.replace('-', ' ')}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="section-label capitalize">{resource.category.replace('-', ' ')}</span>
          {resource.access_level === 'plus'
            ? <span className="badge-plus">⭐ Plus</span>
            : <span className="badge-free">Free</span>}
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy leading-tight mb-4">
          {resource.title}
        </h1>
        {resource.excerpt && (
          <p className="text-gray-600 text-lg leading-relaxed">{resource.excerpt}</p>
        )}
        <p className="text-sm text-gray-400 mt-3">{resource.read_time_minutes} min read</p>
      </div>

      {/* Body or gate */}
      {!isLocked ? (
        <div
          className="prose prose-lg max-w-none text-brand-navy prose-headings:font-display prose-a:text-brand-purple"
          dangerouslySetInnerHTML={{ __html: resource.body ?? '' }}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Preview (first ~150 words) */}
          <div className="relative">
            <div className="text-gray-600 leading-relaxed">
              {resource.excerpt}
            </div>
            {/* Blur gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-cream to-transparent" />
          </div>
          <UpgradeCTA variant="card" context="resource" />
        </div>
      )}
    </article>
  )
}
