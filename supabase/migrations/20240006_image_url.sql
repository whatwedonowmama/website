-- Add image_url column to pending_content and events tables
-- Stores an absolute URL to a representative photo for the event (may be null)

ALTER TABLE pending_content
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS image_url TEXT;
