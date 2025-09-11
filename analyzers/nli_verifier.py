from typing import Dict, Any
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_NAME = "ynie/roberta-large-snli_mnli_fever_anli_R1_R2_R3-nli"

# Lazy globals to avoid import-time stalls in FastAPI reloads
_tokenizer = None
_model = None

def nli_label_scores(claim: str, evidence: str) -> Dict[str, Any]:
    """
    Run NLI with premise=evidence, hypothesis=claim.
    Returns: {label, scores(dict), raw}
    """
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
        _model.eval()
    inputs = _tokenizer(
        evidence,
        claim,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512,
    )
    with torch.no_grad():
        outputs = _model(**inputs)
        logits = outputs.logits[0]
        probs = torch.softmax(logits, dim=-1).tolist()

    # Map id to label (usually: 0=entailment, 1=neutral, 2=contradiction OR different; trust config)
    id2label = _model.config.id2label
    scores = {id2label[i].lower(): float(p) for i, p in enumerate(probs)}

    # Best label
    best_label = max(scores.items(), key=lambda kv: kv[1])[0]
    return {
        "label": best_label,                 # 'entailment' | 'contradiction' | 'neutral'
        "scores": scores,                    # dict with probs
        "raw": {"logits": [float(x) for x in logits.tolist()]},
    }
