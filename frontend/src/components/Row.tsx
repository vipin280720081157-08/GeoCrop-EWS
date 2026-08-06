import React from "react";

export default function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-borderC last:border-b-0">
      <span className="text-sm text-textSecondary">{label}</span>
      <span className="text-sm font-semibold text-textPrimary">{value}</span>
    </div>
  );
}
