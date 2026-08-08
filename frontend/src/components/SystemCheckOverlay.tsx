import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, X, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function SystemCheckOverlay() {
  const { systemStatus } = useApp();
  const [visible, setVisible] = useState(() => {
    // Show on initial page open per session, or always brief on mount
    return !sessionStorage.getItem("geocrop_splash_seen");
  });

  useEffect(() => {
    if (!visible) return;
    // Automatically collapse after 2.2 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("geocrop_splash_seen", "true");
    }, 2200);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem("geocrop_splash_seen", "true");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full p-4 rounded-card bg-card border border-borderC shadow-lg fade-in text-textPrimary transition-all duration-200">
      <div className="flex items-start justify-between gap-2 border-b border-borderC pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-textPrimary leading-tight">GeoCrop System Check</h4>
            <p className="text-[11px] text-textSecondary m-0">Early Warning &amp; Decision Support</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-textSecondary hover:text-textPrimary p-1 rounded hover:bg-bg transition-colors"
          title="Dismiss status overlay"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Item label="Application" state={systemStatus.application} text="Ready" />
        <Item
          label="Backend"
          state={systemStatus.backend}
          text={systemStatus.backend === "online" ? "Online" : systemStatus.backend === "checking" ? "Checking..." : "Unavailable"}
        />
        <Item
          label="Data Service"
          state={systemStatus.dataService}
          text={systemStatus.dataService === "receiving" ? "Receiving data" : systemStatus.dataService === "checking" ? "Checking..." : "No recent data"}
        />
        <Item
          label="Hardware"
          state={systemStatus.hardware}
          text={systemStatus.hardware === "connected" ? "Connected" : systemStatus.hardware === "checking" ? "Checking..." : "Offline"}
        />
        <Item
          label="AI Model"
          state={systemStatus.aiModel}
          text={systemStatus.aiModel === "available" ? "Available" : systemStatus.aiModel === "checking" ? "Checking..." : "Not configured"}
        />
        <Item
          label="GPS"
          state={systemStatus.gps}
          text={systemStatus.gps === "fixed" ? "Fixed" : systemStatus.gps === "waiting" ? "Waiting" : "Unavailable"}
        />
      </div>

      <div className="mt-3 pt-2 border-t border-borderC flex items-center justify-between text-[11px] text-textSecondary">
        <span>Persistent status on Dashboard</span>
        <button onClick={handleClose} className="font-semibold text-primary hover:underline">
          Continue &rarr;
        </button>
      </div>
    </div>
  );
}

function Item({ label, state, text }: { label: string; state: string; text: string }) {
  const isOk = state === "ready" || state === "online" || state === "receiving" || state === "connected" || state === "available" || state === "fixed";
  const isChecking = state === "checking" || state === "waiting";

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded bg-bg border border-borderC">
      {isOk ? (
        <CheckCircle2 size={13} className="text-success flex-shrink-0" />
      ) : isChecking ? (
        <Clock size={13} className="text-warning flex-shrink-0 animate-pulse" />
      ) : (
        <AlertCircle size={13} className="text-textSecondary flex-shrink-0" />
      )}
      <div className="truncate">
        <div className="font-medium text-textPrimary text-[11px]">{label}</div>
        <div className="text-textSecondary text-[10px] truncate">{text}</div>
      </div>
    </div>
  );
}
