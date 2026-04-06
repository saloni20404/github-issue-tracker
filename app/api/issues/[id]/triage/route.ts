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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const issue = await Issue.findOne({ _id: id, userId: user._id.toString() });
  if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `You are an expert issue triager. Return JSON: { "priority": "P0|P1|P2|P3", "labels": ["bug","feature","docs","enhancement"], "aiTriageScore": number 0-100, "aiSuggestedFix": "string" }` },
        { role: 'user', content: `Title: ${issue.title}\nDescription: ${issue.body}` },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    const updated = await Issue.findByIdAndUpdate(id, {
      priority: result.priority || issue.priority,
      labels: result.labels || issue.labels,
      aiTriageScore: result.aiTriageScore || issue.aiTriageScore,
      aiSuggestedFix: result.aiSuggestedFix || issue.aiSuggestedFix,
    }, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'AI triage failed' }, { status: 500 });
  }
}
