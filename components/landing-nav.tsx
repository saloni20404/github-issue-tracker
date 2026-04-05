'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingNav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">IT</span>
        </div>
        <span className="font-semibold text-foreground">Issue Tracker</span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
          Dashboard
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition">
          Docs
        </Link>
      </div>
    </nav>
  );
}
