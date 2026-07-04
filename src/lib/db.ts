import Dexie, { type Table } from 'dexie';
import type {
  Produk,
  Pelanggan,
  Transaction,
  TransactionItem,
  StockMovement,
  CashLedger,
} from '@/types';

export class KasirAmanahDB extends Dexie {
  products!: Table<Produk, string>;
  customers!: Table<Pelanggan, string>;
  transactions!: Table<Transaction, string>;
  transactionItems!: Table<TransactionItem, string>;
  stockMovements!: Table<StockMovement, string>;
  cashLedger!: Table<CashLedger, string>;

  constructor() {
    super('kasir-amanah-db');

    this.version(1).stores({
      products: 'id, nama, barcode, deletedAt',
      customers: 'id, nama, noHp, isGrosir, deletedAt',
      transactions: 'id, customerId, metode, createdAt, deletedAt',
      transactionItems: 'id, transactionId, productId',
      stockMovements: 'id, productId, alasan, createdAt',
      cashLedger: 'id, tipe, createdAt',
    });

    this.version(2)
      .stores({
        products: 'id, nama, barcode, deletedAt',
        customers: 'id, nama, noHp, isGrosir, deletedAt',
        transactions: 'id, customerId, metode, createdAt, deletedAt',
        transactionItems: 'id, transactionId, productId',
        stockMovements: 'id, productId, alasan, createdAt',
        cashLedger: 'id, tipe, createdAt',
      })
      .upgrade(async (tx) => {
        // Backfill hargaBeli = 0 untuk semua produk existing
        const all = await tx.table<Produk>('products').toArray();
        for (const p of all) {
          if (p.hargaBeli !== undefined) continue;
          await tx.table<Produk>('products').update(p.id, { hargaBeli: 0 });
        }
      });
  }
}

export const db = new KasirAmanahDB();

/** Bikin ID unik — timestamp + random (fallback kalau uuid belum tersedia). */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Timestamp sekarang dalam epoch ms. */
export function now(): number {
  return Date.now();
}

/** Tandai record sebagai soft-delete. */
export function softDelete() {
  return { deletedAt: now() };
}

/** Filter array — buang yang soft-deleted. */
export function active<T extends { deletedAt?: number | null }>(
  rows: T[] | undefined | null,
): T[] {
  return (rows ?? []).filter((r) => !r.deletedAt);
}
