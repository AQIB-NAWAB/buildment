import type { NextConfig } from "next";

// WebContainers (Phase 3) require the page to be cross-origin isolated so that
// SharedArrayBuffer is available. Use COEP "require-corp": StackBlitz's hosted
// runtime iframe needs a credentialed context and fails to initialise under
// "credentialless". The Monaco CDN is served with CORP and loads fine here.
const crossOriginIsolationHeaders = [
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
];

const nextConfig: NextConfig = {
  // WebContainer is a singleton and does not tolerate React Strict Mode's
  // double-mount in dev (it orphans the boot effect). Match prod behaviour.
  reactStrictMode: false,
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
