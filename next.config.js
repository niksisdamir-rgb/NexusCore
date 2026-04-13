/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable the instrumentation.ts hook (registers BackgroundWorker on server start)
  experimental: {
    instrumentationHook: true,
  },
  // Suppress warnings for server-only packages used in AI layer
  serverExternalPackages: [
    "better-sqlite3",
    "pdf-parse",
    "tesseract.js",
    "xlsx",
  ],
};

module.exports = nextConfig;
