import React from "react";
import { ShieldCheck, AlertTriangle, OctagonAlert } from "lucide-react";
import type { RiskLevel } from "@/types";

// Risk level values match the locked GeoCrop dataset spec exactly
// (LOW/MEDIUM/HIGH/CRITICAL, uppercase) -- these are the same strings the
// trained models predict directly, so no transformation happens between
// backend and UI.
const MAP: Record<RiskLevel, { bg: string; fg: string; Icon: typeof ShieldCheck; label: string; solid?: boolean }> = {
  LOW: { bg: "bg-successLight", fg: "text-success", Icon: ShieldCheck, label: "Low Risk" },
  MEDIUM: { bg: "bg-warningLight", fg: "text-warning", Icon: AlertTriangle, label: "Medium Risk" },
  HIGH: { bg: "bg-errorLight", fg: "text-error", Icon: AlertTriangle, label: "High Risk" },
  // CRITICAL uses a solid (filled) chip rather than a light-tint chip --
  // the one deliberate visual escalation beyond High, reserved exclusively
  // for this most severe locked risk level.
  CRITICAL: { bg: "bg-error", fg: "text-white", Icon: OctagonAlert, label: "Critical Risk", solid: true },
};

export default function RiskChip({ level, size = "md" }: { level: RiskLevel; size?: "sm" | "md" }) {
  const s = MAP[level] ?? MAP.LOW;
  const pad = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const fontSize = size === "sm" ? "text-xs" : "text-[13px]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${s.bg} ${s.fg} ${pad} ${fontSize}`}>
      <s.Icon size={14} strokeWidth={2} /> {s.label}
    </span>
  );
}
