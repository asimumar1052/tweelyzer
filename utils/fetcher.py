from typing import Optional
import trafilatura
import httpx
from bs4 import BeautifulSoup

async def fetch_and_extract(url: str, timeout: float = 20.0) -> Optional[str]:
    """Download a page and extract main text. Falls back to BeautifulSoup if needed."""
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            text = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=False,
                favor_recall=True
            )
            if text and text.strip():
                return text.strip()
    except Exception:
        pass

    # Fallback: raw HTML + BeautifulSoup (less accurate)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.get(url, follow_redirects=True)
            r.raise_for_status()
            html = r.text
        soup = BeautifulSoup(html, "lxml")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        text = " ".join(soup.get_text(separator=" ").split())
        return text[:20000] if text else None
    except Exception:
        return None
