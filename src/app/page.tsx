import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-primary/5 to-background">
      {/* Branding */}
      <div className="text-center space-y-3">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <span className="text-4xl">⚖️</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Kasir Amanah</h1>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          Kasir warung yang menjaga timbangan dan harga tetap jujur (<em>mizan</em>).
        </p>
        <p className="text-xs text-muted-foreground/70">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
      </div>

      {/* Menu grid */}
      <nav className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {[
          { href: '/kasir', icon: '💰', label: 'Kasir', desc: 'Transaksi baru' },
          { href: '/produk', icon: '📦', label: 'Produk', desc: 'Stok & harga' },
          { href: '/pelanggan', icon: '👥', label: 'Pelanggan', desc: 'Kasbon & grosir' },
          { href: '/laporan', icon: '📊', label: 'Laporan', desc: 'Omzet & backup' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="mt-2 text-sm font-semibold group-hover:text-primary">
              {item.label}
            </p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="text-center space-y-1">
        <p className="text-[10px] text-muted-foreground/60">
          Versi 0.1.0 — Milestone 4
        </p>
        <Link
          href="/tentang"
          className="text-[10px] text-primary/60 hover:text-primary underline"
        >
          Tentang Kasir Amanah
        </Link>
      </div>
    </main>
  );
}
