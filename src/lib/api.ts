import { AnalyzeTweetRequest, AnalyzeTweetResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function analyzeTweet(request: AnalyzeTweetRequest): Promise<AnalyzeTweetResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze-tweet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Network error');
    throw new Error(`Analysis failed: ${error}`);
  }

  return response.json();
}