'use client';

import Link from 'next/link';
import { AppBar } from '@/components/AppBar';
import { BottomNav } from '@/components/BottomNav';

export default function TentangPage() {
  return (
    <>
      <AppBar title="⚖️ Tentang" />
      <main className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-6">
        {/* Filosofi */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
          <span className="text-5xl">⚖️</span>
          <div>
            <h1 className="text-xl font-bold">Kasir Amanah</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Versi 0.1.0 — MVP
            </p>
          </div>
          <p className="text-sm leading-relaxed">
            Kasir warung yang menjaga timbangan dan harga tetap jujur (<em>mizan</em>).
          </p>
          <blockquote className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3 text-left">
            &ldquo;Dan tegakkanlah timbangan itu dengan adil dan janganlah kamu
            mengurangi neraca itu.&rdquo;
            <br />
            <span className="not-italic">— QS Ar-Rahman (55): 9</span>
          </blockquote>
        </div>

        {/* Fitur */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-sm">✨ Fitur Utama</h2>
          <ul className="space-y-2 text-sm">
            {[
              '💰 Transaksi cepat: cari produk, keranjang, bayar tunai/QRIS/kasbon',
              '📦 Manajemen stok otomatis per transaksi + alert stok menipis',
              '🏷️ Harga ganda eceran/grosir per pelanggan',
              '📝 Kasbon pelanggan dengan reminder WhatsApp',
              '📊 Laporan omzet harian/mingguan/bulanan + produk terlaris',
              '📱 Offline-first: semua fitur jalan tanpa internet',
              '💾 Backup/restore data manual via file JSON',
            ].map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Filosofi nama */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <h2 className="font-semibold text-sm">🤲 Mengapa &ldquo;Amanah&rdquo;?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kata <em>amanah</em> sudah menjadi bahasa sehari-hari pedagang pasar
            dan pemilik warung: &ldquo;dagang harus amanah.&rdquo; Tidak perlu
            dijelaskan lagi. Nama ini mengingatkan kita bahwa setiap transaksi
            adalah tanggung jawab — takaran yang jujur, harga yang adil, dan
            hak pelanggan yang dihormati.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Aplikasi ini adalah <em>sadaqah jariyah</em> — dibuat untuk membantu
            pedagang kecil Indonesia berdagang dengan lebih rapi, jujur, dan
            berkah. Versi gratis bisa dipakai selamanya.
          </p>
        </div>

        {/* Distribusi */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <h2 className="font-semibold text-sm">📡 Distribusi</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Didistribusikan melalui jaringan Mahad Al-Askar, RMI-NU, dan koperasi
            santri di seluruh Indonesia. Untuk kemitraan distribusi atau
            white-label, silakan hubungi melalui WhatsApp.
          </p>
        </div>

        {/* Kembali */}
        <Link
          href="/"
          className="block w-full rounded-xl border border-input py-3 text-center text-sm font-medium active:bg-accent"
        >
          ← Kembali ke Beranda
        </Link>
      </main>
      <BottomNav />
    </>
  );
}
