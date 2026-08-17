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
  // PGlite ships Postgres as a WASM binary plus its own filesystem bundle, both
  // loaded at runtime relative to the package. Bundling it breaks those lookups
  // the same way it breaks geoip-lite, so it stays external too. Used by
  // lib/archive/db.ts.
  serverExternalPackages: ['geoip-lite', '@electric-sql/pglite'],
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
  // Security headers. A pentest of the live site found only HSTS present.
  //
  // Deliberately NOT including a Content-Security-Policy here: the site loads
  // Google Fonts, Unsplash imagery, GSAP/Lenis and Vercel Analytics, and a CSP
  // written blind would very likely break production on deploy. That one needs
  // to be built in report-only mode first and promoted once the reports are
  // clean — a separate, testable piece of work, not a line added here.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Clickjacking. Nothing on this site is meant to be framed, and the
          // /admin dashboard is the page where being framed would matter.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stop the browser second-guessing declared content types — the CSV
          // export in particular should never be sniffed into something else.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // /track/<token> carries a secret token IN THE URL. Without this, that
          // token is sent in the Referer header to any third-party host the page
          // touches. Same for /admin URLs. Send the origin only, cross-origin.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // No page here uses these; denying them costs nothing.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
          }
        ]
      }
    ];
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
