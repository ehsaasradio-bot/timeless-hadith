import type { Config } from "tailwindcss";

/**
 * Dashboard Tailwind config — matches timelesshadith.com brand.
 *
 * Dark mode is driven by the `[data-theme="dark"]` attribute on <html>,
 * the same selector strategy the static site uses.
 */

const config: Config = {
  // Use [data-theme="dark"] on <html> as the dark-mode signal
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — indigo-blue + purple
        accent:        "var(--accent)",
        "accent-hover":"var(--accent-hover)",
        "accent-2":    "var(--accent-2)",
        "accent-3":    "var(--accent-3)",

        // Surface tokens (drive light/dark via CSS variables)
        ink:        "var(--ink)",
        muted:      "var(--muted)",
        bg:         "var(--bg)",
        surface:    "var(--surface)",
        surface2:   "var(--surface2)",
        "th-border":"var(--border)",
        "nav-bg":   "var(--nav-bg)",
      },
      fontFamily: {
        sans: [
          "Cairo",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        arabic: [
          "Cairo",
          "Noto Kufi Arabic",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card:  "var(--card-shadow)",
        cardH: "var(--card-shadow-hover)",
      },
    },
  },
  plugins: [],
};

export default config;
