import React from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import type { RiskLevel } from "@/types";

const MAP: Record<RiskLevel, { bg: string; fg: string; Icon: typeof ShieldCheck; label: string }> = {
  Low: { bg: "bg-successLight", fg: "text-success", Icon: ShieldCheck, label: "Low Risk" },
  Medium: { bg: "bg-warningLight", fg: "text-warning", Icon: AlertTriangle, label: "Medium Risk" },
  High: { bg: "bg-errorLight", fg: "text-error", Icon: AlertTriangle, label: "High Risk" },
};

export default function RiskChip({ level, size = "md" }: { level: RiskLevel; size?: "sm" | "md" }) {
  const s = MAP[level] ?? MAP.Low;
  const pad = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const fontSize = size === "sm" ? "text-xs" : "text-[13px]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${s.bg} ${s.fg} ${pad} ${fontSize}`}>
      <s.Icon size={14} strokeWidth={2} /> {s.label}
    </span>
  );
}
