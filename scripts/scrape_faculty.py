"""
CMU Faculty Scraper
-------------------
Fetches faculty profile pages and uses Claude to extract structured data,
then outputs entries ready to merge into data/faculty.json.

Setup:
    pip install requests beautifulsoup4 anthropic

Usage:
    export ANTHROPIC_API_KEY=your_key_here
    python scripts/scrape_faculty.py

The script reads LISTING_PAGES below, extracts profile links from each,
then calls Claude on each profile page to get structured JSON.
Results are saved to scripts/scraped_faculty.json.
"""

import json
import os
import re
import time

import anthropic
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# ------------------------------------ config ------------------------------------
LISTING_PAGES = [
    # scs
    # {
    #     "url": "https://www.csd.cmu.edu/people/faculty",
    #     "base": "https://www.csd.cmu.edu",
    #     "link_pattern": r"/people/faculty/",
    #     "paginate": True,
    # },
    # {
    #     "url": "https://hcii.cmu.edu/people/faculty",
    #     "base": "https://hcii.cmu.edu",
    #     "link_pattern": r"/people/",
    # },
    # comp bio specific pages from https://www.cmu.edu/cbd/people/index.html:
    # {
    #     "url": "https://www.cmu.edu/cbd/people/affiliated-faculty.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"^[^/]+\.html$",
    # },
    # {
    #     "url": "https://www.cmu.edu/cbd/people/adjunct-faculty.html",
    #     "base": "https://www.cmu.edu",
    #     "scrape_listing": True,
    # },
    # {
    #     "url": "https://www.cmu.edu/cbd/people/special-faculty.html",
    #     "base": "https://www.cmu.edu",
    #     "scrape_listing": True,
    # },
    # { # research staff - have lab links
    #     "url": "https://www.cmu.edu/cbd/people/research-staff.html",
    #     "base": "https://www.cmu.edu",
    #     "scrape_listing": True,
    # },
    # --
    # {
    #     "url": "https://www.ri.cmu.edu/people/faculty/",
    #     "base": "https://www.ri.cmu.edu",
    #     "link_pattern": r"/ri-faculty/",
    # }, 
    # need to find ai faculty
    # ml
    # {
    #     "url": "https://ml.cmu.edu/people/core-faculty",
    #     "json_url": "https://ml.cmu.edu/peopleindexes/core-faculty-index.v1.json",
    #     "school": "Carnegie Mellon University",
    # },
    # cfa
    # {
    #     "url": "https://art.cmu.edu/people/faculty/",
    #     "base": "https://art.cmu.edu",
    #     "link_pattern": r"/people/",
    # }, 
    # {
    #     "url": "https://www.cmu.edu/cfa/music/people/index.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"Bios/",
    # },
    # {
    #     "url": "https://drama.cmu.edu/people/",
    #     "base": "https://drama.cmu.edu",
    #     "link_pattern": r"/person/",
    # },
    # {
    #     "url": "https://design.cmu.edu/faculty", 
    #     "base": "https://design.cmu.edu",
    #     "link_pattern": r"/profiles/",
    # },
    # {
    #     "url": "https://www.architecture.cmu.edu/school/people/faculty",
    #     "base": "https://www.architecture.cmu.edu",
    #     "link_pattern": r"/profiles/",
    # },
    # --
    # {
    #     "url": "https://www.heinz.cmu.edu/faculty-research/profiles/?additional[]=Adjunct+Faculty&additional[]=Affiliated+Faculty",
    #     "base": "https://www.heinz.cmu.edu",
    #     "link_pattern": r"/faculty-research/profiles/[a-z]",
    #     "paginate": True,
    # },
    # {
    #     "url": "https://engineering.cmu.edu/directory/index.html",
    #     "base": "https://engineering.cmu.edu",
    #     "link_pattern": r"bios/",
    # },
    # { 
    #     "url": "https://www.cmu.edu/tepper/faculty-and-research/faculty-profiles",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"/tepper/faculty-and-research/faculty-profiles/",
    # },
    # mcs
    # {
    #     "url": "https://www.cmu.edu/bio/people/faculty/index.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"\.html$",
    # },
    # {
    #     "url": "https://www.cmu.edu/math/people/faculty/index.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"\.html$",
    # },
    # {
    #     "url": "https://www.cmu.edu/ni/people/faculty-directory/",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"/ni/people/faculty/",
    # },
    # {
    #     "url": "https://www.cmu.edu/chemistry/people/faculty/",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"\.html$",
    # },
    # {
    #     "url": "https://www.cmu.edu/physics/people/faculty/index.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"\.html$",
    # },
    # dietrich
    # {
    #     "url": "https://www.cmu.edu/dietrich/english/about-us/faculty-profiles.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"faculty/bios/",
    # },
    # {
    #     "url": "https://www.cmu.edu/information-systems/faculty-staff/index.html",
    #     "base": "https://www.cmu.edu",
    #     "scrape_listing": True,
    # },
    # {
    #     "url": "https://www.cmu.edu/cmist/about-us/people/faculty/index.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"\.html$",
    # },
    # {
    #     "url": "https://www.cmu.edu/dietrich/lcal/about-us/filter/faculty/index.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"\.html$",
    # },
    # {
    #     "url": "https://www.cmu.edu/dietrich/philosophy/people/faculty/index.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"^[^/]+\.html$",
    # },
    # { 
    #     "url": "https://www.cmu.edu/dietrich/psychology/directory/index.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"core-training-faculty/",
    # },
    # {
    #     "url": "https://www.cmu.edu/dietrich/sds/people/faculty/index.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"^[^/]+\.html$",
    # },
    # {
    #     "url": "https://www.cmu.edu/dietrich/statistics-datascience/people/faculty/index.html",
    #     "base": "https://www.cmu.edu",
    #     "link_pattern": r"^[^/]+\.html$",
    # },
    # { # cmu qatar
    #     "url": "https://www.qatar.cmu.edu/people/",
    #     "algolia_url": "https://cpj5oxrvyu-dsn.algolia.net/1/indexes/wp_searchable_posts_people/query?x-algolia-agent=Algolia%20for%20JavaScript%20(4.18.0)%3B%20Browser%20(lite)&x-algolia-api-key=896a606c39ba213efea67eed6bbcbdc2&x-algolia-application-id=CPJ5OXRVYU",
    #     "school": "CMU-Qatar",
    # } ,
    # { # cmu silicon valley
    #     "url": "https://sv.cmu.edu/directory/index.html",
    #     "scrape_listing": True,
    # }, 
    { 
        "url": "https://lti.cmu.edu/people/faculty/",
        "base": "https://lti.cmu.edu",
        "link_pattern": r"^[^/]+\.html$",
    },
    { 
        "url": "https://s3d.cmu.edu/people/faculty-index.html",
        "base": "https://s3d.cmu.edu",
        "link_pattern": r"core-faculty/",
    },
]

