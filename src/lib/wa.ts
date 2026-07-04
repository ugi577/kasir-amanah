/** Normalisasi nomor HP Indonesia ke format 62xxxx (tanpa +, tanpa simbol). */
export function normalizeHp(hp: string): string {
  let n = hp.replace(/[^0-9]/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  if (!n.startsWith('62')) n = '62' + n;
  return n;
}

/** Buka WhatsApp dengan pesan siap kirim. */
export function openWa(hp: string | undefined, message: string): void {
  const text = encodeURIComponent(message);
  const url = hp
    ? `https://wa.me/${normalizeHp(hp)}?text=${text}`
    : `https://wa.me/?text=${text}`;
  window.open(url, '_blank');
}
