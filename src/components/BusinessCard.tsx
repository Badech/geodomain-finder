import { BusinessLead } from '@/types';
import { Phone, Mail, Globe, Star, Copy, Check, ExternalLink, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const statusBadge: Record<string, string> = {
  new: 'bg-info/10 text-info',
  saved: 'bg-primary/10 text-primary',
  contacted: 'bg-accent/10 text-accent-foreground',
  interested: 'bg-success/10 text-success',
  'follow-up': 'bg-warning/10 text-warning',
  closed: 'bg-muted text-muted-foreground',
};

export function BusinessCard({ lead }: { lead: BusinessLead }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-elevated transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display font-semibold">{lead.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {lead.city}, {lead.state}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusBadge[lead.status]}`}>
          {lead.status}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-accent fill-accent" />
          <span className="text-sm font-semibold">{lead.rating}</span>
        </div>
        <span className="text-xs text-muted-foreground">({lead.reviewCount} reviews)</span>
      </div>

      <div className="mt-3 space-y-1.5">
        <CopyableField icon={<Phone className="h-3.5 w-3.5" />} value={lead.phone} />
        {lead.email && <CopyableField icon={<Mail className="h-3.5 w-3.5" />} value={lead.email} />}
        {lead.website && <CopyableField icon={<Globe className="h-3.5 w-3.5" />} value={lead.website} />}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground">Buyer Score</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${lead.buyerScore}%` }} />
            </div>
            <span className="text-xs font-bold">{lead.buyerScore}</span>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate(`/prospect/${lead.id}`)} className="text-xs">
          View Details
        </Button>
      </div>

      {lead.recommendedDomain && (
        <div className="mt-3 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
          <p className="text-[10px] text-muted-foreground">Recommended Domain</p>
          <p className="text-sm font-semibold text-primary">{lead.recommendedDomain}</p>
        </div>
      )}
    </div>
  );
}

export function CopyableField({ icon, value }: { icon: React.ReactNode; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="group flex items-center gap-2 text-xs text-muted-foreground">
      {icon}
      <span className="truncate">{value}</span>
      <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0">
        {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}

// Table view for desktop
export function BusinessTable({ leads, onViewDetail }: { leads: BusinessLead[]; onViewDetail: (id: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-3 text-left font-display font-semibold text-xs text-muted-foreground">Business</th>
            <th className="px-4 py-3 text-left font-display font-semibold text-xs text-muted-foreground hidden md:table-cell">Phone</th>
            <th className="px-4 py-3 text-left font-display font-semibold text-xs text-muted-foreground hidden lg:table-cell">Website</th>
            <th className="px-4 py-3 text-center font-display font-semibold text-xs text-muted-foreground">Rating</th>
            <th className="px-4 py-3 text-center font-display font-semibold text-xs text-muted-foreground">Buyer Score</th>
            <th className="px-4 py-3 text-left font-display font-semibold text-xs text-muted-foreground hidden xl:table-cell">Recommended</th>
            <th className="px-4 py-3 text-center font-display font-semibold text-xs text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right font-display font-semibold text-xs text-muted-foreground">Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3">
                <p className="font-semibold">{lead.name}</p>
                <p className="text-xs text-muted-foreground">{lead.city}, {lead.state}</p>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{lead.phone}</td>
              <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs truncate max-w-[180px]">{lead.currentDomain || '—'}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 text-accent fill-accent" /> {lead.rating}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${lead.buyerScore}%` }} />
                  </div>
                  <span className="text-xs font-bold">{lead.buyerScore}</span>
                </div>
              </td>
              <td className="px-4 py-3 hidden xl:table-cell">
                {lead.recommendedDomain && (
                  <span className="text-xs font-medium text-primary">{lead.recommendedDomain}</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[lead.status]}`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="ghost" onClick={() => onViewDetail(lead.id)} className="text-xs">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
