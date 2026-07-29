import type { NextConfig } from "next";

// WebContainers (Phase 3) require the page to be cross-origin isolated so that
// SharedArrayBuffer is available. COEP "credentialless" keeps cross-origin
// subresources (e.g. the Monaco CDN) loadable while still enabling isolation.
const crossOriginIsolationHeaders = [
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: crossOriginIsolationHeaders,
      },
    ];
  },
};

export default nextConfig;
