import mongoose, { Schema, Document } from 'mongoose';

export interface IIssue extends Document {
  title: string;
  body: string;
  repoName: string;
  repoOwner: string;
  githubIssueId: number;
  state: 'open' | 'closed';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  labels: string[];
  assignee: string | null;
  aiTriageScore: number; // 0-100
  aiSuggestedFix: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string; // reference to User model (githubId)
}

const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    repoName: { type: String, required: true },
    repoOwner: { type: String, required: true },
    githubIssueId: { type: Number, required: true, unique: true },
    state: { type: String, enum: ['open', 'closed'], default: 'open' },
    priority: { type: String, enum: ['P0', 'P1', 'P2', 'P3'], default: 'P3' },
    labels: [{ type: String }],
    assignee: { type: String, default: null },
    aiTriageScore: { type: Number, default: 0, min: 0, max: 100 },
    aiSuggestedFix: { type: String, default: '' },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);