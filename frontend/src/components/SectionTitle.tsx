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
        {Icon && <Icon size={20} strokeWidth={2} className="text-textPrimary dark:text-darkTextPrimary" />}
        <h2 className="text-[18px] sm:text-[20px] font-bold text-textPrimary dark:text-darkTextPrimary m-0">{children}</h2>
      </div>
      {right}
    </div>
  );
}
