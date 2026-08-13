import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Radio, Cpu, CloudRain, Sprout, Brain, Lightbulb, CheckSquare, Bell,
  BarChart3, Settings as SettingsIcon, Leaf, X, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { NAV_ITEMS } from "@/utils/constants";

const ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  live: Radio,
  hardware: Cpu,
  weather: CloudRain,
  crop_stage: Sprout,
  prediction: Brain,
  decision: Lightbulb,
  tasks: CheckSquare,
  alerts: Bell,
  analytics: BarChart3,
  settings: SettingsIcon,
};

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? "w-[72px]" : "w-[250px]";

  return (
    <>
      {mobileOpen && (
        <div onClick={onCloseMobile} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" />
      )}
      <aside
        className={`${width} bg-sidebar dark:bg-[#1A232A] h-screen sticky top-0 flex flex-col flex-shrink-0 z-50 transition-all duration-200
        fixed md:sticky left-0 top-0 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 select-none shadow-lg md:shadow-none`}
      >
        <div className="h-[72px] flex items-center px-4 gap-3 border-b border-sidebarHover dark:border-darkBorderC">
          <div className="w-[36px] h-[36px] rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
            <Leaf size={20} color="#fff" strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-white font-bold text-base tracking-wide whitespace-nowrap">GeoCrop</div>
              <div className="text-[#90A4AE] text-[11px] font-medium tracking-wide whitespace-nowrap">Crop Intelligence EWS</div>
            </div>
          )}
          <button onClick={onCloseMobile} className="ml-auto text-[#90A4AE] hover:text-white md:hidden">
            <X size={22} />
          </button>
        </div>

        <nav className="p-2 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.key] || LayoutDashboard;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.path === "/"}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `nav-item w-full flex items-center gap-3 mb-1 rounded-lg relative transition-all duration-150 text-[13.5px] font-medium
                  ${collapsed ? "justify-center py-3 px-0" : "justify-start py-2.5 px-3.5"}
                  ${isActive ? "bg-primary/25 text-white font-semibold" : "text-[#B0BEC5] hover:text-white"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-1 top-2 bottom-2 w-[3.5px] rounded-full bg-primary" />}
                    <Icon size={19} strokeWidth={2} color={isActive ? "#43A047" : "#90A4AE"} />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-2 border-t border-sidebarHover dark:border-darkBorderC hidden md:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-2.5 py-2.5 px-3.5 rounded-lg text-[#90A4AE] hover:text-white transition-colors text-[13px] ${collapsed ? "justify-center" : "justify-start"}`}
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
