'use client';

import Link from 'next/link';
import { IIssue } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const priorityColors: Record<string, string> = {
  P0: 'bg-red-500 text-white',
  P1: 'bg-orange-500 text-white',
  P2: 'bg-yellow-500 text-white',
  P3: 'bg-blue-500 text-white',
};

const labelColors: Record<string, string> = {
  bug: 'bg-red-500 text-white',
  feature: 'bg-green-500 text-white',
  docs: 'bg-gray-500 text-white',
  enhancement: 'bg-purple-500 text-white',
  security: 'bg-red-700 text-white',
  performance: 'bg-orange-600 text-white',
};

interface IssuesTableProps {
  issues: IIssue[];
  onDelete?: () => void;
}

export function IssuesTable({ issues, onDelete }: IssuesTableProps) {
  async function handleDelete(id: string) {
    await fetch(`/api/issues/${id}`, { method: 'DELETE' });
    onDelete?.();
  }

  if (issues.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No issues found. Create your first issue!</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-card">
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Repository</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Labels</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>AI Score</TableHead>
            <TableHead>Created</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue._id} className="hover:bg-muted/50">
              <TableCell>
                <Link href={`/dashboard/issues/${issue._id}`} className="text-primary hover:underline font-medium">
                  {issue.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {issue.repoOwner}/{issue.repoName}
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[issue.priority]}>{issue.priority}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {issue.labels.map((label) => (
                    <Badge key={label} className={labelColors[label] || 'bg-gray-400 text-white'}>
                      {label}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={issue.state === 'open' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                  {issue.state}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${issue.aiTriageScore}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{issue.aiTriageScore}%</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(issue.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-muted-foreground hover:text-red-500"
                  onClick={() => handleDelete(issue._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
