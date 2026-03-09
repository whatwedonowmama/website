#!/usr/bin/env python3
"""
whatwedonowmama Newsletter Formatter
=====================================
Reads the latest scraped events, formats them into a newsletter,
and posts a DRAFT to Beehiiv + social captions to Buffer.

You review the Beehiiv draft before sending — nothing goes out automatically.

USAGE:
    python newsletter_formatter.py                  Normal run
    python newsletter_formatter.py --preview        Print newsletter to terminal only (no API calls)
    python newsletter_formatter.py --no-buffer      Post to Beehiiv only, skip Buffer
    python newsletter_formatter.py --no-beehiiv     Post to Buffer only, skip Beehiiv
    python newsletter_formatter.py --list-buffer-profiles   Show your Buffer profile IDs

DEPENDENCIES:
    pip install requests pyyaml

WORKFLOW:
    1. Run events_scraper.py  →  generates oc_events_latest.json
    2. Run newsletter_formatter.py  →  creates draft in Beehiiv + schedules social posts
    3. Open Beehiiv dashboard  →  review draft  →  hit Send when happy
"""

import json
import logging
import argparse
import sys
import os
import re
from datetime import datetime, timedelta
from typing import Optional

import requests
import yaml

# ============================================================================
# CONFIG
# ============================================================================

CONFIG_FILE  = "newsletter_config.yaml"
EVENTS_FILE  = "oc_events_latest.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def load_config() -> dict:
    if not os.path.exists(CONFIG_FILE):
        print(f"\nERROR: {CONFIG_FILE} not found.")
        print("Make sure newsletter_config.yaml is in the same folder.\n")
        sys.exit(1)
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_events() -> list:
    if not os.path.exists(EVENTS_FILE):
        print(f"\nERROR: {EVENTS_FILE} not found.")
        print("Run events_scraper.py first to generate event data.\n")
        sys.exit(1)
    with open(EVENTS_FILE, "r", encoding="utf-8") as f:
        events = json.load(f)
    logger.info(f"Loaded {len(events)} events from {EVENTS_FILE}")
    return events


# ============================================================================
# EVENT SELECTION
# ============================================================================

def score_event(event: dict) -> float:
    """
    Score events for newsletter quality. Higher = better pick.
    Prioritizes: real scraped data > mock, free > paid, near-term dates.
    """
    score = 0.0

    # Prefer real data over mock fallback
    if not event.get("is_mock"):
        score += 10

    # Prefer free events
    if event.get("is_free") is True:
        score += 5
    elif event.get("is_free") is False:
        score += 2

    # Prefer events happening soon (within 2 weeks = highest priority)
    try:
        event_date = datetime.strptime(event["date"], "%Y-%m-%d")
        days_away = (event_date - datetime.now()).days
        if 0 <= days_away <= 7:
            score += 8    # This week
        elif 7 < days_away <= 14:
            score += 5    # Next week
        elif 14 < days_away <= 30:
            score += 2    # This month
        elif days_away < 0:
            score -= 20   # Past events — heavily penalize
    except Exception:
        pass

    # Prefer events with actual titles (not generic)
    if len(event.get("title", "")) > 15:
        score += 2

    # Prefer events with real URLs
    if event.get("url") and "example.com" not in event.get("url", ""):
        score += 3

    return score


def select_events(events: list, cfg: dict) -> dict:
    """
    Score and sort all events, then pick the best ones by category.
    Returns a dict with 'free', 'paid', 'weekend', 'social_picks'.
    """
    fmt_cfg = cfg.get("newsletter", {})
    max_free    = fmt_cfg.get("max_free_events", 4)
    max_paid    = fmt_cfg.get("max_paid_events", 2)
    max_weekend = fmt_cfg.get("max_weekend_picks", 3)
    social_n    = cfg.get("buffer", {}).get("posts_per_run", 4)

    # Score all events
    scored = sorted(events, key=score_event, reverse=True)

    # Separate by category
    free_events    = [e for e in scored if e.get("is_free") is True][:max_free]
    paid_events    = [e for e in scored if e.get("is_free") is False][:max_paid]

    # Weekend picks = events on Saturday/Sunday within next 10 days
    weekend_events = []
    for e in scored:
        try:
            d = datetime.strptime(e["date"], "%Y-%m-%d")
            if d.weekday() in (5, 6) and 0 <= (d - datetime.now()).days <= 10:
                weekend_events.append(e)
        except Exception:
            pass
    weekend_events = weekend_events[:max_weekend]

    # Social picks = top events (mix of free + interesting)
    social_picks = scored[:social_n]

    logger.info(
        f"Selected: {len(free_events)} free, {len(paid_events)} paid, "
        f"{len(weekend_events)} weekend, {len(social_picks)} social"
    )
    return {
        "free":    free_events,
        "paid":    paid_events,
        "weekend": weekend_events,
        "social":  social_picks,
    }


