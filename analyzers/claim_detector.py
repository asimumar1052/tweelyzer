"""Claim Detection Analyzer"""

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

BASE_MODEL = "xlm-roberta-base"
MODEL_NAME = "SophieTr/xlm-roberta-base-claim-detection-clef21-24"

tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
model.eval()

def detect_claim(text: str, threshold: float = 0.5) -> bool:
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)[0]
    claim_prob = probs[1].item()  # index 1 = "claim"
    return claim_prob >= threshold
