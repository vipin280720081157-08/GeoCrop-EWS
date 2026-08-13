import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Trash2, X, AlertTriangle, Info, CheckCircle2, CloudRain, ShieldAlert, ChevronRight } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import type { NotificationSeverity, NotificationItem } from "@/types";
import { useNavigate } from "react-router-dom";

const SEVERITY_CONFIG: Record<NotificationSeverity, { label: string; badgeClass: string; icon: typeof AlertTriangle }> = {
  CRITICAL: { label: "CRITICAL", badgeClass: "bg-errorLight text-error border-error/30", icon: ShieldAlert },
  WARNING: { label: "WARNING", badgeClass: "bg-warningLight text-warning border-warning/30", icon: AlertTriangle },
  INFO: { label: "INFO", badgeClass: "bg-secondaryLight text-secondary border-secondary/30", icon: Info },
  SUCCESS: { label: "SUCCESS", badgeClass: "bg-successLight text-success border-success/30", icon: CheckCircle2 },
  TASK: { label: "TASK", badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300", icon: Info },
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "critical") return n.severity === "CRITICAL" || n.severity === "WARNING";
    return true;
  });

  const handleActionClick = (n: NotificationItem) => {
    markAsRead(n.id);
    setOpen(false);
    if (n.actionUrl) {
      navigate(n.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Farmer Notifications"
        title="View Notifications & Alerts"
        className="relative p-2 rounded-xl border border-borderC dark:border-darkBorderC bg-bg dark:bg-darkBg text-textPrimary dark:text-darkTextPrimary hover:bg-primaryLight dark:hover:bg-sidebarHover transition-all flex items-center justify-center"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-white font-extrabold text-[10.5px] flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown / Panel */}
      {open && (
        <div
          className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-12 w-[calc(100vw-16px)] sm:w-[380px] md:w-[420px] max-h-[80vh] sm:max-h-[580px] bg-card dark:bg-darkCard border border-borderC dark:border-darkBorderC rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden fade-in"
        >
          {/* Panel Header */}
          <div className="p-3.5 sm:p-4 border-b border-borderC dark:border-darkBorderC flex items-center justify-between bg-bg/50 dark:bg-darkBg/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-textPrimary dark:text-darkTextPrimary">Farmer Alerts</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-errorLight text-error text-[11px] font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    className="p-1.5 text-xs text-textSecondary dark:text-darkTextSecondary hover:text-primary transition flex items-center gap-1"
                  >
                    <CheckCheck size={15} />
                    <span className="hidden sm:inline">Mark read</span>
                  </button>
                  <button
                    onClick={clearNotifications}
                    title="Clear all notifications"
                    className="p-1.5 text-xs text-textSecondary dark:text-darkTextSecondary hover:text-error transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-textSecondary hover:text-textPrimary dark:text-darkTextSecondary"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-borderC dark:border-darkBorderC px-3 pt-2 gap-2 text-xs font-semibold bg-card dark:bg-darkCard">
            <button
              onClick={() => setFilter("all")}
              className={`pb-2 px-2 border-b-2 transition ${filter === "all" ? "border-primary text-primary" : "border-transparent text-textSecondary dark:text-darkTextSecondary"}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`pb-2 px-2 border-b-2 transition ${filter === "unread" ? "border-primary text-primary" : "border-transparent text-textSecondary dark:text-darkTextSecondary"}`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("critical")}
              className={`pb-2 px-2 border-b-2 transition ${filter === "critical" ? "border-primary text-primary" : "border-transparent text-textSecondary dark:text-darkTextSecondary"}`}
            >
              High Risk / Rain
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-borderC dark:divide-darkBorderC p-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-textSecondary dark:text-darkTextSecondary text-xs">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-success opacity-60" />
                <div className="font-semibold text-textPrimary dark:text-darkTextPrimary text-sm mb-0.5">No Active Alerts</div>
                <div>You&apos;re all caught up. System monitoring field telemetry.</div>
              </div>
            ) : (
              filtered.map((n) => {
                const conf = SEVERITY_CONFIG[n.severity] || SEVERITY_CONFIG.INFO;
                const IconComp = conf.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 rounded-xl transition-all my-1 cursor-pointer ${
                      !n.read
                        ? "bg-primaryLight/30 dark:bg-primaryLight/10 border-l-4 border-l-primary"
                        : "hover:bg-bg dark:hover:bg-darkBg"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${conf.badgeClass}`}>
                          {conf.label}
                        </span>
                        <span className="text-[10.5px] font-medium text-textSecondary dark:text-darkTextSecondary">
                          • {n.source}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-textSecondary dark:text-darkTextSecondary flex-shrink-0">
                        {n.timestamp}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-textPrimary dark:text-darkTextPrimary flex items-center gap-1.5 mb-1">
                      <IconComp size={14} className="flex-shrink-0" />
                      <span>{n.title}</span>
                    </div>

                    <p className="text-xs text-textSecondary dark:text-darkTextSecondary leading-relaxed m-0">
                      {n.message}
                    </p>

                    {n.actionText && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(n);
                        }}
                        className="mt-2 text-[11px] font-bold text-primary dark:text-primaryLight hover:underline flex items-center gap-1"
                      >
                        <span>{n.actionText}</span>
                        <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-bg/80 dark:bg-darkBg/80 border-t border-borderC dark:border-darkBorderC text-center text-[11px] text-textSecondary dark:text-darkTextSecondary">
            GeoCrop Automated Early Warning Notification Engine
          </div>
        </div>
      )}
    </div>
  );
}