# ============================================================================
# NEWSLETTER HTML BUILDER
# ============================================================================

BRAND = {
    "purple":      "#5B3FA6",
    "coral":       "#E8735A",
    "cream":       "#FFF9F5",
    "navy":        "#1A1A2E",
    "mid_purple":  "#7B5EA7",
    "lavender":    "#EDE7F6",
    "gold":        "#F7D06E",
}


def format_date_display(date_str: str) -> str:
    """Convert 2026-03-07 → Saturday, March 7"""
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        return d.strftime("%A, %B %-d")
    except Exception:
        return date_str


def event_card_html(event: dict, show_price: bool = True) -> str:
    """Generate the HTML block for a single event card."""
    title    = event.get("title", "Event")
    date_str = format_date_display(event.get("date", ""))
    time_str = event.get("time", "")
    city     = event.get("city", "Orange County")
    location = event.get("location_name", "See event page")
    price    = event.get("price", "Check website")
    url      = event.get("url", "#")
    is_free  = event.get("is_free")

    price_color = BRAND["coral"] if is_free else BRAND["mid_purple"]
    price_label = "FREE" if is_free is True else price

    time_display = f" · {time_str}" if time_str and time_str != "TBD" else ""
    location_display = location if location != "See event page" else city

    return f"""
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
  <tr>
    <td style="background:#ffffff; border:1.5px solid #E0D7F5; border-radius:12px; padding:20px 24px;">
      <p style="margin:0 0 4px 0; font-size:17px; font-weight:700; color:{BRAND['navy']};">
        <a href="{url}" style="color:{BRAND['navy']}; text-decoration:none;">{title}</a>
      </p>
      <p style="margin:0 0 6px 0; font-size:13px; color:{BRAND['mid_purple']};">
        📅 {date_str}{time_display} &nbsp;·&nbsp; 📍 {location_display}
      </p>
      <p style="margin:0; display:inline-block; font-size:12px; font-weight:700;
                color:{price_color}; background:{BRAND['lavender']};
                padding:3px 10px; border-radius:100px;">
        {price_label}
      </p>
    </td>
  </tr>
</table>
"""


def section_header_html(emoji: str, title: str) -> str:
    return f"""
<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 12px 0;">
  <tr>
    <td style="border-bottom:2px solid {BRAND['lavender']}; padding-bottom:8px;">
      <span style="font-size:16px; font-weight:800; color:{BRAND['purple']}; letter-spacing:-0.3px;">
        {emoji} {title}
      </span>
    </td>
  </tr>
</table>
"""


