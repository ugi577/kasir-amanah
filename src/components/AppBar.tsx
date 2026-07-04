'use client';

import Link from 'next/link';

export function AppBar({
  title,
  action,
  showHome,
}: {
  title: string;
  action?: React.ReactNode;
  showHome?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md shadow-primary/20">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {showHome && (
            <Link href="/" className="shrink-0 text-lg opacity-90 active:opacity-70">
              ⚖️
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-tight">
              {title}
            </h1>
            <p className="text-[10px] opacity-70">Kasir Amanah</p>
          </div>
        </div>
        {action}
      </div>
    </header>
  );
}
