export interface IIssue {
  _id: string;
  title: string;
  body: string;
  repoName: string;
  repoOwner: string;
  githubIssueId: number;
  state: 'open' | 'closed';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  labels: string[];
  assignee: string | null;
  aiTriageScore: number;
  aiSuggestedFix: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
