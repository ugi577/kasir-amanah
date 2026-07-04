'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, now } from '@/lib/db';
import { active } from '@/lib/db';
import { rupiah } from '@/lib/format';
import { AppBar } from '@/components/AppBar';
import { BottomNav } from '@/components/BottomNav';
import { Modal, Badge, EmptyState, Fab } from '@/components/ui/ui';
import { ProdukForm } from '@/components/produk/ProdukForm';
import type { Produk } from '@/types';

export default function ProdukPage() {
  const allProduk = useLiveQuery(() => db.products.toArray(), []);
  const produkAktif = active(allProduk);

  // Search
  const [search, setSearch] = useState('');

  // Form modal
  const [editProduk, setEditProduk] = useState<Produk | null | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Produk | null>(null);

  const filteredProduk = (produkAktif ?? []).filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.nama.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q))
    );
  });

  // Urut: stok menipis dulu
  const sortedProduk = [...filteredProduk].sort((a, b) => {
    const aLow = a.stok <= a.stokMinimal ? 0 : 1;
    const bLow = b.stok <= b.stokMinimal ? 0 : 1;
    if (aLow !== bLow) return aLow - bLow;
    return a.nama.localeCompare(b.nama);
  });

  const handleSave = async (produk: Produk) => {
    if (editProduk) {
      await db.products.update(produk.id, { ...produk });
    } else {
      await db.products.add(produk);
    }
    setShowForm(false);
    setEditProduk(undefined);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await db.products.update(deleteTarget.id, { deletedAt: now() });
    setDeleteTarget(null);
  };

  const handleAdjustStok = async (produk: Produk, perubahan: number) => {
    const newStok = Math.max(0, produk.stok + perubahan);
    await db.products.update(produk.id, { stok: newStok });
    await db.stockMovements.add({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      productId: produk.id,
      perubahan,
      alasan: 'adjustment',
      catatan: 'Penyesuaian manual',
      createdAt: now(),
    });
  };

  return (
    <>
      <AppBar
        title="📦 Produk"
        action={
          <span className="text-xs opacity-80">
            {produkAktif?.length ?? 0} produk
          </span>
        }
      />

      <main className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-3">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Cari produk…"
          className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        {sortedProduk.length === 0 ? (
          <EmptyState
            icon="📦"
            title={search ? 'Tidak ditemukan' : 'Belum ada produk'}
            desc={
              search
                ? 'Coba kata kunci lain'
                : 'Tap tombol + di bawah untuk menambahkan produk pertama'
            }
          />
        ) : (
          <ul className="space-y-2">
            {sortedProduk.map((p) => {
              const stokRendah = p.stok <= p.stokMinimal;
              return (
                <li
                  key={p.id}
                  className="rounded-2xl border border-border bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => {
                        setEditProduk(p);
                        setShowForm(true);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {p.nama}
                        </span>
                        {stokRendah && <Badge color="red">⚠️ Stok</Badge>}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{rupiah(p.hargaEceran)}</span>
                        <span>/ {p.satuan}</span>
                        {p.hargaGrosir > 0 && (
                          <Badge color="amber">
                            Grosir {rupiah(p.hargaGrosir)} (min {p.minQtyGrosir})
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stok + quick adjust */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleAdjustStok(p, -1)}
                        className="h-6 w-6 rounded-full bg-muted text-sm leading-none text-muted-foreground active:bg-accent"
                        title="Kurangi stok"
                      >
                        −
                      </button>
                      <span
                        className={`w-8 text-center text-sm font-semibold ${stokRendah ? 'text-red-600' : ''}`}
                      >
                        {p.stok}
                      </span>
                      <button
                        onClick={() => handleAdjustStok(p, 1)}
                        className="h-6 w-6 rounded-full bg-primary/10 text-sm leading-none text-primary active:bg-primary/20"
                        title="Tambah stok"
                      >
                        +
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="ml-1 h-6 w-6 rounded-full text-xs leading-none text-muted-foreground active:bg-red-50 active:text-red-600"
                        title="Hapus produk"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  {p.barcode && (
                    <p className="mt-1 text-[10px] text-muted-foreground font-mono">
                      {p.barcode}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* FAB */}
      <Fab
        onClick={() => {
          setEditProduk(null);
          setShowForm(true);
        }}
        label="Produk"
      />

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditProduk(undefined);
        }}
        title={editProduk ? '✏️ Edit Produk' : '➕ Tambah Produk'}
      >
        <ProdukForm
          existing={editProduk}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditProduk(undefined);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="🗑 Hapus Produk"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 rounded-xl border border-input py-2.5 text-sm font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white active:bg-red-700"
            >
              Hapus
            </button>
          </div>
        }
      >
        <p className="text-sm">
          Produk <strong>{deleteTarget?.nama}</strong> akan dihapus (soft-delete).
          Stok tidak akan dihapus permanen dan masih muncul di laporan.
        </p>
      </Modal>

      <BottomNav />
    </>
  );
}
