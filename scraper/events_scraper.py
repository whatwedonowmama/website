#!/usr/bin/env python3
"""
whatwedonowmama Events Scraping Pipeline — Config-Driven Edition
================================================================

Reads all sources from sites.yaml. Add new sites there — no Python required.
Tracks last-run times in scraper_state.json so weekly sites only run weekly
and monthly sites only run monthly.

USAGE:
    python events_scraper.py                       Normal run — respects schedule
    python events_scraper.py --force               Scrape ALL sites right now
    python events_scraper.py --list                Show all sites + last run dates
    python events_scraper.py --site "OC Parks"     Scrape one specific site only
    python events_scraper.py --dry-run             Show what WOULD run, don't scrape

SCHEDULING (PythonAnywhere cron — runs every Monday at 9am):
    0 9 * * 1 /usr/bin/python3 /path/to/events_scraper.py

DEPENDENCIES:
    pip install requests beautifulsoup4 pyyaml anthropic

OUTPUT FILES:
    oc_events_output.json   — All events from this run
    oc_events_summary.json  — Stats and per-source status
    scraper_state.json      — Auto-managed: tracks last run per site (don't edit)
"""

import json
import logging
import hashlib
import time
import random
import re
import sys
import os
import argparse
from datetime import datetime, timedelta
from typing import Optional
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml not installed. Run: pip install pyyaml")
    sys.exit(1)

# ============================================================================
# GLOBAL SETTINGS
# ============================================================================

SITES_FILE      = "sites.yaml"        # Edit this to add/remove sources
STATE_FILE      = "scraper_state.json" # Auto-managed — don't edit by hand
OUTPUT_DIR      = "output"             # Folder where dated history files are saved
LATEST_FILE     = "oc_events_latest.json"   # Always the most recent run (for automations)
SUMMARY_FILE    = "oc_events_summary.json"
REQUEST_DELAY   = 1.5   # Seconds between HTTP requests (be polite!)
REQUEST_TIMEOUT = 10    # Seconds before giving up on a request
LOG_LEVEL       = "INFO"

# Frequency thresholds (in days)
FREQUENCY_DAYS = {
    "weekly":  7,
    "monthly": 30,
    "oneshot": 9999,  # Effectively only runs once
}

# ============================================================================
# LOGGING
# ============================================================================

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ============================================================================
# CONFIG + STATE MANAGEMENT
# ============================================================================

