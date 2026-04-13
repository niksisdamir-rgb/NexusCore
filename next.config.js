/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress warnings for native server-only packages used in AI layer
  serverExternalPackages: [
    "better-sqlite3",
    "pdf-parse",
    "tesseract.js",
    "xlsx",
  ],
};

module.exports = nextConfig;
