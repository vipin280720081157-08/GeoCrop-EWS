import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Crop, SystemStatus } from "@/types";
import { API_URL } from "@/services/api";

interface AppContextType {
  crop: Crop;
  setCrop: (crop: Crop) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  systemStatus: SystemStatus;
  refreshStatus: () => void;
}

const initialStatus: SystemStatus = {
  application: "ready",
  backend: "checking",
  dataService: "checking",
  hardware: "checking",
  aiModel: "checking",
  gps: "waiting",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [crop, setCropState] = useState<Crop>(() => {
    const saved = localStorage.getItem("geocrop_crop");
    if (saved === "Paddy" || saved === "Turmeric" || saved === "Tomato") {
      return saved;
    }
    return "Paddy";
  });

  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("geocrop_theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>(initialStatus);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("geocrop_theme", theme);
  }, [theme]);

  const setCrop = useCallback((newCrop: Crop) => {
    setCropState(newCrop);
    localStorage.setItem("geocrop_crop", newCrop);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const runStatusSweep = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const healthRes = await fetch(`${API_URL}/api/health`, { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);

      if (!healthRes || !healthRes.ok) {
        setSystemStatus({
          application: "ready",
          backend: "unavailable",
          dataService: "no_data",
          hardware: "offline",
          aiModel: "unavailable",
          gps: "unavailable",
        });
        return;
      }

      const healthData = await healthRes.json().catch(() => ({}));
      const cropModelAvailable = healthData?.models_status?.[crop] ?? healthData?.model_available ?? false;

      // Check sensor data & GPS recency
      const sensorRes = await fetch(`${API_URL}/api/sensors/latest`).catch(() => null);
      if (sensorRes && sensorRes.ok) {
        const sensor = await sensorRes.json().catch(() => null);
        const hasRecentData = sensor && (Date.now() - new Date(sensor.created_at).getTime()) < 10 * 60 * 1000;
        const hasHardwareConnected = sensor && (Date.now() - new Date(sensor.created_at).getTime()) < 5 * 60 * 1000;
        
        let gpsState: "fixed" | "waiting" | "unavailable" = "unavailable";
        if (sensor?.latitude != null && sensor?.longitude != null) {
          gpsState = "fixed";
        } else if (sensor) {
          gpsState = "waiting";
        }

        setSystemStatus({
          application: "ready",
          backend: "online",
          dataService: hasRecentData ? "receiving" : "no_data",
          hardware: hasHardwareConnected ? "connected" : "offline",
          aiModel: cropModelAvailable ? "available" : "unavailable",
          gps: gpsState,
        });
      } else {
        setSystemStatus({
          application: "ready",
          backend: "online",
          dataService: "no_data",
          hardware: "offline",
          aiModel: cropModelAvailable ? "available" : "unavailable",
          gps: "unavailable",
        });
      }
    } catch {
      setSystemStatus({
        application: "ready",
        backend: "unavailable",
        dataService: "no_data",
        hardware: "offline",
        aiModel: "unavailable",
        gps: "unavailable",
      });
    }
  }, [crop]);

  useEffect(() => {
    runStatusSweep();
    const interval = setInterval(runStatusSweep, 15000);
    return () => clearInterval(interval);
  }, [runStatusSweep]);

  return (
    <AppContext.Provider
      value={{
        crop,
        setCrop,
        theme,
        toggleTheme,
        systemStatus,
        refreshStatus: runStatusSweep,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
