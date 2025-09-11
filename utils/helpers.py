import re
from typing import List
from collections import Counter

import spacy

nlp = spacy.load("en_core_web_sm")

_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")

def sentences(text: str, limit: int = 5) -> List[str]:
    """Very simple sentence splitter; returns first N non-empty sentences."""
    if not text:
        return []
    parts = [s.strip() for s in _SENT_SPLIT.split(text) if s.strip()]
    return parts[:limit]

def trim(text: str, max_len: int = 500) -> str:
    if len(text) <= max_len:
        return text
    return text[:max_len - 3] + "..."


def clean_text(text: str) -> str:
    # Remove URLs
    text = re.sub(r"http\S+", "", text)
    # Remove mentions and hashtags
    text = re.sub(r"[@#]\w+", "", text)
    # Remove extra spaces
    return text.strip()


def extract_keywords(text: str) -> str:
    stopwords = {"the", "is", "at", "which", "on", "and", "a", "has", "of", "to", "this", "it", "in"}
    words = [w for w in re.findall(r"\w+", text.lower()) if w not in stopwords]
    most_common = [w for w, _ in Counter(words).most_common(8)]
    return " ".join(most_common)
