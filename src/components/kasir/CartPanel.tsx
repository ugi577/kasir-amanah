'use client';

import { rupiah } from '@/lib/format';
import type { CartItem } from '@/lib/cart';
import { setQty, cartTotal, cartCount } from '@/lib/cart';

export function CartPanel({
  items,
  onItemsChange,
  onCheckout,
}: {
  items: CartItem[];
  onItemsChange: (items: CartItem[]) => void;
  onCheckout: () => void;
}) {
  const total = cartTotal(items);
  const count = cartCount(items);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">🛒 Keranjang kosong</p>
        <p className="text-xs text-muted-foreground mt-1">
          Tap produk di atas untuk menambahkan
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">
          🛒 Keranjang ({count} item)
        </h3>
      </div>
      <ul className="divide-y divide-border max-h-64 overflow-y-auto">
        {items.map((it) => (
          <li key={it.productId} className="flex items-center gap-2 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{it.nama}</p>
              <p className="text-xs text-muted-foreground">
                {rupiah(it.hargaSatuan)} × {it.qty} ={' '}
                <span className="font-medium text-foreground">
                  {rupiah(it.hargaSatuan * it.qty)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  onItemsChange(setQty(items, it.productId, it.qty - 1))
                }
                className="h-7 w-7 rounded-full bg-muted text-lg leading-none text-muted-foreground active:bg-accent"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium">
                {it.qty}
              </span>
              <button
                onClick={() =>
                  onItemsChange(setQty(items, it.productId, it.qty + 1))
                }
                className="h-7 w-7 rounded-full bg-primary/10 text-lg leading-none text-primary active:bg-primary/20"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="p-3 border-t space-y-2">
        <div className="flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{rupiah(total)}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:bg-primary/90 transition-colors"
        >
          💳 Bayar — {rupiah(total)}
        </button>
      </div>
    </div>
  );
}
