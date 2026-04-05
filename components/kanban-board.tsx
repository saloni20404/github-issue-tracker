'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { IIssue } from '@/lib/types';

const priorityColors: Record<string, string> = {
  P0: 'bg-red-500 text-white',
  P1: 'bg-orange-500 text-white',
  P2: 'bg-yellow-500 text-white',
  P3: 'bg-blue-500 text-white',
};

interface KanbanCardProps {
  issue: IIssue;
}

function KanbanCard({ issue }: KanbanCardProps) {
  return (
    <Link href={`/dashboard/issues/${issue._id}`}>
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group">
        <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {issue.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{issue.body}</p>
        <div className="flex items-center gap-2 mb-3">
          <Badge className={priorityColors[issue.priority]}>{issue.priority}</Badge>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${issue.aiTriageScore}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{issue.aiTriageScore}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">{issue.repoOwner}/{issue.repoName}</span>
          {issue.assignee && (
            <span className="text-xs text-muted-foreground">@{issue.assignee}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface KanbanColumnProps {
  title: string;
  issues: IIssue[];
  color: string;
}

function KanbanColumn({ title, issues, color }: KanbanColumnProps) {
  return (
    <div className="flex flex-col flex-1 min-w-72">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h2 className="font-semibold text-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground">({issues.length})</span>
      </div>
      <div className="bg-muted/30 rounded-lg p-3 space-y-3 flex-1 min-h-48">
        {issues.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            No issues
          </div>
        ) : (
          issues.map(issue => <KanbanCard key={issue._id} issue={issue} />)
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  issues: IIssue[];
  onUpdate: (issues: IIssue[]) => void;
}

export function KanbanBoard({ issues }: KanbanBoardProps) {
  const p0p1 = issues.filter(i => i.state === 'open' && (i.priority === 'P0' || i.priority === 'P1'));
  const p2 = issues.filter(i => i.state === 'open' && i.priority === 'P2');
  const p3 = issues.filter(i => i.state === 'open' && i.priority === 'P3');
  const closed = issues.filter(i => i.state === 'closed');

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      <KanbanColumn title="Critical / High" issues={p0p1} color="bg-red-500" />
      <KanbanColumn title="Medium" issues={p2} color="bg-yellow-500" />
      <KanbanColumn title="Low" issues={p3} color="bg-blue-500" />
      <KanbanColumn title="Done" issues={closed} color="bg-gray-400" />
    </div>
  );
}
