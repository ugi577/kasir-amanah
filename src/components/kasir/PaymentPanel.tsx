'use client';

import { useState } from 'react';
import { rupiah, parseNumberInput } from '@/lib/format';
import type { MetodeBayar } from '@/types';
import { Modal } from '@/components/ui/ui';

interface PaymentResult {
  metode: MetodeBayar;
  dibayar: number;
  kasbon: number;
}

export function PaymentPanel({
  open,
  total,
  onClose,
  onBayar,
  customerName,
}: {
  open: boolean;
  total: number;
  onClose: () => void;
  onBayar: (result: PaymentResult) => void;
  customerName?: string;
}) {
  const [metode, setMetode] = useState<MetodeBayar>('tunai');
  const [dibayarStr, setDibayarStr] = useState('');
  const dibayar = parseNumberInput(dibayarStr);

  const kembali = dibayar > total ? dibayar - total : 0;

  const handleBayar = () => {
    const result: PaymentResult = {
      metode,
      dibayar: metode === 'kasbon' ? dibayar : Math.max(dibayar, total),
      kasbon: metode === 'kasbon' ? Math.max(0, total - dibayar) : 0,
    };
    onBayar(result);
    setDibayarStr('');
    setMetode('tunai');
  };

  const footer = (
    <div className="space-y-2">
      {(kembali > 0 && metode !== 'kasbon') && (
        <p className="text-center text-sm font-medium text-emerald-600">
          💵 Kembalian: {rupiah(kembali)}
        </p>
      )}
      {metode === 'kasbon' && dibayar > 0 && dibayar < total && (
        <p className="text-center text-sm font-medium text-amber-600">
          ⚠️ Kurang bayar (kasbon): {rupiah(total - dibayar)}
        </p>
      )}
      <button
        onClick={handleBayar}
        disabled={metode !== 'kasbon' && dibayar < total}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors disabled:opacity-40 active:bg-primary/90"
      >
        {metode === 'kasbon'
          ? dibayar > 0
            ? `Catat Kasbon — Bayar ${rupiah(dibayar)}`
            : `Catat Kasbon Penuh — ${rupiah(total)}`
          : `Bayar ${rupiah(Math.max(dibayar, total))}`}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customerName ? `💳 ${customerName}` : '💳 Pembayaran'}
      footer={footer}
    >
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Tagihan</p>
          <p className="text-3xl font-bold text-primary">{rupiah(total)}</p>
        </div>

        {/* Metode bayar */}
        <div className="flex gap-2">
          {([
            ['tunai', '💵 Tunai'],
            ['qris', '📱 QRIS'],
            ['kasbon', '📝 Kasbon'],
          ] as [MetodeBayar, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMetode(m)}
              className={`flex-1 rounded-xl border py-2.5 text-xs font-medium transition-colors ${
                metode === m
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input jumlah bayar */}
        <div>
          <label className="mb-1 block text-xs font-medium">
            {metode === 'kasbon' ? 'Jumlah Dibayar' : 'Jumlah Uang'}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={dibayarStr}
            onChange={(e) => setDibayarStr(e.target.value)}
            placeholder="Contoh: 50000"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoFocus
          />

          {/* Tombol cepat */}
          <div className="mt-2 flex flex-wrap gap-1">
            {[
              total,
              total + 1000,
              total + 2000,
              total + 5000,
              Math.ceil(total / 10000) * 10000,
              Math.ceil(total / 50000) * 50000,
            ]
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .filter((v) => v >= total)
              .slice(0, 5)
              .map((v) => (
                <button
                  key={v}
                  onClick={() => setDibayarStr(String(v))}
                  className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground active:bg-accent"
                >
                  {rupiah(v)}
                </button>
              ))}
            {metode === 'tunai' && (
              <button
                onClick={() => setDibayarStr(String(total))}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
              >
                💯 Pas
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
