# Tweelyzer

A simple tool to analyze tweets and check facts.

## What it does

- Takes a Twitter URL
- Analyzes the tweet content
- Checks if claims are true or false
- Returns analysis results

## How to run

1. **Clone the project**

   ```bash
   git clone <your-repo-url>
   cd Tweelyzer/backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. **Install stuff**

   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

4. **Run the app**

   ```bash
   uvicorn main:app --reload
   ```

5. **Open your browser**
   - Go to: http://127.0.0.1:8000/docs
   - Try the API with a tweet URL

## API Usage

Send a POST request to `/analyze-tweet` with:

```json
{
  "url": "https://twitter.com/someone/status/123456"
}
```

## Requirements

- Python 3.11+
- Internet connection (for fact checking)

## That's it!

If something breaks, make sure your virtual environment is activated
