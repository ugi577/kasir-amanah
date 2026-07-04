# Prompt awal untuk Claude Code

Copy-paste ini sebagai prompt pertama di Claude Code, di dalam folder project yang sudah ada PRD.md, PLAN.md, DECISIONS.md, dan docs/context/PROJECT-STATE.md.

---

Baca dulu docs/context/PROJECT-STATE.md, PRD.md, PLAN.md, dan DECISIONS.md di root project ini sebelum mulai apapun.

Saya mau scaffold Milestone 0 dari PLAN.md untuk project "Kasir Amanah" — aplikasi kasir (POS) warung sembako/toko kelontong/pasar rakyat.

Stack (jangan diubah): Next.js 14 (App Router), TypeScript, Dexie untuk IndexedDB, Capacitor untuk build Android, Tailwind + shadcn/ui.

Tolong kerjakan berurutan, konfirmasi tiap step sebelum lanjut ke step berikutnya:

1. Init project Next.js 14 + TypeScript di folder ini, setup Tailwind + shadcn/ui.
2. Setup config `output: 'export'` yang HANYA aktif kalau env `CAPACITOR_BUILD=1` — jangan aktif saat dev biasa.
3. Buat Dexie schema di `lib/db.ts` dengan tabel:
   - `products` (id, nama, satuan, hargaEceran, hargaGrosir, minQtyGrosir, stok, stokMinimal, createdAt, deletedAt nullable — soft delete)
   - `customers` (id, nama, noHp, isGrosir boolean, createdAt, deletedAt nullable)
   - `transactions` (id, customerId nullable, total, dibayar, kasbon, metode, createdAt, deletedAt nullable)
   - `transactionItems` (id, transactionId, productId, qty, hargaSatuan, subtotal)
   - `stockMovements` (id, productId, perubahan, alasan, createdAt)
   - `cashLedger` (id, tipe, jumlah, keterangan, createdAt)
   Semua delete harus soft delete (isi `deletedAt`), jangan pernah hard delete.
4. Setup Capacitor config untuk target Android, ikuti pola: semua route yang dipakai di build Capacitor pakai query params, bukan dynamic path segment.
5. Buat `lib/saveFile.ts` — helper export/import backup JSON via Capacitor Filesystem + Share API (untuk backup/restore manual antar device).
6. Setup struktur folder dasar: `app/kasir`, `app/produk`, `app/pelanggan`, `app/laporan`, `components/ui` (shadcn).
7. JANGAN pasang service worker apapun — ini locked convention.

Setelah selesai semua step, update docs/context/PROJECT-STATE.md: pindahkan status ke "Milestone 0 selesai, siap Milestone 1" dan catat file/struktur apa saja yang sudah dibuat.

Kalau ada keputusan arsitektur baru yang kamu ambil di luar yang sudah tertulis di DECISIONS.md, tambahkan entri baru di DECISIONS.md dengan format yang sama (tanggal, keputusan, alasan) — jangan overwrite entri lama.
