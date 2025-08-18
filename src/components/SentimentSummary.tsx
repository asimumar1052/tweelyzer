import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { AnalyzeTweetResponse } from '@/types/api';

interface SentimentSummaryProps {
  sentiment: AnalyzeTweetResponse['sentiment'];
}

export function SentimentSummary({ sentiment }: SentimentSummaryProps) {

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'Positive':
        return 'text-green-600 dark:text-green-400';
      case 'Negative':
        return 'text-red-600 dark:text-red-400';
      case 'Neutral':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'Positive':
        return <TrendingUp className="w-6 h-6" />;
      case 'Negative':
        return <TrendingDown className="w-6 h-6" />;
      case 'Neutral':
        return <Minus className="w-6 h-6" />;
      default:
        return <Minus className="w-6 h-6" />;
    }
  };

  const getSentimentBadgeVariant = (label: string) => {
    switch (label) {
      case 'Positive':
        return 'default';
      case 'Negative':
        return 'destructive';
      case 'Neutral':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const confidencePercentage = Math.round(sentiment.confidence * 100);

  return (
    <section className="space-y-4">
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-3">
            <span className={getSentimentColor(sentiment.label)}>
              {getSentimentIcon(sentiment.label)}
            </span>
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge 
              variant={getSentimentBadgeVariant(sentiment.label)}
              className="text-lg px-4 py-2"
            >
              {sentiment.label}
            </Badge>
            <span className="text-lg font-medium">
              {confidencePercentage}% confidence
            </span>
          </div>
          
          <Progress 
            value={confidencePercentage} 
            className="h-3"
          />
        </CardContent>
      </Card>
    </section>
  );
}