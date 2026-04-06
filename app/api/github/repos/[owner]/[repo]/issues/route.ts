export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decode } from '@auth/core/jwt';
import { Octokit } from '@octokit/rest';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Issue from '@/lib/models/Issue';

async function getUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('__Secure-authjs.session-token')?.value ||
                       cookieStore.get('authjs.session-token')?.value;
  if (!sessionToken) return null;
  const token = await decode({ token: sessionToken, secret: process.env.AUTH_SECRET!, salt: '__Secure-authjs.session-token' });
  if (!token?.email) return null;
  await connectToDatabase();
  return User.findOne({ email: token.email });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { owner, repo } = await params;

  if (!user.githubAccessToken) {
    return NextResponse.json({ error: 'GitHub token not found' }, { status: 400 });
  }

  const octokit = new Octokit({ auth: user.githubAccessToken });
  const githubIssues = await octokit.issues.listForRepo({ owner, repo, state: 'all', per_page: 100 });

  const synced = [];
  for (const issue of githubIssues.data) {
    if (issue.pull_request) continue;
    const existing = await Issue.findOne({ githubIssueId: issue.number, repoOwner: owner, repoName: repo });
    if (!existing) {
      const newIssue = await Issue.create({
        title: issue.title, body: issue.body || '', repoName: repo, repoOwner: owner,
        githubIssueId: issue.number, state: issue.state,
        labels: issue.labels.map((l: any) => l.name),
        assignee: issue.assignee?.login || null,
        userId: user._id.toString(), priority: 'P3', aiTriageScore: 0, aiSuggestedFix: '',
      });
      synced.push(newIssue);
    } else {
      existing.title = issue.title; existing.body = issue.body || '';
      existing.state = issue.state as 'open' | 'closed';
      existing.labels = issue.labels.map((l: any) => l.name);
      existing.assignee = issue.assignee?.login || null;
      await existing.save();
      synced.push(existing);
    }
  }
  return NextResponse.json({ synced, count: synced.length });
}