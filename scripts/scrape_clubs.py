#!/usr/bin/env python3
"""Scrape all clubs from TartanConnect and save to data/clubs.json."""

import json
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_FILE = Path(__file__).parent.parent / "data" / "clubs.json"
URL = "https://tartanconnect.cmu.edu/club_signup?view=all"


def slugify(name: str) -> str:
    name = re.sub(r'[^a-z0-9]+', '-', name.lower().strip('" '))
    return name.strip('-')[:60]


def parse_clubs(html_items) -> list[dict]:
    clubs = []
    seen_ids = {}

    for item in html_items:
        # Name
        name_el = item.query_selector("h2.media-heading a")
        if not name_el:
            continue
        name = name_el.inner_text().strip().replace('\x22', '').replace('“', '').replace('”', '').strip()
        if not name:
            continue

        # Website: prefer the explicit "Website" link, fall back to media-left href
        website = None
        website_el = item.query_selector("a[aria-label='Website']")
        if website_el:
            website = website_el.get_attribute("href") or None
        if not website:
            media_left_el = item.query_selector(".media-left a")
            if media_left_el:
                href = media_left_el.get_attribute("href") or ""
                if href.startswith("http"):
                    website = href

        # TartanConnect join URL
        join_el = item.query_selector("a.btn-cg--group")
        tartan_url = join_el.get_attribute("href") if join_el else None

        # Category line: "Org Type - Tag1, Tag2, Tag3"
        category = ""
        tags: list[str] = []
        cat_el = item.query_selector("p.grey-element")
        if cat_el:
            raw = cat_el.inner_text().strip()
            if " - " in raw:
                parts = raw.split(" - ", 1)
                category = parts[0].strip()
                tags = [t.strip() for t in parts[1].split(",") if t.strip()]
            else:
                category = raw

        # Mission / description (hidden p with id="club_<id>")
        description = ""
        mission_el = item.query_selector("p[id^='club_']:not([id*='whatwedo'])")
        if mission_el:
            full = mission_el.inner_text().strip()
            # Strip leading "Mission\n" label if present
            if full.lower().startswith("mission"):
                full = full[len("mission"):].strip()
            description = full

        # Unique slug id
        base_slug = slugify(name)
        if base_slug in seen_ids:
            seen_ids[base_slug] += 1
            slug = f"{base_slug}-{seen_ids[base_slug]}"
        else:
            seen_ids[base_slug] = 0
            slug = base_slug

        club: dict = {
            "id": slug,
            "name": name,
            "category": category,
            "tags": tags,
            "description": description,
        }
        if website:
            club["website"] = website
        if tartan_url:
            club["tartanUrl"] = tartan_url

        clubs.append(club)

    return clubs


def main():
    print(f"Loading {URL} ...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(5000)

        items = page.query_selector_all(".list-group-item")
        print(f"Found {len(items)} list items (including header)")

        # Skip the first item — it's the column header row
        club_items = items[1:]
        clubs = parse_clubs(club_items)

        browser.close()

    print(f"Parsed {len(clubs)} clubs")
    OUT_FILE.write_text(json.dumps(clubs, indent=2, ensure_ascii=False))
    print(f"Saved to {OUT_FILE}")


if __name__ == "__main__":
    main()
