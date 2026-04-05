'use client';

import { use, useEffect, useState } from 'react';
import { IssueDetail } from '@/components/issue-detail';
import { IIssue } from '@/lib/types';

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [issue, setIssue] = useState<IIssue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/issues/${id}`)
      .then(r => r.json())
      .then(data => { setIssue(data); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!issue || (issue as any).error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Issue Not Found</h1>
        <p className="text-muted-foreground">This issue doesn&apos;t exist or you don&apos;t have access.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <IssueDetail issue={issue} onUpdate={setIssue} />
    </div>
  );
}
