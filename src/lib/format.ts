/**
 * Format angka ke Rupiah (bahasa Indonesia).
 * Contoh: 15000 → "Rp15.000"
 */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Alias singkat untuk formatRupiah — dipakai di banyak tempat. */
export { formatRupiah as rupiah };

/** Format angka desimal (untuk qty, dll). */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Parse input string ke number (bersihkan karakter non-numeric). */
export function parseNumberInput(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '');
  return cleaned ? Number(cleaned) : 0;
}

/** Format tanggal: "04 Jul 2026" */
export function tanggalIndo(ts: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ts));
}

/** Format tanggal + jam: "04 Jul 2026, 14:30" */
export function tanggalJamIndo(ts: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

/** Nomor nota: DDMMYY-HHmmss-XXXX */
export function generateNoNota(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const tgl = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear().toString().slice(2)}`;
  const jam = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${tgl}-${jam}-${rand}`;
}
