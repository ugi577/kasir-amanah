'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, now } from '@/lib/db';
import { active } from '@/lib/db';
import { rupiah, tanggalJamIndo } from '@/lib/format';
import { totalKasbon } from '@/lib/transaksi';
import { openWa } from '@/lib/wa';
import { AppBar } from '@/components/AppBar';
import { BottomNav } from '@/components/BottomNav';
import { Modal, Badge, EmptyState, Fab } from '@/components/ui/ui';
import { PelangganForm } from '@/components/pelanggan/PelangganForm';
import type { Pelanggan, Transaction } from '@/types';

export default function PelangganPage() {
  const allPelanggan = useLiveQuery(() => db.customers.toArray(), []);
  const allTx = useLiveQuery(() => db.transactions.toArray(), []);
  const pelangganAktif = active(allPelanggan);
  const txAktif = active(allTx) as Transaction[];

  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<Pelanggan | null | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pelanggan | null>(null);
  const [kasbonDetail, setKasbonDetail] = useState<Pelanggan | null>(null);

  const filtered = (pelangganAktif ?? [])
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        (p.noHp && p.noHp.includes(q))
      );
    })
    .sort((a, b) => a.nama.localeCompare(b.nama));

  const handleSave = async (p: Pelanggan) => {
    if (editTarget) {
      await db.customers.update(p.id, { ...p });
    } else {
      await db.customers.add(p);
    }
    setShowForm(false);
    setEditTarget(undefined);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await db.customers.update(deleteTarget.id, { deletedAt: now() });
    setDeleteTarget(null);
  };

  // Reminder kasbon
  const generateReminder = (p: Pelanggan): string => {
    const kasbon = totalKasbon(txAktif, p.id);
    const nama = p.nama;
    return [
      `Assalamu'alaikum ${nama},`,
      '',
      `Ini dari *Kasir Amanah* — pengingat kasbon yang masih berjalan:`,
      '',
      `💰 Total outstanding: *${rupiah(kasbon)}*`,
      '',
      'Mohon maaf mengingatkan, semoga dilancarkan rezekinya 🙏',
      'Barakallahu fiikum.',
    ].join('\n');
  };

  const kasbonTxFor = (customerId: string): Transaction[] => {
    return txAktif.filter(
      (tx) => tx.customerId === customerId && tx.kasbon > 0,
    );
  };

  return (
    <>
      <AppBar
        title="👥 Pelanggan"
        action={
          <span className="text-xs opacity-80">
            {pelangganAktif?.length ?? 0} orang
          </span>
        }
      />

      <main className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-3">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Cari pelanggan…"
          className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title={search ? 'Tidak ditemukan' : 'Belum ada pelanggan'}
            desc={
              search
                ? 'Coba kata kunci lain'
                : 'Tap tombol + untuk menambahkan pelanggan'
            }
          />
        ) : (
          <ul className="space-y-2">
            {filtered.map((p) => {
              const kasbon = totalKasbon(txAktif, p.id);
              return (
                <li
                  key={p.id}
                  className="rounded-2xl border border-border bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => {
                        setEditTarget(p);
                        setShowForm(true);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {p.nama}
                        </span>
                        {p.isGrosir && <Badge color="green">🏷️ Grosir</Badge>}
                        {kasbon > 0 && (
                          <Badge color="amber">💳 {rupiah(kasbon)}</Badge>
                        )}
                      </div>
                      {p.noHp && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          📱 {p.noHp}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {kasbon > 0 && (
                        <button
                          onClick={() => setKasbonDetail(p)}
                          className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 active:bg-amber-200"
                        >
                          Detail
                        </button>
                      )}
                      {p.noHp && kasbon > 0 && (
                        <button
                          onClick={() =>
                            openWa(p.noHp, generateReminder(p))
                          }
                          className="rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-700 active:bg-green-200"
                          title="Kirim reminder WhatsApp"
                        >
                          📱
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="h-6 w-6 rounded-full text-xs leading-none text-muted-foreground active:bg-red-50 active:text-red-600"
                        title="Hapus"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* FAB */}
      <Fab
        onClick={() => {
          setEditTarget(null);
          setShowForm(true);
        }}
        label="Pelanggan"
      />

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditTarget(undefined);
        }}
        title={editTarget ? '✏️ Edit Pelanggan' : '➕ Tambah Pelanggan'}
      >
        <PelangganForm
          existing={editTarget}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditTarget(undefined);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="🗑 Hapus Pelanggan"
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
          Pelanggan <strong>{deleteTarget?.nama}</strong> akan dihapus (soft-delete).
          Data transaksi & kasbon tetap tersimpan.
        </p>
      </Modal>

      {/* Kasbon Detail Modal */}
      <Modal
        open={!!kasbonDetail}
        onClose={() => setKasbonDetail(null)}
        title={`💳 Kasbon: ${kasbonDetail?.nama ?? ''}`}
        footer={
          kasbonDetail?.noHp ? (
            <button
              onClick={() =>
                openWa(kasbonDetail!.noHp!, generateReminder(kasbonDetail!))
              }
              className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white active:bg-green-700"
            >
              📱 Kirim Reminder WhatsApp
            </button>
          ) : undefined
        }
      >
        {kasbonDetail && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold text-amber-600">
                {rupiah(totalKasbon(txAktif, kasbonDetail.id))}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground">
                Riwayat Kasbon
              </h4>
              {kasbonTxFor(kasbonDetail.id).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Tidak ada transaksi kasbon
                </p>
              ) : (
                <ul className="space-y-1">
                  {kasbonTxFor(kasbonDetail.id)
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((tx) => (
                      <li
                        key={tx.id}
                        className="rounded-lg bg-muted px-3 py-2"
                      >
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {tanggalJamIndo(tx.createdAt)}
                          </span>
                          <span className="font-medium text-amber-600">
                            {rupiah(tx.kasbon)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tx.items
                            .map((it) => `${it.nama} ×${it.qty}`)
                            .join(', ')}
                        </p>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>Total: {rupiah(tx.total)}</span>
                          <span>Dibayar: {rupiah(tx.dibayar)}</span>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      <BottomNav />
    </>
  );
}
