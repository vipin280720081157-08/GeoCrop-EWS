import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Radio, Brain, ClipboardList, Menu, X, CloudRain,
  Sprout, Lightbulb, Bell, BarChart3, Settings as SettingsIcon
} from "lucide-react";

export default function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);

  const mainItems = [
    { to: "/", label: "Home", icon: LayoutDashboard },
    { to: "/live-monitoring", label: "Field", icon: Radio },
    { to: "/disease-prediction", label: "Risk", icon: Brain },
    { to: "/tasks", label: "Tasks", icon: ClipboardList },
  ];

  const moreItems = [
    { to: "/weather", label: "Weather & Forecast", icon: CloudRain },
    { to: "/crop-stage", label: "Crop & Stage", icon: Sprout },
    { to: "/decision-support", label: "Recommendations", icon: Lightbulb },
    { to: "/alerts", label: "System Alerts", icon: Bell },
    { to: "/historical-analytics", label: "Field History", icon: BarChart3 },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <>
      {/* Slide-up More Drawer backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden fade-in"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* Slide-up More Drawer */}
      {moreOpen && (
        <div className="fixed bottom-[64px] left-0 right-0 bg-card border-t border-borderC rounded-t-2xl p-4 z-50 md:hidden shadow-2xl fade-in flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-borderC">
            <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">
              GeoCrop Navigation
            </span>
            <button
              onClick={() => setMoreOpen(false)}
              className="p-1 rounded-lg hover:bg-bg text-textSecondary"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition ${
                      isActive
                        ? "bg-primaryLight text-primary border-primary"
                        : "bg-bg border-borderC text-textPrimary hover:bg-bg/80"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-card border-t border-borderC z-40 md:hidden flex items-center justify-around px-2 shadow-lg">
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 w-16 h-12 rounded-xl transition ${
                  isActive ? "text-primary font-bold" : "text-textSecondary hover:text-textPrimary"
                }`
              }
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}

        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 rounded-xl transition ${
            moreOpen ? "text-primary font-bold" : "text-textSecondary hover:text-textPrimary"
          }`}
        >
          <Menu size={20} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </>
  );
}
