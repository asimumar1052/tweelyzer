from typing import Dict, Any, List
from datetime import datetime, timezone

from search.google_search import google_search

from analyzers.claim_detector import detect_claim
from analyzers.nli_verifier import nli_label_scores
from analyzers.sentiment_analyzer import analyze_sentiment

from utils.fetcher import fetch_and_extract
from utils.query_extractor import extract_queries
from utils.tweet_extractor import extract_tweet_data
from utils.helpers import clean_text, sentences, trim


SUPPORT_KEYS = ("entailment", "supports")
REFUTE_KEYS = ("contradiction", "refutes")


async def fact_check_claim(url: str, k_search: int = 6, max_evidence_sentences: int = 3) -> Dict[str, Any]:
    """
    Fact-check a claim from a tweet URL:
    1) Extract tweet data
    2) Analyze sentiment
    3) Check if it's a claim
    4) Extract queries
    5) Google search the queries
    6) Fetch each page from search results & extract text
    7) Run NLI (premise=evidence, hypothesis=claim) on snippet + top sentences
    8) Aggregate into a verdict
    """

    tweet = await extract_tweet_data(url)

    tweet['sentiment'] = analyze_sentiment(tweet['text'])
    tweet['is_claim'] = detect_claim(tweet['text'])

    if not tweet['is_claim']:
        tweet['fact_check'] = {"verdict": "NOT A CLAIM", "details": []}
        return tweet

    claim_tweet = tweet['text']

    cleaned_text = clean_text(claim_tweet)
    claims = extract_queries(cleaned_text, min_score=0.03)

    searched_queries = []
    
    analyses: List[Dict[str, Any]] = []

    for claim in claims:
        searched_queries.append(claim['text'])

        results = await google_search(claim["text"], num_results=k_search)

        for item in results:
            url = item["link"]
            title = item.get("title")
            snippet = item.get("snippet", "") or ""

            # Start with the snippet (already a summary from Google)
            candidates = [snippet] if snippet else []

            # Try to fetch page text and add first few sentences
            page_text = await fetch_and_extract(url)
            if page_text:
                for s in sentences(page_text, limit=max_evidence_sentences):
                    if s and s not in candidates:
                        candidates.append(s)

            # Run NLI on each candidate, keep the best one per URL
            best = None
            for cand in candidates:
                if not cand.strip():
                    continue
                out = nli_label_scores(claim=claim["text"], evidence=cand)
                label = out["label"]
                score = out["scores"].get(label, 0.0)
                record = {
                    "url": url,
                    "title": title,
                    "evidence": trim(cand, 400),
                    "label": label,
                    "score": score,
                    "scores": out["scores"],
                }
                if best is None:
                    best = record
                if score > best["score"]:
                    best = record

            if best:
                analyses.append(best)

    # Aggregate
    support = [a for a in analyses if a["label"].lower() in SUPPORT_KEYS]
    refute  = [a for a in analyses if a["label"].lower() in REFUTE_KEYS]
    neutral = [a for a in analyses if a["label"].lower() not in SUPPORT_KEYS + REFUTE_KEYS]

    def avg(xs): return sum(xs)/len(xs) if xs else 0.0
    support_score = avg([a["score"] for a in support])
    refute_score  = avg([a["score"] for a in refute])

    # Simple decision rules (tune as you like)
    if len(refute) >= 2 and refute_score >= 0.55:
        verdict = "Likely False"
        confidence = min(0.95, 0.5 + refute_score)
    elif len(support) >= 2 and support_score >= 0.55:
        verdict = "Likely True"
        confidence = min(0.95, 0.5 + support_score)
    elif (len(support) >= 1 and support_score >= 0.6) and len(refute) == 0:
        verdict = "Possibly True"
        confidence = min(0.9, 0.45 + support_score)
    elif (len(refute) >= 1 and refute_score >= 0.6) and len(support) == 0:
        verdict = "Possibly False"
        confidence = min(0.9, 0.45 + refute_score)
    else:
        verdict = "Unclear"
        confidence = 0.4

    tweet['fact_check'] = {
            "claim": claim_tweet,
            "verdict": verdict,
            "confidence": round(confidence, 3),
            "searched_queries": searched_queries,
            "results_considered": len(analyses),
            "support": support[:5],
            "refute": refute[:5],
            "neutral": neutral[:5],
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "notes": "Automated verdict based on top web results and NLI; manual review recommended.",
        }

    return tweet