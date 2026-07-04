import type { Produk } from '@/types';

/** Hitung harga satuan yang berlaku untuk kombinasi produk + pelanggan. */
export function hargaEfektif(
  produk: Produk,
  qty: number,
  isPelangganGrosir: boolean,
): number {
  // Pelanggan grosir DAN qty memenuhi syarat → harga grosir
  if (isPelangganGrosir && produk.minQtyGrosir > 0 && qty >= produk.minQtyGrosir) {
    return produk.hargaGrosir;
  }
  // Semua orang dapat harga grosir kalau qty cukup (beli banyak)
  if (produk.minQtyGrosir > 0 && qty >= produk.minQtyGrosir) {
    return produk.hargaGrosir;
  }
  return produk.hargaEceran;
}
