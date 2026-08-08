import React from "react";

export default function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${connected ? "text-success" : "text-textDisabled"}`}>
      <span className={`w-2 h-2 rounded-full ${connected ? "bg-success shadow-[0_0_0_3px_var(--color-success-light)]" : "bg-textDisabled"}`} />
      {connected ? "Connected" : "Offline"}
    </span>
  );
}
