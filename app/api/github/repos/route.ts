import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Octokit } from '@octokit/rest';
import User from '@/lib/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findOne({ githubId: token.sub });
  if (!user?.githubAccessToken) {
    return NextResponse.json({ error: 'GitHub token not found' }, { status: 400 });
  }

  const octokit = new Octokit({ auth: user.githubAccessToken });
  const repos = await octokit.repos.listForAuthenticatedUser({ per_page: 100 });
  return NextResponse.json(repos.data);
}
