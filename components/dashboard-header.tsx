'use client';

import { useSession, signOut } from 'next-auth/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 p-0">
              {session?.user?.image ? (
                <img src={session.user.image} alt={session.user.name ?? ''} className="w-full h-full rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {session?.user?.name?.[0] ?? 'U'}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <div className="flex flex-col">
                <span className="font-semibold">{session?.user?.name}</span>
                <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-red-500">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
