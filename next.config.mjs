/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/omie/:path*",
        destination: "https://app.omie.com.br/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
