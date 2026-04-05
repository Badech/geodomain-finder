import { Search, Database, FileText, Inbox, Globe } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Generic empty state component
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  const DefaultIcon = Icon || Inbox;
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] text-center p-8 ${className}`}>
      <div className="rounded-full bg-muted p-6 mb-4">
        <DefaultIcon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * No search results empty state
 */
export function NoSearchResults({ onNewSearch }: { onNewSearch?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="We couldn't find any domains or businesses matching your search criteria. Try adjusting your search parameters or searching in a different location."
      action={onNewSearch ? {
        label: 'New Search',
        onClick: onNewSearch,
      } : undefined}
    />
  );
}

/**
 * No saved opportunities empty state
 */
export function NoOpportunities({ onSearch }: { onSearch?: () => void }) {
  return (
    <EmptyState
      icon={Database}
      title="No saved opportunities"
      description="You haven't saved any domain opportunities yet. Run a search to discover geo-service domains and potential business matches."
      action={onSearch ? {
        label: 'Start Searching',
        onClick: onSearch,
      } : undefined}
    />
  );
}

/**
 * No notes empty state
 */
export function NoNotes({ onAddNote }: { onAddNote?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No notes yet"
      description="Keep track of your conversations and important details by adding notes to this lead."
      action={onAddNote ? {
        label: 'Add Note',
        onClick: onAddNote,
      } : undefined}
    />
  );
}

/**
 * No leads in CRM pipeline
 */
export function NoLeads({ onSearch }: { onSearch?: () => void }) {
  return (
    <EmptyState
      icon={Inbox}
      title="No leads in pipeline"
      description="Your CRM pipeline is empty. Start by running a search to find potential business leads."
      action={onSearch ? {
        label: 'Find Leads',
        onClick: onSearch,
      } : undefined}
    />
  );
}

/**
 * No domains available
 */
export function NoDomains({ onSearch }: { onSearch?: () => void }) {
  return (
    <EmptyState
      icon={Globe}
      title="No domains found"
      description="We couldn't find any available domains for your search. Try different keywords or search in another location."
      action={onSearch ? {
        label: 'Try Different Search',
        onClick: onSearch,
      } : undefined}
    />
  );
}
