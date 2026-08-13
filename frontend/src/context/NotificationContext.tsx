import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { NotificationItem, SensorReading, WeatherData, Prediction } from "@/types";
import { evaluateAlertRules } from "@/services/alertEngine";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  evaluateRules: (
    sensor: SensorReading | null,
    weather: WeatherData | null,
    prediction: Prediction | null,
    crop?: string,
    stage?: string
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Helper to deduplicate notifications array by ID and title
function deduplicateNotifications(items: NotificationItem[]): NotificationItem[] {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const result: NotificationItem[] = [];

  for (const item of items) {
    if (!seenIds.has(item.id) && !seenTitles.has(item.title)) {
      seenIds.add(item.id);
      seenTitles.add(item.title);
      result.push(item);
    }
  }

  return result.slice(0, 5); // Cap at max 5 active alerts
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem("geocrop_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return deduplicateNotifications(parsed);
        }
      }
    } catch {
      // Ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("geocrop_notifications", JSON.stringify(notifications));
    } catch {
      // Ignore
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem("geocrop_notifications");
    } catch {
      // Ignore
    }
  }, []);

  const evaluateRules = useCallback(
    (
      sensor: SensorReading | null,
      weather: WeatherData | null,
      prediction: Prediction | null,
      crop?: string,
      stage?: string
    ) => {
      const generated = evaluateAlertRules(sensor, weather, prediction, crop, stage);
      if (generated.length > 0) {
        setNotifications((prev) => {
          const combined = [...generated, ...prev];
          return deduplicateNotifications(combined);
        });
      }
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        evaluateRules,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
