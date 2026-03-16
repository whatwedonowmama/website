type EventSchemaProps = {
  name: string
  description: string
  startDate: string        // ISO 8601: "2026-03-17T10:30:00"
  endDate?: string
  locationName: string
  locationCity: string
  locationState?: string
  url: string
  image?: string | null
  isFree?: boolean
}

export default function EventSchema({
  name,
  description,
  startDate,
  endDate,
  locationName,
  locationCity,
  locationState = 'CA',
  url,
  image,
  isFree = true,
}: EventSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    startDate,
    ...(endDate && { endDate }),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: locationName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: locationCity,
        addressRegion: locationState,
        addressCountry: 'US',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'whatwedonowmama',
      url: 'https://www.whatwedonowmama.com',
    },
    offers: {
      '@type': 'Offer',
      ...(isFree && { price: '0' }),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url,
    },
    url,
    ...(image && { image }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
