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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Excluir handlebars do processamento webpack no servidor
      config.externals = config.externals || [];
      config.externals.push({
        handlebars: "commonjs handlebars",
      });
    }

    // Ignorar warnings específicos do handlebars
    config.ignoreWarnings = [
      { module: /node_modules\/handlebars/ },
      { message: /require\.extensions/ },
    ];

    return config;
  },
  experimental: {
    // Permitir que o servidor use módulos CommonJS
    serverComponentsExternalPackages: ["handlebars", "extenso"],
  },
};

export default nextConfig;
