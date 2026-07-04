'use client';

import { rupiah } from '@/lib/format';
import type { Produk } from '@/types';
import { EmptyState } from '@/components/ui/ui';

export function ProdukGrid({
  produk,
  onPick,
}: {
  produk: Produk[];
  onPick: (p: Produk) => void;
}) {
  if (produk.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="Produk tidak ditemukan"
        desc="Coba kata kunci lain, atau tambahkan produk dulu."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {produk.map((p) => (
        <button
          key={p.id}
          onClick={() => onPick(p)}
          disabled={p.stok <= 0}
          className="flex flex-col rounded-2xl border border-border bg-card p-3 text-left transition-colors active:bg-accent disabled:opacity-40"
        >
          <span className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">
            {p.nama}
          </span>
          <span className="mt-1 font-semibold text-primary">
            {rupiah(p.hargaEceran)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            /{p.satuan}
            {p.stok <= p.stokMinimal ? ' ⚠️' : ` · stok ${p.stok}`}
          </span>
          {p.hargaGrosir > 0 && (
            <span className="text-[10px] text-amber-600">
              Grosir {rupiah(p.hargaGrosir)} (min {p.minQtyGrosir})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
