import React, { useEffect, useState } from "react";
import { Sun, Moon, MapPin, Menu } from "lucide-react";
import StatusDot from "./StatusDot";
import NotificationBell from "./NotificationBell";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  title: string;
  connected: boolean;
  onMenuClick: () => void;
}

export default function Header({ title, connected, onMenuClick }: HeaderProps) {
  const [now, setNow] = useState(new Date());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="h-[72px] bg-card dark:bg-darkCard border-b border-borderC dark:border-darkBorderC flex items-center px-3 sm:px-6 gap-2 sm:gap-4 sticky top-0 z-30 transition-colors duration-200 shadow-sm">
      <button
        onClick={onMenuClick}
        aria-label="Open mobile navigation menu"
        className="md:hidden text-textPrimary dark:text-darkTextPrimary p-1.5 rounded-lg border border-borderC dark:border-darkBorderC hover:bg-bg dark:hover:bg-darkBg"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-base sm:text-xl font-bold text-textPrimary dark:text-darkTextPrimary m-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] xs:max-w-[180px] sm:max-w-none">
        {title}
      </h1>

      <div className="flex items-center gap-2 sm:gap-3.5 ml-auto">
        {/* Real system clock */}
        <div className="hidden sm:block text-[12.5px] text-textSecondary dark:text-darkTextSecondary text-right leading-tight">
          <div className="font-semibold text-textPrimary dark:text-darkTextPrimary">
            {now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <div>{now.toLocaleTimeString("en-IN")}</div>
        </div>

        <div className="hidden sm:block w-px h-6 bg-borderC dark:bg-darkBorderC" />

        {/* Location division indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg dark:bg-darkBg border border-borderC dark:border-darkBorderC text-xs text-textSecondary dark:text-darkTextSecondary">
          <MapPin size={13} className="text-primary" />
          <span className="font-medium">Erode Division</span>
        </div>

        {/* Real Hardware Connection Status */}
        <StatusDot connected={connected} />

        <div className="w-px h-6 bg-borderC dark:bg-darkBorderC" />

        {/* Farmer Notification Bell System */}
        <NotificationBell />
      </div>
    </header>
  );
}
