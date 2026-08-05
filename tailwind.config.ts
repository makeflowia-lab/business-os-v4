import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        raziel: {
          bg: '#060810',
          surface: '#0d1117',
          border: '#1a2744',
          blue: '#0ea5e9',
          'blue-dim': '#0369a1',
          'blue-glow': 'rgba(14, 165, 233, 0.4)',
          'soul': '#00d4ff',
          'soul-dim': 'rgba(0, 212, 255, 0.15)',
          text: '#e2e8f0',
          muted: '#64748b',
          human: '#8b5e3c',
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'soul-flicker': 'soul-flicker 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)' },
          '50%': { boxShadow: '0 0 35px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 212, 255, 0.3)' },
        },
        'soul-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
