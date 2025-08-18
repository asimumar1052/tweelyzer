export interface EvidenceItem {
  url: string;
  title: string;
  evidence: string;
  label: "entailment" | "neutral" | "contradiction";
  score: number;
  scores: {
    entailment: number;
    neutral: number;
    contradiction: number;
  };
}

export interface AnalyzeTweetResponse {
  id: string;
  created_at: string; // "Sun Jul 20 18:05:44 +0000 2025"
  text: string;
  lang: string;
  likes: number;
  retweets: number;
  bookmarks: number;
  quotes: number;
  replies: number;
  author: {
    name: string;
    screen_name: string;
    image: string;
    blue_verified: boolean;
  };
  media: string | null;
  sentiment: {
    label: "Positive" | "Negative" | "Neutral";
    confidence: number; // 0..1
  };
  is_claim: boolean;
  fact_check: {
    claim: string;
    verdict: string; // e.g., "Likely False"
    confidence: number; // 0..1
    searched_queries: string[];
    results_considered: number;
    support: EvidenceItem[];
    refute: EvidenceItem[];
    neutral: EvidenceItem[];
    timestamp_utc: string;
    notes: string;
  };
}

export interface AnalyzeTweetRequest {
  url: string;
}