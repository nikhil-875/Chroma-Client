/**
 * Custom Next.js configuration to handle Node.js modules in client bundles
 */

/** @type {import('next').NextConfig} */
const userNextConfig = {
  webpack: (config, { isServer }) => {
    // Only for client-side bundles
    if (!isServer) {
      // Ignore node-specific modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        child_process: false,
        worker_threads: false,
        perf_hooks: false,
        "node:fs": false,
        "node:path": false,
        "node:os": false,
        "node:crypto": false,
        "node:stream": false,
        "node:child_process": false,
        "node:worker_threads": false,
        "node:perf_hooks": false,
      };
    }
    return config;
  },
  transpilePackages: ["@xenova/transformers"]
};

export default userNextConfig; 