/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Ship the prebuilt SQLite file with the serverless functions. Without this,
  // Next's file tracer never sees data/roadmap.db (it's opened via a runtime
  // path, not an import) and the deploy 500s with SQLITE_CANTOPEN.
  experimental: {
    outputFileTracingIncludes: {
      "/api/**/*": ["./data/roadmap.db"],
      "/": ["./data/roadmap.db"],
    },
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({ "better-sqlite3": "commonjs better-sqlite3" });
    return config;
  },
};
module.exports = nextConfig;
