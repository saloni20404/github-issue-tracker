import { auth } from "@/auth";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';

import { Octokit } from '@octokit/rest';
import User from '@/lib/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await User.findOne({ githubId: session.user.id });

  await connectToDatabase();
  
  if (!user?.githubAccessToken) {
    return NextResponse.json({ error: 'GitHub token not found' }, { status: 400 });
  }

  const octokit = new Octokit({ auth: user.githubAccessToken });
  const repos = await octokit.repos.listForAuthenticatedUser({ per_page: 100 });
  return NextResponse.json(repos.data);
}
