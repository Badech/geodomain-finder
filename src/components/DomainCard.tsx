import { DomainOpportunity } from '@/types';
import { Globe, Bookmark, BookmarkCheck, Star, TrendingUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const statusColors: Record<string, string> = {
  available: 'bg-success text-success-foreground',
  premium: 'bg-purple-500/10 text-purple-600',
  taken: 'bg-destructive/10 text-destructive',
  unknown: 'bg-warning/10 text-warning',
  error: 'bg-orange-500/10 text-orange-600',
  invalid: 'bg-gray-500/10 text-gray-600',
};

const statusLabels: Record<string, string> = {
  available: 'Available',
  premium: 'Premium',
  taken: 'Taken',
  unknown: 'Unknown',
  error: 'Error',
  invalid: 'Invalid',
};

interface DomainCardProps {
  domain: DomainOpportunity;
  onSave: (id: string) => void;
  onAssign?: (domain: DomainOpportunity) => void;
}

export function DomainCard({ domain, onSave, onAssign }: DomainCardProps) {
  const [copied, setCopied] = useState(false);

  const copyDomain = () => {
    navigator.clipboard.writeText(domain.domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group rounded-2xl border border-border bg-card p-5 hover:shadow-elevated transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-sm">{domain.domain}</h3>
              <button onClick={copyDomain} className="opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            </div>
            <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[domain.status]}`}>
              {statusLabels[domain.status]}
            </span>
          </div>
        </div>
        <button onClick={() => onSave(domain.id)} className="text-muted-foreground hover:text-primary transition-colors">
          {domain.saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <ScorePill label="Quality" score={domain.qualityScore} />
        <ScorePill label="SEO" score={domain.seoScore} />
        <ScorePill label="Resale" score={domain.resaleScore} />
      </div>

      <div className="mt-3 space-y-1">
        {domain.reasons.slice(0, 2).map((r, i) => (
          <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 text-accent shrink-0" />
            {r}
          </p>
        ))}
      </div>

      {domain.status === 'available' && onAssign && (
        <Button size="sm" variant="outline" onClick={() => onAssign(domain)} className="mt-4 w-full text-xs">
          Assign to Prospect
        </Button>
      )}
    </div>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  const color = score >= 85 ? 'text-success' : score >= 70 ? 'text-primary' : 'text-warning';
  return (
    <div className="rounded-lg bg-secondary/50 px-2 py-1.5 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{score}</p>
    </div>
  );
}
