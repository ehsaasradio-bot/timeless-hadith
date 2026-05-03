export const colors = {
  brand: {
    50:  "#eef2ff",
    100: "#dbe3ff",
    200: "#bccafd",
    300: "#a0baff",
    400: "#7891fb",
    500: "#4f72f8",
    600: "#3a5ce0",
    700: "#2d4ac0",
    800: "#23399c",
    900: "#1a2a78",
  },
  brand2: {
    50:  "#f4efff",
    100: "#e7dcff",
    200: "#d0bdff",
    300: "#b89bf0",
    400: "#9c7aeb",
    500: "#7c5ce6",
    600: "#6a48d8",
    700: "#553aae",
    800: "#402c83",
    900: "#2a1d59",
  },
  ink: {
    50:  "#f5f5f7",
    100: "#ebebeb",
    200: "#e0e0e0",
    300: "#c4c4c8",
    400: "#9a9a9f",
    500: "#6e6e73",
    600: "#46464a",
    700: "#2f2f33",
    800: "#1d1d1f",
    900: "#0a0a0a",
  },
  status: {
    success: "#16a34a",
    warning: "#d97706",
    danger:  "#dc2626",
    info:    "#0284c7",
    neutral: "#64748b",
  },
  surface: {
    light:      "#ffffff",
    lightMuted: "#f5f5f7",
    dark:       "#060c1a",
    darkMuted:  "#0d1629",
  },
} as const;

export const spacing = {
  xs:    "0.5rem",
  sm:    "0.75rem",
  md:    "1rem",
  lg:    "1.5rem",
  xl:    "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const;

export const radius = {
  sm:   "rounded-lg",
  md:   "rounded-xl",
  lg:   "rounded-2xl",
  xl:   "rounded-3xl",
  full: "rounded-full",
} as const;

export const shadows = {
  none:   "shadow-none",
  soft:   "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]",
  card:   "shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
  lifted: "shadow-[0_16px_48px_rgba(0,0,0,0.14)]",
  glow:   "shadow-[0_0_0_1px_rgba(79,114,248,0.15),0_8px_24px_-12px_rgba(79,114,248,0.30)]",
} as const;

export const gradients = {
  brand:      "bg-gradient-to-br from-[#4f72f8] via-[#5a6cf2] to-[#7c5ce6]",
  brandSoft:  "bg-gradient-to-br from-[#eef2ff] via-[#f3eeff] to-[#e7dcff]",
  surface:    "bg-gradient-to-b from-[var(--bg)] to-[var(--surface)]",
  glassLight: "bg-gradient-to-br from-white/80 via-white/60 to-white/40",
  glassDark:  "bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02]",
} as const;

export const glass = {
  base:  "th-glass",
  inset: "ring-1 ring-inset ring-white/[0.4] dark:ring-white/[0.04]",
} as const;

export const card = {
  default: "rounded-2xl th-glass p-5 sm:p-6",
  large:   "rounded-3xl th-glass p-6 sm:p-8",
  flat:    "rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-5 sm:p-6",
} as const;

export const statusBg = {
  brand:  "bg-[#eef2ff] text-[#3a5ce0] dark:bg-[#3a5ce0]/30 dark:text-[#a0baff]",
  blue:   "bg-[#dbe3ff] text-[#23399c] dark:bg-[#23399c]/30 dark:text-[#bccafd]",
  amber:  "bg-[#fef3c7] text-[#92400e] dark:bg-[#92400e]/30 dark:text-[#fde68a]",
  violet: "bg-[#f4efff] text-[#553aae] dark:bg-[#553aae]/30 dark:text-[#d0bdff]",
  rose:   "bg-[#ffe4e6] text-[#9f1239] dark:bg-[#9f1239]/30 dark:text-[#fda4af]",
} as const;

export type StatusAccent = keyof typeof statusBg;

const designTokens = {
  colors,
  spacing,
  radius,
  shadows,
  gradients,
  glass,
  card,
  statusBg,
};

export default designTokens;
