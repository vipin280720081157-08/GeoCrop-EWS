import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Activity, Stethoscope, ClipboardList, BarChart3, MapPin,
  FileText, Settings as SettingsIcon, Leaf, X, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { NAV_ITEMS } from "@/utils/constants";

const ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  live: Activity,
  prediction: Stethoscope,
  decision: ClipboardList,
  analytics: BarChart3,
  gis: MapPin,
  reports: FileText,
  settings: SettingsIcon,
};

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? "w-[72px]" : "w-[260px]";

  return (
    <>
      {mobileOpen && (
        <div onClick={onCloseMobile} className="fixed inset-0 bg-black/40 z-40 md:hidden" />
      )}
      <aside
        className={`${width} min-w-fit bg-sidebar h-screen sticky top-0 flex flex-col flex-shrink-0 z-50 transition-[width] duration-200
        fixed md:sticky left-0 top-0 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="h-[72px] flex items-center px-4 gap-2.5 border-b border-sidebarHover">
          <div className="w-[34px] h-[34px] rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Leaf size={19} color="#fff" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-white font-semibold text-sm whitespace-nowrap">GeoCrop</div>
              <div className="text-[#90A4AE] text-[11.5px] whitespace-nowrap">Disease Early Warning</div>
            </div>
          )}
          <button onClick={onCloseMobile} className="ml-auto text-[#90A4AE] md:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="p-2 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.key];
            return (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.path === "/"}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `nav-item w-full flex items-center gap-3 mb-1 rounded-lg relative transition-colors duration-200 text-[14.5px]
                  ${collapsed ? "justify-center py-3" : "justify-start py-2.5 px-3.5"}
                  ${isActive ? "bg-[rgba(46,125,50,0.22)] text-white font-semibold" : "text-[#B0BEC5] font-medium"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded bg-primary" />}
                    <Icon size={22} strokeWidth={2} color={isActive ? "#43A047" : "#90A4AE"} />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-2 border-t border-sidebarHover hidden md:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-2.5 py-2.5 px-3.5 rounded-lg text-[#90A4AE] text-[13.5px] ${collapsed ? "justify-center" : "justify-start"}`}
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