# add individual profile urls directly:
EXTRA_PROFILE_URLS: list[str] = [
    # "https://www.cs.cmu.edu/~example/",
]

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; CMUConnectBot/1.0; research project)"}
DELAY_SECONDS = 0.5 # not hammer servers
MAX_PAGE_CHARS = 6000  # trim page content before sending to claude

# give api key in terminal 
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# ------------------------------------ helpers ------------------------------------

def fetch(url: str) -> str | None:
    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        r.raise_for_status()
        return r.text
    except Exception as e:
        print(f"  [fetch error] {url}: {e}")
        return None


def page_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)[:MAX_PAGE_CHARS]


def html_to_text(raw: str) -> str:
    soup = BeautifulSoup(raw, "html.parser")
    return soup.get_text(separator=" ", strip=True)


def process_json_listing(listing: dict) -> list[dict]:
    raw = fetch(listing["json_url"])
    if not raw:
        return []
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        print(f"  [json error] could not parse {listing['json_url']}")
        return []

    people = payload if isinstance(payload, list) else payload.get("data", [])
    school = listing.get("school", "")
    results = []
    for p in people:
        name = p.get("n") or p.get("name", "")
        if not name:
            continue
        title = ""
        if p.get("titl"):
            title = p["titl"][0] if isinstance(p["titl"], list) else p["titl"]
        dept = ""
        if p.get("dept"):
            dept = p["dept"][0] if isinstance(p["dept"], list) else p["dept"]
        if not dept and "ml.cmu.edu" in listing.get("json_url", ""):
            dept = "Machine Learning Department"
        research = [t.lower() for t in (p.get("rsrc") or [])]
        bio = html_to_text(p.get("bio", ""))
        url = p.get("href", "")
        if url and not url.startswith("http"):
            url = urljoin(listing["json_url"], url)
        # prefer personal website over profile page if available
        for soc in p.get("soc", []):
            if soc.get("type") == "website":
                url = soc["url"]
                break
        results.append({
            "name": name,
            "title": title,
            "department": dept,
            "school": school,
            "researchAreas": research,
            "bio": bio[:400],
            "openTo": ["research", "mentorship"],
            "email": "",
            "url": url,
        })
    print(f"  parsed {len(results)} people from {listing['json_url']}")
    return results


