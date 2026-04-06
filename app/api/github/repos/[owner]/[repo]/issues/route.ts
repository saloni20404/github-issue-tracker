export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { auth } from "@/auth";
import { NextRequest, NextResponse } from 'next/server';

import { Octokit } from '@octokit/rest';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Issue from '@/lib/models/Issue';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await User.findOne({ githubId: session.user.id });
  const { owner, repo } = await params;
  await connectToDatabase();
  
  if (!user?.githubAccessToken) {
    return NextResponse.json({ error: 'GitHub token not found' }, { status: 400 });
  }

  const octokit = new Octokit({ auth: user.githubAccessToken });
  const githubIssues = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'all',
    per_page: 100,
  });

  const synced = [];
  for (const issue of githubIssues.data) {
    if (issue.pull_request) continue;

    const existing = await Issue.findOne({ githubIssueId: issue.number, repoOwner: owner, repoName: repo });
    if (!existing) {
      const newIssue = await Issue.create({
        title: issue.title,
        body: issue.body || '',
        repoName: repo,
        repoOwner: owner,
        githubIssueId: issue.number,
        state: issue.state,
        labels: issue.labels.map((l: any) => l.name),
        assignee: issue.assignee?.login || null,
        userId: user._id.toString(),
        priority: 'P3',
        aiTriageScore: 0,
        aiSuggestedFix: '',
      });
      synced.push(newIssue);
    } else {
      existing.title = issue.title;
      existing.body = issue.body || '';
      existing.state = issue.state;
      existing.labels = issue.labels.map((l: any) => l.name);
      existing.assignee = issue.assignee?.login || null;
      await existing.save();
      synced.push(existing);
    }
  }

  return NextResponse.json({ synced, count: synced.length });
}
