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
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${iconColor}1A` }}>
          <Icon size={20} strokeWidth={2} color={iconColor} />
        </div>
        <span className="text-[14px] sm:text-[15px] text-textSecondary dark:text-darkTextSecondary font-medium leading-tight">{title}</span>
      </div>
      <div className="text-[26px] sm:text-[30px] font-bold text-textPrimary dark:text-darkTextPrimary leading-tight flex items-baseline gap-1">
        <span>{value}</span>
        {unit && <span className="text-base font-normal text-textSecondary dark:text-darkTextSecondary">{unit}</span>}
      </div>
      {trendLabel && (
        <div className={`mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold ${trendUp ? "text-success" : "text-textSecondary dark:text-darkTextSecondary"}`}>
          {trend === "up" ? <TrendingUp size={14} /> : trend === "down" ? <TrendingDown size={14} /> : null}
          <span>{trendLabel}</span>
        </div>
      )}
    </Card>
  );
}
