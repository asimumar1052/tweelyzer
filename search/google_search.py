import os
from typing import List, Dict
import httpx
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CX = os.getenv("GOOGLE_CX")

if not GOOGLE_API_KEY or not GOOGLE_CX:
    raise RuntimeError("GOOGLE_API_KEY and GOOGLE_CX must be set in .env")

SEARCH_URL = "https://www.googleapis.com/customsearch/v1"

async def google_search(claim: str, num_results: int = 6) -> List[Dict]:
    """
    Query Google Custom Search JSON API and return top results.
    Each item: {title, link, snippet, displayLink}
    """
    exclude_sites = "-site:x.com -site:twitter.com -site:nitter.net -site:tweettunnel.com -site:youtube.com -site:tiktok.com -site:reddit.com -site:facebook.com -site:instagram.com"

    query = f'{claim} {exclude_sites}'
    

    params = {
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CX,
        "q": query,
        "num": min(max(num_results, 1), 10),  # Google API allows up to 10 per call
        "safe": "active",
        "gl": "us",
        "lr": "lang_en",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(SEARCH_URL, params=params)
        r.raise_for_status()
        data = r.json()

    items = data.get("items", []) or []
    results: List[Dict] = []
    for it in items:
        results.append({
            "title": it.get("title"),
            "link": it.get("link"),
            "snippet": it.get("snippet"),
            "displayLink": it.get("displayLink"),
        })
    return results
