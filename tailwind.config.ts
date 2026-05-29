import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'hsl(var(--brand-primary) / <alpha-value>)',
          secondary: 'hsl(var(--brand-secondary) / <alpha-value>)',
        },
        bg: {
          base: 'hsl(var(--bg-base) / <alpha-value>)',
          surface: 'hsl(var(--bg-surface) / <alpha-value>)',
          elevated: 'hsl(var(--bg-elevated) / <alpha-value>)',
          border: 'hsl(var(--bg-border) / <alpha-value>)',
        },
        text: {
          primary: 'hsl(var(--text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--text-secondary) / <alpha-value>)',
          muted: 'hsl(var(--text-muted) / <alpha-value>)',
        },
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        error: 'hsl(var(--error) / <alpha-value>)',
        info: 'hsl(var(--info) / <alpha-value>)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': '1.25rem',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        glow: 'var(--shadow-glow)',
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse_ring: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.08)', opacity: '0.7' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        pulse_ring: 'pulse_ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
