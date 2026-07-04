import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Simpan & (di Android) buka share sheet untuk sebuah file teks (JSON).
 * Di web/dev (bukan native), fallback ke download browser biasa.
 */
export async function saveFile(filename: string, content: string) {
  if (Capacitor.isNativePlatform()) {
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    await Share.share({
      title: filename,
      url: result.uri,
    });

    return result.uri;
  }

  // Fallback web: trigger download langsung di browser (dev mode).
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return url;
}

/** Export backup JSON seluruh database. */
export async function exportBackupJson(data: unknown) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await saveFile(`kasir-amanah-backup-${stamp}.json`, JSON.stringify(data, null, 2));
}

/** Bagikan teks lepas (struk/rekap) via share sheet; fallback clipboard/alert di web. */
export async function shareText(title: string, text: string) {
  if (Capacitor.isNativePlatform()) {
    await Share.share({ title, text, dialogTitle: title });
    return;
  }
  const nav = navigator as Navigator & {
    share?: (d: { title?: string; text: string }) => Promise<void>;
  };
  if (nav.share) {
    try {
      await nav.share({ title, text });
      return;
    } catch {
      /* fallback */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    alert(`${title} disalin ke clipboard:\n\n${text}`);
  } catch {
    alert(text);
  }
}
