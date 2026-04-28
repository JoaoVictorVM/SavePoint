import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permite carregar capas de qualquer host HTTPS — comum em apps de game tracking
    // onde URLs vêm de diversas fontes (IGDB, Steam, GOG, etc).
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    // Tamanhos pré-calculados pra capas (reduz CPU em build/serve)
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [40, 60, 80, 160, 240],
  },
};

export default nextConfig;
