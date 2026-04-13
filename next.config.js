/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Suppress warnings for native server-only packages used in AI layer
  serverExternalPackages: [
    "pdf-parse",
    "tesseract.js",
    "xlsx",
  ],
};

module.exports = nextConfig;
