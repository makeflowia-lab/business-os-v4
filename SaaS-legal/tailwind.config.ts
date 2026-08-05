import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': 'var(--color-brand-primary)',
        'brand-accent': 'var(--color-brand-accent)',
        'bg-dark': 'var(--color-bg-dark)',
        'bg-card': 'var(--color-bg-card)',
        'border-subtle': 'var(--color-border-subtle)',
      },
      fontFamily: {
        sans: ['var(--font-family-sans)'],
      },
    },
  },
  plugins: [],
}

export default config
