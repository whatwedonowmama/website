-- ============================================================
-- Migration 005: per-source scrape stats + seed built-in sources
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Add last_events_count column ─────────────────────────
-- Tracks how many real events were found the last time this source was scraped.
-- Lets you quickly see which sources are productive vs. dead.

ALTER TABLE scrape_sources
  ADD COLUMN IF NOT EXISTS last_events_count integer DEFAULT NULL;


-- ── 2. Seed the built-in sources as regular DB rows ─────────
-- Moving them out of the hardcoded frontend so they can be
-- paused, resumed, and tracked like any custom source.
-- Use INSERT ... ON CONFLICT DO NOTHING so re-running this is safe.

INSERT INTO scrape_sources (name, url, frequency, enabled, tags, notes)
VALUES
  (
    'Meetup OC Families',
    'https://www.meetup.com/find/?keywords=family+kids&location=Orange+County%2C+CA&source=EVENTS',
    'weekly',
    true,
    ARRAY['family', 'kids', 'outdoor'],
    'OC family meetup groups — good volume, usually 10+ events per run.'
  ),
  (
    'OC Parks & Recreation',
    'https://www.ocparks.com/events',
    'monthly',
    true,
    ARRAY['outdoor', 'parks', 'family'],
    'OC Parks seasonal & special events. Run monthly — content changes slowly.'
  )
ON CONFLICT DO NOTHING;
