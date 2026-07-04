import type { Produk } from '@/types';

export interface CartItem {
  productId: string;
  nama: string;
  hargaSatuan: number;
  qty: number;
}

/** Tambah produk ke keranjang (atau +1 qty kalau sudah ada). */
export function addItem(items: CartItem[], produk: Produk, harga: number): CartItem[] {
  const idx = items.findIndex((it) => it.productId === produk.id);
  if (idx >= 0) {
    const next = [...items];
    next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
    return next;
  }
  return [
    ...items,
    { productId: produk.id, nama: produk.nama, hargaSatuan: harga, qty: 1 },
  ];
}

/** Set qty item; qty <= 0 menghapus item dari keranjang. */
export function setQty(items: CartItem[], productId: string, qty: number): CartItem[] {
  if (qty <= 0) return items.filter((it) => it.productId !== productId);
  return items.map((it) => (it.productId === productId ? { ...it, qty } : it));
}

/** Total rupiah keranjang. */
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, it) => sum + it.hargaSatuan * it.qty, 0);
}

/** Total item (jumlah qty semua item). */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, it) => sum + it.qty, 0);
}
