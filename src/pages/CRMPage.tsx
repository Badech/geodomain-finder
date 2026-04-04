import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Globe, Phone, Mail, Star, ArrowLeft, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/hooks/useAppState';
import { LeadStatus } from '@/types';

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-info/10 border-info/30' },
  { id: 'saved', label: 'Saved', color: 'bg-primary/10 border-primary/30' },
  { id: 'contacted', label: 'Contacted', color: 'bg-accent/10 border-accent/30' },
  { id: 'interested', label: 'Interested', color: 'bg-success/10 border-success/30' },
  { id: 'follow-up', label: 'Follow-up', color: 'bg-warning/10 border-warning/30' },
  { id: 'closed', label: 'Closed', color: 'bg-muted border-border' },
];

export default function CRMPage() {
  const navigate = useNavigate();
  const { businesses, updateLeadStatus } = useAppState();

  const columns = useMemo(() => {
    return COLUMNS.map(col => ({
      ...col,
      leads: businesses.filter(b => b.status === col.id),
    }));
  }, [businesses]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as LeadStatus;
    updateLeadStatus(result.draggableId, newStatus);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
            </Button>
          </div>
          <span className="font-display font-bold">CRM Pipeline</span>
          <div className="w-20" />
        </div>
      </header>

      <div className="p-4 overflow-x-auto">
        {businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Globe className="h-16 w-16 text-muted-foreground/30" />
            <h2 className="mt-4 font-display text-xl font-bold">No prospects yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Search for businesses in the dashboard to populate your pipeline.</p>
            <Button className="mt-6" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 min-w-[1200px]">
              {columns.map(col => (
                <div key={col.id} className="flex-1 min-w-[200px]">
                  <div className={`rounded-xl border ${col.color} px-3 py-2 mb-3`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-sm font-semibold capitalize">{col.label}</h3>
                      <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-bold">{col.leads.length}</span>
                    </div>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        className={`space-y-2 min-h-[200px] rounded-xl p-1 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}>
                        {col.leads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps}
                                className={`rounded-xl border border-border bg-card p-3 shadow-elegant cursor-pointer transition-shadow
                                  ${snapshot.isDragging ? 'shadow-prominent rotate-1' : 'hover:shadow-elevated'}`}
                                onClick={() => navigate(`/prospect/${lead.id}`)}>
                                <div className="flex items-start gap-2">
                                  <div {...provided.dragHandleProps} className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground">
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-display font-semibold text-sm truncate">{lead.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{lead.city}, {lead.state}</p>
                                    <div className="mt-2 space-y-1">
                                      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Phone className="h-2.5 w-2.5" /> {lead.phone}
                                      </p>
                                      {lead.email && (
                                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                          <Mail className="h-2.5 w-2.5" /> {lead.email}
                                        </p>
                                      )}
                                    </div>
                                    {lead.recommendedDomain && (
                                      <p className="mt-2 text-[10px] font-semibold text-primary truncate">{lead.recommendedDomain}</p>
                                    )}
                                    <div className="mt-2 flex items-center justify-between">
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-accent fill-accent" />
                                        <span className="text-[10px] font-medium">{lead.rating}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="h-1 w-8 overflow-hidden rounded-full bg-secondary">
                                          <div className="h-full rounded-full bg-primary" style={{ width: `${lead.buyerScore}%` }} />
                                        </div>
                                        <span className="text-[10px] font-bold">{lead.buyerScore}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
