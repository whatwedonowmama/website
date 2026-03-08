import Link from 'next/link'
import type { Resource } from '@/lib/types'
import type { SeedResource } from '@/lib/seed-resources'

const CATEGORY_LABELS: Record<string, string> = {
  sleep:       'Sleep',
  feeding:     'Feeding',
  development: 'Development',
  activities:  'Activities',
  milestones:  'Milestones',
  'oc-guides': 'OC Guides',
}

const CATEGORY_EMOJI: Record<string, string> = {
  sleep:       '🌙',
  feeding:     '🥑',
  development: '🌱',
  activities:  '🏃',
  milestones:  '⭐',
  'oc-guides': '📍',
}

const CATEGORY_BG: Record<string, string> = {
  sleep:       'bg-indigo-50',
  feeding:     'bg-green-50',
  development: 'bg-yellow-50',
  activities:  'bg-orange-50',
  milestones:  'bg-brand-lavender/50',
  'oc-guides': 'bg-coral-50',
}

type Props = {
  resource: Resource | SeedResource
  locked?: boolean
}

export default function ResourceCard({ resource, locked = false }: Props) {
  const emoji = CATEGORY_EMOJI[resource.category] ?? '📖'
  const categoryBg = CATEGORY_BG[resource.category] ?? 'bg-gray-50'

  return (
    <Link
      href={locked ? '/signup?plan=plus' : `/resources/${resource.slug}`}
      className="group flex flex-col rounded-3xl bg-white border border-gray-100 hover:border-brand-purple/30 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Color accent bar at top */}
      <div className={`${categoryBg} px-5 pt-5 pb-4 flex items-start justify-between gap-3`}>
        <span className="text-3xl">{emoji}</span>
        <div className="flex items-center gap-2">
          {locked
            ? <span className="badge-plus">✦ Plus</span>
            : resource.access_level === 'plus'
              ? <span className="badge-plus">✦ Plus</span>
              : <span className="badge-free">Free</span>
          }
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Category label */}
        <p className="section-label">
          {CATEGORY_LABELS[resource.category] ?? resource.category}
        </p>

        {/* Title */}
        <h3 className={`font-display font-bold text-lg leading-snug group-hover:text-brand-purple transition-colors ${locked ? 'text-gray-400' : 'text-brand-navy'}`}>
          {resource.title}
        </h3>

        {/* Excerpt */}
        {resource.excerpt && (
          <p className={`text-sm leading-relaxed line-clamp-3 ${locked ? 'text-gray-300' : 'text-gray-600'}`}>
            {locked ? resource.excerpt.slice(0, 120) + '…' : resource.excerpt}
          </p>
        )}

        {/* Tags */}
        {'tags' in resource && resource.tags && resource.tags.length > 0 && !locked && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {(resource.tags as string[]).slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">{resource.read_time_minutes} min read</span>
          {locked
            ? <span className="text-xs font-semibold text-brand-coral">Unlock with Plus →</span>
            : <span className="text-xs font-semibold text-brand-purple group-hover:underline">Read article →</span>
          }
        </div>

        {/* Locked hint */}
        {locked && (
          <div className="rounded-2xl bg-brand-lavender/60 border border-brand-purple/20 px-3 py-2 text-xs text-brand-purple font-medium text-center">
            🔒 Plus members only · $7/mo · 7-day free trial
          </div>
        )}
      </div>
    </Link>
  )
}
