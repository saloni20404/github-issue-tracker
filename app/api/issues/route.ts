export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decode } from '@auth/core/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import Issue from '@/lib/models/Issue';
import User from '@/lib/models/User';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const priority = searchParams.get('priority');
  const search = searchParams.get('search');

  const filter: any = { userId: user._id.toString() };
  if (state && ['open', 'closed'].includes(state)) filter.state = state;
  if (priority && ['P0', 'P1', 'P2', 'P3'].includes(priority)) filter.priority = priority;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { body: { $regex: search, $options: 'i' } },
    ];
  }

  const issues = await Issue.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(issues);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, description, repoOwner, repoName, githubIssueId } = body;

  if (!title || !description || !repoOwner || !repoName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  let triageResult = { priority: 'P3' as const, labels: [] as string[], aiTriageScore: 0, aiSuggestedFix: '' };
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `You are an expert issue triager. Return JSON: { "priority": "P0|P1|P2|P3", "labels": ["bug","feature","docs","enhancement"], "aiTriageScore": number 0-100, "aiSuggestedFix": "string" }` },
        { role: 'user', content: `Title: ${title}\nDescription: ${description}` },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    triageResult = {
      priority: result.priority || 'P3',
      labels: result.labels || [],
      aiTriageScore: result.aiTriageScore || 0,
      aiSuggestedFix: result.aiSuggestedFix || '',
    };
  } catch (error) {
    console.error('AI triage failed:', error);
  }

  const issue = await Issue.create({
    title, body: description, repoName, repoOwner,
    githubIssueId: githubIssueId || Math.floor(Math.random() * 1000000),
    state: 'open',
    priority: triageResult.priority,
    labels: triageResult.labels,
    aiTriageScore: triageResult.aiTriageScore,
    aiSuggestedFix: triageResult.aiSuggestedFix,
    userId: user._id.toString(),
  });

  return NextResponse.json(issue, { status: 201 });
}