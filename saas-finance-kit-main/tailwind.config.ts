import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: '#e6e7ee',
          dark: '#b8b9be',
          light: '#ffffff',
          'bg-dark': '#2d2d2d',
          'dark-shadow': '#1a1a1a',
          'light-shadow': '#404040',
        },
      },
      boxShadow: {
        'neu-sm': '3px 3px 6px #b8b9be, -3px -3px 6px #ffffff',
        'neu': '6px 6px 12px #b8b9be, -6px -6px 12px #ffffff',
        'neu-md': '8px 8px 16px #b8b9be, -8px -8px 16px #ffffff',
        'neu-lg': '12px 12px 24px #b8b9be, -12px -12px 24px #ffffff',
        'neu-inset-sm': 'inset 2px 2px 4px #b8b9be, inset -2px -2px 4px #ffffff',
        'neu-inset': 'inset 4px 4px 8px #b8b9be, inset -4px -4px 8px #ffffff',
        'neu-inset-md': 'inset 6px 6px 12px #b8b9be, inset -6px -6px 12px #ffffff',
      },
    },
  },
  plugins: [typography],
}

export default config
