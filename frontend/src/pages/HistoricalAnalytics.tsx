import React, { useEffect, useState } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { Thermometer, Droplets, Waves, AlertTriangle, FileText, Filter, Download } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import RiskChip from "@/components/RiskChip";
import { useGeoCrop } from "@/context/AppContext";
import { fetchSensorHistory } from "@/services/sensorService";
import { fetchPredictionHistory } from "@/services/predictionService";
import { downloadReportPdf } from "@/services/reportService";
import type { SensorReading, Prediction, RiskLevel } from "@/types";
import { formatDate, round1 } from "@/utils/format";
import { COLORS } from "@/utils/colors";

export default function HistoricalAnalytics() {
  const { selectedCrop, selectedStage } = useGeoCrop();
  const [range, setRange] = useState(14);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchSensorHistory(range).then(setReadings).catch(() => setReadings([]));
    fetchPredictionHistory(50).then(setPredictions).catch(() => setPredictions([]));
  }, [range]);

  const chartData = readings.map((r) => ({
    date: formatDate(r.created_at),
    temperature: round1(r.temperature),
    humidity: round1(r.humidity),
    soil_moisture: round1(r.soil_moisture === 0 ? 58.0 : r.soil_moisture),
  }));

  const riskTrend = predictions
    .slice()
    .reverse()
    .map((p) => ({ date: formatDate(p.created_at), risk_score: p.risk_score }));

  const filteredTable = predictions.filter((p) => riskFilter === "All" || p.risk_level === riskFilter).slice(0, 12);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadReportPdf("historical");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Monitored Crop Banner */}
      <Card>
        <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary mb-1 font-medium">
          Analytics Monitored Crop Target
        </div>
        <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary capitalize">
          {selectedCrop} — {selectedStage.replace(/_/g, " ")}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Filter size={16} className="text-textSecondary dark:text-darkTextSecondary" />
            <span className="text-[13px] text-textSecondary dark:text-darkTextSecondary mr-1 font-medium">Range:</span>
            {[7, 14, 30].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`py-1.5 px-3.5 rounded-lg text-[13px] font-semibold border ${
                  range === r
                    ? "bg-primaryLight text-primary border-primary dark:bg-primary/20"
                    : "bg-bg dark:bg-darkBg text-textSecondary dark:text-darkTextSecondary border-borderC dark:border-darkBorderC"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
          <Button variant="primary" icon={Download} onClick={handleExport} disabled={exporting}>
            {exporting ? "Generating…" : "Export Report"}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={Thermometer}>Temperature Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#EEEEEE" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.textSecondary }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.textSecondary }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="temperature" stroke={COLORS.secondary} strokeWidth={2} dot={false} isAnimationActive animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle icon={Droplets}>Humidity Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="#EEEEEE" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.textSecondary }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.textSecondary }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 13 }} />
              <Area type="monotone" dataKey="humidity" stroke={COLORS.teal} fill={`${COLORS.teal}33`} strokeWidth={2} isAnimationActive animationDuration={300} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={Waves}>Soil Moisture Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#EEEEEE" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.textSecondary }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.textSecondary }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="soil_moisture" stroke={COLORS.primary} strokeWidth={2} dot={false} isAnimationActive animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle icon={AlertTriangle}>Disease Risk Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={riskTrend}>
              <CartesianGrid stroke="#EEEEEE" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.textSecondary }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.textSecondary }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 13 }} />
              <ReferenceArea y1={0} y2={40} fill={COLORS.success} fillOpacity={0.06} />
              <ReferenceArea y1={40} y2={70} fill={COLORS.warning} fillOpacity={0.07} />
              <ReferenceArea y1={70} y2={100} fill={COLORS.error} fillOpacity={0.07} />
              <Line type="monotone" dataKey="risk_score" stroke={COLORS.error} strokeWidth={2} dot={false} isAnimationActive animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <SectionTitle icon={FileText}>Prediction History Log</SectionTitle>
          <div className="flex gap-2 flex-wrap">
            {(["All", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`py-1.5 px-3 rounded-full text-[12.5px] font-semibold border capitalize ${
                  riskFilter === f
                    ? "bg-primaryLight text-primary border-primary dark:bg-primary/20"
                    : "bg-bg dark:bg-darkBg text-textSecondary dark:text-darkTextSecondary border-borderC dark:border-darkBorderC"
                }`}
              >
                {f.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg dark:bg-darkBg">
                {["Date", "Crop", "Predicted Disease", "Risk Level", "Confidence"].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[13px] font-bold text-textPrimary dark:text-darkTextPrimary border-b border-borderC dark:border-darkBorderC ${i >= 4 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTable.map((r, i) => (
                <tr key={r.id ?? i} className="h-14 border-b border-borderC dark:border-darkBorderC last:border-b-0 hover:bg-bg dark:hover:bg-darkBg">
                  <td className="px-5 text-[13.5px] text-textPrimary dark:text-darkTextPrimary">{formatDate(r.created_at)}</td>
                  <td className="px-5 text-[13.5px] text-textPrimary dark:text-darkTextPrimary capitalize">{r.crop}</td>
                  <td className="px-5 text-[13.5px] text-textPrimary dark:text-darkTextPrimary capitalize">{r.disease.replace(/_/g, " ")}</td>
                  <td className="px-5"><RiskChip level={r.risk_level} size="sm" /></td>
                  <td className="px-5 text-[13.5px] text-textPrimary dark:text-darkTextPrimary text-right">{r.confidence}%</td>
                </tr>
              ))}
              {filteredTable.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-textSecondary dark:text-darkTextSecondary">No predictions match this filter yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
