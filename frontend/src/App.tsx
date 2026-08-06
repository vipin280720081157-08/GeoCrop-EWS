import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import LiveMonitoring from "@/pages/LiveMonitoring";
import DiseasePrediction from "@/pages/DiseasePrediction";
import DecisionSupport from "@/pages/DecisionSupport";
import HistoricalAnalytics from "@/pages/HistoricalAnalytics";
import GISMap from "@/pages/GISMap";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/live-monitoring" element={<LiveMonitoring />} />
        <Route path="/disease-prediction" element={<DiseasePrediction />} />
        <Route path="/decision-support" element={<DecisionSupport />} />
        <Route path="/historical-analytics" element={<HistoricalAnalytics />} />
        <Route path="/gis-map" element={<GISMap />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
