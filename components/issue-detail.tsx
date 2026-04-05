'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IIssue } from '@/lib/types';

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

interface IssueDetailProps {
  issue: IIssue;
  onUpdate: (issue: IIssue) => void;
}

export function IssueDetail({ issue, onUpdate }: IssueDetailProps) {
  const [triaging, setTriaging] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleTriage() {
    setTriaging(true);
    try {
      const res = await fetch(`/api/issues/${issue._id}/triage`, { method: 'POST' });
      const updated = await res.json();
      onUpdate(updated);
    } finally {
      setTriaging(false);
    }
  }

  async function handleStateChange(state: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/issues/${issue._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });
      const updated = await res.json();
      onUpdate(updated);
    } finally {
      setUpdating(false);
    }
  }

  async function handlePriorityChange(priority: string) {
    const res = await fetch(`/api/issues/${issue._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    });
    const updated = await res.json();
    onUpdate(updated);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard/issues" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Issues
      </Link>

      <div className="grid grid-cols-3 gap-8">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">{issue.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={issue.state === 'open' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                {issue.state}
              </Badge>
              <Badge className={priorityColors[issue.priority]}>{issue.priority}</Badge>
              {issue.labels.map(label => (
                <Badge key={label} className={labelColors[label] || 'bg-gray-400 text-white'}>{label}</Badge>
              ))}
              <span className="text-sm text-muted-foreground">
                Created {new Date(issue.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Description</h2>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{issue.body}</p>
          </div>

          {/* AI Suggested Fix */}
          {issue.aiSuggestedFix && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">AI Suggested Fix</h2>
              </div>
              <p className="text-foreground leading-relaxed">{issue.aiSuggestedFix}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-20 space-y-6">

            {/* Re-triage button */}
            <Button
              onClick={handleTriage}
              disabled={triaging}
              className="w-full gap-2"
              variant="outline"
            >
              <Sparkles className="w-4 h-4" />
              {triaging ? 'Triaging...' : 'Re-run AI Triage'}
            </Button>

            {/* State */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">State</h3>
              <Select value={issue.state} onValueChange={handleStateChange} disabled={updating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Priority</h3>
              <Select value={issue.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P0">P0 - Critical</SelectItem>
                  <SelectItem value="P1">P1 - High</SelectItem>
                  <SelectItem value="P2">P2 - Medium</SelectItem>
                  <SelectItem value="P3">P3 - Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Score */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">AI Triage Score</h3>
              <div className="bg-background rounded-lg p-4">
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary transition-all" style={{ width: `${issue.aiTriageScore}%` }} />
                </div>
                <p className="text-2xl font-bold text-foreground">{issue.aiTriageScore}%</p>
              </div>
            </div>

            {/* Repository */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Repository</h3>
              <p className="text-sm font-mono text-foreground">{issue.repoOwner}/{issue.repoName}</p>
            </div>

            {/* Assignee */}
            {issue.assignee && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Assignee</h3>
                <p className="text-sm text-foreground">@{issue.assignee}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
