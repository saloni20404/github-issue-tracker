import { auth } from "@/auth";
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Issue from '@/lib/models/Issue';
import User from '@/lib/models/User';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;
  const issue = await Issue.findOne({ _id: id, userId: user._id.toString() });
  if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert issue triager. Analyze the issue and return JSON:
          { "priority": "P0|P1|P2|P3", "labels": ["bug","feature","docs","enhancement"], "aiTriageScore": number 0-100, "aiSuggestedFix": "string" }`,
        },
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
    console.error('AI triage error:', error);
    return NextResponse.json({ error: 'AI triage failed' }, { status: 500 });
  }
}
