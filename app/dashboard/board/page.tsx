'use client';

import { useState, useEffect } from 'react';
import { KanbanBoard } from '@/components/kanban-board';
import { IIssue } from '@/lib/types';

export default function BoardPage() {
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/issues')
      .then(r => r.json())
      .then(data => {
        setIssues(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Kanban Board</h1>
        <p className="text-muted-foreground">Visualize and manage your workflow</p>
      </div>
      {loading ? (
        <div className="flex gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1 min-w-72 h-96 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <KanbanBoard issues={issues} onUpdate={setIssues} />
      )}
    </div>
  );
}
