import React, { useEffect, useState } from "react";
import { Search, UserCircle2, Menu } from "lucide-react";
import StatusDot from "./StatusDot";

interface HeaderProps {
  title: string;
  connected: boolean;
  onMenuClick: () => void;
}

export default function Header({ title, connected, onMenuClick }: HeaderProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="h-[72px] bg-card border-b border-borderC flex items-center px-6 gap-4 sticky top-0 z-30">
      <button onClick={onMenuClick} className="md:hidden text-textPrimary">
        <Menu size={24} />
      </button>
      <h1 className="text-xl font-semibold text-textPrimary m-0 whitespace-nowrap">{title}</h1>

      <div className="hidden lg:block flex-1 max-w-[420px] mx-auto relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textDisabled" />
        <input
          placeholder="Search fields, reports, alerts…"
          className="w-full h-10 rounded-lg border border-borderC pl-9 pr-3 text-sm text-textPrimary bg-bg outline-none"
        />
      </div>

      <div className="flex items-center gap-4 md:gap-5 ml-auto">
        <div className="hidden md:block text-[13px] text-textSecondary text-right leading-tight">
          <div className="font-semibold text-textPrimary">
            {now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <div>{now.toLocaleTimeString("en-IN")}</div>
        </div>
        <div className="hidden md:block w-px h-7 bg-borderC" />
        <StatusDot connected={connected} />
        <div className="hidden md:flex items-center gap-2">
          <UserCircle2 size={30} className="text-textSecondary" strokeWidth={1.6} />
          <div className="text-[13px]">
            <div className="font-semibold text-textPrimary">Field Officer</div>
            <div className="text-textSecondary text-xs">Cauvery Delta Zone</div>
          </div>
        </div>
      </div>
    </header>
  );
}
