/**
 * Search Progress Component
 * Displays live search progress with animated indicators
 */

import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SearchProgressProps {
  status: string;
  progress?: number;
  stage?: string;
}

export function SearchProgress({ status, progress, stage }: SearchProgressProps) {
  return (
    <div className="space-y-3">
      {/* Status message */}
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm font-medium text-foreground">{status}</span>
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Stage indicator */}
      {stage && (
        <div className="flex gap-2 text-xs text-muted-foreground">
          {getStageIndicators(stage).map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1 ${
                item.active ? 'text-primary font-medium' : ''
              }`}
            >
              {item.active && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStageIndicators(currentStage: string) {
  const stages = [
    { key: 'generating', label: 'Generate' },
    { key: 'checking-availability', label: 'Check' },
    { key: 'searching-businesses', label: 'Find' },
    { key: 'enriching', label: 'Enrich' },
  ];

  const stageOrder = [
    'generating',
    'domains-generated',
    'checking-availability',
    'domain-checked',
    'availability-complete',
    'searching-businesses',
    'businesses-found',
    'enriching',
    'business-enriched',
    'enrichment-complete',
    'complete',
  ];

  const currentIndex = stageOrder.indexOf(currentStage);

  return stages.map((stage, idx) => ({
    ...stage,
    active: currentIndex >= idx * 2 && currentIndex < (idx + 1) * 2 + 1,
  }));
}
