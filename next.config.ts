import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export: `next build` writes plain HTML/CSS/JS to ./out so the site can be served by the
  // existing Cloudflare Worker static-assets setup (point wrangler's assets.directory at ./out).
  output: 'export',
  images: { unoptimized: true },
  // The dev-mode badge would otherwise show up in the pixel-diff screenshots.
  devIndicators: false,
  // Do not write AGENTS.md / CLAUDE.md into the repo.
  agentRules: false,
  // A stray lockfile in the user's home directory would otherwise be picked as the workspace root.
  turbopack: { root: __dirname },
};

export default nextConfig;