def build_newsletter_html(selected: dict, cfg: dict, run_date: str) -> str:
    """Build the full newsletter HTML for Beehiiv."""
    nl_cfg   = cfg.get("newsletter", {})
    intro    = nl_cfg.get("intro_template", "Hey OC fam! 👋\n\nHere's your weekly events roundup.").strip()
    outro    = nl_cfg.get("outro_template", "See you out there! 🌞\n\n— The whatwedonowmama team").strip()

    intro_html = "".join(f"<p style='margin:0 0 14px 0; font-size:15px; color:{BRAND['navy']}; line-height:1.7;'>{line}</p>" for line in intro.split("\n") if line.strip())
    outro_html = "".join(f"<p style='margin:0 0 10px 0; font-size:14px; color:{BRAND['mid_purple']}; line-height:1.7;'>{line}</p>" for line in outro.split("\n") if line.strip())

    # Build event sections
    events_html = ""

    if selected["free"]:
        events_html += section_header_html("🆓", "FREE THIS WEEK")
        for e in selected["free"]:
            events_html += event_card_html(e)

    if selected["weekend"]:
        events_html += section_header_html("🏖️", "WEEKEND PICKS")
        for e in selected["weekend"]:
            # Avoid duplicating events already in the free section
            if e not in selected["free"]:
                events_html += event_card_html(e)

    if selected["paid"]:
        events_html += section_header_html("🎟️", "WORTH THE SPLURGE")
        for e in selected["paid"]:
            events_html += event_card_html(e)

    # Count total events
    all_shown = selected["free"] + selected["paid"] + [e for e in selected["weekend"] if e not in selected["free"]]
    total_events = len(all_shown)

    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:{BRAND['cream']}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:20px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:{BRAND['purple']}; padding:28px 32px; border-radius:16px 16px 0 0; text-align:center;">
            <p style="margin:0; font-size:22px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">
              whatwedonowmama
            </p>
            <p style="margin:6px 0 0 0; font-size:13px; color:rgba(255,255,255,0.75);">
              🗓️ Weekly OC Events Digest · {run_date}
            </p>
          </td>
        </tr>

        <!-- INTRO -->
        <tr>
          <td style="background:#ffffff; padding:28px 32px;">
            {intro_html}
            <p style="margin:16px 0 0 0; font-size:13px; color:{BRAND['mid_purple']}; background:{BRAND['lavender']}; padding:10px 16px; border-radius:8px;">
              📌 This week: <strong>{total_events} family-friendly events</strong> across Orange County
            </p>
          </td>
        </tr>

        <!-- EVENTS -->
        <tr>
          <td style="background:#ffffff; padding:0 32px 28px 32px;">
            {events_html}
          </td>
        </tr>

        <!-- DIVIDER -->
        <tr>
          <td style="background:#ffffff; padding:0 32px;">
            <hr style="border:none; border-top:2px dashed {BRAND['lavender']}; margin:0 0 24px 0;">
          </td>
        </tr>

        <!-- OUTRO -->
        <tr>
          <td style="background:#ffffff; padding:0 32px 32px 32px;">
            {outro_html}
          </td>
        </tr>

        <!-- DISCORD CTA -->
        <tr>
          <td style="background:{BRAND['lavender']}; padding:24px 32px; text-align:center;">
            <p style="margin:0 0 12px 0; font-size:14px; font-weight:700; color:{BRAND['purple']};">
              Not in the community yet? Come hang out. 👇
            </p>
            <a href="[DISCORD_INVITE_LINK]"
               style="display:inline-block; background:{BRAND['coral']}; color:#ffffff;
                      font-size:14px; font-weight:700; padding:12px 28px;
                      border-radius:100px; text-decoration:none;">
              Join the Discord — It's Free
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:{BRAND['navy']}; padding:20px 32px; border-radius:0 0 16px 16px; text-align:center;">
            <p style="margin:0; font-size:12px; color:rgba(255,255,255,0.5);">
              whatwedonowmama · Orange County, CA<br>
              <a href="{{{{ unsubscribe_url }}}}" style="color:rgba(255,255,255,0.4);">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
