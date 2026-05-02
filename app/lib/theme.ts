export const colors = {
  bg: "#0f1225",
  bgElevated: "#1a1f3a",
  border: "#2a3050",
  text: "#ffffff",
  textMuted: "#a0a8c0",
  textDim: "#7a8099",
  textLink: "#7eb1ff",
  primary: "#3b82f6",
  primaryHover: "#2563eb",
  success: "#22c55e",
  warning: "#eab308",
  danger: "#ef4444",
  dangerSoft: "#2a1a1a",
  dangerBorder: "#5a2a2a",
} as const;

export const severityColor = {
  critical: colors.danger,
  high: "#f97316",
  medium: colors.warning,
  low: colors.success,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 64,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;
