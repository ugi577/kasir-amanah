'use client';

import { DbInit } from '@/components/DbInit';

export function Providers({ children }: { children: React.ReactNode }) {
  return <DbInit>{children}</DbInit>;
}