"""
    return html


# ============================================================================
# BEEHIIV API
# ============================================================================

def post_beehiiv_draft(html: str, selected: dict, cfg: dict, run_date: str) -> Optional[str]:
    """
    Create a draft post in Beehiiv. Returns the post URL on success, None on failure.
    Docs: https://developers.beehiiv.com/docs/v2/posts-create
    """
    bh_cfg  = cfg.get("beehiiv", {})
    api_key = bh_cfg.get("api_key", "")
    pub_id  = bh_cfg.get("publication_id", "")

    if not api_key or api_key.startswith("YOUR_"):
        logger.warning("Beehiiv API key not set in newsletter_config.yaml — skipping")
        return None
    if not pub_id or pub_id.startswith("pub_YOUR_"):
        logger.warning("Beehiiv publication_id not set in newsletter_config.yaml — skipping")
        return None

    total_events = len(selected["free"]) + len(selected["paid"]) + len(
        [e for e in selected["weekend"] if e not in selected["free"]]
    )

    payload = {
        "status":           bh_cfg.get("post_status", "draft"),
        "platform":         bh_cfg.get("platform", "both"),
        "title":            f"🗓️ This Week in OC: {total_events} Family Events You'll Love",
        "subtitle":         f"Your weekly Orange County family events digest — {run_date}",
        "email_body_html":  html,
        "web_body_html":    html,
        "content_tags":     ["events", "orange-county", "family"],
    }

    url     = f"https://api.beehiiv.com/v2/publications/{pub_id}/posts"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type":  "application/json",
        "Accept":        "application/json",
    }

    try:
        logger.info("Posting draft to Beehiiv...")
        resp = requests.post(url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        data     = resp.json()
        post_id  = data.get("data", {}).get("id", "unknown")
        post_url = f"https://app.beehiiv.com/posts/{post_id}"
        logger.info(f"✓ Beehiiv draft created: {post_url}")
        return post_url
    except requests.HTTPError as e:
        logger.error(f"✗ Beehiiv API error {e.response.status_code}: {e.response.text[:300]}")
        return None
    except Exception as e:
        logger.error(f"✗ Beehiiv request failed: {e}")
        return None


# ============================================================================
# BUFFER API
# ============================================================================

def build_social_caption(event: dict, cfg: dict) -> str:
    """Build a single social media caption for one event."""
    nl_cfg   = cfg.get("newsletter", {})
    template = nl_cfg.get("social_template", "")

    title    = event.get("title", "")
    city     = event.get("city", "Orange County")
    price    = "FREE 🎉" if event.get("is_free") else event.get("price", "Check link")
    url      = event.get("url", "")

    # Format date nicely
    try:
        d = datetime.strptime(event["date"], "%Y-%m-%d")
        date_display = d.strftime("%a %b %-d")
    except Exception:
        date_display = event.get("date", "")

    # Pick a CTA
    is_free = event.get("is_free")
    if is_free:
        cta = "Free for families — link in bio 👆"
    else:
        cta = "Details + tickets in bio 👆"

    if template:
        caption = template.format(
            title=title, date=date_display, city=city,
            price=price, url=url, cta=cta
        )
    else:
        caption = (
            f"🗓️ {title}\n"
            f"📅 {date_display}\n"
            f"📍 {city}, OC\n"
            f"💰 {price}\n\n"
            f"{cta}\n\n"
            "#OrangeCounty #OCfamilies #OCkids #whatwedonowmama #OCevents"
        )
    return caption.strip()


def list_buffer_profiles(cfg: dict) -> None:
    """Print available Buffer profiles — helps user find their profile IDs."""
    token = cfg.get("buffer", {}).get("access_token", "")
    if not token or token.startswith("YOUR_"):
        print("\nBuffer access token not set in newsletter_config.yaml\n")
        return

    try:
        resp = requests.get(
            "https://api.bufferapp.com/1/profiles.json",
            params={"access_token": token},
            timeout=10,
        )
        resp.raise_for_status()
        profiles = resp.json()
        print("\n--- YOUR BUFFER PROFILES ---")
        for p in profiles:
            print(f"  ID: {p['id']}  |  {p.get('service','?').upper()}  |  @{p.get('formatted_username','?')}")
        print("\nCopy the IDs you want into newsletter_config.yaml → buffer.profile_ids\n")
    except Exception as e:
        logger.error(f"Could not fetch Buffer profiles: {e}")


def post_buffer_captions(selected: dict, cfg: dict) -> list[str]:
    """
    Schedule social captions to Buffer. Returns list of created update IDs.
    Docs: https://buffer.com/developers/api/updates
    """
    buf_cfg    = cfg.get("buffer", {})
    token      = buf_cfg.get("access_token", "")
    profile_ids = buf_cfg.get("profile_ids", [])
    days_ahead = buf_cfg.get("post_days_ahead", 1)
    hour       = buf_cfg.get("post_hour", 9)

    if not token or token.startswith("YOUR_"):
        logger.warning("Buffer access token not set — skipping social posts")
        return []
    if not profile_ids or any(pid.startswith("YOUR_") for pid in profile_ids):
        logger.warning("Buffer profile_ids not set — skipping social posts")
        return []

    events       = selected["social"]
    created_ids  = []
    base_time    = datetime.now().replace(hour=hour, minute=0, second=0, microsecond=0)
    base_time   += timedelta(days=days_ahead)

    for i, event in enumerate(events):
        caption      = build_social_caption(event, cfg)
        scheduled_at = base_time + timedelta(hours=i * 2)  # Space posts 2 hours apart

        payload = {
            "text":         caption,
            "profile_ids[]": profile_ids,
            "scheduled_at": scheduled_at.strftime("%Y-%m-%dT%H:%M:%S"),
            "access_token": token,
        }

        try:
            resp = requests.post(
                "https://api.bufferapp.com/1/updates/create.json",
                data=payload,
                timeout=10,
            )
            resp.raise_for_status()
            update_id = resp.json().get("updates", [{}])[0].get("id", "unknown")
            created_ids.append(update_id)
            logger.info(f"  ✓ Buffer post {i+1}/{len(events)} scheduled for {scheduled_at.strftime('%a %b %-d at %-I%p')}")
        except Exception as e:
            logger.error(f"  ✗ Buffer post {i+1} failed: {e}")

    return created_ids


# ============================================================================
# PREVIEW (terminal output — no API calls)
# ============================================================================

def print_preview(selected: dict, cfg: dict, run_date: str) -> None:
    """Print a readable preview of the newsletter to the terminal."""
    nl_cfg = cfg.get("newsletter", {})
    intro  = nl_cfg.get("intro_template", "").strip()
    outro  = nl_cfg.get("outro_template", "").strip()

    print("\n" + "=" * 70)
    print("NEWSLETTER PREVIEW")
    print(f"Run date: {run_date}")
    print("=" * 70)

    print(f"\n{intro}\n")

    if selected["free"]:
        print("🆓 FREE THIS WEEK")
        print("-" * 40)
        for e in selected["free"]:
            date_str = format_date_display(e.get("date", ""))
            print(f"  • {e['title']}")
            print(f"    📅 {date_str}  📍 {e.get('city','OC')}  💰 FREE")
            if e.get("url") and "example.com" not in e.get("url",""):
                print(f"    🔗 {e['url']}")
            print()

    if selected["weekend"]:
        print("🏖️ WEEKEND PICKS")
        print("-" * 40)
        for e in selected["weekend"]:
            if e not in selected["free"]:
                date_str = format_date_display(e.get("date", ""))
                print(f"  • {e['title']}")
                print(f"    📅 {date_str}  📍 {e.get('city','OC')}  💰 {e.get('price','Check site')}")
                print()

    if selected["paid"]:
        print("🎟️ WORTH THE SPLURGE")
        print("-" * 40)
        for e in selected["paid"]:
            date_str = format_date_display(e.get("date", ""))
            print(f"  • {e['title']}")
            print(f"    📅 {date_str}  📍 {e.get('city','OC')}  💰 {e.get('price','Check site')}")
            print()

    print("-" * 40)
    print(f"\n{outro}\n")

    print("📱 SOCIAL CAPTIONS QUEUED FOR BUFFER")
    print("-" * 40)
    for i, e in enumerate(selected["social"], 1):
        caption = build_social_caption(e, cfg)
        print(f"\n--- Post {i} ---")
        print(caption)

    print("\n" + "=" * 70)
    mock_count = sum(
        1 for section in selected.values()
        for e in section if e.get("is_mock")
    )
    if mock_count:
        print(f"⚠  {mock_count} events are mock/fallback data — real scraping may have failed")
    print("=" * 70 + "\n")


# ============================================================================
# MAIN
# ============================================================================

def parse_args():
    parser = argparse.ArgumentParser(
        description="whatwedonowmama Newsletter Formatter",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python newsletter_formatter.py                  Full run — posts to Beehiiv + Buffer
  python newsletter_formatter.py --preview        Print newsletter preview only
  python newsletter_formatter.py --no-buffer      Beehiiv draft only
  python newsletter_formatter.py --no-beehiiv     Buffer posts only
  python newsletter_formatter.py --list-buffer-profiles   Find your Buffer profile IDs
        """
    )
    parser.add_argument("--preview",               action="store_true", help="Print newsletter preview, no API calls")
    parser.add_argument("--no-buffer",             action="store_true", help="Skip Buffer, only post to Beehiiv")
    parser.add_argument("--no-beehiiv",            action="store_true", help="Skip Beehiiv, only post to Buffer")
    parser.add_argument("--list-buffer-profiles",  action="store_true", help="List your Buffer profile IDs")
    return parser.parse_args()


