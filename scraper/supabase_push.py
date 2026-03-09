#!/usr/bin/env python3
"""
whatwedonowmama — Supabase Push
================================
Reads oc_events_latest.json (written by events_scraper.py) and inserts
new events into the `pending_content` table in Supabase for admin review.

USAGE:
    python supabase_push.py               Push scraped events to Supabase
    python supabase_push.py --dry-run     Show what would be inserted (no writes)
    python supabase_push.py --file PATH   Use a specific JSON file instead of latest

ENVIRONMENT VARIABLES (set in .env or GitHub Actions secrets):
    SUPABASE_URL          https://YOUR_PROJECT.supabase.co
    SUPABASE_SERVICE_KEY  service_role key (NOT the anon key — needs insert access)

DEPENDENCIES:
    pip install requests python-dotenv
"""

import json
import os
import sys
import re
import argparse
import hashlib
import logging
from datetime import datetime
from typing import Optional

import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # Fine in GitHub Actions — env vars come from secrets

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

EVENTS_FILE     = "oc_events_latest.json"
SUPABASE_URL    = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY    = os.getenv("SUPABASE_SERVICE_KEY", "")
TABLE           = "pending_content"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# SUPABASE HELPERS
# ─────────────────────────────────────────────────────────────

def supabase_headers(prefer: str = "return=minimal") -> dict:
    return {
        "apikey":        SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        prefer,
    }


def fetch_existing_fingerprints() -> set:
    """
    Fetch fingerprints already in pending_content (any status) AND already-approved
    events in the events table so we never re-queue something that's already live.
    """
    fingerprints = set()

    # ── pending_content fingerprints ──────────────────────────
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/{TABLE}",
        headers=supabase_headers(),
        params={"select": "fingerprint", "fingerprint": "not.is.null"},
        timeout=15,
    )
    if resp.ok:
        for row in resp.json():
            fp = row.get("fingerprint")
            if fp:
                fingerprints.add(fp)
        logger.info(f"Loaded {len(fingerprints)} fingerprints from pending_content")
    else:
        logger.warning(f"Could not load pending_content fingerprints: {resp.status_code}")

    # ── events table: already-approved events ─────────────────
    # We fingerprint approved events the same way so we never re-add them.
    try:
        events_resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/events",
            headers=supabase_headers(),
            params={"select": "title,event_date,city"},
            timeout=15,
        )
        if events_resp.ok:
            live_events = events_resp.json()
            for ev in live_events:
                fp = _normalize_fingerprint(
                    ev.get("title", ""),
                    ev.get("event_date", ""),
                    ev.get("city", ""),
                )
                fingerprints.add(fp)
            logger.info(f"Loaded {len(live_events)} fingerprints from live events table")
    except Exception as e:
        logger.warning(f"Could not check live events table: {e}")

    return fingerprints


def _normalize_fingerprint(title: str, date: str, city: str) -> str:
    """
    Normalize and hash event fields for deduplication.
    Strips punctuation, collapses whitespace, and lowercases before hashing
    so minor differences in formatting don't create false duplicates.
    """
    def clean(s: str) -> str:
        s = s.lower().strip()
        s = re.sub(r"[^\w\s]", "", s)   # strip punctuation
        s = re.sub(r"\s+", " ", s)       # collapse whitespace
        return s

    key = f"{clean(title)}-{date}-{clean(city)}"
    return hashlib.md5(key.encode()).hexdigest()


def event_fingerprint(event: dict) -> str:
    """Public interface — compute dedup fingerprint for a scraped event dict."""
    return _normalize_fingerprint(
        event.get("title", ""),
        event.get("date", ""),
        event.get("city", ""),
    )


def map_event_to_row(event: dict) -> dict:
    """Convert a scraped event dict to a pending_content table row."""
    fp = event_fingerprint(event)
    return {
        "content_type":  "event",
        "status":        "pending",
        "title":         event.get("title", "Untitled Event"),
        "description":   event.get("description") or f"{event.get('title','')} in {event.get('city','OC')}",
        "source_url":    event.get("url"),
        "source_name":   event.get("source"),
        "event_date":    event.get("date"),
        "event_time":    event.get("time") if event.get("time") not in (None, "TBD") else None,
        "location_name": event.get("location_name"),
        "city":          event.get("city"),
        "price":         event.get("price"),
        "is_free":       bool(event.get("is_free")) if event.get("is_free") is not None else False,
        "category":      None,
        "tags":          event.get("categories") or [],
        "scraped_at":    event.get("scraped_at") or datetime.utcnow().isoformat() + "Z",
        "fingerprint":   fp,
        "notes":         f"fingerprint:{fp}",  # keep for backward compat
    }


