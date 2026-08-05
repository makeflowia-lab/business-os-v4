import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  // Desactivado: en dev React monta los componentes 2 veces y eso abriria 2
  // sesiones de LiveAvatar; el plan Free solo permite 1 sesion concurrente.
  reactStrictMode: false,
  experimental: {
    mcpServer: isDev,  // Solo en desarrollo
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(self), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // unsafe-eval requerido por Next.js dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "media-src 'self' blob:",
              "connect-src 'self' https://openrouter.ai https://api.anthropic.com https://*.google.com wss://*.google.com https://api.elevenlabs.io https://api.liveavatar.com https://*.liveavatar.com wss://*.liveavatar.com https://*.heygen.com wss://*.heygen.com https://*.livekit.cloud wss://*.livekit.cloud",
              "font-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
