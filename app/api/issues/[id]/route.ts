import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import Issue from '@/lib/models/Issue';
import User from '@/lib/models/User';

async function getUser(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return null;
  await connectToDatabase();
  return User.findOne({ githubId: token.sub });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const issue = await Issue.findOne({ _id: id, userId: user._id.toString() });
  if (!issue) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(issue);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const updates = await request.json();
  const allowed = ['title', 'body', 'state', 'priority', 'labels', 'assignee'];
  const filtered: any = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }
  const issue = await Issue.findOneAndUpdate(
    { _id: id, userId: user._id.toString() },
    filtered,
    { new: true }
  );
  if (!issue) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(issue);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const issue = await Issue.findOneAndDelete({ _id: id, userId: user._id.toString() });
  if (!issue) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
}
