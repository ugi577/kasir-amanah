'use client';

import { Modal } from '@/components/ui/ui';
import type { Transaction } from '@/types';
import { buildStrukText, strukWaText } from '@/lib/struk';
import { shareText } from '@/lib/saveFile';
import { openWa } from '@/lib/wa';
import { rupiah } from '@/lib/format';

export function StrukView({
  open,
  transaction,
  pelangganNama,
  pelangganHp,
  onClose,
}: {
  open: boolean;
  transaction: Transaction;
  pelangganNama?: string;
  pelangganHp?: string;
  onClose: () => void;
}) {
  const strukText = buildStrukText({
    tokoNama: 'Kasir Amanah',
    transaction,
    pelangganNama,
  });

  const waText = strukWaText({
    tokoNama: 'Kasir Amanah',
    transaction,
    pelangganNama,
  });

  const handleShareWa = () => {
    openWa(pelangganHp, waText);
  };

  const handleShare = () => {
    shareText('Struk Kasir Amanah', strukText);
  };

  const footer = (
    <div className="flex gap-2">
      <button
        onClick={handleShareWa}
        className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white active:bg-green-700"
      >
        📱 Kirim WhatsApp
      </button>
      <button
        onClick={handleShare}
        className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium active:bg-accent"
      >
        📤 Share
      </button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="✅ Transaksi Berhasil" footer={footer}>
      <div className="space-y-3">
        <div className="text-center">
          <p className="text-4xl mb-2">✅</p>
          <p className="text-lg font-bold text-emerald-600">Pembayaran Berhasil</p>
          <p className="text-sm text-muted-foreground">
            {transaction.kasbon > 0
              ? `Kasbon: ${rupiah(transaction.kasbon)}`
              : `Kembali: ${rupiah(Math.max(0, transaction.dibayar - transaction.total))}`}
          </p>
        </div>
        <pre className="whitespace-pre-wrap rounded-xl bg-muted p-4 text-xs font-mono leading-relaxed">
          {strukText}
        </pre>
      </div>
    </Modal>
  );
}
