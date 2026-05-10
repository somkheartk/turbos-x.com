/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

const securityHeaders = [
  { key: 'Strict-Transport-Security',  value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options',     value: 'nosniff' },
  { key: 'X-Frame-Options',            value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      isDev
        ? "connect-src 'self' https: http://localhost:* http://127.0.0.1:*"
        : "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig = {
  output: 'standalone',
  experimental: {
    typedRoutes: true,
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
