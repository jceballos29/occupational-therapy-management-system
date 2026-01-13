import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      // Solo aplicamos esto si estamos en modo desarrollo
      allowedOrigins: process.env.NODE_ENV === 'development' 
        ? ["*.app.github.dev", "localhost:3000"] 
        : [], // En producción dejamos que Next.js maneje la seguridad estándar
    },
  },
};

export default nextConfig;
