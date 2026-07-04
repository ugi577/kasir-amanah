'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { active } from '@/lib/db';
import { rupiah } from '@/lib/format';
import { exportBackupJson } from '@/lib/saveFile';
import { AppBar } from '@/components/AppBar';
import { BottomNav } from '@/components/BottomNav';
import type { Transaction } from '@/types';

type Periode = '7hari' | '4minggu' | '6bulan';

export default function LaporanPage() {
  const allTx = useLiveQuery(() => db.transactions.toArray(), []);
  const allProduk = useLiveQuery(() => db.products.toArray(), []);
  const txAktif = useMemo(() => (active(allTx) as Transaction[]) ?? [], [allTx]);
  const produkAktif = useMemo(() => active(allProduk) ?? [], [allProduk]);

  const [periode, setPeriode] = useState<Periode>('7hari');
  const [showRestore, setShowRestore] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState('');

  // Rentang tanggal berdasarkan periode
  const { startDate, endDate, groupLabel } = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start: Date;
    let label: string;

    switch (periode) {
      case '7hari': {
        start = new Date(end);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        const opts: Intl.DateTimeFormatOptions = {
          day: 'numeric',
          month: 'short',
        };
        label = `${start.toLocaleDateString('id-ID', opts)} – ${end.toLocaleDateString('id-ID', opts)}`;
        break;
      }
      case '4minggu': {
        start = new Date(end);
        start.setDate(start.getDate() - 27);
        start.setHours(0, 0, 0, 0);
        const opts: Intl.DateTimeFormatOptions = {
          day: 'numeric',
          month: 'short',
        };
        label = `${start.toLocaleDateString('id-ID', opts)} – ${end.toLocaleDateString('id-ID', opts)}`;
        break;
      }
      case '6bulan': {
        start = new Date(end);
        start.setMonth(start.getMonth() - 5);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const opts: Intl.DateTimeFormatOptions = {
          month: 'short',
          year: 'numeric',
        };
        label = `${start.toLocaleDateString('id-ID', opts)} – ${end.toLocaleDateString('id-ID', opts)}`;
        break;
      }
    }

    return { startDate: start.getTime(), endDate: end.getTime(), groupLabel: label };
  }, [periode]);

  // Transaksi dalam rentang
  const txInRange = useMemo(
    () =>
      txAktif.filter(
        (tx) => tx.createdAt >= startDate && tx.createdAt <= endDate,
      ),
    [txAktif, startDate, endDate],
  );

  // Ringkasan omzet
  const ringkasan = useMemo(() => {
    const totalOmzet = txInRange.reduce((sum, tx) => sum + tx.total, 0);
    const totalMargin = txInRange.reduce((sum, tx) => {
      const margin = tx.items.reduce((m, item) => {
        const produk = produkAktif.find((p) => p.id === item.productId);
        if (produk && produk.hargaBeli > 0) {
          return m + (item.hargaSatuan - produk.hargaBeli) * item.qty;
        }
        return m;
      }, 0);
      return sum + margin;
    }, 0);
    const countTx = txInRange.length;
    const hari = Math.max(
      1,
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
    );
    return {
      totalOmzet,
      totalMargin,
      countTx,
      rataHarian: Math.round(totalOmzet / hari),
      marginPersen: totalOmzet > 0 ? Math.round((totalMargin / totalOmzet) * 100) : 0,
    };
  }, [txInRange, produkAktif, startDate, endDate]);

  // Produk terlaris (top 10 by qty)
  const topProduk = useMemo(() => {
    const sold = new Map<string, { nama: string; qty: number; omzet: number; margin: number }>();
    for (const tx of txInRange) {
      for (const item of tx.items) {
        const prev = sold.get(item.productId) ?? {
          nama: item.nama,
          qty: 0,
          omzet: 0,
          margin: 0,
        };
        const produk = produkAktif.find((p) => p.id === item.productId);
        const margin =
          produk && produk.hargaBeli > 0
            ? (item.hargaSatuan - produk.hargaBeli) * item.qty
            : 0;
        sold.set(item.productId, {
          nama: item.nama,
          qty: prev.qty + item.qty,
          omzet: prev.omzet + item.subtotal,
          margin: prev.margin + margin,
        });
      }
    }
    const result: { id: string; nama: string; qty: number; omzet: number; margin: number }[] = [];
    sold.forEach((val, id) => { result.push({ id, ...val }); });
    return result.sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [txInRange, produkAktif]);

  const maxQty = topProduk[0]?.qty ?? 1;

  // Chart: omzet per hari (hanya untuk 7hari)
  const chartHarian = useMemo(() => {
    if (periode !== '7hari') return [];
    const days: { label: string; omzet: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dEnd = dStart + 86400000;
      const txs = txAktif.filter((tx) => tx.createdAt >= dStart && tx.createdAt < dEnd);
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      days.push({
        label: dayNames[d.getDay()],
        omzet: txs.reduce((s, tx) => s + tx.total, 0),
        count: txs.length,
      });
    }
    return days;
  }, [periode, txAktif]);

  const maxOmzetHarian = Math.max(...chartHarian.map((d) => d.omzet), 1);

  // Stok menipis
  const stokMenipis = useMemo(
    () => produkAktif.filter((p) => p.stok <= p.stokMinimal),
    [produkAktif],
  );

  // Backup: kumpulkan semua data
  const handleBackup = async () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      products: await db.products.toArray(),
      customers: await db.customers.toArray(),
      transactions: await db.transactions.toArray(),
      transactionItems: await db.transactionItems.toArray(),
      stockMovements: await db.stockMovements.toArray(),
      cashLedger: await db.cashLedger.toArray(),
    };
    await exportBackupJson(data);
  };

  // Restore: baca file JSON
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validasi sederhana
      if (!data.products || !data.transactions) {
        setRestoreMsg('❌ File backup tidak valid');
        return;
      }

      if (!confirm(`Restore ${data.products.length} produk, ${data.transactions.length} transaksi? Data saat ini akan ditimpa.`)) {
        setRestoreMsg('');
        return;
      }

      // Clear & import
      await db.transaction('rw', [db.products, db.customers, db.transactions, db.transactionItems, db.stockMovements, db.cashLedger], async () => {
        await db.products.clear();
        await db.customers.clear();
        await db.transactions.clear();
        await db.transactionItems.clear();
        await db.stockMovements.clear();
        await db.cashLedger.clear();

        await db.products.bulkAdd(data.products);
        await db.customers.bulkAdd(data.customers ?? []);
        await db.transactions.bulkAdd(data.transactions);
        await db.transactionItems.bulkAdd(data.transactionItems ?? []);
        await db.stockMovements.bulkAdd(data.stockMovements ?? []);
        await db.cashLedger.bulkAdd(data.cashLedger ?? []);
      });

      setRestoreMsg(
        `✅ Data dipulihkan: ${data.products.length} produk, ${data.transactions.length} transaksi`,
      );
    } catch {
      setRestoreMsg('❌ Gagal membaca file backup');
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <>
      <AppBar
        title="📊 Laporan"
        action={
          <div className="flex items-center gap-1">
            <button
              onClick={handleBackup}
              className="rounded bg-white/20 px-2 py-1 text-xs"
              title="Backup data"
            >
              📤 Backup
            </button>
            <button
              onClick={() => setShowRestore(!showRestore)}
              className="rounded bg-white/20 px-2 py-1 text-xs"
              title="Restore data"
            >
              📥
            </button>
          </div>
        }
      />

      <main className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
        {/* Periode selector */}
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {([
            ['7hari', '7 Hari'],
            ['4minggu', '4 Minggu'],
            ['6bulan', '6 Bulan'],
          ] as [Periode, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPeriode(val)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                periode === val
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">{groupLabel}</p>

        {/* Ringkasan Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Omzet</p>
            <p className="text-lg font-bold text-primary">
              {rupiah(ringkasan.totalOmzet)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Transaksi</p>
            <p className="text-lg font-bold">{ringkasan.countTx}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Rata/hari</p>
            <p className="text-lg font-bold">{rupiah(ringkasan.rataHarian)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Margin</p>
            <p className="text-lg font-bold text-emerald-600">
              {rupiah(ringkasan.totalMargin)}
            </p>
            {ringkasan.marginPersen > 0 && (
              <p className="text-[10px] text-emerald-600">
                {ringkasan.marginPersen}%
              </p>
            )}
          </div>
        </div>

        {/* Chart harian (hanya 7hari) */}
        {periode === '7hari' && chartHarian.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">📈 Omzet Harian</h3>
            <div className="space-y-2">
              {chartHarian.map((d) => (
                <div key={d.label} className="flex items-center gap-2">
                  <span className="w-8 text-xs text-muted-foreground text-right">
                    {d.label}
                  </span>
                  <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full bg-primary/80 rounded-md transition-all min-w-[2px]"
                      style={{
                        width: `${Math.max(3, (d.omzet / maxOmzetHarian) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-16 text-xs text-right font-mono">
                    {rupiah(d.omzet)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Produk */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">
            🏆 Produk Terlaris
          </h3>
          {topProduk.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Belum ada transaksi di periode ini
            </p>
          ) : (
            <div className="space-y-2">
              {topProduk.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{p.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.qty} terjual · {rupiah(p.omzet)}
                      {p.margin > 0
                        ? ` · margin ${rupiah(p.margin)}`
                        : ''}
                    </p>
                  </div>
                  <div className="shrink-0 w-20">
                    <div className="h-4 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-md"
                        style={{
                          width: `${Math.max(5, (p.qty / maxQty) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stok Menipis */}
        {stokMenipis.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-700 mb-3">
              ⚠️ Stok Menipis ({stokMenipis.length})
            </h3>
            <ul className="space-y-1">
              {stokMenipis.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between text-sm text-red-700"
                >
                  <span>{p.nama}</span>
                  <span className="font-semibold">
                    Stok: {p.stok}/{p.stokMinimal}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Backup / Restore */}
        {showRestore && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">
              📥 Pulihkan Data
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Pilih file backup JSON. Data saat ini akan ditimpa.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="w-full text-xs"
            />
            {restoreMsg && (
              <p
                className={`mt-2 text-xs font-medium ${
                  restoreMsg.startsWith('✅')
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {restoreMsg}
              </p>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}
