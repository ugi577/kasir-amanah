'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';

export function DbInit({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Dexie auto-opens — cukup tunggu db terbuka
    db.open()
      .then(() => setReady(true))
      .catch((err) => {
        console.error('Gagal membuka database:', err);
        setReady(true); // tetep lanjut, tapi mungkin error di runtime
      });
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Menyiapkan data…
      </div>
    );
  }

  return <>{children}</>;
}
