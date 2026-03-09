-- Add slug column to events table (needed for approve → live pipeline)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS slug text;

-- Make slug unique where present (NULLs are allowed for old rows)
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique
  ON public.events (slug)
  WHERE slug IS NOT NULL;
