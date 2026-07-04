# PRD — Kasir Amanah
**Tagline:** "Kasir Amanah — kasir warung yang menjaga timbangan dan harga tetap jujur (mizan)."
*(Nama final. Filosofi "mizan"/timbangan-keadilan dipakai sebagai narasi produk, bukan bagian dari nama, karena "mizan" kurang akrab di telinga pedagang awam.)*

## 1. Masalah
Warung sembako, toko kelontong, dan pedagang pasar rakyat (±3,94 juta unit, ~98,8% retail Indonesia) masih banyak yang mengelola transaksi, stok, dan kasbon secara manual. Aplikasi kasir yang ada di pasaran (Kasir Pintar, Qasir, Majoo, Olsera, Pawoon, dll) sudah bagus tapi:
- Model langganan bulanan berat buat margin tipis (1–3% per transaksi).
- Harga ganda eceran vs grosir per pelanggan jarang ditangani dengan baik.
- Kasbon (utang pelanggan) fiturnya dangkal — tidak ada reminder otomatis.
- Tidak ada yang mengangkat nilai jujur-timbangan/berkah/anti-riba sebagai identitas produk.

## 2. Target pengguna
- **Primary:** warung sembako & toko kelontong (eceran + grosir campuran).
- **Secondary:** pedagang pasar rakyat, kios koperasi santri/pesantren, warung wakaf.
- **Distribusi:** jalur yang sudah ada — jaringan Mahad Al-Askar (14 cabang), RMI-NU (dari playbook Hafizhiy), koperasi santri.

## 3. Positioning
"Kasir warung yang jujur & berkah" — bukan kasir generik. Nilai jual: amanah dalam takaran/harga, kasbon yang rapi dan diingatkan otomatis, tanpa jebakan langganan mahal.

**Filosofi nama:** "Amanah" dipilih karena sudah jadi bahasa sehari-hari pedagang pasar/warung ("dagang harus amanah"), tidak perlu dijelaskan lagi. Nilai *mizan* (ميزان — timbangan/keadilan, QS Ar-Rahman) tetap dipakai sebagai landasan filosofis produk dan bisa muncul di tagline, about page, atau splash screen — tapi tidak dipaksakan jadi nama karena istilahnya kurang familiar buat orang awam.

## 4. Fitur MVP (harus ada)
1. **Transaksi cepat** — cari produk (barcode/nama), keranjang, bayar tunai/QRIS, cetak/kirim struk (WA/print thermal).
2. **Manajemen stok** — tambah/kurang stok otomatis per transaksi, alert stok menipis, satuan ganda (pcs/dus/karung → eceran).
3. **Harga ganda eceran/grosir** — per produk bisa set harga grosir + minimal qty, dan per pelanggan bisa ditandai "pelanggan grosir" dengan harga khusus.
4. **Kasbon (utang) pelanggan** — catat kasbon per pelanggan, riwayat, reminder otomatis via WhatsApp (link wa.me, bukan API resmi dulu di MVP).
5. **Laporan** — omzet harian/mingguan/bulanan, produk terlaris, laba kotor per transaksi.
6. **Offline-first** — semua fungsi inti jalan tanpa internet, sync/backup manual via file (pola `saveFile.ts` yang sudah dipakai di project lain).
7. **Multi-perangkat via backup/restore JSON** — konsisten dengan pola IndexedDB per-device yang sudah dipakai di mahad-askar-app-v2 & depot-kasir-app.

## 5. Fitur v2 (nice to have, bukan MVP)
- PPOB/pulsa/token listrik (integrasi provider PPOB pihak ketiga).
- Multi-cabang / sync cloud opsional.
- Kalkulasi zakat mal/infaq otomatis dari omzet bulanan (opsional, toggle).
- Barcode scanner kamera HP.
- White-label untuk distribusi ke koperasi santri lain (pola Hafizhiy: gratis branded + berbayar white-label).

## 6. Non-goals (MVP)
- Tidak build POS untuk restoran/F&B (beda kebutuhan resep/meja).
- Tidak build sistem multi-cabang real-time di MVP.
- Tidak integrasi payment gateway kompleks di MVP — QRIS statis dulu.

## 7. Model monetisasi (usulan)
- **Freemium:** gratis untuk 1 perangkat, watermark struk kecil ("powered by [nama], sadaqah jariyah").
- **Berbayar:** lisensi sekali bayar atau tahunan murah (bukan bulanan) untuk multi-perangkat + hapus watermark + fitur v2.
- Ini beda dari kompetitor yang rata-rata bulanan Rp50–260rb — jadi diferensiasi harga juga.

## 8. Tech stack (mengikuti konvensi project lain)
- Next.js 14 (`output: 'export'` gated di balik `CAPACITOR_BUILD=1`)
- Dexie (IndexedDB) untuk data lokal
- Capacitor untuk build Android/iOS
- Tailwind + shadcn/ui
- Soft delete only, service worker dilarang (locked convention)
