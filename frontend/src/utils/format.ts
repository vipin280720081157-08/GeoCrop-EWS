export function round1(value: number | null | undefined): number {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return Math.round(value * 10) / 10;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-IN");
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("en-IN");
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function formatTimestampISO(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export function getSeasonFromMonth(month: number): string {
  if (month === 1 || month === 2) return "winter";
  if (month >= 3 && month <= 5) return "summer";
  if (month >= 6 && month <= 9) return "southwest_monsoon";
  if (month >= 10 && month <= 12) return "northeast_monsoon";
  return "southwest_monsoon";
}
