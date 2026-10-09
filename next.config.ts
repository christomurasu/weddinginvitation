/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // URL admin lama /weddings/... → /events/weddings/...
  async redirects() {
    return [
      { source: "/weddings", destination: "/events", permanent: false },
      { source: "/weddings/:path*", destination: "/events/weddings/:path*", permanent: false },
    ]
  },
};

export default nextConfig;
