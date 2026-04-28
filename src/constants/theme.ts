import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#010013",
    background: "#FAF9F6",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
    accent: "#208AEF",
    accentStrong: "#1A2953",
    accentSoft: "#D5EBFF",
    success: "#1F9D61",
    warning: "#E88A1D",
    danger: "#E74C3C",
    heroBackground: "#DBE5F8",
    heroBadgeBackground: "#C7DEFC",
    heroBadgeText: "#14578D",
    heroDescription: "#365B77",
    mapHeroBackground: "#F3F8EC",
    mapHeroEyebrow: "#507B23",
    primaryButtonBackground: "#1A2953",
    primaryButtonBorder: "#24386E",
    primaryButtonText: "#FAF9F6",
    secondaryButtonBackground: "#FAF9F6",
    secondaryButtonBorder: "#9AC8F1",
    secondaryButtonText: "#1A2953",
    tableBorder: "rgba(32, 138, 239, 0.15)",
    tableRowBorder: "rgba(0, 0, 0, 0.1)",
    tableHeaderBackground: "rgba(59, 130, 246, 0.08)",
    summaryMeta: "rgba(26, 41, 83, 0.7)",
  },
  dark: {
    text: "#FAF9F6",
    background: "#010013",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
    accent: "#4AA3F5",
    accentStrong: "#208AEF",
    accentSoft: "#2E3D5C",
    success: "#43C37E",
    warning: "#F2A642",
    danger: "#F07167",
    heroBackground: "#1A2953",
    heroBadgeBackground: "#2E3D5C",
    heroBadgeText: "#C7DEFC",
    heroDescription: "#D9E6F5",
    mapHeroBackground: "#243020",
    mapHeroEyebrow: "#B9D694",
    primaryButtonBackground: "#208AEF",
    primaryButtonBorder: "#6BB8FF",
    primaryButtonText: "#FAF9F6",
    secondaryButtonBackground: "#161A20",
    secondaryButtonBorder: "#335C84",
    secondaryButtonText: "#E8F2FF",
    tableBorder: "rgba(74, 163, 245, 0.22)",
    tableRowBorder: "rgba(255, 255, 255, 0.12)",
    tableHeaderBackground: "rgba(74, 163, 245, 0.16)",
    summaryMeta: "rgba(232, 242, 255, 0.72)",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
