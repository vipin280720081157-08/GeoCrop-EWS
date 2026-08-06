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
  border: "#E0E0E0",
};

export function riskColor(level: string): string {
  if (level === "High") return COLORS.error;
  if (level === "Medium") return COLORS.warning;
  return COLORS.success;
}
