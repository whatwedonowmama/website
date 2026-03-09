-- Replace partial unique index with a full unique constraint
-- (PostgREST ON CONFLICT requires a non-partial constraint)
DROP INDEX IF EXISTS events_slug_unique;

ALTER TABLE public.events
  ADD CONSTRAINT events_slug_unique UNIQUE (slug);