def batch_insert(rows: list[dict], dry_run: bool = False) -> tuple[int, int]:
    """
    Insert rows into pending_content, ignoring rows whose fingerprint already exists.
    Uses PostgREST ON CONFLICT / ignore-duplicates so DB-level dedup catches anything
    the Python pre-check misses.
    Returns (inserted_count, skipped_or_failed_count).
    """
    if not rows:
        return 0, 0

    inserted = 0
    failed   = 0
    batch_size = 50

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]

        if dry_run:
            for row in batch:
                logger.info(f"  [DRY RUN] Would insert: {row['title']} ({row.get('event_date','?')}) — {row.get('city','?')}")
            inserted += len(batch)
            continue

        # Use upsert with ignore-duplicates so DB rejects conflicting fingerprints
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/{TABLE}?on_conflict=fingerprint",
            headers=supabase_headers("resolution=ignore-duplicates,return=minimal"),
            json=batch,
            timeout=20,
        )

        if resp.ok:
            inserted += len(batch)
            logger.info(f"  ✓ Processed batch of {len(batch)} events (duplicates ignored at DB level)")
        else:
            failed += len(batch)
            logger.error(f"  ✗ Batch insert failed: {resp.status_code} — {resp.text[:200]}")

    return inserted, failed


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Push scraped events to Supabase pending_content")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be inserted without writing")
    parser.add_argument("--file",    type=str,            help="Path to events JSON (default: oc_events_latest.json)")
    parser.add_argument("--all",     action="store_true", help="Skip dedup check and push all events (for testing)")
    args = parser.parse_args()

    events_file = args.file or EVENTS_FILE

    # ── Validate env ──────────────────────────────────────────
    if not args.dry_run:
        if not SUPABASE_URL:
            print("\nERROR: SUPABASE_URL environment variable not set.")
            sys.exit(1)
        if not SUPABASE_KEY:
            print("\nERROR: SUPABASE_SERVICE_KEY environment variable not set.")
            sys.exit(1)

    # ── Load events ───────────────────────────────────────────
    if not os.path.exists(events_file):
        print(f"\nERROR: {events_file} not found. Run events_scraper.py first.\n")
        sys.exit(1)

    with open(events_file, "r", encoding="utf-8") as f:
        events = json.load(f)

    logger.info(f"Loaded {len(events)} events from {events_file}")

    # ── Skip mock events ──────────────────────────────────────
    real_events = [e for e in events if not e.get("is_mock")]
    mock_count  = len(events) - len(real_events)
    if mock_count:
        logger.info(f"Skipping {mock_count} mock/fallback events")

    # ── Deduplication ─────────────────────────────────────────
    # Step 1: dedup within this batch (same event from multiple sources)
    seen_in_batch = set()
    unique_in_batch = []
    for e in real_events:
        fp = event_fingerprint(e)
        if fp not in seen_in_batch:
            seen_in_batch.add(fp)
            unique_in_batch.append(e)
    batch_dupes = len(real_events) - len(unique_in_batch)
    if batch_dupes:
        logger.info(f"Dedup: removed {batch_dupes} duplicates within this batch")

    # Step 2: check against Supabase (pending + live events)
    if not args.all and not args.dry_run:
        existing = fetch_existing_fingerprints()
        logger.info(f"Found {len(existing)} existing fingerprints in Supabase")
        new_events = [e for e in unique_in_batch if event_fingerprint(e) not in existing]
        skipped_dedup = len(unique_in_batch) - len(new_events)
        if skipped_dedup:
            logger.info(f"Dedup: skipping {skipped_dedup} already-seen events")
    else:
        new_events = unique_in_batch

    if not new_events:
        logger.info("No new events to push. All already in Supabase. ✓")
        return 0

    # ── Map to rows ───────────────────────────────────────────
    rows = [map_event_to_row(e) for e in new_events]
    logger.info(f"Preparing to insert {len(rows)} new events...")

    # ── Insert ────────────────────────────────────────────────
    inserted, failed = batch_insert(rows, dry_run=args.dry_run)

    # ── Summary ───────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("SUPABASE PUSH SUMMARY")
    print("=" * 60)
    print(f"  Source file:    {events_file}")
    print(f"  Total events:   {len(events)}")
    print(f"  Mock (skipped): {mock_count}")
    print(f"  Batch dupes:    {batch_dupes}")
    print(f"  New to push:    {len(new_events)}")
    if args.dry_run:
        print(f"  [DRY RUN] Would insert: {inserted}")
    else:
        print(f"  Inserted:       {inserted}")
        print(f"  Failed:         {failed}")
    print("=" * 60)
    if not args.dry_run and inserted > 0:
        print(f"\n✓ {inserted} events are now pending review at /admin/review")
    print()

    return 0 if (failed == 0) else 1


if __name__ == "__main__":
    sys.exit(main())
