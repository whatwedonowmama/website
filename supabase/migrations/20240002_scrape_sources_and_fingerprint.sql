-- ============================================================
-- Migration 002: scrape_sources table + fingerprint dedup column
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================


-- ── 1. Add fingerprint column to pending_content ─────────────
-- Used for DB-level deduplication. The scraper stores a hash of
-- title+date+city so the same event can never be inserted twice.

ALTER TABLE pending_content
  ADD COLUMN IF NOT EXISTS fingerprint text;

-- Unique constraint so PostgREST ON CONFLICT can ignore duplicates.
-- Multiple NULLs are allowed (PostgreSQL treats each NULL as distinct),
-- so old rows without a fingerprint are unaffected.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pending_content_fingerprint_unique'
  ) THEN
    ALTER TABLE pending_content
      ADD CONSTRAINT pending_content_fingerprint_unique UNIQUE (fingerprint);
  END IF;
END
$$;


-- ── 2. Create scrape_sources table ───────────────────────────
-- Stores websites to scrape. Managed through the admin UI at /admin/sources.
-- The scraper reads this table on each run and merges with sites.yaml.

CREATE TABLE IF NOT EXISTS scrape_sources (
  id           uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text         NOT NULL,
  url          text         NOT NULL,
  frequency    text         NOT NULL DEFAULT 'weekly'
                            CHECK (frequency IN ('weekly', 'monthly', 'oneshot')),
  enabled      boolean      NOT NULL DEFAULT true,
  tags         text[]       DEFAULT '{}',
  notes        text,
  added_by     uuid         REFERENCES auth.users(id),
  last_scraped_at timestamptz,
  created_at   timestamptz  DEFAULT now()
);

ALTER TABLE scrape_sources ENABLE ROW LEVEL SECURITY;

-- Admins can read/write all sources
CREATE POLICY "Admin full access to scrape_sources"
  ON scrape_sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );
