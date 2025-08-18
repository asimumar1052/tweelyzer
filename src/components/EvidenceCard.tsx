import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { EvidenceItem } from '@/types/api';

interface EvidenceCardProps {
  evidence: EvidenceItem;
  type: 'support' | 'refute' | 'neutral';
}

export function EvidenceCard({ evidence, type }: EvidenceCardProps) {
  const getCardClass = () => {
    switch (type) {
      case 'support':
        return 'evidence-card evidence-support';
      case 'refute':
        return 'evidence-card evidence-refute';
      case 'neutral':
        return 'evidence-card evidence-neutral';
      default:
        return 'evidence-card evidence-neutral';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'support':
        return 'Supporting';
      case 'refute':
        return 'Contradicting';
      case 'neutral':
        return 'Neutral';
      default:
        return 'Neutral';
    }
  };

  const confidence = Math.round(evidence.score * 100);

  return (
    <div className={getCardClass()}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h4 className="font-medium text-sm leading-5 line-clamp-2 cursor-help">
                  {evidence.title}
                </h4>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm">
                <p>{evidence.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
          <a href={evidence.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
        {evidence.evidence}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">{getTypeLabel()}</span>
          <span className="text-muted-foreground">{confidence}% confidence</span>
        </div>
        <Progress value={confidence} className="h-1.5" />
      </div>
    </div>
  );
}