'use client';

import { useState, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, newId, now } from '@/lib/db';
import { active } from '@/lib/db';
import { addItem, cartTotal, type CartItem } from '@/lib/cart';
import { hargaEfektif } from '@/lib/harga';
import { rupiah, tanggalJamIndo } from '@/lib/format';
import { AppBar } from '@/components/AppBar';
import { BottomNav } from '@/components/BottomNav';
import { ProdukSearch } from '@/components/kasir/ProdukSearch';
import { ProdukGrid } from '@/components/kasir/ProdukGrid';
import { CartPanel } from '@/components/kasir/CartPanel';
import { PaymentPanel } from '@/components/kasir/PaymentPanel';
import { StrukView } from '@/components/kasir/StrukView';
import { CustomerSelector } from '@/components/kasir/CustomerSelector';
import { Badge } from '@/components/ui/ui';
import type { Produk, Pelanggan, Transaction } from '@/types';

export default function KasirPage() {
  // Data dari database
  const allProduk = useLiveQuery(() => db.products.toArray(), []);
  const allPelanggan = useLiveQuery(() => db.customers.toArray(), []);
  const produkAktif = active(allProduk);

  // State pencarian
  const [search, setSearch] = useState('');

  // State pelanggan terpilih
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(null);

  // State keranjang
  const [items, setItems] = useState<CartItem[]>([]);

  // State pembayaran
  const [showPayment, setShowPayment] = useState(false);

  // State struk
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showStruk, setShowStruk] = useState(false);

  // State riwayat (hari ini)
  const [showRiwayat, setShowRiwayat] = useState(false);
  const todayTx = useLiveQuery(
    async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const txs = await db.transactions
        .where('createdAt')
        .above(start.getTime())
        .reverse()
        .toArray();
      return active(txs) as Transaction[];
    },
    [lastTransaction],
  );

  // Map customerId → nama untuk tampilan riwayat
  const pelangganMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of active(allPelanggan) ?? []) {
      if (p.id) map.set(p.id, p.nama);
    }
    return map;
  }, [allPelanggan]);

  // Filter produk berdasarkan search
  const filteredProduk = (produkAktif ?? []).filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.nama.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q))
    );
  });

  // Tambah ke keranjang — harga tergantung pelanggan terpilih
  const handlePick = useCallback(
    (produk: Produk) => {
      const isGrosir = selectedCustomer?.isGrosir ?? false;
      const harga = hargaEfektif(produk, 1, isGrosir);
      setItems((prev) => addItem(prev, produk, harga));
    },
    [selectedCustomer],
  );

  // Ganti pelanggan → recalculate semua harga di keranjang
  const handleSelectCustomer = useCallback(
    (p: Pelanggan | null) => {
      setSelectedCustomer(p);
      if (items.length > 0) {
        setItems((prev) =>
          prev.map((it) => {
            const produk = produkAktif?.find((pr) => pr.id === it.productId);
            if (!produk) return it;
            const isGrosir = p?.isGrosir ?? false;
            const newHarga = hargaEfektif(produk, it.qty, isGrosir);
            return { ...it, hargaSatuan: newHarga };
          }),
        );
      }
    },
    [items, produkAktif],
  );

  // Handle checkout — buka panel pembayaran
  const handleCheckout = () => {
    if (items.length === 0) return;
    setShowPayment(true);
  };

  // Handle bayar — simpan transaksi
  const handleBayar = async (result: {
    metode: 'tunai' | 'qris' | 'kasbon';
    dibayar: number;
    kasbon: number;
  }) => {
    const total = cartTotal(items);
    const txId = newId();
    const ts = now();

    const txItems = items.map((it) => ({
      id: newId(),
      transactionId: txId,
      productId: it.productId,
      nama: it.nama,
      qty: it.qty,
      hargaSatuan: it.hargaSatuan,
      subtotal: it.hargaSatuan * it.qty,
    }));

    const transaction: Transaction = {
      id: txId,
      customerId: selectedCustomer?.id,
      items: txItems,
      total,
      dibayar: result.dibayar,
      kasbon: result.kasbon,
      metode: result.metode,
      createdAt: ts,
    };

    // Simpan transaksi + update stok + stock movements
    await db.transactions.add(transaction);

    for (const it of items) {
      const produk = await db.products.get(it.productId);
      if (produk) {
        await db.products.update(it.productId, {
          stok: Math.max(0, produk.stok - it.qty),
        });
        await db.stockMovements.add({
          id: newId(),
          productId: it.productId,
          perubahan: -it.qty,
          alasan: 'transaksi',
          refId: txId,
          createdAt: ts,
        });
      }
    }

    // Kalau ada kasbon, bisa tambah cashLedger (opsional)
    if (result.kasbon > 0 && selectedCustomer) {
      await db.cashLedger.add({
        id: newId(),
        tipe: 'keluar',
        jumlah: result.kasbon,
        keterangan: `Kasbon: ${selectedCustomer.nama}`,
        refId: txId,
        createdAt: ts,
      });
    }

    // Reset keranjang + tutup payment
    setItems([]);
    setShowPayment(false);
    setLastTransaction(transaction);
    setShowStruk(true);
  };

  const total = cartTotal(items);

  return (
    <>
      <AppBar
        title="💰 Kasir"
        action={
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                {items.length} item
              </span>
            )}
            <button
              onClick={() => setShowRiwayat(!showRiwayat)}
              className="text-xs opacity-80"
            >
              📋 Riwayat
            </button>
          </div>
        }
      />

      <main className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
        {/* Search */}
        <ProdukSearch onSearch={setSearch} />

        {/* Customer Selector */}
        {!showRiwayat && (
          <CustomerSelector
            selectedId={selectedCustomer?.id}
            onSelect={handleSelectCustomer}
          />
        )}

        {/* Produk grid atau riwayat */}
        {showRiwayat ? (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm">📋 Transaksi Hari Ini</h2>
            {todayTx && todayTx.length > 0 ? (
              <ul className="space-y-2">
                {todayTx.map((tx) => (
                  <li
                    key={tx.id}
                    className="rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground">
                          {tanggalJamIndo(tx.createdAt)}
                        </p>
                        <p className="text-sm mt-1">
                          {tx.items
                            .map((it) => `${it.nama} ×${it.qty}`)
                            .join(', ')}
                        </p>
                        {tx.customerId && pelangganMap.has(tx.customerId) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            👤 {pelangganMap.get(tx.customerId)}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm">
                          {rupiah(tx.total)}
                        </p>
                        <Badge
                          color={
                            tx.metode === 'tunai'
                              ? 'green'
                              : tx.metode === 'qris'
                                ? 'blue'
                                : 'amber'
                          }
                        >
                          {tx.metode}
                          {tx.kasbon > 0
                            ? ` · sisa ${rupiah(tx.kasbon)}`
                            : ''}
                        </Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada transaksi hari ini
              </p>
            )}
            <button
              onClick={() => setShowRiwayat(false)}
              className="w-full rounded-xl border border-input py-2 text-sm"
            >
              Kembali ke Kasir
            </button>
          </div>
        ) : (
          <>
            {selectedCustomer && (
              <p className="text-xs text-muted-foreground text-center">
                {selectedCustomer.isGrosir
                  ? '🏷️ Harga grosir otomatis diterapkan untuk pelanggan ini'
                  : 'ℹ️ Pelanggan eceran — harga normal'}
              </p>
            )}
            <ProdukGrid produk={filteredProduk} onPick={handlePick} />
          </>
        )}

        {/* Update CartPanel trigger when customer changes */}
        {!showRiwayat && items.length > 0 && selectedCustomer && (
          <p className="text-[10px] text-muted-foreground text-center">
            👤 {selectedCustomer.nama} ·{' '}
            {selectedCustomer.isGrosir ? 'Harga Grosir' : 'Harga Eceran'}
          </p>
        )}
      </main>

      {/* Cart (fixed bottom, above nav) */}
      {!showRiwayat && (
        <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-md px-4">
          <CartPanel
            items={items}
            onItemsChange={setItems}
            onCheckout={handleCheckout}
          />
        </div>
      )}

      {/* Payment Modal */}
      <PaymentPanel
        open={showPayment}
        total={total}
        onClose={() => setShowPayment(false)}
        onBayar={handleBayar}
        customerName={selectedCustomer?.nama}
      />

      {/* Struk Modal */}
      {lastTransaction && (
        <StrukView
          open={showStruk}
          transaction={lastTransaction}
          pelangganNama={selectedCustomer?.nama}
          pelangganHp={selectedCustomer?.noHp}
          onClose={() => {
            setShowStruk(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      <BottomNav />
    </>
  );
}
