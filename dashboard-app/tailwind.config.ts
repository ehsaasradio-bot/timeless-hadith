import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f8f9",
          100: "#eef0f2",
          200: "#dde1e6",
          300: "#b9c0c8",
          400: "#7e8a96",
          500: "#56616d",
          600: "#3a444f",
          700: "#293039",
          800: "#1a1f26",
          900: "#0f1318",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
