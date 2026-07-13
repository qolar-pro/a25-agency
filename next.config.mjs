/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A sibling lockfile exists one directory up (D:\apps), which makes Next
  // infer the wrong workspace root for build-trace collection. Pin it to this
  // project directory.
  outputFileTracingRoot: import.meta.dirname,
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
