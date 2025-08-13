import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { TweetCard } from "@/components/tweelyzer/TweetCard";
import { AnalysisResults } from "@/components/tweelyzer/AnalysisResults";
import { Cog, Rocket, Loader2, CheckCircle2, Sparkles, Download, Lock, ListChecks } from "lucide-react";

// Tweelyzer Home Page
const Index = () => {
  const [backendUrl, setBackendUrl] = useState("http://127.0.0.1:8000");
  const [tweetUrl, setTweetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  // SEO
  useEffect(() => {
    document.title = "Tweelyzer – Tweet Analyzer";
    const desc =
      "Tweelyzer: AI-powered Tweet analysis with sentiment, authenticity, and engagement metrics.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);
  }, []);

  const controllerRef = useRef<AbortController | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    setData(null);

    const trimmed = tweetUrl.trim();
    if (!trimmed) {
      setError("Please enter a valid tweet URL.");
      toast({ title: "Invalid input", description: "Enter a valid Twitter/X URL." });
      return;
    }

    setLoading(true);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${backendUrl}/analyze-tweet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
        signal: controller.signal,
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
        toast({ title: "Analysis complete", description: "Tweet analyzed successfully." });
      } else if (res.status === 400) {
        const detail = await safeDetail(res);
        setError(`Invalid Request: ${detail || "Invalid tweet URL format"}`);
        toast({ title: "Invalid request", description: detail || "Check the URL format." });
      } else if (res.status === 500) {
        const detail = await safeDetail(res);
        setError(`Server Error: ${detail || "Internal server error"}`);
        toast({ title: "Server error", description: "Please try again later." });
      } else {
        const txt = await res.text();
        setError(`Unexpected error: HTTP ${res.status}`);
        console.error("Response:", txt);
      }
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setError("Analysis timed out. Please try again.");
        toast({ title: "Timeout", description: "Server took too long to respond." });
      } else {
        setError("Network error occurred. Please check your connection/backend.");
        toast({ title: "Network error", description: "Verify backend is running and accessible." });
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  async function safeDetail(res: Response) {
    try {
      const j = await res.json();
      return j?.detail as string | undefined;
    } catch {
      return undefined;
    }
  }

  const hasResults = !!data;

  const reportText = useMemo(() => {
    if (!data) return "";
    const tweet_text = data?.text || "N/A";
    const authorObj = (data?.author && typeof data.author === "object") ? data.author : undefined;
    const authorName = authorObj?.name || authorObj?.screen_name || "N/A";

    let sentimentLabel = "Unknown";
    let sentimentConfidence = 0;
    if (typeof data?.sentiment === "string") sentimentLabel = data.sentiment;
    else if (data?.sentiment) {
      sentimentLabel = data.sentiment.label || "Unknown";
      sentimentConfidence = data.sentiment.confidence || 0;
    }

    let authResult = "Content verified as authentic";
    const fct = data?.fact_check_trigger;
    const needsFact = typeof fct === "object" && fct?.label === "Needs fact check";
    if (needsFact && data?.fake_news_detection) {
      if (typeof data.fake_news_detection === "string") {
        authResult = data.fake_news_detection;
      } else {
        const label = data.fake_news_detection.label || "N/A";
        const conf = data.fake_news_detection.confidence || 0;
        authResult = `${label} (Confidence: ${(conf * 100).toFixed(1)}%)`;
      }
    }

    const dt = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");

    return `TWEELYZER ANALYSIS REPORT
========================

Tweet URL: ${tweetUrl}
Analysis Date: ${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}

TWEET CONTENT:
${tweet_text}

ANALYSIS RESULTS:
================

SENTIMENT ANALYSIS:
   Classification: ${sentimentLabel}
   Confidence Level: ${(sentimentConfidence * 100).toFixed(1)}%

AUTHENTICITY CHECK:
   Result: ${authResult}

ENGAGEMENT METRICS:
   Author: ${authorName}
   Published: ${data?.date || "N/A"}
   Likes: ${data?.likes ?? "N/A"}
   Retweets: ${data?.retweets ?? "N/A"}
   Replies: ${data?.replies ?? "N/A"}

---
Report generated by Tweelyzer - Tweet Analysis Tool`;
  }, [data, tweetUrl]);

  const downloadReport = () => {
    const content = reportText.trim();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dt = new Date();
    const ts = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(dt.getDate()).padStart(2, "0")}_${String(dt.getHours()).padStart(2, "0")}${String(dt.getMinutes()).padStart(2, "0")}${String(dt.getSeconds()).padStart(2, "0")}`;
    a.href = url;
    a.download = `tweelyzer_report_${ts}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full border-b">
        <div className="container flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-bold">Tweelyzer</h1>
            <p className="text-sm text-muted-foreground">AI-Powered Tweet Analysis</p>
          </div>

          {/* Mobile settings */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Cog className="mr-2 h-4 w-4" /> Settings
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle>Configuration</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-6">
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Backend URL</p>
                    <Input
                      value={backendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      placeholder="http://127.0.0.1:8000"
                      aria-label="Backend URL"
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-2 font-medium">Features</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Instant Analysis</li>
                      <li className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Real-time Data</li>
                      <li className="flex items-center gap-2"><Download className="h-4 w-4" /> Export Ready</li>
                      <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Secure Processing</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-2 font-medium">What We Analyze</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Sentiment Analysis</li>
                      <li className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Authenticity Check</li>
                      <li className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Engagement Metrics</li>
                    </ul>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container grid gap-6 py-8 lg:grid-cols-4">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cog className="h-5 w-5" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Backend URL</p>
                <Input
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://127.0.0.1:8000"
                  aria-label="Backend URL"
                />
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-medium">Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Instant Analysis</li>
                  <li className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Real-time Data</li>
                  <li className="flex items-center gap-2"><Download className="h-4 w-4" /> Export Ready</li>
                  <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Secure Processing</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-medium">What We Analyze</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Sentiment Analysis</li>
                  <li className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Authenticity Check</li>
                  <li className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Engagement Metrics</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main content */}
        <section className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Rocket className="h-5 w-5" /> Analyze Any Tweet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Input
                    value={tweetUrl}
                    onChange={(e) => setTweetUrl(e.target.value)}
                    placeholder="https://twitter.com/username/status/... or https://x.com/..."
                    aria-label="Tweet URL"
                  />
                </div>
                <Button onClick={handleAnalyze} disabled={loading} className="sm:w-40">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {hasResults && (
            <div className="mt-6 space-y-6">
              <TweetCard data={data} tweetUrl={tweetUrl} />
              <AnalysisResults data={data} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="h-5 w-5" /> Export Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button variant="default" onClick={downloadReport} className="w-full sm:w-auto">
                      <Download className="mr-2 h-4 w-4" /> Download Text Report
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      A human-readable analysis report will be downloaded.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8">
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                <p className="font-medium text-primary">Your Privacy & Security Matter</p>
                <p>We process your tweets securely and don't store personal data. All analyses are performed in real-time.</p>
                <p className="opacity-80">Built with ❤️ using React & FastAPI | © 2025 Tweelyzer - Tweet Analysis Platform</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
