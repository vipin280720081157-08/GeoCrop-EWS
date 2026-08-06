import React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "./Card";

interface StatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  value: React.ReactNode;
  unit?: string;
  trend?: "up" | "down";
  trendLabel?: string;
  trendUp?: boolean;
}

export default function StatCard({ icon: Icon, iconColor = "#2E7D32", title, value, unit, trend, trendLabel, trendUp }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}1A` }}>
          <Icon size={20} strokeWidth={2} color={iconColor} />
        </div>
        <span className="text-[15px] text-textSecondary font-medium">{title}</span>
      </div>
      <div className="text-[32px] font-bold text-textPrimary leading-tight">
        {value}
        {unit && <span className="text-lg font-medium text-textSecondary"> {unit}</span>}
      </div>
      {trendLabel && (
        <div className={`mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold ${trendUp ? "text-success" : "text-textSecondary"}`}>
          {trend === "up" ? <TrendingUp size={14} /> : trend === "down" ? <TrendingDown size={14} /> : null}
          {trendLabel}
        </div>
      )}
    </Card>
  );
}
