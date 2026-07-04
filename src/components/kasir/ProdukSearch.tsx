'use client';

import { useState } from 'react';

export function ProdukSearch({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const [val, setVal] = useState('');

  return (
    <div className="relative">
      <input
        type="text"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder="Cari produk (nama / barcode)…"
        className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">
        🔍
      </span>
      {val && (
        <button
          onClick={() => {
            setVal('');
            onSearch('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground leading-none"
        >
          ✕
        </button>
      )}
    </div>
  );
}
