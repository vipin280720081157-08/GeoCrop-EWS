/** Design-system colors, kept in one place for chart strokes/fills that need raw hex values. */
export const COLORS = {
  primary: "#2E7D32",
  secondary: "#1565C0",
  accent: "#F9A825",
  success: "#43A047",
  warning: "#FB8C00",
  error: "#D32F2F",
  teal: "#00897B",
  textSecondary: "#607D8B",
  textDisabled: "#9E9E9E",
  border: "#E0E0E0",
  card: "#FFFFFF",
};

export function getThemeColors(isDark = false) {
  if (isDark) {
    return {
      primary: "#43A047",
      secondary: "#4FA3F7",
      accent: "#FFB84D",
      success: "#4CAF50",
      warning: "#FFA726",
      error: "#EF5350",
      teal: "#26A69A",
      textSecondary: "#94A3AD",
      textDisabled: "#5A656B",
      border: "#2C363C",
      card: "#1E252A",
    };
  }
  return COLORS;
}

export function riskColor(level: string, isDark = false): string {
  const colors = getThemeColors(isDark);
  if (level === "High") return colors.error;
  if (level === "Medium") return colors.warning;
  return colors.success;
}
