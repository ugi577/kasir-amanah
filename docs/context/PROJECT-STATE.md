# PROJECT-STATE — Kasir Amanah

> Anchor file. Baca ini di awal setiap sesi Claude Code sebelum lanjut kerja.

## Status saat ini
**Fase:** MVP selesai — Milestone 0–4 done (2026-07-05)
**Milestone aktif:** Siap Milestone 5 (v2: PPOB, white-label, zakat) atau testing user

## Ringkasan produk
Aplikasi kasir (POS) untuk warung sembako, toko kelontong, dan pedagang pasar rakyat. Diferensiasi: harga ganda eceran/grosir per pelanggan, kasbon dengan reminder WhatsApp, offline-first, model lisensi non-subscription, positioning "jujur & berkah".

**Nama final: Kasir Amanah.** Tagline: "Kasir warung yang menjaga timbangan dan harga tetap jujur (mizan)."

## Stack
- Next.js 14, `output: 'export'` gated `CAPACITOR_BUILD=1`
- Dexie (IndexedDB) v2, Capacitor v8 (Android)
- Tailwind v3 + shadcn/ui (classic, manual)
- Soft delete only, no service worker
- `saveFile.ts` pola Capacitor Filesystem + Share

---

## Ringkasan semua Milestone

| M | Nama | Fitur | Status |
|---|------|-------|--------|
| 0 | Setup | Scaffold, Dexie, Capacitor, icon | ✅ |
| 1 | Transaksi & Produk | Kasir, keranjang, bayar, stok, struk, CRUD produk | ✅ |
| 2 | Kasbon & Pelanggan | CRUD pelanggan, customer selector, auto grosir, reminder WA | ✅ |
| 3 | Laporan & Stok | Dashboard omzet, chart, top produk, stok menipis, backup/restore, hargaBeli | ✅ |
| 4 | Polish & APK | Branding, About page, watermark struk, APK debug 5.0MB | ✅ |

---

## Semua halaman

| Route | Fungsi | JS Size |
|-------|--------|---------|
| `/` | Home — grid navigasi + branding "jujur & berkah" | 175 B |
| `/kasir` | Kasir — search, keranjang, customer, bayar, struk, riwayat | 7.82 kB |
| `/produk` | CRUD produk + quick adjust stok + harga beli | 5.63 kB |
| `/pelanggan` | CRUD pelanggan + kasbon tracking + reminder WA | 5.84 kB |
| `/laporan` | Dashboard + chart + top produk + stok menipis + backup/restore | 4.39 kB |
| `/tentang` | About — filosofi, fitur, distribusi | 2.32 kB |

---

## File structure final

```
kasir-amanah/
├── assets/icon.png                      # 1024×1024 (302KB)
├── public/
│   ├── icon.png
│   └── manifest.json                    # PWA manifest
├── capacitor.config.ts                  # id.amanah.kasir
├── next.config.mjs                      # CAPACITOR_BUILD gate
├── tailwind.config.ts                   # Theme hijau 160 84% 39%
├── components.json                      # shadcn classic
├── package.json                         # Scripts: dev, build, build:android, apk:debug
├── android/                             # Capacitor Android project
│   └── app/build/outputs/apk/debug/
│       └── app-debug.apk                # ✅ 5.0 MB (debug)
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Home — brand "jujur & berkah"
│   │   ├── kasir/page.tsx               # Full flow transaksi
│   │   ├── produk/page.tsx              # Full CRUD produk
│   │   ├── pelanggan/page.tsx           # CRUD + kasbon + reminder
│   │   ├── laporan/page.tsx             # Dashboard + backup/restore
│   │   └── tentang/page.tsx             # About / filosofi
│   ├── components/
│   │   ├── AppBar.tsx, BottomNav.tsx
│   │   ├── DbInit.tsx, Providers.tsx
│   │   ├── ui/button.tsx, ui/ui.tsx
│   │   ├── kasir/  (ProdukSearch, ProdukGrid, CartPanel,
│   │   │           PaymentPanel, StrukView, CustomerSelector)
│   │   ├── produk/ (ProdukForm)
│   │   └── pelanggan/ (PelangganForm)
│   ├── lib/
│   │   ├── db.ts (Dexie v2), saveFile.ts, utils.ts
│   │   ├── format.ts, harga.ts, transaksi.ts
│   │   ├── cart.ts, struk.ts, wa.ts
│   └── types/index.ts
└── docs/context/ (PRD, PLAN, DECISIONS, PROJECT-STATE)
```

---

## Total: 10 route, ~30 file src, 1 APK

---

## Cara build APK

```bash
# Pastikan JAVA_HOME ke Java 21
JAVA_HOME=/usr/lib/jvm/java-21-openjdk

# Build web + sync + APK debug
npm run apk:debug

# Atau step by step:
CAPACITOR_BUILD=1 npm run build   # Static export ke out/
npx cap sync android               # Sync ke android/
cd android && ./gradlew assembleDebug   # Build APK
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

## Yang sudah diverifikasi
- [x] `npm run build` — sukses (10 route)
- [x] `CAPACITOR_BUILD=1 npm run build` — sukses (static export)
- [x] `./gradlew assembleDebug` — sukses (APK 5.0 MB)
- [x] Tidak ada service worker
- [x] Semua delete soft delete
- [x] Stok otomatis + stockMovement + cashLedger
- [x] Harga grosir + recalculate saat ganti pelanggan
- [x] Backup/restore JSON atomic (Dexie transaction)
- [x] Watermark struk: "Powered by Kasir Amanah — sadaqah jariyah"
- [x] Branding "jujur & berkah" + ayat Al-Quran (QS Ar-Rahman 55:9)

## Yang belum diputuskan
- Struktur harga lisensi (nominal)
- Cloud sync di v2 atau tetap backup/restore manual
- White-label branding config untuk distribusi

## Next: Milestone 5 (v2, setelah validasi user)
1. PPOB/pulsa/token listrik (integrasi provider pihak ketiga)
2. White-label branding config (pola Hafizhiy)
3. Zakat/infaq calculator opsional (toggle)
4. Multi-cabang / sync cloud opsional
5. Barcode scanner kamera HP

## Referensi
- `depot-kasir-app` — pola Dexie + Capacitor POS
- `mahad-askar-app-v2` — backup/restore JSON, Capacitor gate
