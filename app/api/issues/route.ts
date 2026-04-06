import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Issue from '@/lib/models/Issue';
import User from '@/lib/models/User';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const user = await User.findOne({ githubId: session.user.id });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

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
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const user = await User.findOne({ githubId: session.user.id });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

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
        {
          role: 'system',
          content: `You are an expert issue triager. Analyze the issue and return JSON:
          { "priority": "P0|P1|P2|P3", "labels": ["bug","feature","docs","enhancement"], "aiTriageScore": number 0-100, "aiSuggestedFix": "string" }`,
        },
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
    title,
    body: description,
    repoName,
    repoOwner,
    githubIssueId: githubIssueId || 0,
    state: 'open',
    priority: triageResult.priority,
    labels: triageResult.labels,
    aiTriageScore: triageResult.aiTriageScore,
    aiSuggestedFix: triageResult.aiSuggestedFix,
    userId: user._id.toString(),
  });

  return NextResponse.json(issue, { status: 201 });
}