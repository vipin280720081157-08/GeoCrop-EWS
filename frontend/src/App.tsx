import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { GeoCropProvider } from "@/context/AppContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import LiveMonitoring from "@/pages/LiveMonitoring";
import WeatherPage from "@/pages/WeatherPage";
import CropStagePage from "@/pages/CropStagePage";
import DiseasePrediction from "@/pages/DiseasePrediction";
import DecisionSupport from "@/pages/DecisionSupport";
import TasksPage from "@/pages/TasksPage";
import AlertsPage from "@/pages/AlertsPage";
import HistoricalAnalytics from "@/pages/HistoricalAnalytics";
import GISMap from "@/pages/GISMap";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <GeoCropProvider>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live-monitoring" element={<LiveMonitoring />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/crop-stage" element={<CropStagePage />} />
              <Route path="/disease-prediction" element={<DiseasePrediction />} />
              <Route path="/decision-support" element={<DecisionSupport />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/historical-analytics" element={<HistoricalAnalytics />} />
              <Route path="/gis-map" element={<GISMap />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </GeoCropProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
