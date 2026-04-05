'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Layers3, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/issues', label: 'Issues', icon: FileText },
  { href: '/dashboard/board', label: 'Board', icon: Layers3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground hidden md:flex flex-col">
      <div className="flex items-center gap-2 px-6 py-6 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">IT</span>
        </div>
        <span className="font-semibold">Issue Tracker</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-6 border-t border-border">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
      </div>
    </aside>
  );
}
