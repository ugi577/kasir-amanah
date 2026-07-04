/** Tipe dasar untuk semua record — soft-delete ready. */
export interface Base {
  id: string;
  createdAt: number; // epoch ms
  deletedAt?: number; // epoch ms — kalau ada berarti record ini soft-deleted
}

/** Satuan produk — eceran atau grosir. */
export type Satuan = 'pcs' | 'dus' | 'karung' | 'kg' | 'liter' | 'pack' | 'renceng';

export interface Produk extends Base {
  nama: string;
  satuan: Satuan;
  hargaBeli: number; // harga beli/modal per satuan — untuk hitung margin
  hargaEceran: number;
  hargaGrosir: number;
  minQtyGrosir: number; // minimal qty supaya dapat harga grosir
  stok: number;
  stokMinimal: number; // threshold alert stok menipis
  barcode?: string;
}

export interface Pelanggan extends Base {
  nama: string;
  noHp?: string;
  isGrosir: boolean; // kalau true, otomatis dapat harga grosir
}

export type MetodeBayar = 'tunai' | 'qris' | 'kasbon';

export interface Transaction extends Base {
  customerId?: string; // nullable — transaksi walk-in
  items: TransactionItem[];
  total: number;
  dibayar: number;
  kasbon: number; // selisih total - dibayar (kalau kurang bayar)
  metode: MetodeBayar;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  nama: string; // snapshot nama produk saat transaksi
  qty: number;
  hargaSatuan: number; // snapshot harga saat transaksi
  subtotal: number;
}

export type AlasanStok = 'pembelian' | 'transaksi' | 'void' | 'adjustment' | 'retur';

export interface StockMovement extends Base {
  productId: string;
  perubahan: number; // positif = masuk, negatif = keluar
  alasan: AlasanStok;
  refId?: string; // ID transaksi atau referensi lain
  catatan?: string;
}

export type TipeKas = 'masuk' | 'keluar';

export interface CashLedger extends Base {
  tipe: TipeKas;
  jumlah: number;
  keterangan: string;
  refId?: string; // ID transaksi terkait
}
