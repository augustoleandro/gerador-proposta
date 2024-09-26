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
  serverRuntimeConfig: {
    // Aumenta o timeout para 30 segundos (valor em milissegundos)
    apiResponseTimeout: 30000,
  },
};

export default nextConfig;
