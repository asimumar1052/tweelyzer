import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AnalyzeTweetResponse } from '@/types/api';

interface FactCheckSummaryProps {
  data: AnalyzeTweetResponse;
}

export function FactCheckSummary({ data }: FactCheckSummaryProps) {
  const { fact_check, is_claim } = data;

  const getVerdictColor = (verdict: string) => {
    const lowerVerdict = verdict.toLowerCase();
    if (lowerVerdict.includes('true') || lowerVerdict.includes('accurate')) {
      return 'text-green-600 dark:text-green-400';
    }
    if (lowerVerdict.includes('false') || lowerVerdict.includes('misleading')) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getVerdictIcon = (verdict: string) => {
    const lowerVerdict = verdict.toLowerCase();
    if (lowerVerdict.includes('true') || lowerVerdict.includes('accurate')) {
      return <CheckCircle className="w-6 h-6" />;
    }
    if (lowerVerdict.includes('false') || lowerVerdict.includes('misleading')) {
      return <AlertTriangle className="w-6 h-6" />;
    }
    return <AlertTriangle className="w-6 h-6" />;
  };

  const getVerdictBadgeVariant = (verdict: string) => {
    const lowerVerdict = verdict.toLowerCase();
    if (lowerVerdict.includes('true') || lowerVerdict.includes('accurate')) {
      return 'default';
    }
    if (lowerVerdict.includes('false') || lowerVerdict.includes('misleading')) {
      return 'destructive';
    }
    return 'secondary';
  };

  if (!is_claim) {
    return (
      <section className="space-y-4">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-gray-500" />
              Fact-Check Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-lg mb-2">No Factual Claims Detected</h3>
              <p className="text-muted-foreground">
                This tweet doesn't appear to contain any factual claims that can be verified.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const confidencePercentage = Math.round((fact_check?.confidence || 0) * 100);
  const totalEvidence = (fact_check?.support?.length || 0) + 
                       (fact_check?.refute?.length || 0) + 
                       (fact_check?.neutral?.length || 0);

  return (
    <section className="space-y-4">
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-3">
            <span className={getVerdictColor(fact_check?.verdict || '')}>
              {getVerdictIcon(fact_check?.verdict || '')}
            </span>
            Fact-Check Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge 
                variant={getVerdictBadgeVariant(fact_check?.verdict || '')}
                className="text-lg px-4 py-2"
              >
                {fact_check?.verdict || 'Unknown'}
              </Badge>
              <span className="text-lg font-medium">
                {confidencePercentage}% confidence
              </span>
            </div>
            
            <Progress 
              value={confidencePercentage} 
              className="h-3"
            />

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">{fact_check?.searched_queries?.length || 0}</span> search queries
              </div>
              <div>
                <span className="font-medium">{totalEvidence}</span> evidence sources
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}