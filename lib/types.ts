export type UserTier = 'free' | 'plus'
export type UserRole = 'member' | 'admin'
export type ResourceCategory = 'sleep' | 'feeding' | 'development' | 'activities' | 'milestones' | 'oc-guides'

export interface User {
  id: string
  email: string
  first_name: string | null
  role: UserRole
  tier: UserTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  subscription_ends_at: string | null
  beehiiv_subscriber_id: string | null
  created_at: string
  last_login_at: string | null
}

export interface Resource {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string | null
  category: ResourceCategory
  access_level: 'free' | 'plus'
  status: 'draft' | 'published'
  featured: boolean
  read_time_minutes: number
  hero_image_url: string | null
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  location_name: string | null
  city: string | null
  price: string
  is_free: boolean
  source_url: string | null
  image_url: string | null
  is_pinned: boolean
  created_at: string
}

export type PendingStatus = 'pending' | 'approved' | 'rejected'
export type ContentType  = 'event' | 'resource'

export interface PendingContent {
  id:            string
  content_type:  ContentType
  status:        PendingStatus
  title:         string
  description:   string | null
  source_url:    string | null
  source_name:   string | null
  event_date:    string | null
  event_time:    string | null
  location_name: string | null
  city:          string | null
  price:         string | null
  is_free:       boolean
  category:      string | null
  tags:          string[] | null
  image_url:     string | null
  scraped_at:    string
  reviewed_at:   string | null
  notes:         string | null
  created_at:    string
}

// Scraped event from oc_events_latest.json
export interface ScrapedEvent {
  title: string
  date?: string
  time?: string
  location?: string
  city?: string
  price?: string
  is_free?: boolean
  url?: string
  source?: string
  description?: string
}
