import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent:         "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-2":     "var(--accent-2)",
        "accent-3":     "var(--accent-3)",
        ink:            "var(--ink)",
        muted:          "var(--muted)",
        bg:             "var(--bg)",
        surface:        "var(--surface)",
        surface2:       "var(--surface2)",
        "th-border":    "var(--border)",
        "nav-bg":       "var(--nav-bg)",
      },
      fontFamily: {
        sans:   ["Cairo", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        arabic: ["Cairo", "Noto Kufi Arabic", "sans-serif"],
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
