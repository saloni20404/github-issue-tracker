export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { auth } from "@/auth";
import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import User from '@/lib/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const session = await auth.apply(null, [request] as any)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!user.githubAccessToken) {
    return NextResponse.json({ error: 'GitHub token not found' }, { status: 400 });
  }

  try {
    const octokit = new Octokit({ auth: user.githubAccessToken });
    const repos = await octokit.repos.listForAuthenticatedUser({ per_page: 100 });
    return NextResponse.json(repos.data);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 });
  }
}