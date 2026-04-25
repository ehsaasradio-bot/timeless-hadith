// tailwind.config.ts
// Timeless Hadith Shop — Extended Tailwind config

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF7F2',
        sand: {
          DEFAULT: '#F0E8DC',
          dark: '#E0D0BC',
        },
        charcoal: {
          DEFAULT: '#1C1C1E',
          soft: '#3A3A3C',
        },
        emerald: {
          DEFAULT: '#0D4A3C',
          light: '#1A6B54',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C96A',
        },
        border: '#E8DDD0',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'emerald-sm': '0 2px 8px rgba(13, 74, 60, 0.08)',
        'emerald-md': '0 8px 24px rgba(13, 74, 60, 0.12)',
        'emerald-lg': '0 16px 48px rgba(13, 74, 60, 0.16)',
        'gold-sm': '0 2px 8px rgba(201, 168, 76, 0.15)',
        'gold-md': '0 8px 24px rgba(201, 168, 76, 0.2)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      scale: {
        '102': '1.02',
        '104': '1.04',
        '108': '1.08',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fadeIn 0.4s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-ivory': 'linear-gradient(135deg, #FAF7F2 0%, #F0E8DC 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #0D4A3C 0%, #1A6B54 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)',
      },
    },
  },
  plugins: [
    // @tailwindcss/line-clamp is built-in since Tailwind v3.3 — no plugin needed
  ],
};

export default config;
