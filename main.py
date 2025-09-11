"""Main application file for the FastAPI server."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.tweet_url import TweetURL
from models.tweet_response import TweetResponse

from analyzers.fact_checker import fact_check_claim

from search.google_search import google_search

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-tweet", response_model=TweetResponse)
async def analyze_tweet(data: TweetURL):
    """Endpoint to analyze a tweet given its URL."""
    try:
        response = await fact_check_claim(data.url)
        
        return response
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid tweet URL format") from exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
