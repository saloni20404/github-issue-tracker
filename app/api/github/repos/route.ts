export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decode } from '@auth/core/jwt';
import { Octokit } from '@octokit/rest';
import User from '@/lib/models/User';
import { connectToDatabase } from '@/lib/mongodb';

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

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
