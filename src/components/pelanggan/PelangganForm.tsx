'use client';

import { useState, useEffect } from 'react';
import type { Pelanggan } from '@/types';
import { createPelanggan } from '@/lib/transaksi';
import { Input, Field } from '@/components/ui/ui';

export function PelangganForm({
  existing,
  onSave,
  onCancel,
}: {
  existing?: Pelanggan | null;
  onSave: (p: Pelanggan) => void;
  onCancel: () => void;
}) {
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [isGrosir, setIsGrosir] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setNama(existing.nama);
      setNoHp(existing.noHp ?? '');
      setIsGrosir(existing.isGrosir);
    } else {
      setNama('');
      setNoHp('');
      setIsGrosir(false);
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama pelanggan wajib diisi');
      return;
    }

    const pelanggan = createPelanggan({
      ...(existing
        ? { id: existing.id, createdAt: existing.createdAt }
        : {}),
      nama: nama.trim(),
      noHp: noHp.trim() || undefined,
      isGrosir,
    });

    onSave(pelanggan);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Nama Pelanggan *">
        <Input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Bu Sari"
          autoFocus
        />
      </Field>

      <Field label="No. HP / WhatsApp" hint="Untuk kirim struk & reminder kasbon">
        <Input
          type="tel"
          value={noHp}
          onChange={(e) => setNoHp(e.target.value)}
          placeholder="0812xxxx atau 62812xxxx"
        />
      </Field>

      {/* Toggle Grosir */}
      <div className="flex items-center justify-between rounded-xl border border-border p-3">
        <div>
          <p className="text-sm font-medium">🏷️ Pelanggan Grosir</p>
          <p className="text-xs text-muted-foreground">
            Otomatis dapat harga grosir saat qty mencukupi
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsGrosir(!isGrosir)}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            isGrosir ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              isGrosir ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-input py-2.5 text-sm font-medium active:bg-accent"
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:bg-primary/90"
        >
          {existing ? '💾 Simpan' : '➕ Tambah Pelanggan'}
        </button>
      </div>
    </form>
  );
}
