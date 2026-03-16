import { MetadataRoute } from 'next'
import { FARMERS_MARKETS } from '@/lib/farmers-markets'
import { createServiceClient } from '@/lib/supabase/server'

const BASE_URL = 'https://whatwedonowmama.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static public pages ───────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                                       priority: 1.0,  changeFrequency: 'daily'   },
    { url: `${BASE_URL}/events`,                           priority: 0.9,  changeFrequency: 'daily'   },
    { url: `${BASE_URL}/orange-county-farmers-market`,     priority: 0.9,  changeFrequency: 'weekly'  },
    { url: `${BASE_URL}/resources`,                        priority: 0.8,  changeFrequency: 'weekly'  },
    { url: `${BASE_URL}/about`,                            priority: 0.6,  changeFrequency: 'monthly' },
    { url: `${BASE_URL}/signup`,                           priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${BASE_URL}/login`,                            priority: 0.4,  changeFrequency: 'monthly' },
    { url: `${BASE_URL}/privacy`,                          priority: 0.3,  changeFrequency: 'yearly'  },
    { url: `${BASE_URL}/terms`,                            priority: 0.3,  changeFrequency: 'yearly'  },
  ]

  // ── Farmers market pages (34 static pages) ───────────────────────────────
  const farmersMarketPages: MetadataRoute.Sitemap = FARMERS_MARKETS.map(market => ({
    url: `${BASE_URL}/orange-county-farmers-market/${market.slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }))

  // ── Dynamic event pages from DB ───────────────────────────────────────────
  let eventPages: MetadataRoute.Sitemap = []
  try {
    const supabase = createServiceClient()
    const { data: events } = await supabase
      .from('events')
      .select('slug, created_at')
      .order('event_date', { ascending: false })
      .limit(500)

    if (events) {
      eventPages = events
        .filter(e => e.slug)
        .map(e => ({
          url: `${BASE_URL}/events/${e.slug}`,
          lastModified: new Date(e.created_at),
          priority: 0.7,
          changeFrequency: 'weekly' as const,
        }))
    }
  } catch {
    // DB unavailable at build time — skip dynamic event pages
  }

  // ── Dynamic resource pages from DB ───────────────────────────────────────
  let resourcePages: MetadataRoute.Sitemap = []
  try {
    const supabase = createServiceClient()
    const { data: resources } = await supabase
      .from('resources')
      .select('slug, updated_at')
      .eq('status', 'published')
      .limit(200)

    if (resources) {
      resourcePages = resources
        .filter(r => r.slug)
        .map(r => ({
          url: `${BASE_URL}/resources/${r.slug}`,
          lastModified: r.updated_at ? new Date(r.updated_at) : undefined,
          priority: 0.7,
          changeFrequency: 'monthly' as const,
        }))
    }
  } catch {
    // DB unavailable at build time — skip dynamic resource pages
  }

  return [...staticPages, ...farmersMarketPages, ...eventPages, ...resourcePages]
}
