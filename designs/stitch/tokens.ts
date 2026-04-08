/**
 * Queens Henna Design Tokens
 * Theme: Regal Verdance (from Stitch design system)
 *
 * Material Design 3 color system with light theme.
 * Font: Public Sans / Pretendard (Korean fallback)
 * Icons: Phosphor Icons (app) / Material Symbols Outlined (reference only)
 */

// ─── Colors ─────────────────────────────────────────────
export const colors = {
  // Primary
  primary: "#576063",
  "primary-dim": "#4b5457",
  "primary-container": "#dbe4e7",
  "on-primary": "#f0f9fc",
  "on-primary-container": "#4a5356",
  "primary-fixed": "#dbe4e7",
  "primary-fixed-dim": "#cdd6d9",
  "on-primary-fixed": "#384143",
  "on-primary-fixed-variant": "#545d60",
  "inverse-primary": "#e6eff3",

  // Secondary
  secondary: "#5d5f61",
  "secondary-dim": "#515355",
  "secondary-container": "#e1e2e4",
  "on-secondary": "#f8f9fb",
  "on-secondary-container": "#505254",
  "secondary-fixed": "#e1e2e4",
  "secondary-fixed-dim": "#d3d4d6",
  "on-secondary-fixed": "#3d4041",
  "on-secondary-fixed-variant": "#595c5e",

  // Tertiary
  tertiary: "#4b6274",
  "tertiary-dim": "#3f5667",
  "tertiary-container": "#d0e8fe",
  "on-tertiary": "#f5f9ff",
  "on-tertiary-container": "#3f5668",
  "tertiary-fixed": "#d0e8fe",
  "tertiary-fixed-dim": "#c2daf0",
  "on-tertiary-fixed": "#2d4455",
  "on-tertiary-fixed-variant": "#496072",

  // Error
  error: "#9f403d",
  "error-dim": "#4e0309",
  "error-container": "#fe8983",
  "on-error": "#fff7f6",
  "on-error-container": "#752121",

  // Surface
  surface: "#fbf9f9",
  "surface-dim": "#d7dbdb",
  "surface-bright": "#fbf9f9",
  "surface-variant": "#e1e3e3",
  "surface-tint": "#576063",
  "surface-container-lowest": "#ffffff",
  "surface-container-low": "#f4f3f3",
  "surface-container": "#eeeeee",
  "surface-container-high": "#e7e8e8",
  "surface-container-highest": "#e1e3e3",
  "on-surface": "#303334",
  "on-surface-variant": "#5c6060",
  "inverse-surface": "#0d0e0f",
  "inverse-on-surface": "#9d9d9d",

  // Outline
  outline: "#787b7c",
  "outline-variant": "#b0b2b3",

  // Background
  background: "#fbf9f9",
  "on-background": "#303334",

  // Original brand palette (from DESIGN.md)
  brand: {
    primary: "#70797c",
    secondary: "#757779",
    tertiary: "#637a8d",
    neutral: "#777777",
  },
} as const

// ─── Typography ─────────────────────────────────────────
export const typography = {
  fontFamily: {
    headline: ["Public Sans", "Pretendard", "sans-serif"],
    body: ["Public Sans", "Pretendard", "sans-serif"],
    label: ["Public Sans", "Pretendard", "sans-serif"],
  },
  fontSize: {
    "display-lg": ["3.5625rem", { lineHeight: "4rem", letterSpacing: "-0.25px", fontWeight: "900" }],
    "display-md": ["2.8125rem", { lineHeight: "3.25rem", fontWeight: "900" }],
    "display-sm": ["2.25rem", { lineHeight: "2.75rem", fontWeight: "900" }],
    "headline-lg": ["2rem", { lineHeight: "2.5rem", fontWeight: "900" }],
    "headline-md": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "800" }],
    "headline-sm": ["1.5rem", { lineHeight: "2rem", fontWeight: "800" }],
    "title-lg": ["1.375rem", { lineHeight: "1.75rem", fontWeight: "700" }],
    "title-md": ["1rem", { lineHeight: "1.5rem", fontWeight: "700", letterSpacing: "0.15px" }],
    "title-sm": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "700", letterSpacing: "0.1px" }],
    "body-lg": ["1rem", { lineHeight: "1.5rem", fontWeight: "400", letterSpacing: "0.5px" }],
    "body-md": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400", letterSpacing: "0.25px" }],
    "body-sm": ["0.75rem", { lineHeight: "1rem", fontWeight: "400", letterSpacing: "0.4px" }],
    "label-lg": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "600", letterSpacing: "0.1px" }],
    "label-md": ["0.75rem", { lineHeight: "1rem", fontWeight: "600", letterSpacing: "0.5px" }],
    "label-sm": ["0.6875rem", { lineHeight: "1rem", fontWeight: "600", letterSpacing: "0.5px" }],
  },
} as const

// ─── Shape / Border Radius ──────────────────────────────
export const radius = {
  none: "0",
  xs: "0.125rem",   // 2px  - subtle
  sm: "0.25rem",     // 4px
  md: "0.5rem",      // 8px
  lg: "0.75rem",     // 12px
  xl: "1rem",        // 16px
  "2xl": "1.25rem",  // 20px
  "3xl": "1.5rem",   // 24px
  "4xl": "2rem",     // 32px
  "5xl": "2.5rem",   // 40px
  full: "9999px",
} as const

// ─── Spacing ────────────────────────────────────────────
export const spacing = {
  0: "0",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const

// ─── Shadows ────────────────────────────────────────────
export const shadows = {
  sm: "0 2px 8px rgba(0, 0, 0, 0.04)",
  md: "0 4px 12px rgba(0, 0, 0, 0.06)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.08)",
  xl: "0 12px 32px rgba(0, 0, 0, 0.10)",
  primary: "0 4px 12px rgba(87, 96, 99, 0.2)",
} as const

// ─── Transitions ────────────────────────────────────────
export const transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const

// ─── Layout Constants ───────────────────────────────────
export const layout = {
  sidebarWidth: "280px",
  topbarHeight: "64px",
  maxContentWidth: "1400px",
  contentPadding: "2rem",
} as const
