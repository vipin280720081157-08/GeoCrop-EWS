import React from "react";

export default function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${connected ? "text-success" : "text-textDisabled"}`}>
      <span
        className="w-2 h-2 rounded-full"
        style={{
          background: connected ? "#43A047" : "#BDBDBD",
          boxShadow: connected ? "0 0 0 3px #E8F5E9" : "none",
        }}
      />
      {connected ? "Connected" : "Offline"}
    </span>
  );
}
