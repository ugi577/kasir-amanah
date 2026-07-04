'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { active } from '@/lib/db';
import { rupiah } from '@/lib/format';
import { totalKasbon } from '@/lib/transaksi';
import { Modal } from '@/components/ui/ui';
import type { Pelanggan, Transaction } from '@/types';

export function CustomerSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string | undefined;
  onSelect: (p: Pelanggan | null) => void;
}) {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');

  const allPelanggan = useLiveQuery(() => db.customers.toArray(), []);
  const allTx = useLiveQuery(() => db.transactions.toArray(), []);
  const pelangganAktif = active(allPelanggan);

  const selected = selectedId
    ? pelangganAktif?.find((p) => p.id === selectedId)
    : null;

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

  return (
    <>
      {/* Tombol pilih pelanggan */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2">
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
        >
          <span className="text-lg shrink-0">
            {selected ? '👤' : '👥'}
          </span>
          <div className="min-w-0">
            {selected ? (
              <>
                <p className="text-sm font-medium truncate">{selected.nama}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.isGrosir ? '🏷️ Grosir' : 'Eceran'}
                  {selected.noHp ? ` · ${selected.noHp}` : ''}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pilih pelanggan (opsional)
              </p>
            )}
          </div>
        </button>
        {selected && (
          <button
            onClick={() => onSelect(null)}
            className="shrink-0 px-2 text-sm text-muted-foreground active:text-red-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Modal pilih pelanggan */}
      <Modal
        open={show}
        onClose={() => {
          setShow(false);
          setSearch('');
        }}
        title="👥 Pilih Pelanggan"
        footer={
          <button
            onClick={() => {
              setShow(false);
              setSearch('');
              onSelect(null);
            }}
            className="w-full rounded-xl border border-input py-2.5 text-sm font-medium"
          >
            Tanpa Pelanggan (Walk-in)
          </button>
        }
      >
        <div className="space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cari pelanggan…"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              {search ? 'Tidak ditemukan' : 'Belum ada pelanggan. Tambahkan di menu Pelanggan.'}
            </p>
          ) : (
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {filtered.map((p) => {
                const kasbon = totalKasbon(
                  (allTx ?? []) as Transaction[],
                  p.id,
                );
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        onSelect(p);
                        setShow(false);
                        setSearch('');
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors active:bg-accent ${
                        p.id === selectedId
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.nama}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.isGrosir ? '🏷️ Grosir' : 'Eceran'}
                          {p.noHp ? ` · ${p.noHp}` : ''}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {kasbon > 0 && (
                          <p className="text-xs font-medium text-amber-600">
                            💳 {rupiah(kasbon)}
                          </p>
                        )}
                        {p.id === selectedId && (
                          <span className="text-primary text-sm">✓</span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Modal>
    </>
  );
}
