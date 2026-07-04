'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV = [
  { href: '/kasir', label: 'Kasir', icon: '💰' },
  { href: '/produk', label: 'Produk', icon: '📦' },
  { href: '/pelanggan', label: 'Pelanggan', icon: '👥' },
  { href: '/laporan', label: 'Laporan', icon: '📊' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
      <ul className="grid grid-cols-4">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 py-2 text-xs',
                  active
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground',
                )}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