def process_algolia_listing(listing: dict) -> list[dict]:
    url = listing["algolia_url"]
    school = listing.get("school", "")
    results = []
    page = 0
    while True:
        try:
            r = requests.post(
                url,
                json={"hitsPerPage": 200, "page": page, "filters": "taxonomies.directory:Faculty"},
                headers=HEADERS,
                timeout=12,
            )
            r.raise_for_status()
            payload = r.json()
        except Exception as e:
            print(f"  [algolia error] page {page}: {e}")
            break

        hits = payload.get("hits", [])
        if not hits:
            break

        for h in hits:
            info = h.get("additional_info", {})
            name = h.get("post_title", "")
            if not name:
                continue
            depts = h.get("taxonomies", {}).get("department-names", [])
            dept = depts[0] if depts else info.get("designation", "")
            url_val = info.get("scholar_link", "") or h.get("permalink", "")
            results.append({
                "name": name,
                "title": info.get("titles", ""),
                "department": dept,
                "school": school,
                "researchAreas": [],
                "bio": "",
                "openTo": ["research", "mentorship"],
                "email": info.get("email", ""),
                "url": url_val,
            })

        if page >= payload.get("nbPages", 1) - 1:
            break
        page += 1
        time.sleep(DELAY_SECONDS)

    print(f"  parsed {len(results)} people from {listing['algolia_url']}")
    return results


def get_profile_links(listing: dict) -> list[str]:
    base_url = listing["url"]
    pattern = re.compile(listing["link_pattern"])
    seen: set[str] = set()
    links: list[str] = []

    def collect_from_html(html: str, page_url: str) -> None:
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.find_all("a", href=True):
            href: str = a["href"]
            if not pattern.search(href):
                continue
            href = urljoin(page_url, href)
            if href.startswith("http") and href not in seen:
                seen.add(href)
                links.append(href)

    html = fetch(base_url)
    if not html:
        return []
    collect_from_html(html, base_url)

    if listing.get("paginate"):
        soup = BeautifulSoup(html, "html.parser")
        page_hrefs: set[str] = set()
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "page=" in href or "/page/" in href or "jump=" in href or "pageIndex=" in href:
                page_hrefs.add(urljoin(base_url, href))
        for page_url in sorted(page_hrefs):
            if page_url == base_url:
                continue
            time.sleep(DELAY_SECONDS)
            page_html = fetch(page_url)
            if page_html:
                collect_from_html(page_html, page_url)

    print(f"  found {len(links)} candidate links on {listing['url']}")
    return links


def make_id(name: str) -> str:
    parts = name.lower().split()
    if len(parts) >= 2:
        return f"{parts[-1]}-{parts[0][0]}"
    return name.lower().replace(" ", "-")


def extract_with_claude(url: str, text: str) -> dict | None:
    prompt = f"""You are parsing a CMU faculty profile page.
URL: {url}

Return ONLY a JSON object — no markdown, no explanation — with these exact keys:
{{
  "name": "Full name",
  "title": "Academic title (Professor / Associate Professor / Assistant Professor / etc.)",
  "department": "Department name",
  "school": "School or College name",
  "researchAreas": ["lowercase tag", "lowercase tag", ...],
  "bio": "Two sentence summary of their research.",
  "openTo": ["research", "mentorship", "projects"],
  "email": "andrew@cmu.edu or empty string if not found",
  "url": "{url}"
}}

Rules:
- researchAreas: 4–8 specific lowercase keyword tags (e.g. "machine learning", "computer vision")
- openTo: include "research" if they run a lab, "mentorship" if they advise students, "projects" if they do applied/industry work — use judgment
- If you cannot find a field, use an empty string or empty array

Page content:
{text}"""

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"[json error] could not parse Claude response: {e}")
        return None
    except Exception as e:
        print(f"[claude error] {e}")
        return None


def extract_listing_with_claude(url: str, text: str) -> list[dict]:
    prompt = f"""You are parsing a CMU faculty listing page that contains multiple faculty members.
URL: {url}

Return ONLY a JSON array — no markdown, no explanation — where each element has these exact keys:
{{
  "name": "Full name",
  "title": "Academic title (Professor / Associate Professor / Assistant Professor / etc.)",
  "department": "Department name",
  "school": "School or College name",
  "researchAreas": ["lowercase tag", "lowercase tag", ...],
  "bio": "Two sentence summary of their work.",
  "openTo": ["research", "mentorship", "projects"],
  "email": "andrew@cmu.edu or empty string if not found",
  "url": "their profile URL if present, otherwise empty string"
}}

Rules:
- Include every faculty member you can find on the page
- researchAreas: 4–8 specific lowercase keyword tags
- openTo: use judgment based on their title and role
- If you cannot find a field, use an empty string or empty array

Page content:
{text}"""

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"[json error] could not parse Claude response: {e}")
        return []
    except Exception as e:
        print(f"[claude error] {e}")
        return []


