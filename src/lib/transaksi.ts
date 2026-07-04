import { newId, now } from '@/lib/db';
import type {
  Produk,
  Pelanggan,
  Transaction,
  TransactionItem,
  MetodeBayar,
} from '@/types';

/** Item dalam keranjang sebelum disimpan sebagai transaksi. */
export interface CartItem {
  productId: string;
  nama: string;
  qty: number;
  hargaSatuan: number;
  subtotal: number;
}

/** Data untuk membuat transaksi baru. */
export interface CreateTransactionInput {
  customerId?: string;
  items: CartItem[];
  dibayar: number;
  metode: MetodeBayar;
}

/** Bikin transaksi lengkap dari input keranjang. */
export function createTransaction(input: CreateTransactionInput): Transaction {
  const total = input.items.reduce((sum, it) => sum + it.subtotal, 0);
  const kasbon = Math.max(0, total - input.dibayar);
  const ts = now();
  const txId = newId();

  const txItems: TransactionItem[] = input.items.map((it) => ({
    id: newId(),
    transactionId: txId,
    productId: it.productId,
    nama: it.nama,
    qty: it.qty,
    hargaSatuan: it.hargaSatuan,
    subtotal: it.subtotal,
  }));

  return {
    id: txId,
    customerId: input.customerId,
    items: txItems,
    total,
    dibayar: input.dibayar,
    kasbon,
    metode: input.metode,
    createdAt: ts,
  };
}

/** Total kasbon (outstanding) untuk seorang pelanggan dari daftar transaksi. */
export function totalKasbon(
  transactions: Transaction[],
  customerId: string,
): number {
  return transactions
    .filter((tx) => tx.customerId === customerId && tx.kasbon > 0 && !tx.deletedAt)
    .reduce((sum, tx) => sum + tx.kasbon, 0);
}

/** Buat produk baru dengan nilai default. */
export function createProduk(partial: Partial<Produk> = {}): Produk {
  return {
    id: newId(),
    nama: '',
    satuan: 'pcs',
    hargaBeli: 0,
    hargaEceran: 0,
    hargaGrosir: 0,
    minQtyGrosir: 0,
    stok: 0,
    stokMinimal: 5,
    createdAt: now(),
    ...partial,
  };
}

/** Buat pelanggan baru dengan nilai default. */
export function createPelanggan(partial: Partial<Pelanggan> = {}): Pelanggan {
  return {
    id: newId(),
    nama: '',
    isGrosir: false,
    createdAt: now(),
    ...partial,
  };
}
