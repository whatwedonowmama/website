import { formatDate } from '@/lib/utils'
import type { Event, ScrapedEvent } from '@/lib/types'

type Props = {
  event: Event | ScrapedEvent
  past?: boolean
}

function isDbEvent(e: Event | ScrapedEvent): e is Event {
  return 'event_date' in e
}

export default function EventCard({ event, past = false }: Props) {
  const title       = event.title
  const date        = isDbEvent(event) ? event.event_date : event.date
  const time        = isDbEvent(event) ? event.event_time : event.time
  const location    = isDbEvent(event) ? event.location_name : event.location
  const city        = event.city
  const price       = event.price ?? 'Free'
  const isFree      = isDbEvent(event) ? event.is_free : (event.is_free ?? price === 'Free')
  const url         = isDbEvent(event) ? event.source_url : event.url

  return (
    <div className={`card flex flex-col gap-3 ${past ? 'opacity-75' : ''}`}>
      {/* Price badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-bold text-brand-navy text-base leading-snug flex-1">
          {title}
        </h3>
        <span className={isFree ? 'badge-free' : 'badge-paid'}>
          {isFree ? 'Free' : price}
        </span>
      </div>

      {/* Date / time / location */}
      <div className="flex flex-col gap-1 text-sm text-gray-500">
        {date && (
          <span className="flex items-center gap-1.5">
            <span>📅</span>
            {formatDate(date)}{time ? ` · ${time}` : ''}
          </span>
        )}
        {(location || city) && (
          <span className="flex items-center gap-1.5">
            <span>📍</span>
            {[location, city].filter(Boolean).join(', ')}
          </span>
        )}
      </div>

      {/* Past event warning */}
      {past && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
          This event has passed. Link may no longer be active.
        </p>
      )}

      {/* CTA */}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto text-sm font-semibold text-brand-purple hover:underline"
        >
          View event →
        </a>
      )}
    </div>
  )
}
