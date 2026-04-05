export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  username: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  repoName: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  labels: string[];
  assignee: User;
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
  aiTriageScore: number;
  comments: Comment[];
  suggestedFix?: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
}

export const currentUser: User = {
  id: 'user-1',
  name: 'Alex Chen',
  email: 'alex@github.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  username: 'alexchen',
};

const mockUsers: User[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'Sarah Wilson',
    email: 'sarah@github.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    username: 'sarahwilson',
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike@github.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    username: 'mikej',
  },
  {
    id: 'user-4',
    name: 'Emma Davis',
    email: 'emma@github.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    username: 'emmadavis',
  },
];

export const mockIssues: Issue[] = [
  {
    id: 'issue-1',
    title: 'Fix authentication flow for OAuth providers',
    description: 'The OAuth callback is not properly handling edge cases when multiple providers are configured. Users are experiencing redirect loops in some scenarios.',
    repoName: 'vercel/next.js',
    priority: 'P0',
    labels: ['bug', 'auth'],
    assignee: mockUsers[1],
    status: 'open',
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-18T14:22:00Z',
    aiTriageScore: 0.95,
    suggestedFix: 'Add state validation in OAuth callback handler and implement retry logic with exponential backoff.',
    comments: [
      {
        id: 'comment-1',
        author: mockUsers[1],
        content: 'I can reproduce this issue when using Google and GitHub OAuth simultaneously.',
        createdAt: '2024-01-16T10:15:00Z',
      },
      {
        id: 'comment-2',
        author: mockUsers[3],
        content: 'We should also add better error logging to understand what\'s happening in the redirect flow.',
        createdAt: '2024-01-16T12:30:00Z',
      },
    ],
  },
  {
    id: 'issue-2',
    title: 'Implement dark mode support for dashboard',
    description: 'Add comprehensive dark mode support across all dashboard pages and components. Should respect system preferences and allow manual toggle.',
    repoName: 'vercel/dashboard',
    priority: 'P1',
    labels: ['feature', 'ui'],
    assignee: mockUsers[2],
    status: 'open',
    createdAt: '2024-01-10T16:45:00Z',
    updatedAt: '2024-01-18T09:20:00Z',
    aiTriageScore: 0.78,
    suggestedFix: 'Integrate next-themes and update all components with proper color scheme detection.',
    comments: [
      {
        id: 'comment-3',
        author: mockUsers[0],
        content: 'Happy to help with the implementation. I can start with the core layout components.',
        createdAt: '2024-01-15T11:00:00Z',
      },
    ],
  },
  {
    id: 'issue-3',
    title: 'Performance regression in data fetching',
    description: 'Queries are running 40% slower than they did in v1.2.0. Appears to be related to the new query optimization layer.',
    repoName: 'vercel/postgres',
    priority: 'P0',
    labels: ['bug', 'performance'],
    assignee: mockUsers[2],
    status: 'closed',
    createdAt: '2024-01-05T13:20:00Z',
    updatedAt: '2024-01-17T16:45:00Z',
    aiTriageScore: 0.92,
    suggestedFix: 'Investigate query plan generation in the optimization layer and add index hints where appropriate.',
    comments: [
      {
        id: 'comment-4',
        author: mockUsers[2],
        content: 'Fixed by reverting the optimization layer and implementing proper index strategies.',
        createdAt: '2024-01-17T16:45:00Z',
      },
    ],
  },
  {
    id: 'issue-4',
    title: 'Update documentation for new API endpoints',
    description: 'API v3 has new endpoints that need comprehensive documentation with examples and migration guides from v2.',
    repoName: 'vercel/docs',
    priority: 'P2',
    labels: ['docs'],
    assignee: mockUsers[3],
    status: 'open',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-18T11:30:00Z',
    aiTriageScore: 0.65,
    suggestedFix: 'Create comprehensive migration guide with code examples and deprecation notices.',
    comments: [],
  },
  {
    id: 'issue-5',
    title: 'Add WebSocket support for real-time updates',
    description: 'Implement WebSocket connections to provide real-time updates for issue tracking and team collaboration features.',
    repoName: 'vercel/next.js',
    priority: 'P1',
    labels: ['feature', 'enhancement'],
    assignee: mockUsers[1],
    status: 'open',
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-18T13:45:00Z',
    aiTriageScore: 0.88,
    suggestedFix: 'Implement using socket.io with Redis pub/sub for scalable multi-server support.',
    comments: [
      {
        id: 'comment-5',
        author: mockUsers[1],
        content: 'Started prototyping with socket.io. Performance looks good with 1000+ concurrent connections.',
        createdAt: '2024-01-16T15:20:00Z',
      },
    ],
  },
  {
    id: 'issue-6',
    title: 'Memory leak in component lifecycle',
    description: 'Memory usage grows unbounded when rapidly mounting and unmounting large component trees. Affects server-side rendering performance.',
    repoName: 'vercel/react-lib',
    priority: 'P0',
    labels: ['bug', 'critical'],
    assignee: mockUsers[0],
    status: 'open',
    createdAt: '2024-01-08T14:30:00Z',
    updatedAt: '2024-01-18T10:15:00Z',
    aiTriageScore: 0.97,
    suggestedFix: 'Audit useEffect cleanup functions and ensure proper event listener removal. Consider using WeakMap for internal caches.',
    comments: [
      {
        id: 'comment-6',
        author: mockUsers[0],
        content: 'Found the issue in the context cleanup. PR incoming with fix.',
        createdAt: '2024-01-18T10:15:00Z',
      },
    ],
  },
  {
    id: 'issue-7',
    title: 'Add TypeScript support for config files',
    description: 'Allow users to define configuration in TypeScript for better IDE support and type safety.',
    repoName: 'vercel/next.js',
    priority: 'P2',
    labels: ['feature'],
    assignee: mockUsers[3],
    status: 'open',
    createdAt: '2024-01-13T11:45:00Z',
    updatedAt: '2024-01-17T09:30:00Z',
    aiTriageScore: 0.72,
    suggestedFix: 'Implement config loader that supports TypeScript transpilation with jiti or similar.',
    comments: [],
  },
  {
    id: 'issue-8',
    title: 'Implement rate limiting middleware',
    description: 'Add middleware for rate limiting API requests to prevent abuse and ensure fair resource allocation.',
    repoName: 'vercel/api-gateway',
    priority: 'P1',
    labels: ['feature', 'security'],
    assignee: mockUsers[2],
    status: 'open',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-18T15:00:00Z',
    aiTriageScore: 0.85,
    suggestedFix: 'Use token bucket algorithm with Redis for distributed rate limiting across multiple servers.',
    comments: [
      {
        id: 'comment-7',
        author: mockUsers[2],
        content: 'Started implementation. Need to decide on rate limit tiers and response headers format.',
        createdAt: '2024-01-18T15:00:00Z',
      },
    ],
  },
];

export const repositories = [
  'vercel/next.js',
  'vercel/dashboard',
  'vercel/postgres',
  'vercel/docs',
  'vercel/react-lib',
  'vercel/api-gateway',
];
