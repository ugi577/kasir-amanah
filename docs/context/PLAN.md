# PLAN — Kasir Amanah

## Milestone 0 — Setup
- [ ] Init repo `kasir-amanah` (GitHub ugi577), struktur Next.js 14 + TS
- [ ] Setup Tailwind + shadcn/ui
- [ ] Setup Dexie schema awal (products, customers, transactions, transaction_items, stock_movements, cash_ledger)
- [ ] Setup Capacitor config (android target dulu, ikuti env CachyOS yang sudah ada)
- [ ] `docs/context/PROJECT-STATE.md` sebagai anchor sesi
- [ ] `saveFile.ts` via Capacitor Filesystem + Share (reuse pola dari depot-kasir-app)

## Milestone 1 — Transaksi & Produk (MVP core)
- [ ] CRUD produk: nama, satuan (pcs/dus/karung/kg), harga eceran, harga grosir + min qty
- [ ] Halaman kasir: search produk, keranjang, hitung kembalian, simpan transaksi
- [ ] Update stok otomatis per transaksi (soft-delete only untuk void transaksi)
- [ ] Cetak/struk digital (share via WA) — thermal printer opsional belakangan

## Milestone 2 — Kasbon & Pelanggan
- [ ] CRUD pelanggan, tandai "pelanggan grosir" (dapat harga grosir otomatis)
- [ ] Catat kasbon per transaksi (bayar sebagian/nanti)
- [ ] Riwayat kasbon per pelanggan + total outstanding
- [ ] Reminder kasbon via wa.me link (generate pesan otomatis, buka WhatsApp)

## Milestone 3 — Laporan & Stok
- [ ] Dashboard omzet harian/mingguan/bulanan (chart sederhana)
- [ ] Produk terlaris, margin kotor
- [ ] Alert stok menipis (threshold per produk)
- [ ] Backup/restore JSON (pola sudah ada dari project lain)

## Milestone 4 — Polish & Build
- [ ] Redesign UI final (branding "jujur & berkah" — warna, tipografi)
- [ ] Watermark struk untuk versi gratis
- [ ] APK build via Capacitor (ikuti Gate v1 pattern dari mahad-askar-app-v2)
- [ ] Testing di Samsung S23+ (device testing yang biasa dipakai)

## Milestone 5 (v2, setelah validasi) — Ekspansi
- [ ] PPOB/pulsa integration
- [ ] White-label branding config (pola Hafizhiy)
- [ ] Zakat/infaq calculator opsional

## Locked conventions (jangan diubah tanpa alasan kuat)
- `output: 'export'` hanya aktif saat `CAPACITOR_BUILD=1`
- Semua route Capacitor pakai query params, bukan dynamic route path
- Service worker: DILARANG
- Soft delete only — tidak ada hard delete di data transaksi/stok
- Data lokal per-device via IndexedDB, sync via Backup/Restore JSON manual
