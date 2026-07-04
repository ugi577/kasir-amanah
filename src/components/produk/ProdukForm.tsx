'use client';

import { useState, useEffect } from 'react';
import type { Produk, Satuan } from '@/types';
import { createProduk } from '@/lib/transaksi';
import { Input, Select, Field } from '@/components/ui/ui';
import { parseNumberInput } from '@/lib/format';

const SATUAN_OPTIONS: Satuan[] = [
  'pcs',
  'dus',
  'karung',
  'kg',
  'liter',
  'pack',
  'renceng',
];

interface ProdukFormData {
  nama: string;
  satuan: Satuan;
  hargaBeli: number;
  hargaEceran: number;
  hargaGrosir: number;
  minQtyGrosir: number;
  stok: number;
  stokMinimal: number;
  barcode: string;
}

export function ProdukForm({
  existing,
  onSave,
  onCancel,
}: {
  existing?: Produk | null;
  onSave: (p: Produk) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState<ProdukFormData>({
    nama: '',
    satuan: 'pcs',
    hargaBeli: 0,
    hargaEceran: 0,
    hargaGrosir: 0,
    minQtyGrosir: 0,
    stok: 0,
    stokMinimal: 5,
    barcode: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setData({
        nama: existing.nama,
        satuan: existing.satuan,
        hargaBeli: existing.hargaBeli ?? 0,
        hargaEceran: existing.hargaEceran,
        hargaGrosir: existing.hargaGrosir,
        minQtyGrosir: existing.minQtyGrosir,
        stok: existing.stok,
        stokMinimal: existing.stokMinimal,
        barcode: existing.barcode ?? '',
      });
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.nama.trim()) {
      setError('Nama produk wajib diisi');
      return;
    }
    if (data.hargaEceran <= 0) {
      setError('Harga eceran harus lebih dari 0');
      return;
    }

    const produk = createProduk({
      ...(existing ? { id: existing.id, createdAt: existing.createdAt } : {}),
      nama: data.nama.trim(),
      satuan: data.satuan,
      hargaBeli: data.hargaBeli,
      hargaEceran: data.hargaEceran,
      hargaGrosir: data.hargaGrosir,
      minQtyGrosir: data.minQtyGrosir,
      stok: data.stok,
      stokMinimal: data.stokMinimal,
      barcode: data.barcode || undefined,
    });

    onSave(produk);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Nama Produk *">
        <Input
          value={data.nama}
          onChange={(e) => setData({ ...data, nama: e.target.value })}
          placeholder="Contoh: Beras Rojolele 5kg"
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Satuan">
          <Select
            value={data.satuan}
            onChange={(e) =>
              setData({ ...data, satuan: e.target.value as Satuan })
            }
          >
            {SATUAN_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Barcode (opsional)">
          <Input
            value={data.barcode}
            onChange={(e) => setData({ ...data, barcode: e.target.value })}
            placeholder="Scan / ketik"
          />
        </Field>
      </div>

      <Field label="Harga Beli / Modal" hint="Untuk hitung margin. Kosongkan kalau belum tahu.">
        <Input
          type="text"
          inputMode="numeric"
          value={data.hargaBeli > 0 ? String(data.hargaBeli) : ''}
          onChange={(e) =>
            setData({
              ...data,
              hargaBeli: parseNumberInput(e.target.value),
            })
          }
          placeholder="0"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Harga Eceran *">
          <Input
            type="text"
            inputMode="numeric"
            value={data.hargaEceran > 0 ? String(data.hargaEceran) : ''}
            onChange={(e) =>
              setData({
                ...data,
                hargaEceran: parseNumberInput(e.target.value),
              })
            }
            placeholder="0"
          />
        </Field>
        <Field label="Harga Grosir">
          <Input
            type="text"
            inputMode="numeric"
            value={data.hargaGrosir > 0 ? String(data.hargaGrosir) : ''}
            onChange={(e) =>
              setData({
                ...data,
                hargaGrosir: parseNumberInput(e.target.value),
              })
            }
            placeholder="0 = tidak ada"
          />
        </Field>
      </div>

      <Field label="Min. Qty Grosir" hint="Jumlah minimal beli supaya dapat harga grosir">
        <Input
          type="text"
          inputMode="numeric"
          value={data.minQtyGrosir > 0 ? String(data.minQtyGrosir) : ''}
          onChange={(e) =>
            setData({
              ...data,
              minQtyGrosir: parseNumberInput(e.target.value),
            })
          }
          placeholder="0 = semua dapat grosir kalau harga diisi"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Stok Saat Ini">
          <Input
            type="text"
            inputMode="numeric"
            value={String(data.stok)}
            onChange={(e) =>
              setData({
                ...data,
                stok: parseNumberInput(e.target.value),
              })
            }
          />
        </Field>
        <Field label="Stok Minimal" hint="Alert saat stok ≤ nilai ini">
          <Input
            type="text"
            inputMode="numeric"
            value={String(data.stokMinimal)}
            onChange={(e) =>
              setData({
                ...data,
                stokMinimal: parseNumberInput(e.target.value),
              })
            }
          />
        </Field>
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
          {existing ? '💾 Simpan' : '➕ Tambah Produk'}
        </button>
      </div>
    </form>
  );
}
