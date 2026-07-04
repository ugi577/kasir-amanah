import { rupiah, tanggalJamIndo } from '@/lib/format';
import type { Transaction } from '@/types';

const WIDTH = 32;

function padKiriKanan(label: string, nilai: string, width = WIDTH) {
  const ruang = width - label.length - nilai.length;
  if (ruang < 1) return `${label} ${nilai}`;
  return label + ' '.repeat(ruang) + nilai;
}

function garis(ch = '-') {
  return ch.repeat(WIDTH);
}

function tengah(text: string) {
  if (text.length >= WIDTH) return text;
  const kiri = Math.floor((WIDTH - text.length) / 2);
  return ' '.repeat(kiri) + text;
}

const METODE_LABEL: Record<string, string> = {
  tunai: 'Tunai',
  qris: 'QRIS',
  kasbon: 'Kasbon',
};

export interface StrukOpts {
  tokoNama: string;
  footer?: string;
  transaction: Transaction;
  pelangganNama?: string;
}

/** Bangun teks struk untuk share / cetak thermal. */
export function buildStrukText(opts: StrukOpts): string {
  const { tokoNama, footer, transaction, pelangganNama } = opts;
  const baris: string[] = [];

  baris.push(tengah(tokoNama.toUpperCase()));
  baris.push(tengah('Kasir Amanah — Jujur & Berkah'));
  baris.push(garis());
  baris.push(padKiriKanan('Tgl', tanggalJamIndo(transaction.createdAt)));
  baris.push(padKiriKanan('No', transaction.id.slice(-12).toUpperCase()));
  if (pelangganNama) baris.push(`Plgn: ${pelangganNama}`);
  baris.push(garis());

  for (const it of transaction.items) {
    baris.push(it.nama);
    baris.push(
      padKiriKanan(`  ${it.qty} x ${rupiah(it.hargaSatuan)}`, rupiah(it.subtotal)),
    );
  }

  baris.push(garis());
  baris.push(padKiriKanan('TOTAL', rupiah(transaction.total)));
  baris.push(
    padKiriKanan(
      `Bayar (${METODE_LABEL[transaction.metode] ?? transaction.metode})`,
      rupiah(transaction.dibayar),
    ),
  );
  if (transaction.kasbon > 0) {
    baris.push(padKiriKanan('KASBON/HUTANG', rupiah(transaction.kasbon)));
  } else if (transaction.dibayar > transaction.total) {
    baris.push(padKiriKanan('Kembali', rupiah(transaction.dibayar - transaction.total)));
  }
  baris.push(garis());
  if (footer) {
    baris.push(tengah(footer));
  } else {
    baris.push(tengah('Terima kasih — Barakallahu fiikum 🙏'));
  }
  baris.push('');
  baris.push(tengah('Powered by Kasir Amanah — sadaqah jariyah'));

  return baris.join('\n');
}

/** Pesan struk singkat untuk WhatsApp. */
export function strukWaText(opts: StrukOpts): string {
  const { transaction } = opts;
  const lines = [
    `*${opts.tokoNama}* — Kasir Amanah`,
    `Tgl: ${tanggalJamIndo(transaction.createdAt)}`,
    '',
    ...transaction.items.map(
      (it) => `• ${it.nama} ${it.qty} x ${rupiah(it.hargaSatuan)} = ${rupiah(it.subtotal)}`,
    ),
    '',
    `Total: ${rupiah(transaction.total)}`,
    `Dibayar: ${rupiah(transaction.dibayar)}`,
    transaction.kasbon > 0
      ? `*Sisa Kasbon: ${rupiah(transaction.kasbon)}*`
      : 'Lunas ✅',
    '',
    'Terima kasih 🙏',
    '',
    '_Powered by Kasir Amanah — sadaqah jariyah_',
  ];
  return lines.join('\n');
}
