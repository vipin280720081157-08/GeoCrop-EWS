import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
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
    <div className="font-sans bg-bg dark:bg-darkBg min-h-screen text-textPrimary dark:text-darkTextPrimary transition-colors duration-200">
      <div className="flex w-full min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <Header title={activeItem?.label ?? "GeoCrop Monitoring"} connected={connected} onMenuClick={() => setMobileOpen(true)} />
          <main className="fade-in p-4 sm:p-6 pb-20 md:pb-6 w-full max-w-[1400px] mx-auto flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
