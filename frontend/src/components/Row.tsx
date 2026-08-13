import React from "react";

export default function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-borderC dark:border-darkBorderC last:border-b-0">
      <span className="text-sm text-textSecondary dark:text-darkTextSecondary">{label}</span>
      <span className="text-sm font-semibold text-textPrimary dark:text-darkTextPrimary">{value}</span>
    </div>
  );
}
