'use client';

import { Button } from '@/components/ui/button';

export function LandingHero() {
  return (
    <section className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
          Professional Issue Tracking for Modern Teams
        </h1>
        <p className="text-lg text-muted-foreground mb-8 text-balance">
          Manage GitHub issues with AI-powered triage, kanban boards, and collaborative workflows. Built for developers, by developers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/api/auth/signin/github">
            <Button size="lg" className="w-full sm:w-auto">
              Sign in with GitHub
            </Button>
          </a>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            View Documentation
          </Button>
        </div>
      </div>
    </section>
  )
}