def main():
    args     = parse_args()
    cfg      = load_config()
    run_date = datetime.now().strftime("%B %-d, %Y")  # e.g. March 5, 2026

    # --list-buffer-profiles: helper mode
    if args.list_buffer_profiles:
        list_buffer_profiles(cfg)
        return 0

    events   = load_events()
    selected = select_events(events, cfg)

    total = sum(len(v) for v in selected.values())
    if total == 0:
        logger.error("No events to format. Run events_scraper.py first.")
        return 1

    # --preview: terminal only
    if args.preview:
        print_preview(selected, cfg, run_date)
        return 0

    # Always show a preview first
    print_preview(selected, cfg, run_date)

    # Build newsletter HTML
    html = build_newsletter_html(selected, cfg, run_date)

    results = {"beehiiv": None, "buffer": []}

    # Post to Beehiiv
    if not args.no_beehiiv:
        results["beehiiv"] = post_beehiiv_draft(html, selected, cfg, run_date)

    # Post to Buffer
    if not args.no_buffer:
        results["buffer"] = post_buffer_captions(selected, cfg)

    # Final summary
    print("\n" + "=" * 70)
    print("FORMATTER RUN COMPLETE")
    print("=" * 70)

    if results["beehiiv"]:
        print(f"\n✓ Beehiiv draft ready:  {results['beehiiv']}")
        print("  → Open Beehiiv, review the draft, then hit Send when happy.")
    else:
        print("\n– Beehiiv: skipped or failed (check API key in newsletter_config.yaml)")

    if results["buffer"]:
        print(f"\n✓ Buffer: {len(results['buffer'])} social posts scheduled")
    else:
        print("\n– Buffer: skipped or failed (check access token in newsletter_config.yaml)")

    print("\n" + "=" * 70 + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
