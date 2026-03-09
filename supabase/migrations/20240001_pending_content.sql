-- ─────────────────────────────────────────────────────────────
-- pending_content
-- Holds scraped events and resources waiting for admin review.
-- Scraper writes here; admin UI reads, approves, or rejects.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pending_content (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type     text        NOT NULL CHECK (content_type IN ('event', 'resource')),
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'approved', 'rejected')),

  -- ── Shared ────────────────────────────────────────────────
  title            text        NOT NULL,
  description      text,
  source_url       text,
  source_name      text,       -- e.g. 'Eventbrite', 'OC Parks'

  -- ── Event-specific ────────────────────────────────────────
  event_date       text,       -- ISO date string: '2025-03-15'
  event_time       text,       -- e.g. '10:00 AM – 2:00 PM'
  location_name    text,
  city             text,
  price            text,
  is_free          boolean     DEFAULT false,

  -- ── Resource-specific ─────────────────────────────────────
  category         text,       -- sleep, feeding, development, activities, milestones, oc-guides
  tags             text[],

  -- ── Meta ──────────────────────────────────────────────────
  scraped_at       timestamptz DEFAULT now(),
  reviewed_at      timestamptz,
  reviewed_by      uuid        REFERENCES auth.users(id),
  notes            text,       -- admin can leave a note when rejecting
  created_at       timestamptz DEFAULT now()
);

-- Index for the most common query: all pending items, newest first
CREATE INDEX IF NOT EXISTS idx_pending_content_status
  ON pending_content (status, created_at DESC);

-- RLS: only admins can read/write
ALTER TABLE pending_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to pending_content"
  ON pending_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
