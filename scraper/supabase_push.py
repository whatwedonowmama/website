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

def supabase_headers() -> dict:
    return {
        "apikey":        SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        "return=minimal",
    }


def fetch_existing_fingerprints() -> set:
    """
    Fetch fingerprints of items already in pending_content (pending or approved)
    so we don't re-insert events that were already scraped this week.
    """
    url = f"{SUPABASE_URL}/rest/v1/{TABLE}?select=notes&status=in.(pending,approved)"
    # We store the dedup fingerprint in the `notes` field as `fingerprint:<hash>`
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/{TABLE}",
        headers=supabase_headers(),
        params={
            "select": "notes",
            "status": "in.(pending,approved)",
        },
        timeout=15,
    )
    if not resp.ok:
        logger.warning(f"Could not fetch existing items: {resp.status_code} — will push all")
        return set()

    rows = resp.json()
    fingerprints = set()
    for row in rows:
        notes = row.get("notes") or ""
        if notes.startswith("fingerprint:"):
            fingerprints.add(notes.split(":", 1)[1])
    return fingerprints


def event_fingerprint(event: dict) -> str:
    """Stable dedup hash: title + date + city."""
    key = f"{event.get('title','').lower().strip()}-{event.get('date','')}-{event.get('city','').lower().strip()}"
    return hashlib.md5(key.encode()).hexdigest()


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
        "category":      None,   # Events don't have resource categories
        "tags":          event.get("categories") or [],
        "scraped_at":    event.get("scraped_at") or datetime.utcnow().isoformat() + "Z",
        "notes":         f"fingerprint:{fp}",  # used for deduplication
    }


def batch_insert(rows: list[dict], dry_run: bool = False) -> tuple[int, int]:
    """
    Insert rows into pending_content in batches of 50.
    Returns (inserted_count, skipped_count).
    """
    if not rows:
        return 0, 0

    inserted = 0
    failed   = 0

    # Insert in batches of 50
    batch_size = 50
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]

        if dry_run:
            for row in batch:
                logger.info(f"  [DRY RUN] Would insert: {row['title']} ({row.get('event_date','?')}) — {row.get('city','?')}")
            inserted += len(batch)
            continue

        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/{TABLE}",
            headers=supabase_headers(),
            json=batch,
            timeout=20,
        )

        if resp.ok:
            inserted += len(batch)
            logger.info(f"  ✓ Inserted batch of {len(batch)} events")
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
            print("Add it to your .env file or GitHub Actions secrets.\n")
            sys.exit(1)
        if not SUPABASE_KEY:
            print("\nERROR: SUPABASE_SERVICE_KEY environment variable not set.")
            print("Use the service_role key from Supabase → Settings → API.\n")
            sys.exit(1)

    # ── Load events ───────────────────────────────────────────
    if not os.path.exists(events_file):
        print(f"\nERROR: {events_file} not found.")
        print("Run events_scraper.py first.\n")
        sys.exit(1)

    with open(events_file, "r", encoding="utf-8") as f:
        events = json.load(f)

    logger.info(f"Loaded {len(events)} events from {events_file}")

    # ── Skip mock events ──────────────────────────────────────
    real_events = [e for e in events if not e.get("is_mock")]
    mock_count  = len(events) - len(real_events)
    if mock_count:
        logger.info(f"Skipping {mock_count} mock/fallback events — only real scraped events will be pushed")

    # ── Deduplication ─────────────────────────────────────────
    if not args.all and not args.dry_run:
        existing = fetch_existing_fingerprints()
        logger.info(f"Found {len(existing)} existing fingerprints in Supabase")
        new_events = [e for e in real_events if event_fingerprint(e) not in existing]
        skipped_dedup = len(real_events) - len(new_events)
        if skipped_dedup:
            logger.info(f"Dedup: skipping {skipped_dedup} already-seen events")
    else:
        new_events = real_events

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
