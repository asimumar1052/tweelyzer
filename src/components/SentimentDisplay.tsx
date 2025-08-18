import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { AnalyzeTweetResponse } from '@/types/api';

interface SentimentDisplayProps {
  sentiment: AnalyzeTweetResponse['sentiment'];
}

export function SentimentDisplay({ sentiment }: SentimentDisplayProps) {
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
        return <TrendingUp className="w-5 h-5" />;
      case 'Negative':
        return <TrendingDown className="w-5 h-5" />;
      case 'Neutral':
        return <Minus className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
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
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className={getSentimentColor(sentiment.label)}>
            {getSentimentIcon(sentiment.label)}
          </span>
          Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge 
            variant={getSentimentBadgeVariant(sentiment.label)}
            className="text-sm px-2 py-1"
          >
            {sentiment.label}
          </Badge>
          {/* <span className="text-xs text-muted-foreground">
            {confidencePercentage}% confidence
          </span> */}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium">{confidencePercentage}%</span>
          </div>
          <Progress 
            value={confidencePercentage} 
            className="h-1.5"
          />
        </div>
      </CardContent>
    </Card>
  );
}