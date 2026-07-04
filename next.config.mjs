/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export hanya untuk build Capacitor (APK).
  // Build dev biasa tetap SSR supaya hot-reload & routing normal.
  ...(process.env.CAPACITOR_BUILD === '1'
    ? { output: 'export', images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
