'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface Repo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  description: string | null;
  open_issues_count: number;
  private: boolean;
}

interface SyncResult {
  repo: string;
  count: number;
  error?: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});
  const [reposLoaded, setReposLoaded] = useState(false);

  async function loadRepos() {
    setLoadingRepos(true);
    try {
      const res = await fetch('/api/github/repos');
      const data = await res.json();
      setRepos(Array.isArray(data) ? data.slice(0, 20) : []);
      setReposLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRepos(false);
    }
  }

  async function syncRepo(owner: string, repo: string) {
    const key = `${owner}/${repo}`;
    setSyncing(key);
    try {
      const res = await fetch(`/api/github/repos/${owner}/${repo}/issues`);
      const data = await res.json();
      setSyncResults(prev => ({
        ...prev,
        [key]: { repo: key, count: data.count ?? 0 },
      }));
    } catch (e) {
      setSyncResults(prev => ({
        ...prev,
        [key]: { repo: key, count: 0, error: 'Sync failed' },
      }));
    } finally {
      setSyncing(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and sync GitHub repositories</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your GitHub account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {session?.user?.image && (
                <img src={session.user.image} alt="" className="w-12 h-12 rounded-full" />
              )}
              <div>
                <p className="font-semibold text-foreground">{session?.user?.name}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
              <Badge className="ml-auto bg-green-500 text-white">Connected</Badge>
            </div>
          </CardContent>
        </Card>

        {/* GitHub Repo Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Repositories
            </CardTitle>
            <CardDescription>
              Sync issues from your GitHub repositories into the tracker
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!reposLoaded ? (
              <Button onClick={loadRepos} disabled={loadingRepos} className="w-full gap-2">
                <Github className="w-4 h-4" />
                {loadingRepos ? 'Loading repos...' : 'Load My Repositories'}
              </Button>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{repos.length} repositories found</p>
                  <Button variant="ghost" size="sm" onClick={loadRepos} disabled={loadingRepos}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {repos.map(repo => {
                    const key = `${repo.owner.login}/${repo.name}`;
                    const result = syncResults[key];
                    const isSyncing = syncing === key;
                    return (
                      <div key={repo.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground text-sm truncate">{repo.full_name}</p>
                            {repo.private && <Badge variant="outline" className="text-xs">Private</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {repo.open_issues_count} open issues
                          </p>
                          {result && (
                            <p className={`text-xs mt-1 flex items-center gap-1 ${result.error ? 'text-red-500' : 'text-green-500'}`}>
                              {result.error ? (
                                <><AlertCircle className="w-3 h-3" />{result.error}</>
                              ) : (
                                <><Check className="w-3 h-3" />Synced {result.count} issues</>
                              )}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={result && !result.error ? 'outline' : 'default'}
                          disabled={isSyncing}
                          onClick={() => syncRepo(repo.owner.login, repo.name)}
                          className="ml-3 shrink-0"
                        >
                          {isSyncing ? (
                            <><RefreshCw className="w-3 h-3 animate-spin mr-1" />Syncing</>
                          ) : result && !result.error ? (
                            <><RefreshCw className="w-3 h-3 mr-1" />Re-sync</>
                          ) : (
                            'Sync Issues'
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
