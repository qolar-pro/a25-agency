/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A sibling lockfile exists one directory up (D:\apps), which makes Next
  // infer the wrong workspace root for build-trace collection. Pin it to this
  // project directory.
  outputFileTracingRoot: import.meta.dirname,
  // geoip-lite reads its country database (.dat files) from disk at runtime,
  // relative to its own package path. Webpack-bundling it breaks that lookup
  // (ENOENT on geoip-country.dat), so keep it external: Next loads it from
  // node_modules at runtime with its data files intact. Used by
  // lib/languageDetect.ts's detectFromIP.
  serverExternalPackages: ['geoip-lite'],
  // geoip-lite loads its .dat databases via a runtime fs.readFileSync that the
  // build tracer can't follow, so the data files aren't auto-included in the
  // serverless function bundle. Force-include them for the routes that reach
  // lib/languageDetect.ts (the /track page and the chat API, which both call
  // into detectFromIP / the shared language module).
  outputFileTracingIncludes: {
    '/track/[token]': ['./node_modules/geoip-lite/data/*.dat'],
    '/api/chat': ['./node_modules/geoip-lite/data/*.dat'],
    '/api/telegram-webhook': ['./node_modules/geoip-lite/data/*.dat'],
  },
  webpack: (config) => {
    // The shared logic layer in lib/*.ts imports siblings with an explicit
    // `.js` extension (NodeNext/ESM convention). Teach webpack to resolve
    // those specifiers to the real `.ts` sources so lib/ stays untouched.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias || {}),
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;
