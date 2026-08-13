import React from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import { useNotifications } from "@/context/NotificationContext";

export default function AlertsPage() {
  const { notifications, markAsRead, clearNotifications } = useNotifications();

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <div>
            <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary font-medium">
              Data-Driven Notification Stream
            </div>
            <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
              System Alerts
            </div>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-borderC text-textSecondary hover:bg-bg"
            >
              Clear All Alerts
            </button>
          )}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Bell}>Active Field Notifications</SectionTitle>
        <div className="flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-textSecondary dark:text-darkTextSecondary">
              <CheckCircle2 size={40} className="mx-auto mb-2 text-success opacity-70" />
              <div className="font-bold text-base text-textPrimary dark:text-darkTextPrimary mb-1">✓ No Active Alerts</div>
              <div className="text-xs sm:text-sm">Your field currently has no conditions requiring immediate attention.</div>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 rounded-xl border flex items-start gap-3.5 transition cursor-pointer ${
                  n.read ? "bg-bg border-borderC opacity-75" : "bg-card border-primary shadow-sm"
                }`}
              >
                {n.severity === "WARNING" ? (
                  <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-0.5" />
                ) : (
                  <Info size={20} className="text-secondary flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-bold text-textPrimary">{n.title}</span>
                    <span className="text-[11px] text-textSecondary">{n.timestamp}</span>
                  </div>
                  <p className="m-0 text-xs sm:text-sm text-textSecondary leading-relaxed">{n.message}</p>
                  <div className="text-[11px] font-semibold text-textSecondary mt-2">Source: {n.source}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
