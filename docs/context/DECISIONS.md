# DECISIONS — Kasir Amanah

## 2026-07-04 — Nama final: Kasir Amanah
**Keputusan:** Nama aplikasi final adalah "Kasir Amanah" (bukan "Mizan Kasir" seperti codename awal).
**Alasan:** Kata "mizan" secara filosofi pas (timbangan/keadilan, QS Ar-Rahman) tapi kurang akrab di telinga pedagang awam. "Amanah" sudah jadi bahasa sehari-hari pedagang pasar ("dagang harus amanah"), langsung dipahami tanpa penjelasan. Filosofi mizan tetap dipakai di tagline/narasi produk: "Kasir Amanah — kasir warung yang menjaga timbangan dan harga tetap jujur (mizan)."

## 2026-07-04 — Positioning & diferensiasi
**Keputusan:** Produk diposisikan sebagai "kasir warung jujur & berkah", bukan kasir generik.
**Alasan:** Riset kompetitor (Kasir Pintar, Qasir, Majoo, Olsera, dll) menunjukkan fitur inti sudah komoditas. Diferensiasi ada di: harga ganda eceran/grosir bawaan, kasbon+reminder WA, model non-subscription, dan nilai amanah yang sejalan dengan basis distribusi pesantren/koperasi santri.

## 2026-07-04 — Model monetisasi: bukan subscription bulanan
**Keputusan:** Freemium (1 device + watermark) lalu lisensi tahunan/sekali-bayar, bukan biaya bulanan.
**Alasan:** Margin warung sembako sangat tipis (1–3%/transaksi); subscription bulanan Rp50–260rb terasa berat. Model beda ini juga jadi pesan pemasaran.

## 2026-07-04 — Stack: reuse konvensi depot-kasir-app
**Keputusan:** Next.js 14 + Dexie + Capacitor + Tailwind/shadcn, bukan stack baru.
**Alasan:** Konsisten dengan codebase & tooling yang sudah dikuasai (multi-model AI coding setup, Android build env CachyOS/Mac sudah siap). Mengurangi biaya belajar ulang.

## 2026-07-04 — MVP tidak termasuk PPOB
**Keputusan:** PPOB/pulsa masuk v2, bukan MVP.
**Alasan:** Integrasi PPOB butuh kerja sama provider pihak ketiga (kompleksitas & biaya), MVP fokus validasi kasir inti dulu.

## 2026-07-04 — shadcn/ui pakai versi classic (Tailwind v3 compatible)
**Keputusan:** Komponen shadcn/ui ditulis manual (classic pattern), bukan pakai CLI shadcn v4 yang auto-install.
**Alasan:** CLI `shadcn@4.x` auto-install Tailwind v4 + `@base-ui/react` + `tw-animate-css` yang tidak kompatibel dengan Next.js 14 + Tailwind v3. Komponen ditulis ulang secara manual mengikuti classic shadcn pattern (CVA + Radix-style, pakai HTML native button). File `src/lib/utils.ts` dan struktur `components/ui/` tetap standar.

## 2026-07-04 — Theme hijau untuk positioning "berkah"
**Keputusan:** Warna primary pakai hijau (`--primary: 160 84% 39%` — emerald green) sebagai warna utama.
**Alasan:** Sejalan dengan positioning "jujur & berkah" dan basis pengguna pesantren/koperasi santri. Warna hijau identik dengan nilai Islami tanpa perlu penjelasan tambahan. Bisa diganti nanti kalau ada branding final.

## 2026-07-04 — Struktur halaman: query params bukan dynamic routes
**Keputusan:** Semua halaman pakai path segment statis (misal `app/kasir/page.tsx`), form/edit menggunakan modal, bukan dynamic route seperti `[id]/edit`.
**Alasan:** Konsisten dengan locked convention "Semua route Capacitor pakai query params, bukan dynamic route path" — static export Next.js tidak support SSR dynamic routes, dan modal lebih cocok untuk UX mobile.