# ------------------------------------ main ------------------------------------
def main() -> None:
    out_path = os.path.join(os.path.dirname(__file__), "scraped_faculty.json")

    # Load existing results and build lookup sets for deduplication
    if os.path.exists(out_path):
        with open(out_path) as f:
            results: list[dict] = json.load(f)
        print(f"Loaded {len(results)} existing entries from {out_path}")
    else:
        results = []

    done_urls: set[str] = {r["url"] for r in results if r.get("url")}
    done_names: set[str] = {r["name"].lower().strip() for r in results if r.get("name")}
    failed: list[str] = []
    added = 0

    def is_duplicate(data: dict) -> bool:
        if data.get("url") and data["url"] in done_urls:
            return True
        if data.get("name") and data["name"].lower().strip() in done_names:
            return True
        return False

    def register(data: dict) -> None:
        if data.get("url"):
            done_urls.add(data["url"])
        if data.get("name"):
            done_names.add(data["name"].lower().strip())

    algolia_pages = [l for l in LISTING_PAGES if l.get("algolia_url")]
    json_pages = [l for l in LISTING_PAGES if l.get("json_url")]
    listing_pages = [l for l in LISTING_PAGES if l.get("scrape_listing")]
    profile_pages = [l for l in LISTING_PAGES if not l.get("scrape_listing") and not l.get("json_url") and not l.get("algolia_url")]

    for listing in algolia_pages:
        print(f"\n[algolia mode] {listing['url']}")
        for data in process_algolia_listing(listing):
            if is_duplicate(data):
                print(f"  — skip (dup): {data['name']}")
                continue
            data["id"] = make_id(data["name"])
            results.append(data)
            register(data)
            added += 1
            print(f"  ✓ {data['name']}")

    for listing in json_pages:
        print(f"\n[json mode] {listing['json_url']}")
        for data in process_json_listing(listing):
            if is_duplicate(data):
                print(f"  — skip (dup): {data['name']}")
                continue
            data["id"] = make_id(data["name"])
            results.append(data)
            register(data)
            added += 1
            print(f"  ✓ {data['name']}")

    for listing in listing_pages:
        print(f"\n[listing mode] {listing['url']}")
        html = fetch(listing["url"])
        if not html:
            failed.append(listing["url"])
            continue
        text = page_text(html)
        extracted = extract_listing_with_claude(listing["url"], text)
        for data in extracted:
            if not data.get("name"):
                continue
            if is_duplicate(data):
                print(f"  — skip (dup): {data['name']}")
                continue
            data["id"] = make_id(data["name"])
            results.append(data)
            register(data)
            added += 1
            print(f"  ✓ {data['name']}")
        time.sleep(DELAY_SECONDS)

    listing_mode_urls: set[str] = {l["url"] for l in listing_pages}

    profile_urls: list[str] = list(EXTRA_PROFILE_URLS)
    for listing in profile_pages:
        print(f"\nScanning listing: {listing['url']}")
        profile_urls.extend(get_profile_links(listing))

    profile_urls = [u for u in dict.fromkeys(profile_urls) if u not in listing_mode_urls]
    new_profile_urls = [u for u in profile_urls if u not in done_urls]
    print(f"\nTotal profiles found: {len(profile_urls)} — {len(profile_urls) - len(new_profile_urls)} already exist, {len(new_profile_urls)} to process")

    for i, url in enumerate(new_profile_urls, 1):
        print(f"\n[{i}/{len(new_profile_urls)}] {url}")
        html = fetch(url)
        if not html:
            failed.append(url)
            time.sleep(DELAY_SECONDS)
            continue

        text = page_text(html)
        data = extract_with_claude(url, text)

        if data and data.get("name"):
            if is_duplicate(data):
                print(f"  — skip (dup): {data['name']}")
            else:
                data["id"] = make_id(data["name"])
                results.append(data)
                register(data)
                added += 1
                print(f"{data['name']} — {data.get('department', '?')}")
        else:
            print(f"extraction failed")
            failed.append(url)

        with open(out_path, "w") as f:
            json.dump(results, f, indent=2)

        time.sleep(DELAY_SECONDS)

    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n{'='*50}")
    print(f"Done. {added} new, {len(results) - added} already existed, {len(failed)} failed.")
    print(f"Results saved to: {out_path}")
    if failed:
        print(f"\nFailed URLs:")
        for u in failed:
            print(f"  {u}")
    print("\nReview scraped_faculty.json, then copy entries into data/faculty.json.")


if __name__ == "__main__":
    main()
