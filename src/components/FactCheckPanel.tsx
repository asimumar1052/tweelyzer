import { AlertTriangle, CheckCircle, Clock, Search, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EvidenceCard } from './EvidenceCard';
import { formatExactTime } from '@/lib/date-utils';
import type { AnalyzeTweetResponse } from '@/types/api';

interface FactCheckPanelProps {
  data: AnalyzeTweetResponse;
}

export function FactCheckPanel({ data }: FactCheckPanelProps) {
  const { fact_check, is_claim } = data;

  const getVerdictColor = (verdict: string) => {
    const lowerVerdict = verdict.toLowerCase();
    if (lowerVerdict.includes('true') || lowerVerdict.includes('accurate')) {
      return 'verdict-true';
    }
    if (lowerVerdict.includes('false') || lowerVerdict.includes('misleading')) {
      return 'verdict-false';
    }
    return 'verdict-mixed';
  };

  const getVerdictIcon = (verdict: string) => {
    const lowerVerdict = verdict.toLowerCase();
    if (lowerVerdict.includes('true') || lowerVerdict.includes('accurate')) {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (lowerVerdict.includes('false') || lowerVerdict.includes('misleading')) {
      return <AlertTriangle className="w-5 h-5" />;
    }
    return <AlertTriangle className="w-5 h-5" />;
  };

  const confidencePercentage = Math.round((fact_check?.confidence || 0) * 100);
  const analysisTime = new Date(fact_check?.timestamp_utc || Date.now());

  const totalEvidence = (fact_check?.support?.length || 0) + 
                       (fact_check?.refute?.length || 0) + 
                       (fact_check?.neutral?.length || 0);

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getVerdictIcon(fact_check?.verdict || '')}
            Fact-Check Analysis
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {is_claim && (
          <>

            {/* Verdict */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`verdict-badge ${getVerdictColor(fact_check?.verdict || '')} flex items-center gap-2 text-lg px-4 py-2`}>
                  {getVerdictIcon(fact_check?.verdict || '')}
                  {fact_check?.verdict || 'Unknown'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {confidencePercentage}% confidence
                </span>
              </div>
              <Progress value={confidencePercentage} className="h-2" />
            </div>

            <Separator />

            {/* Evidence Summary */}
            {totalEvidence > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Evidence Summary
                </h4>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div className="text-center p-1 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="font-medium text-green-700 dark:text-green-300">
                      {fact_check?.support?.length || 0}
                    </div>
                    <div className="text-green-600 dark:text-green-400 text-[10px]">Support</div>
                  </div>
                  <div className="text-center p-1 bg-red-50 dark:bg-red-900/20 rounded">
                    <div className="font-medium text-red-700 dark:text-red-300">
                      {fact_check?.refute?.length || 0}
                    </div>
                    <div className="text-red-600 dark:text-red-400 text-[10px]">Against</div>
                  </div>
                  <div className="text-center p-1 bg-gray-50 dark:bg-gray-900/20 rounded">
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      {fact_check?.neutral?.length || 0}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-[10px]">Neutral</div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Research Summary
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{fact_check?.searched_queries?.length || 0}</strong> search queries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{fact_check?.results_considered || 0}</strong> sources analyzed
                </span>
              </div>
            </div> */}

            {/* Search Queries */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Search Queries Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {(fact_check?.searched_queries || []).map((query, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {query}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Evidence */}
            {totalEvidence > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Evidence ({totalEvidence} sources)
                </h3>

                {/* Supporting Evidence */}
                {(fact_check?.support?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Supporting Evidence ({fact_check?.support?.length || 0})
                    </h4>
                    <div className="grid gap-3">
                      {(fact_check?.support || []).map((evidence, index) => (
                        <EvidenceCard
                          key={`support-${index}`}
                          evidence={evidence}
                          type="support"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Contradicting Evidence */}
                {(fact_check?.refute?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Contradicting Evidence ({fact_check?.refute?.length || 0})
                    </h4>
                    <div className="grid gap-3">
                      {(fact_check?.refute || []).map((evidence, index) => (
                        <EvidenceCard
                          key={`refute-${index}`}
                          evidence={evidence}
                          type="refute"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Neutral Evidence */}
                {(fact_check?.neutral?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Neutral Evidence ({fact_check?.neutral?.length || 0})
                    </h4>
                    <div className="grid gap-3">
                      {(fact_check?.neutral || []).map((evidence, index) => (
                        <EvidenceCard
                          key={`neutral-${index}`}
                          evidence={evidence}
                          type="neutral"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {fact_check?.notes && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Analysis Notes
                </h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {fact_check.notes}
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border">
              <Clock className="w-3 h-3" />
              <span>Analysis generated on {formatExactTime(analysisTime)}</span>
            </div>
          </>
        )}

        {!is_claim && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-lg mb-2">No Factual Claims Detected</h3>
            <p className="text-muted-foreground">
              This tweet doesn't appear to contain any factual claims that can be verified.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}