## 2026-07-05 — Kasbon reminder via WA (bukan API resmi)
**Keputusan:** Reminder kasbon dikirim via wa.me link (user tap kirim manual), bukan WhatsApp Business API.
**Alasan:** WA Business API perlu approval Meta, biaya, dan kompleksitas backend. wa.me link gratis, langsung jalan, dan tetap memberi kontrol ke pemilik warung sebelum kirim (by design — sesuai PRD "bukan API resmi dulu di MVP").

## 2026-07-05 — Harga grosir recalculate saat ganti pelanggan
**Keputusan:** Saat pelanggan dipilih/diganti di kasir, semua harga di keranjang di-recalculate otomatis dengan `hargaEfektif()` berdasarkan flag `isGrosir` pelanggan baru.
**Alasan:** Biar konsisten — kalau pelanggan grosir dipilih setelah item masuk keranjang, harga harus ikut turun ke harga grosir (dan sebaliknya). Tanpa recalculate, kasir harus hapus & tambah ulang item.

## 2026-07-05 — CashLedger entry untuk transaksi kasbon
**Keputusan:** Setiap transaksi dengan `kasbon > 0` otomatis mencatat entry di `cashLedger` dengan tipe `keluar` dan keterangan nama pelanggan.
**Alasan:** Memudahkan pelacakan arus kas — kasbon adalah "uang keluar" (piutang) yang perlu tercatat di pembukuan. Ini menyiapkan fondasi untuk laporan laba/rugi di Milestone 3.

## 2026-07-05 — Laporan tanpa library chart eksternal
**Keputusan:** Chart omzet pakai CSS bar chart sederhana (div dengan width %), bukan library seperti Chart.js atau Recharts.
**Alasan:** Mengurangi bundle size untuk APK, chart sederhana sudah cukup untuk MVP (omzet harian 7 hari). Bisa upgrade ke library chart di v2 kalau butuh visualisasi lebih kompleks.

## 2026-07-05 — Dexie bulk transaction untuk restore
**Keputusan:** Restore pakai `db.transaction('rw', [...tables], callback)` dengan clear + bulkAdd untuk semua 6 tabel.
**Alasan:** Atomic restore — kalau gagal di tengah, semua rollback. Hindari inkonsistensi data parsial.

## 2026-07-05 — Field hargaBeli opsional (default 0)
**Keputusan:** Field `hargaBeli` ditambahkan ke Produk dengan default 0. Produk tanpa harga beli tetap bisa, margin = 0.
**Alasan:** Tidak semua pemilik warung langsung tahu harga modal per item. Field opsional memungkinkan adopsi bertahap — isi nanti kalau sudah siap. Dashboard tetap berfungsi (margin 0 untuk produk tanpa harga beli).

## 2026-07-05 — APK build dengan Java 21 (bukan Java 26)
**Keputusan:** Build Android APK harus pakai `JAVA_HOME=/usr/lib/jvm/java-21-openjdk`, bukan Java 26 (default sistem CachyOS).
**Alasan:** Gradle yang dipakai Capacitor v8 (`gradle-8.x`) belum support Java class version 70 (Java 26). Java 21 adalah LTS terbaru yang kompatibel. Script `apk:debug` di package.json sudah include `JAVA_HOME` override.

## 2026-07-05 — APK debug 5.0 MB, tanpa ProGuard/minify
**Keputusan:** Build pertama pakai `assembleDebug` (5.0 MB), belum pakai ProGuard/R8 minification.
**Alasan:** Debug build cukup untuk testing internal di Samsung S23+. Build release (`.aab` signed) akan dilakukan setelah validasi MVP selesai dan siap distribusi.

## 2026-07-05 — Watermark struk: sadaqah jariyah
**Keputusan:** Setiap struk (cetak & WA) selalu ada watermark: "Powered by Kasir Amanah — sadaqah jariyah".
**Alasan:** Sesuai model freemium PRD: versi gratis selamanya bisa dipakai, dengan watermark kecil sebagai branding. Versi berbayar nanti bisa hapus watermark.

<!-- Tambahkan entri baru di atas, format: tanggal — judul singkat, lalu Keputusan & Alasan -->
