/**
 * Apple-style design tokens for the Hadith Reader Dashboard.
 *
 * These tokens are intentionally framework-agnostic strings (Tailwind class
 * names + CSS values) so they can be consumed by both server and client
 * components without any runtime overhead.
 */

export const colors = {
  // Soft Islamic green palette
  brand: {
    50: "#f0faf3",
    100: "#dcf2e1",
    200: "#bce5c8",
    300: "#8dd1a3",
    400: "#5cb87d",
    500: "#3a9e5e", // primary
    600: "#2c7f4a",
    700: "#25653c",
    800: "#1f5132",
    900: "#1a432b",
  },
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
  status: {
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#0284c7",
    neutral: "#64748b",
  },
  surface: {
    light: "#ffffff",
    lightMuted: "#f7f8f9",
    dark: "#0f1318",
    darkMuted: "#1a1f26",
  },
} as const;

export const spacing = {
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const;

export const radius = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
  full: "rounded-full",
} as const;

export const shadows = {
  none: "shadow-none",
  soft: "shadow-[0_1px_2px_rgba(15,19,24,0.04),0_1px_2px_rgba(15,19,24,0.06)]",
  card: "shadow-[0_1px_2px_rgba(15,19,24,0.04),0_8px_24px_-12px_rgba(15,19,24,0.08)]",
  lifted:
    "shadow-[0_4px_8px_-2px_rgba(15,19,24,0.06),0_16px_32px_-12px_rgba(15,19,24,0.10)]",
  glow: "shadow-[0_0_0_1px_rgba(58,158,94,0.15),0_8px_24px_-12px_rgba(58,158,94,0.25)]",
} as const;

export const gradients = {
  brand:
    "bg-gradient-to-br from-[#3a9e5e] via-[#2c7f4a] to-[#1f5132]",
  brandSoft:
    "bg-gradient-to-br from-[#f0faf3] via-[#dcf2e1] to-[#bce5c8]",
  surface:
    "bg-gradient-to-b from-white to-[#f7f8f9] dark:from-[#1a1f26] dark:to-[#0f1318]",
  glassLight:
    "bg-gradient-to-br from-white/80 via-white/60 to-white/40",
  glassDark:
    "bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-white/[0.02]",
} as const;

/**
 * Premium glass-card class string. Combine with rounded-2xl/rounded-3xl
 * and a shadow token for a complete card.
 */
export const glass = {
  // Light/dark adaptive translucent surface
  base:
    "backdrop-blur-xl bg-white/70 dark:bg-white/[0.04] " +
    "border border-black/[0.06] dark:border-white/[0.06]",
  // Subtle hover state
  hover:
    "transition-all duration-200 hover:bg-white/85 dark:hover:bg-white/[0.06]",
  // Inset highlight for premium feel
  inset:
    "ring-1 ring-inset ring-white/[0.4] dark:ring-white/[0.04]",
} as const;

/**
 * Convenience composite — drop into a div for an instant Apple-style card.
 */
export const card = {
  default: [
    "rounded-2xl",
    glass.base,
    glass.inset,
    shadows.card,
    "p-5 sm:p-6",
  ].join(" "),
  large: [
    "rounded-3xl",
    glass.base,
    glass.inset,
    shadows.lifted,
    "p-6 sm:p-8",
  ].join(" "),
  flat: [
    "rounded-2xl",
    "bg-white dark:bg-[#1a1f26]",
    "border border-black/[0.06] dark:border-white/[0.06]",
    "p-5 sm:p-6",
  ].join(" "),
} as const;

/**
 * Status accent backgrounds (subtle, used for stat-card icon chips).
 */
export const statusBg = {
  brand: "bg-[#dcf2e1] text-[#1f5132] dark:bg-[#1f5132]/30 dark:text-[#8dd1a3]",
  blue: "bg-[#dbeafe] text-[#1e3a8a] dark:bg-[#1e3a8a]/30 dark:text-[#93c5fd]",
  amber: "bg-[#fef3c7] text-[#92400e] dark:bg-[#92400e]/30 dark:text-[#fde68a]",
  violet:
    "bg-[#ede9fe] text-[#5b21b6] dark:bg-[#5b21b6]/30 dark:text-[#c4b5fd]",
  rose: "bg-[#ffe4e6] text-[#9f1239] dark:bg-[#9f1239]/30 dark:text-[#fda4af]",
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
