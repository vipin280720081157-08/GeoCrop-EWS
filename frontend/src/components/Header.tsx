import React, { useEffect, useState } from "react";
import { Menu, Sun, Moon, Sprout } from "lucide-react";
import StatusDot from "./StatusDot";
import { useApp } from "@/context/AppContext";
import { SUPPORTED_CROPS, type SupportedCrop } from "@/utils/constants";

interface HeaderProps {
  title: string;
  connected: boolean;
  onMenuClick: () => void;
}

export default function Header({ title, connected, onMenuClick }: HeaderProps) {
  const { crop, setCrop, theme, toggleTheme } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="h-[72px] bg-card border-b border-borderC flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-30 transition-colors duration-150">
      <button onClick={onMenuClick} className="md:hidden text-textPrimary p-1">
        <Menu size={24} />
      </button>

      <h1 className="text-lg md:text-xl font-semibold text-textPrimary m-0 whitespace-nowrap">{title}</h1>

      {/* Global Crop Selector */}
      <div className="flex items-center gap-1.5 bg-bg border border-borderC rounded-lg p-1 ml-2 md:ml-4">
        <Sprout size={16} className="text-primary hidden sm:block ml-1" />
        <div className="flex gap-1">
          {SUPPORTED_CROPS.map((c) => (
            <button
              key={c}
              onClick={() => setCrop(c as SupportedCrop)}
              className={`px-2.5 py-1 text-xs md:text-sm font-medium rounded-md transition-colors ${
                crop === c
                  ? "bg-primary text-white font-semibold"
                  : "text-textSecondary hover:text-textPrimary hover:bg-card"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5 ml-auto">
        {/* Real-time Clock */}
        <div className="hidden md:block text-[13px] text-textSecondary text-right leading-tight">
          <div className="font-semibold text-textPrimary">
            {now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <div>{now.toLocaleTimeString("en-IN")}</div>
        </div>

        <div className="hidden md:block w-px h-7 bg-borderC" />

        {/* Connection Status */}
        <StatusDot connected={connected} />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} theme`}
          className="w-9 h-9 rounded-lg border border-borderC bg-bg hover:bg-card text-textPrimary flex items-center justify-center transition-colors"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
        </button>
      </div>
    </header>
  );
}