def load_config() -> dict:
    """Load sites.yaml. Exits with helpful message if file is missing."""
    if not os.path.exists(SITES_FILE):
        print(f"\nERROR: {SITES_FILE} not found.")
        print("Make sure sites.yaml is in the same folder as this script.\n")
        sys.exit(1)
    with open(SITES_FILE, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    return config


def load_db_sources() -> list:
    """
    Load additional scrape sources from the Supabase scrape_sources table.
    These are URLs added through the admin UI at /admin/sources.
    Returns an empty list if env vars aren't set or the table is unreachable.
    """
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        return []

    try:
        resp = requests.get(
            f"{url}/rest/v1/scrape_sources",
            headers={
                "apikey":        key,
                "Authorization": f"Bearer {key}",
            },
            params={"select": "*", "enabled": "eq.true"},
            timeout=10,
        )
        if not resp.ok:
            logger.warning(f"Could not load DB sources: {resp.status_code}")
            return []

        rows = resp.json()
        sources = []
        for row in rows:
            sources.append({
                "name":       row.get("name") or row.get("url", "Unknown"),
                "url":        row.get("url"),
                "frequency":  row.get("frequency", "weekly"),
                "enabled":    True,
                "max_events": 15,
                "tags":       row.get("tags") or [],
                "notes":      row.get("notes") or "Added via admin UI",
                "_from_db":   True,
            })
        if sources:
            logger.info(f"Loaded {len(sources)} additional sources from Supabase DB")
        return sources

    except Exception as e:
        logger.warning(f"Error loading DB sources: {e}")
        return []


def load_state() -> dict:
    """Load scraper_state.json (last-run tracker). Returns empty dict if first run."""
    if not os.path.exists(STATE_FILE):
        return {}
    with open(STATE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_state(state: dict) -> None:
    """Save updated last-run times to scraper_state.json."""
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def is_due(site: dict, state: dict) -> tuple[bool, str]:
    """
    Check if a site is due to be scraped based on its frequency.
    Returns (should_scrape: bool, reason: str).
    """
    name = site["name"]
    frequency = site.get("frequency", "weekly")
    threshold = FREQUENCY_DAYS.get(frequency, 7)

    if not site.get("enabled", True):
        return False, "disabled in sites.yaml"

    if name not in state:
        return True, "never scraped before"

    last_run_str = state[name].get("last_run")
    if not last_run_str:
        return True, "no last-run timestamp found"

    last_run = datetime.fromisoformat(last_run_str)
    days_since = (datetime.now() - last_run).days
    days_remaining = threshold - days_since

    if days_since >= threshold:
        return True, f"last run {days_since}d ago (threshold: {threshold}d)"
    else:
        return False, f"ran {days_since}d ago — next run in ~{days_remaining}d"


def update_state(state: dict, site_name: str, event_count: int) -> None:
    """Record a successful scrape in the state file."""
    state[site_name] = {
        "last_run": datetime.now().isoformat(),
        "last_event_count": event_count,
    }


# ============================================================================
# MOCK DATA FALLBACK
# ============================================================================

def generate_mock_events(source_name: str, cities: list, tags: list, count: int = 10) -> list:
    """
    Generate realistic mock events when a site blocks scraping.
    Uses cities from sites.yaml so mock data is always OC-relevant.
    """
    event_templates = [
        ("Toddler Storytime & Sing-Along",      ["toddler-friendly", "indoor", "free"],       "0-3 years"),
        ("Family Yoga in the Park",              ["outdoor", "all-ages", "free"],              "All ages"),
        ("Kids Art Workshop: Spring Paintings",  ["indoor", "school-age"],                     "3-12 years"),
        ("Outdoor Movie Night: Family Classics", ["outdoor", "family", "free"],                "All ages"),
        ("Farmers Market Family Day",            ["outdoor", "educational", "free"],           "All ages"),
        ("Music & Movement for Toddlers",        ["toddler-friendly", "indoor"],               "0-3 years"),
        ("Kids Cooking Class: Pizza Making",     ["educational", "school-age"],                "4-10 years"),
        ("Family Nature Walk & Bird Watching",   ["outdoor", "educational", "free"],           "All ages"),
        ("STEM Workshop: Build Your Own Robot",  ["educational", "school-age", "indoor"],      "6-14 years"),
        ("Baby & Me: Music & Movement",          ["toddler-friendly", "indoor", "free"],       "0-2 years"),
        ("Crystal Cove Tide Pool Family Walk",   ["outdoor", "educational", "free"],           "All ages"),
        ("Irvine Spectrum Family Movie Night",   ["outdoor", "family", "free"],                "All ages"),
        ("OC Farmers Market Family Day",         ["outdoor", "family", "toddler-friendly"],    "All ages"),
        ("Huntington Beach Surf Lessons",        ["outdoor", "school-age"],                    "6-14 years"),
        ("Community Park Picnic & Games",        ["outdoor", "family", "free"],                "All ages"),
    ]
    prices_options = [
        ("Free", 0), ("Free", 0), ("Free", 0),
        ("$5 per child", 5), ("$10 per family", 10),
        ("$15 per person", 15), ("$3-8 per ticket", 5),
    ]

    events = []
    base_date = datetime.now()
    oc_cities = cities if cities else ["Irvine", "Newport Beach", "Huntington Beach"]

    for i in range(count):
        city = random.choice(oc_cities)
        title, categories, age_range = random.choice(event_templates)
        days_ahead = random.randint(1, 60)
        event_date = base_date + timedelta(days=days_ahead)
        hour = random.choice([9, 10, 11, 14, 15, 16, 18])
        start_time = f"{hour}:00 AM" if hour < 12 else f"{hour - 12 or 12}:00 PM"
        price_str, price_num = random.choice(prices_options)
        unique_str = f"{title}-{city}-{event_date.date()}-{source_name}".lower()
        event_id = hashlib.md5(unique_str.encode()).hexdigest()[:12]
        events.append({
            "id": event_id,
            "source": source_name,
            "title": title,
            "description": f"Join us for {title.lower()} in {city}. Perfect for families.",
            "date": event_date.strftime("%Y-%m-%d"),
            "time": start_time,
            "end_time": "TBD",
            "city": city,
            "state": "CA",
            "location_name": f"{city} Community Center",
            "url": f"https://example.com/events/{event_id}",
            "price": price_str,
            "price_numeric": price_num,
            "is_free": price_num == 0,
            "categories": list(set(categories + tags)),
            "age_range": age_range,
            "scraped_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "is_mock": True,
        })

    logger.info(f"  Generated {count} mock events for {source_name}")
    return events


# ============================================================================
# GENERIC SITE SCRAPER
# ============================================================================

def ai_scrape_site(site: dict, html_content: str, cities: list, tags: list) -> list:
    """
    Use Claude (claude-haiku) to extract events from unstructured HTML.
    Called automatically when the HTML pattern-matcher finds no events.
    Requires ANTHROPIC_API_KEY environment variable.
    Returns a list of event dicts (same shape as scrape_site output), or [].
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        logger.debug("  AI extraction skipped — ANTHROPIC_API_KEY not set")
        return []

    try:
        import anthropic
    except ImportError:
        logger.warning("  AI extraction skipped — 'anthropic' package not installed (pip install anthropic)")
        return []

    name = site["name"]
    url  = site["url"]

    # Strip HTML down to readable text — remove noise, cap at ~6 000 chars
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "img"]):
            tag.decompose()
        page_text = soup.get_text(separator="\n", strip=True)
        page_text = re.sub(r"\n{3,}", "\n\n", page_text)  # collapse blank lines
        page_text = page_text[:6000]
    except Exception as e:
        logger.warning(f"  AI extraction: could not clean HTML — {e}")
        return []

    prompt = f"""You are a data extraction assistant for a family events newsletter in Orange County, CA.

Carefully read the page text below and extract every distinct upcoming event you can find.

For each event return a JSON object with these fields (use null for missing fields):
  title        — event name (string, required)
  date         — date as YYYY-MM-DD if possible, otherwise the raw date text (string or null)
  time         — start time, e.g. "10:00 AM" (string or null)
  location_name — venue or place name (string or null)
  city         — city in Orange County, CA (string, default "Orange County")
  description  — 1-2 sentence description of the event (string)
  url          — direct link to this event, or the page URL if no specific link (string)
  price        — price text, e.g. "Free", "$10", "Check website" (string)
  is_free      — true if free, false if paid, null if unknown (boolean or null)
  categories   — relevant tags from this list: {json.dumps(tags or ["family", "kids"])} (array)

Return ONLY a valid JSON array.  If you find no events, return [].
Do not include any explanation or markdown — raw JSON only.

Source: {name}
URL: {url}

Page text:
{page_text}"""

    try:
        client   = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model      = "claude-haiku-4-5-20251001",
            max_tokens = 2048,
            messages   = [{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()

        # Extract JSON array (Claude sometimes wraps in ```json ... ```)
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        if not match:
            logger.warning(f"  AI extraction: no JSON array in response for {name}")
            return []

        ai_events = json.loads(match.group())
        if not isinstance(ai_events, list):
            return []

        # Normalise to the same shape as scrape_site output
        results = []
        for i, ev in enumerate(ai_events):
            if not ev.get("title"):
                continue
            event_id = hashlib.md5(f"{ev['title']}-{name}-{ev.get('date','')}".encode()).hexdigest()[:12]
            results.append({
                "id":            event_id,
                "source":        name,
                "title":         ev.get("title", "Untitled"),
                "description":   ev.get("description") or f"{ev.get('title','')} in {ev.get('city', 'OC')}",
                "date":          ev.get("date") or (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                "time":          ev.get("time") or "TBD",
                "end_time":      "TBD",
                "city":          ev.get("city") or "Orange County",
                "state":         "CA",
                "location_name": ev.get("location_name") or "See event page",
                "url":           ev.get("url") or url,
                "price":         ev.get("price") or "Check website",
                "price_numeric": 0 if ev.get("is_free") else None,
                "is_free":       ev.get("is_free"),
                "categories":    ev.get("categories") or tags,
                "age_range":     "All ages",
                "scraped_at":    datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
                "is_mock":       False,
                "ai_extracted":  True,
            })

        logger.info(f"  🤖 AI extracted {len(results)} events from {name}")
        return results

    except json.JSONDecodeError as e:
        logger.warning(f"  AI extraction: JSON parse error for {name} — {e}")
        return []
    except Exception as e:
        logger.warning(f"  AI extraction failed for {name}: {e}")
        return []


def scrape_site(site: dict, cities: list, session: requests.Session) -> list:
    """
    Generic scraper that works for any site in sites.yaml.
    Uses flexible selectors; falls back to AI extraction (if ANTHROPIC_API_KEY
    is set) before falling back to mock data gracefully.
    """
    name        = site["name"]
    url         = site["url"]
    max_events  = site.get("max_events", 20)
    tags        = site.get("tags", [])

    logger.info(f"  Scraping: {name}")
    logger.info(f"  URL: {url}")

    html_content = None   # captured for AI fallback if pattern-matching fails

    try:
        response = session.get(url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        html_content = response.text
        soup = BeautifulSoup(response.content, "html.parser")

        # Try multiple common patterns for event cards
        event_cards = (
            soup.find_all("div",     {"data-testid": "event-card"}) or
            soup.find_all("article", class_=re.compile(r"event", re.I)) or
            soup.find_all("div",     class_=re.compile(r"event.card|eventcard|event-item|event-listing", re.I)) or
            soup.find_all("li",      class_=re.compile(r"event", re.I)) or
            soup.find_all("a",       class_=re.compile(r"event", re.I))
        )

        events = []
        for card in event_cards[:max_events]:
            try:
                # Title
                title_elem = (
                    card.find(["h2", "h3", "h4"], class_=re.compile(r"title|name|heading", re.I)) or
                    card.find(["h2", "h3", "h4"]) or
                    card.find("a")
                )
                title = title_elem.get_text(strip=True) if title_elem else None
                if not title or len(title) < 3:
                    continue

                # URL
                link = card.find("a", href=True)
                event_url = link["href"] if link else ""
                if event_url and not event_url.startswith("http"):
                    event_url = urljoin(url, event_url)

                # Date — scan text for common date patterns
                text = card.get_text()
                date_match = (
                    re.search(r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2}\b", text) or
                    re.search(r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}", text)
                )
                try:
                    if date_match:
                        raw_date = date_match.group()
                        # Try month-name format first
                        for fmt in ["%B %d", "%b %d", "%m/%d/%Y", "%m-%d-%Y"]:
                            try:
                                parsed = datetime.strptime(raw_date + f" {datetime.now().year}" if len(raw_date) < 10 else raw_date, fmt if len(raw_date) < 10 else fmt.replace(" %Y", ""))
                                if parsed < datetime.now():
                                    parsed = parsed.replace(year=datetime.now().year + 1)
                                event_date = parsed
                                break
                            except ValueError:
                                continue
                        else:
                            event_date = datetime.now() + timedelta(days=random.randint(1, 30))
                    else:
                        event_date = datetime.now() + timedelta(days=random.randint(1, 30))
                except Exception:
                    event_date = datetime.now() + timedelta(days=random.randint(1, 30))

                # Time
                time_match = re.search(r"\d{1,2}:\d{2}\s*[AaPp][Mm]", text)
                event_time = time_match.group() if time_match else "TBD"

                # Price
                price_match = re.search(r"Free|FREE|\$[\d.]+", text)
                price_str = price_match.group() if price_match else "Check website"
                is_free = price_str.lower() == "free" if price_match else None
                price_num = 0 if is_free else None

                # City — try to match against known OC cities
                found_city = "Orange County"
                for city in cities:
                    if city.lower() in text.lower():
                        found_city = city
                        break

                event_id = hashlib.md5(f"{title}-{name}-{event_url}".encode()).hexdigest()[:12]

                events.append({
                    "id":            event_id,
                    "source":        name,
                    "title":         title,
                    "description":   f"{name}: {title}",
                    "date":          event_date.strftime("%Y-%m-%d"),
                    "time":          event_time,
                    "end_time":      "TBD",
                    "city":          found_city,
                    "state":         "CA",
                    "location_name": "See event page",
                    "url":           event_url,
                    "price":         price_str,
                    "price_numeric": price_num,
                    "is_free":       is_free,
                    "categories":    tags,
                    "age_range":     "All ages",
                    "scraped_at":    datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "is_mock":       False,
                })
                time.sleep(0.3)

            except Exception as parse_err:
                logger.debug(f"  Parse error on card: {parse_err}")
                continue

        if events:
            logger.info(f"  ✓ Scraped {len(events)} real events from {name}")
            return events
        else:
            raise ValueError("No structured events found — trying AI extraction")

    except Exception as err:
        logger.warning(f"  ✗ Pattern scraping failed for {name}: {err}")

        # ── AI fallback: send page text to Claude if we fetched the HTML ──
        if html_content and os.getenv("ANTHROPIC_API_KEY"):
            logger.info(f"  → Trying AI extraction for {name}...")
            ai_events = ai_scrape_site(site, html_content, cities, tags)
            if ai_events:
                return ai_events
            logger.info(f"  → AI found no events for {name}")

        logger.info(f"  → Falling back to mock data for {name}")
        return generate_mock_events(name, cities, tags, max_events)


# ============================================================================
# PIPELINE
# ============================================================================

def deduplicate(events: list) -> list:
    """Remove duplicates based on title + date + city."""
    seen = set()
    unique = []
    for event in events:
        key = f"{event['title'].lower()}-{event['date']}-{event['city'].lower()}"
        key_hash = hashlib.md5(key.encode()).hexdigest()
        if key_hash not in seen:
            seen.add(key_hash)
            unique.append(event)
    removed = len(events) - len(unique)
    if removed:
        logger.info(f"Deduplication: removed {removed} duplicates → {len(unique)} unique events")
    return unique


def run_pipeline(config: dict, state: dict, sites_to_run: list, force: bool = False) -> tuple[list, dict]:
    """
    Main pipeline. Iterates over sites, scrapes those that are due, returns events + run stats.
    """
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (compatible; whatwedonowmama-events-bot/1.0; +https://whatwedonowmama.com)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    })

    cities = config.get("region", {}).get("cities", [])
    all_events = []
    run_stats = {}

    logger.info("=" * 70)
    logger.info("whatwedonowmama Events Scraper")
    logger.info(f"Run time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 70)

    for site in sites_to_run:
        name = site["name"]
        due, reason = is_due(site, state)

        if force:
            logger.info(f"\n[{name}] FORCED run")
        elif due:
            logger.info(f"\n[{name}] Running — {reason}")
        else:
            logger.info(f"\n[{name}] SKIPPED — {reason}")
            run_stats[name] = {"status": "skipped", "reason": reason, "count": 0}
            continue

        events = scrape_site(site, cities, session)
        run_stats[name] = {
            "status":    "success",
            "count":     len(events),
            "frequency": site.get("frequency", "weekly"),
            "mock":      any(e.get("is_mock") for e in events),
        }
        all_events.extend(events)
        update_state(state, name, len(events))
        save_state(state)  # Save after each site so progress isn't lost
        time.sleep(REQUEST_DELAY)

    # Deduplicate combined results
    all_events = deduplicate(all_events)
    return all_events, run_stats


# ============================================================================
# OUTPUT
# ============================================================================

def save_events_json(events: list) -> str:
    """
    Save events to two places:
      1. output/oc_events_YYYY-MM-DD.json  — dated archive file
      2. oc_events_latest.json             — always the most recent run (for automations)
    Returns the path of the dated file.
    """
    # Create output/ folder if it doesn't exist yet
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Dated archive file
    today = datetime.now().strftime("%Y-%m-%d")
    dated_file = os.path.join(OUTPUT_DIR, f"oc_events_{today}.json")
    with open(dated_file, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved {len(events)} events → {dated_file}")

    # Latest symlink (plain copy for cross-platform compatibility)
    with open(LATEST_FILE, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2, ensure_ascii=False)
    logger.info(f"Updated latest → {LATEST_FILE}")

    return dated_file


def save_summary(events: list, run_stats: dict) -> None:
    free_count    = sum(1 for e in events if e.get("is_free") is True)
    paid_count    = sum(1 for e in events if e.get("is_free") is False)
    mock_count    = sum(1 for e in events if e.get("is_mock"))
    dates         = [e["date"] for e in events if e.get("date")]

    summary = {
        "metadata": {
            "generated_at":  datetime.utcnow().isoformat() + "Z",
            "total_events":  len(events),
            "mock_events":   mock_count,
            "real_events":   len(events) - mock_count,
            "date_range": {
                "earliest": min(dates) if dates else None,
                "latest":   max(dates) if dates else None,
            },
        },
        "pricing": {
            "free":    free_count,
            "paid":    paid_count,
            "unknown": len(events) - free_count - paid_count,
        },
        "by_source": run_stats,
    }
    # Dated summary archive
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    today = datetime.now().strftime("%Y-%m-%d")
    dated_summary = os.path.join(OUTPUT_DIR, f"oc_summary_{today}.json")
    with open(dated_summary, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    # Latest summary (for automations)
    with open(SUMMARY_FILE, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved summary → {dated_summary} + {SUMMARY_FILE}")


def print_run_summary(events: list, run_stats: dict, state: dict, dated_file: str = "") -> None:
    print("\n" + "=" * 70)
    print("SCRAPER RUN SUMMARY")
    print("=" * 70)

    print(f"\n{'SITE':<28} {'STATUS':<12} {'EVENTS':>7}  {'NOTES'}")
    print("-" * 70)
    for name, info in run_stats.items():
        status  = info.get("status", "—")
        count   = info.get("count", 0)
        mock    = " (mock fallback)" if info.get("mock") else ""
        reason  = f"  {info.get('reason', '')}" if status == "skipped" else mock
        icon    = "✓" if status == "success" else ("–" if status == "skipped" else "✗")
        print(f"  {icon} {name:<26} {status:<12} {count:>5}  {reason}")

    print("-" * 70)
    print(f"\nTotal events this run:  {len(events)}")
    free = sum(1 for e in events if e.get("is_free") is True)
    paid = sum(1 for e in events if e.get("is_free") is False)
    print(f"  Free:  {free}   |   Paid: {paid}   |   Unknown: {len(events) - free - paid}")

    mock_total = sum(1 for e in events if e.get("is_mock"))
    if mock_total:
        print(f"\n⚠  {mock_total} events used mock fallback data (site was unreachable)")

    print(f"\nArchived:  {dated_file}")
    print(f"Latest:    {LATEST_FILE}  ← use this in Make.com/automations")
    print(f"Summary:   {SUMMARY_FILE}")
    print("=" * 70 + "\n")


def print_site_list(config: dict, state: dict) -> None:
    """Print a status table of all sites and their schedule."""
    print("\n" + "=" * 70)
    print("CONFIGURED SITES")
    print("=" * 70)
    print(f"\n{'SITE':<28} {'FREQ':<10} {'ENABLED':<10} {'LAST RUN':<22} STATUS")
    print("-" * 70)
    for site in config.get("sources", []):
        name      = site["name"]
        freq      = site.get("frequency", "weekly")
        enabled   = "yes" if site.get("enabled", True) else "NO"
        last_info = state.get(name, {})
        last_run  = last_info.get("last_run", "never")[:16].replace("T", " ") if last_info else "never"
        due, why  = is_due(site, state)
        status    = "▶ DUE NOW" if due else f"waiting ({why})"
        print(f"  {name:<28} {freq:<10} {enabled:<10} {last_run:<22} {status}")
    print("=" * 70)
    print(f"\nTo scrape a specific site: python events_scraper.py --site \"Site Name\"")
    print(f"To force all sites now:    python events_scraper.py --force\n")


# ============================================================================
# MAIN + CLI
# ============================================================================

def parse_args():
    parser = argparse.ArgumentParser(
        description="whatwedonowmama Events Scraper",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python events_scraper.py                     Normal run — respects schedule
  python events_scraper.py --force             Scrape all sites regardless of schedule
  python events_scraper.py --list              Show site schedule status
  python events_scraper.py --site "OC Parks"  Scrape one site only
  python events_scraper.py --dry-run           Show what would run (no scraping)
        """
    )
    parser.add_argument("--force",   action="store_true", help="Scrape all sites now, ignoring schedule")
    parser.add_argument("--list",    action="store_true", help="Show all sites and last run dates")
    parser.add_argument("--dry-run", action="store_true", help="Show what would run without scraping")
    parser.add_argument("--site",    type=str,            help="Scrape only this specific site by name")
    return parser.parse_args()


def main():
    args   = parse_args()
    config = load_config()
    state  = load_state()

    # --list: show site schedule table and exit
    if args.list:
        print_site_list(config, state)
        return 0

    # Merge yaml sources with any sources added via the admin UI
    yaml_sources = config.get("sources", [])
    db_sources   = load_db_sources()

    # Avoid duplicates if a URL was added to both yaml and DB
    yaml_urls = {s["url"] for s in yaml_sources}
    new_db_sources = [s for s in db_sources if s["url"] not in yaml_urls]
    if new_db_sources:
        logger.info(f"Adding {len(new_db_sources)} sources from DB not in sites.yaml")

    all_sources = yaml_sources + new_db_sources

    # --site: filter to just the named site
    if args.site:
        match = [s for s in all_sources if s["name"].lower() == args.site.lower()]
        if not match:
            available = [s["name"] for s in all_sources]
            print(f"\nERROR: Site '{args.site}' not found in sites.yaml or Supabase sources.")
            print(f"Available sites: {', '.join(available)}\n")
            return 1
        sites_to_run = match
        force = True  # --site always forces a run
        logger.info(f"Running single site: {args.site}")
    else:
        sites_to_run = all_sources
        force = args.force

    # --dry-run: show what would run and exit
    if args.dry_run:
        print("\n--- DRY RUN (no scraping will happen) ---")
        print_site_list(config, state)
        print("Sites that would run:")
        for site in sites_to_run:
            due, reason = is_due(site, state)
            if force or due:
                print(f"  ▶ {site['name']}  ({reason})")
            else:
                print(f"  – {site['name']}  SKIP: {reason}")
        return 0

    # Normal run
    events, run_stats = run_pipeline(config, state, sites_to_run, force=force)

    if not events:
        logger.warning("No events collected this run.")
        return 0

    dated_file = save_events_json(events)
    save_summary(events, run_stats)
    print_run_summary(events, run_stats, state, dated_file)

    return 0


if __name__ == "__main__":
    sys.exit(main())
