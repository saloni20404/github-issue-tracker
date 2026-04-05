'use client';

import { useState, useEffect } from 'react';
import { IssuesTable } from '@/components/issues-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Filter, Search } from 'lucide-react';
import { IIssue } from '@/lib/types';

export default function IssuesPage() {
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    repoOwner: '',
    repoName: '',
  });

  async function fetchIssues() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (priorityFilter) params.set('priority', priorityFilter);
    if (stateFilter) params.set('state', stateFilter);
    const res = await fetch(`/api/issues?${params.toString()}`);
    const data = await res.json();
    setIssues(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchIssues(); }, [search, priorityFilter, stateFilter]);

  async function handleCreate() {
    if (!form.title || !form.description || !form.repoOwner || !form.repoName) return;
    setCreating(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setModalOpen(false);
        setForm({ title: '', description: '', repoOwner: '', repoName: '' });
        fetchIssues();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Issues</h1>
          <p className="text-muted-foreground">Manage and track all your GitHub issues</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          New Issue
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="P0">P0</SelectItem>
            <SelectItem value="P1">P1</SelectItem>
            <SelectItem value="P2">P2</SelectItem>
            <SelectItem value="P3">P3</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <IssuesTable issues={issues} onDelete={fetchIssues} />
      )}

      {/* New Issue Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Repo Owner</Label>
                <Input
                  placeholder="e.g. vercel"
                  value={form.repoOwner}
                  onChange={e => setForm(f => ({ ...f, repoOwner: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Repo Name</Label>
                <Input
                  placeholder="e.g. next.js"
                  value={form.repoName}
                  onChange={e => setForm(f => ({ ...f, repoName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                placeholder="Issue title..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the issue..."
                rows={4}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              🤖 AI will automatically triage this issue and assign priority + labels
            </p>
            <Button
              onClick={handleCreate}
              disabled={creating || !form.title || !form.description || !form.repoOwner || !form.repoName}
              className="w-full"
            >
              {creating ? 'Creating & triaging...' : 'Create Issue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
