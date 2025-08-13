import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, AlertTriangle, Smile, Frown, Meh } from "lucide-react";

interface SentimentObj {
  label?: string;
  confidence?: number;
}

interface FactCheckTrigger {
  label?: string;
}

interface FakeNewsDetection {
  label?: string;
  confidence?: number;
}

interface Props {
  data: {
    sentiment?: SentimentObj | string;
    fact_check_trigger?: FactCheckTrigger | string;
    fake_news_detection?: FakeNewsDetection | string;
  };
}

export function AnalysisResults({ data }: Props) {
  // Sentiment parsing
  let sentimentLabel = "Unknown";
  let sentimentConfidence = 0;
  if (typeof data?.sentiment === "string") {
    sentimentLabel = data.sentiment;
  } else if (data?.sentiment && typeof data.sentiment === "object") {
    sentimentLabel = data.sentiment.label || "Unknown";
    sentimentConfidence = data.sentiment.confidence || 0;
  }

  const sentimentLower = (sentimentLabel || "").toLowerCase();
  const sentimentIcon =
    sentimentLower === "positive" ? (
      <Smile className="h-5 w-5 text-primary" />
    ) : sentimentLower === "negative" ? (
      <Frown className="h-5 w-5 text-destructive" />
    ) : (
      <Meh className="h-5 w-5 text-accent" />
    );

  const sentimentClasses =
    sentimentLower === "positive"
      ? "border-l-4 border-primary bg-secondary/40"
      : sentimentLower === "negative"
      ? "border-l-4 border-destructive bg-destructive/10"
      : "border-l-4 border-accent bg-accent/10";

  // Authenticity parsing
  let needsFactCheck = false;
  if (typeof data?.fact_check_trigger === "object") {
    needsFactCheck = data.fact_check_trigger?.label === "Needs fact check";
  }

  let authLabel = "Verified";
  let authConfidenceText = "Status: No concerns detected";
  let isReal = true;

  if (needsFactCheck) {
    if (typeof data?.fake_news_detection === "string") {
      authLabel = data.fake_news_detection;
      isReal = authLabel.toUpperCase() === "REAL";
    } else if (
      data?.fake_news_detection &&
      typeof data.fake_news_detection === "object"
    ) {
      authLabel = data.fake_news_detection.label || "Unknown";
      const c = data.fake_news_detection.confidence || 0;
      isReal = authLabel.toUpperCase() === "REAL";
      authConfidenceText = `Confidence: ${(c * 100).toFixed(1)}%`;
    }
  }

  const authIcon = isReal ? (
    <ShieldCheck className="h-5 w-5 text-primary" />
  ) : (
    <AlertTriangle className="h-5 w-5 text-destructive" />
  );

  const authClasses = isReal
    ? "border-l-4 border-primary bg-secondary/40"
    : "border-l-4 border-destructive bg-destructive/10";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {sentimentIcon}
            <span>Sentiment Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`rounded-lg p-4 shadow-sm ${sentimentClasses}`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{sentimentLabel}</p>
              <p className="text-sm text-muted-foreground">
                Confidence: {(sentimentConfidence * 100).toFixed(1)}%
              </p>
            </div>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">
              {sentimentLower === "positive"
                ? "This tweet expresses positive emotions."
                : sentimentLower === "negative"
                ? "This tweet contains negative sentiment."
                : "This tweet maintains a neutral tone."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {authIcon}
            <span>Authenticity Check</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`rounded-lg p-4 shadow-sm ${authClasses}`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{isReal ? "Verified" : authLabel}</p>
              <p className="text-sm text-muted-foreground">{authConfidenceText}</p>
            </div>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">
              {isReal
                ? "This content appears factual."
                : "This content requires additional verification."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
