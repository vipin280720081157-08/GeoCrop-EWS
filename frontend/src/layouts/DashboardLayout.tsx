import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import SystemCheckOverlay from "@/components/SystemCheckOverlay";
import { NAV_ITEMS } from "@/utils/constants";
import { useSensorData } from "@/hooks/useSensorData";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { connected } = useSensorData();

  const activeItem = NAV_ITEMS.find((item) =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );

  return (
    <div className="font-sans bg-bg min-h-screen text-textPrimary">
      <SystemCheckOverlay />
      <div className="flex w-full min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Header title={activeItem?.label ?? "Dashboard"} connected={connected} onMenuClick={() => setMobileOpen(true)} />
          <main className="fade-in p-4 md:p-6 w-full max-w-[1320px] mx-auto flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
