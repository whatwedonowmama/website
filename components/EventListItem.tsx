import Link from 'next/link'
import type { SeedEvent } from '@/lib/seed-events'

const CATEGORY_LABEL: Record<string, string> = {
  outdoor:   'Outdoor',
  museum:    'Museum',
  market:    'Market',
  arts:      'Arts',
  sports:    'Sports',
  community: 'Community',
}

function formatEventDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month:   'short',
      day:     'numeric',
    })
  } catch {
    return dateStr
  }
}

type Props = {
  event: SeedEvent
}

export default function EventListItem({ event }: Props) {
  const formattedDate = formatEventDate(event.date)

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex gap-4 md:gap-6 bg-white rounded-3xl border border-gray-100 hover:border-brand-purple/30 shadow-sm hover:shadow-md transition-all overflow-hidden p-4 md:p-5"
    >
      {/* ── Feature image ── */}
      <div className="flex-shrink-0 w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden">
        <div className={`w-full h-full bg-gradient-to-br ${event.placeholderGradient} flex items-center justify-center`}>
          <span className="text-4xl md:text-5xl select-none">{event.placeholderEmoji}</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">

        {/* Top row: category label + price badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="section-label">{CATEGORY_LABEL[event.category] ?? event.category}</span>
          <span className={event.is_free
            ? 'badge-free'
            : 'inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-gold/20 text-brand-navy'
          }>
            {event.is_free ? 'Free' : event.price}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-brand-navy text-lg leading-snug group-hover:text-brand-purple transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Date · time · location */}
        <div className="flex flex-col gap-0.5 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span>📅</span>
            {formattedDate}
            {event.time && <span className="text-gray-400">· {event.time}</span>}
          </span>
          <span className="flex items-center gap-1.5">
            <span>📍</span>
            {event.location ? `${event.location}, ${event.city}` : event.city}
          </span>
        </div>

        {/* Description — 2-line clamp */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
          {event.description}
        </p>

        {/* CTA */}
        <span className="text-xs font-semibold text-brand-purple mt-auto group-hover:underline">
          See details →
        </span>

      </div>
    </Link>
  )
}
