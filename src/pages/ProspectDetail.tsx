import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Phone, Mail, MapPin, Star, ExternalLink, Copy, Check, MessageSquare, Tag, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppState } from '@/hooks/useAppState';
import { CopyableField } from '@/components/BusinessCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus } from '@/types';

export default function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { businesses, activityNotes, addNote, updateLeadStatus, domains } = useAppState();
  const [noteText, setNoteText] = useState('');

  const lead = businesses.find(b => b.id === id);
  if (!lead) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="font-display text-xl font-bold">Prospect not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const notes = activityNotes.filter(n => n.businessLeadId === lead.id);
  const recommendedDomains = domains.filter(d => d.status === 'available').slice(0, 3);

  const fitReasons = [
    `Exact geo-service match for "${lead.city}" + "${lead.niche}"`,
    lead.currentDomain?.includes('wix') || lead.currentDomain?.includes('weebly') || lead.currentDomain?.includes('squarespace') || lead.currentDomain?.includes('godaddy')
      ? 'Currently on a free website builder subdomain'
      : !lead.website ? 'No website — needs a strong domain' : 'Current domain is not geo-optimized',
    `${lead.reviewCount} reviews show established local presence`,
    'Generic geo-service domain improves brand recall',
    'Stronger local SEO positioning vs current domain',
  ];

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addNote(lead.id, noteText.trim());
    setNoteText('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <span className="font-display font-semibold">{lead.name}</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Summary */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold">{lead.name}</h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {lead.address}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="font-semibold">{lead.rating}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">({lead.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v as LeadStatus)}>
                    <SelectTrigger className="w-[140px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['new', 'saved', 'contacted', 'interested', 'follow-up', 'closed'] as LeadStatus[]).map(s => (
                        <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <CopyableField icon={<Phone className="h-3.5 w-3.5" />} value={lead.phone} />
                  {lead.email && <CopyableField icon={<Mail className="h-3.5 w-3.5" />} value={lead.email} />}
                  {lead.website && <CopyableField icon={<Globe className="h-3.5 w-3.5" />} value={lead.website} />}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Buyer Score</p>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${lead.buyerScore}%` }} />
                    </div>
                    <span className="text-lg font-bold font-display">{lead.buyerScore}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {lead.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <Tag className="h-2.5 w-2.5" /> {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Why this domain fits */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <h3 className="font-display font-semibold">Why this domain is a fit</h3>
              {lead.recommendedDomain && (
                <p className="mt-1 text-sm text-primary font-semibold">{lead.recommendedDomain}</p>
              )}
              <div className="mt-4 space-y-2">
                {fitReasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground">{r}</span>
                  </div>
                ))}
              </div>
              {lead.matchReason && (
                <p className="mt-4 text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">{lead.matchReason}</p>
              )}
            </div>

            {/* Outreach Angle */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <h3 className="font-display font-semibold">Outreach Angle</h3>
              <div className="mt-3 rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground leading-relaxed">
                <p>Hi, I noticed {lead.name} has strong reviews ({lead.rating}★, {lead.reviewCount} reviews) but {lead.website ? 'could benefit from a stronger domain' : 'doesn\'t have a website yet'}.
                I have {lead.recommendedDomain || 'a premium geo-service domain'} available — an exact match for {lead.niche} in {lead.city}.
                Would you be interested in discussing how it could help your online presence?</p>
              </div>
              <Button variant="outline" size="sm" className="mt-3 text-xs"
                onClick={() => navigator.clipboard.writeText(`Hi, I noticed ${lead.name} has strong reviews...`)}>
                <Copy className="mr-1 h-3 w-3" /> Copy outreach angle
              </Button>
            </div>

            {/* Notes Timeline */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <h3 className="font-display font-semibold mb-4">Activity Notes</h3>
              <div className="flex gap-2">
                <Textarea placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)}
                  className="min-h-[60px] text-sm" />
                <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()} className="shrink-0 self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {notes.length === 0 ? (
                <p className="mt-4 text-xs text-muted-foreground">No notes yet. Add one above.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {notes.map(note => (
                    <div key={note.id} className="flex gap-3 border-l-2 border-border pl-3">
                      <div>
                        <p className="text-sm">{note.content}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{note.createdAt.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Domain Analysis */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant">
              <h3 className="font-display font-semibold text-sm">Current Domain Analysis</h3>
              <div className="mt-3">
                {lead.currentDomain ? (
                  <div>
                    <p className="text-sm font-medium">{lead.currentDomain}</p>
                    <div className="mt-2 space-y-1">
                      {(lead.currentDomain.includes('wix') || lead.currentDomain.includes('weebly') || lead.currentDomain.includes('squarespace') || lead.currentDomain.includes('godaddy')) && (
                        <p className="text-xs text-destructive">⚠ Free website builder subdomain</p>
                      )}
                      {lead.currentDomain.length > 25 && (
                        <p className="text-xs text-warning">⚠ Domain is too long for easy recall</p>
                      )}
                      <p className="text-xs text-muted-foreground">Not optimized for local geo-search</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-destructive">No website detected</p>
                )}
              </div>
            </div>

            {/* Recommended Domains */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant">
              <h3 className="font-display font-semibold text-sm">Recommended Domains</h3>
              <div className="mt-3 space-y-2">
                {recommendedDomains.map(d => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold">{d.domain}</p>
                      <p className="text-[10px] text-muted-foreground">Score: {d.qualityScore}/100</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-success" />
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-5 flex flex-col items-center justify-center h-48">
              <MapPin className="h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-xs text-muted-foreground">Map view coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
