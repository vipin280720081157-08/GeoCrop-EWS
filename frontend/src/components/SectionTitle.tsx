import React from "react";
import type { LucideIcon } from "lucide-react";

interface SectionTitleProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  right?: React.ReactNode;
}

export default function SectionTitle({ children, icon: Icon, right }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={20} strokeWidth={2} className="text-textPrimary" />}
        <h2 className="text-[22px] font-semibold text-textPrimary m-0">{children}</h2>
      </div>
      {right}
    </div>
  );
}
