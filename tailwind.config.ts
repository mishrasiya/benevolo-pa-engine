import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0e1a',
          900: '#0d1117',
          800: '#111827',
          700: '#1a2332',
          600: '#1f2937',
          500: '#374151',
        },
        cyan: {
          DEFAULT: '#00d4ff',
          dark: '#0099cc',
          light: '#66e5ff',
        },
        green: {
          accent: '#00ff9d',
          dark: '#00cc7a',
        },
        amber: {
          accent: '#f59e0b',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['IBM Plex Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
