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
        // Light-blue glassmorphism palette (matches coin shop design)
        'glass-bg': '#EEF4FF',
        'glass-border': '#C8D9F5',
        'glass-card': 'rgba(255,255,255,0.65)',

        ivory: '#FAF7F2',
        sand: {
          DEFAULT: '#F0E8DC',
          dark: '#E0D0BC',
        },
        charcoal: {
          DEFAULT: '#1C1C1E',
          soft: '#3A3A3C',
        },
        // Renamed from 'emerald' → 'brand' to avoid overriding Tailwind's built-in emerald scale
        brand: {
          DEFAULT: '#0D4A3C',
          light: '#1A6B54',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C96A',
        },
        border: '#E8DDD0',

        // Coin shop blues
        'coin-blue': {
          50: '#EEF4FF',
          100: '#D6E4FF',
          200: '#ADC8FF',
          300: '#84ABFF',
          400: '#5B8EFF',
          500: '#3471FF',
          600: '#1A56DB',
          700: '#1042B3',
          800: '#0B328A',
          900: '#072261',
        },
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
        'brand-sm': '0 2px 8px rgba(13, 74, 60, 0.08)',
        'brand-md': '0 8px 24px rgba(13, 74, 60, 0.12)',
        'brand-lg': '0 16px 48px rgba(13, 74, 60, 0.16)',
        'gold-sm': '0 2px 8px rgba(201, 168, 76, 0.15)',
        'gold-md': '0 8px 24px rgba(201, 168, 76, 0.2)',
        'glass': '0 8px 32px rgba(31, 75, 180, 0.08)',
        'glass-lg': '0 16px 48px rgba(31, 75, 180, 0.14)',
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
        'gradient-brand': 'linear-gradient(135deg, #0D4A3C 0%, #1A6B54 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)',
        'gradient-glass': 'linear-gradient(135deg, #EEF4FF 0%, #D6E4FF 100%)',
      },
    },
  },
  plugins: [
    // Hides scrollbars while keeping scroll functionality (used in category filter strip)
    require('tailwind-scrollbar-hide'),
  ],
};

export default config;
