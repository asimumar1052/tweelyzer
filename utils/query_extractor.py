from __future__ import annotations
from typing import List, Dict, Any, Iterable, Set
import re
from functools import lru_cache

import numpy as np
import spacy
import pytextrank

from analyzers.claim_detector import detect_claim


@lru_cache(maxsize=1)
def _get_nlp():
    nlp = spacy.load("en_core_web_sm")
    if "textrank" not in nlp.pipe_names:
        # pytextrank registers a "textrank" factory; importing it enables this
        nlp.add_pipe("textrank", last=True)
    return nlp


def _normalize_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def extract_queries(
    text: str,
    *,
    min_score: float = 0.05,          # base threshold (normalized)
    quantile: float = 0.7,            # dynamic threshold (top 30% by score)
    entity_types: Iterable[str] | None = None,
    min_entities: int = 1,            # require at least one named entity
    require_verb: bool = True,        # require a verb in the sentence
    dedupe: bool = True               # dedupe by normalized text
) -> List[Dict[str, Any]]:
    """
    Extract check-worthy sentences using TextRank (via keyphrase ranks) + NER.

    Approach:
      1) Run spaCy + pytextrank.
      2) Score each sentence by summing ranks of keyphrases whose chunks fall in it.
      3) Filter by NER presence (e.g., GPE/ORG/DATE...) and (optionally) verb presence.
      4) Keep all sentences whose normalized score >= max(min_score, quantile(scores)).

    Returns: list of dicts: {text, score, norm_score, entities: [{text,label},...]}
    """
    if entity_types is None:
        entity_types = {
            "PERSON", "ORG", "GPE", "NORP", "LOC", "DATE", "TIME", "EVENT", "LAW",
            "PRODUCT", "MONEY", "PERCENT", "CARDINAL", "ORDINAL", "FAC", "WORK_OF_ART",
            "LANGUAGE"
        }

    nlp = _get_nlp()
    doc = nlp(text)

    # 1) Init sentence scores
    sent_list = list(doc.sents)
    if not sent_list:
        return []

    sent_scores = {sent: 0.0 for sent in sent_list}

    # 2) Accumulate phrase ranks into sentences containing their chunks
    #    This is stable across pytextrank versions.
    for phrase in doc._.phrases:      # ranked keyphrases
        rank = float(phrase.rank)
        # phrase.chunks are Spans anchored in the doc; map them to their sentence.
        for chunk in phrase.chunks:
            sent_scores[chunk.sent] += rank

    # 3) Build candidates with NER and optional verb filter
    candidates: List[Dict[str, Any]] = []
    for sent, score in sent_scores.items():
        if not sent.text.strip():
            continue

        ents = [ {"text": e.text, "label": e.label_}
                 for e in sent.ents if e.label_ in entity_types ]

        if len(ents) < min_entities:
            continue

        if require_verb and not any(t.pos_ == "VERB" for t in sent):
            continue

        # Penalize hypothetical/conditional sentences
        text_norm = sent.text.strip().lower()
        penalty = 1.0
        hypotheticals = ["would", "could", "should", "might"]
        if any(hw in text_norm for hw in hypotheticals) or text_norm.startswith("if ") or text_norm.startswith("otherwise"):
            penalty = 0.5  # Reduce score by half for hypothetical/conditional

        # Penalize repeated named entities
        entity_texts = [e["text"].lower() for e in ents]
        entity_counts = {}
        for et in entity_texts:
            entity_counts[et] = entity_counts.get(et, 0) + 1
        repeat_entity_penalty = 1.0
        for count in entity_counts.values():
            if count > 1:
                repeat_entity_penalty *= 0.8 ** (count - 1)  # 20% penalty per repeat

        # Penalize repeated keyphrases (if available)
        keyphrase_texts = []
        if hasattr(sent.doc._, "phrases"):
            for phrase in sent.doc._.phrases:
                for chunk in phrase.chunks:
                    if chunk.sent == sent:
                        keyphrase_texts.append(phrase.text.lower())
        keyphrase_counts = {}
        for kt in keyphrase_texts:
            keyphrase_counts[kt] = keyphrase_counts.get(kt, 0) + 1
        repeat_keyphrase_penalty = 1.0
        for count in keyphrase_counts.values():
            if count > 1:
                repeat_keyphrase_penalty *= 0.85 ** (count - 1)  # 15% penalty per repeat

        # Apply all penalties before normalization
        penalized_score = float(score) * penalty * repeat_entity_penalty * repeat_keyphrase_penalty

        candidates.append({
            "text": _normalize_ws(sent.text),
            "score": penalized_score,
        })

    if not candidates:
        return []

    # 4) Normalize scores and apply dynamic threshold
    max_score = max(c["score"] for c in candidates) or 1.0
    for c in candidates:
        c["norm_score"] = c["score"] / max_score

    scores = np.array([c["norm_score"] for c in candidates], dtype=float)
    dyn_thresh = float(np.quantile(scores, quantile))  # e.g., 70th percentile
    cutoff = max(min_score, dyn_thresh)

    selected = [c for c in candidates if c["norm_score"] >= cutoff]
    selected.sort(key=lambda x: x["norm_score"], reverse=True)

    # Always include the top claim(s) after normalization
    if selected:
        top_score = selected[0]["norm_score"]
        # Include all claims within 0.05 of the top score
        selected = [c for c in selected if top_score - c["norm_score"] <= 0.05]

    # 5) Optional dedupe by normalized lowercase text
    if dedupe:
        seen: Set[str] = set()
        uniq = []
        for c in selected:
            key = _normalize_ws(c["text"].lower())
            if key not in seen:
                seen.add(key)
                uniq.append(c)
        selected = uniq

    # 6) Check for unworded claims
    for c in selected:
        if not detect_claim(c["text"]):
            # Remove if not a claim
            selected.remove(c)

    # 7) Remove norm_score
    for c in selected:
        c.pop("norm_score", None)
    
    return selected
