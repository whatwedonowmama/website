import Link from 'next/link'
import type { Resource } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  sleep:       'Sleep',
  feeding:     'Feeding',
  development: 'Development',
  activities:  'Activities',
  milestones:  'Milestones',
  'oc-guides': 'OC Guides',
}

type Props = {
  resource: Resource
  locked?: boolean  // true when free user sees a Plus resource
}

export default function ResourceCard({ resource, locked = false }: Props) {
  return (
    <Link
      href={locked ? '/signup?plan=plus' : `/resources/${resource.slug}`}
      className="card flex flex-col gap-3 hover:shadow-md transition-shadow group"
    >
      {/* Category + access badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="section-label">
          {CATEGORY_LABELS[resource.category] ?? resource.category}
        </span>
        {locked
          ? <span className="badge-plus">⭐ Plus</span>
          : resource.access_level === 'plus'
            ? <span className="badge-plus">⭐ Plus</span>
            : <span className="badge-free">Free</span>
        }
      </div>

      {/* Title */}
      <h3 className={`font-display font-bold text-lg leading-snug group-hover:text-brand-purple transition-colors ${locked ? 'text-gray-400' : 'text-brand-navy'}`}>
        {resource.title}
      </h3>

      {/* Excerpt */}
      {resource.excerpt && (
        <p className={`text-sm leading-relaxed line-clamp-3 ${locked ? 'text-gray-300' : 'text-gray-600'}`}>
          {locked ? resource.excerpt.slice(0, 120) + '...' : resource.excerpt}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-gray-400">{resource.read_time_minutes} min read</span>
        {locked
          ? <span className="text-xs font-semibold text-brand-coral">Unlock with Plus →</span>
          : <span className="text-xs font-semibold text-brand-purple">Read →</span>
        }
      </div>

      {/* Locked overlay hint */}
      {locked && (
        <div className="rounded-xl bg-brand-lavender/60 border border-brand-purple/20 px-3 py-2 text-xs text-brand-purple font-medium text-center">
          🔒 Plus members only · $7/mo · 7-day free trial
        </div>
      )}
    </Link>
  )
}
