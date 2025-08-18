import { AlertTriangle, CheckCircle, Search, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AnalyzeTweetResponse } from '@/types/api';

interface FactCheckCompactProps {
  data: AnalyzeTweetResponse;
}

export function FactCheckCompact({ data }: FactCheckCompactProps) {
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
      return <CheckCircle className="w-4 h-4" />;
    }
    if (lowerVerdict.includes('false') || lowerVerdict.includes('misleading')) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <AlertTriangle className="w-4 h-4" />;
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

  const confidencePercentage = Math.round((fact_check?.confidence || 0) * 100);
  const totalEvidence = (fact_check?.support?.length || 0) + 
                       (fact_check?.refute?.length || 0) + 
                       (fact_check?.neutral?.length || 0);

  if (!is_claim) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-500" />
            Fact-Check Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-medium text-sm mb-1">No Claims Detected</h3>
            <p className="text-xs text-muted-foreground">
              No factual claims to verify.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className={getVerdictColor(fact_check?.verdict || '')}>
            {getVerdictIcon(fact_check?.verdict || '')}
          </span>
          Fact-Check Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Verdict */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge 
              variant={getVerdictBadgeVariant(fact_check?.verdict || '')}
              className="text-sm px-2 py-1"
            >
              {fact_check?.verdict || 'Unknown'}
            </Badge>
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
        </div>

      </CardContent>
    </Card>
  );
}
