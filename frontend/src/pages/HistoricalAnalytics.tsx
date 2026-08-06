import React, { useEffect, useState } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { Thermometer, Droplets, Waves, AlertTriangle, FileText, Filter, Download } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import RiskChip from "@/components/RiskChip";
import { fetchSensorHistory } from "@/services/sensorService";
import { fetchPredictionHistory } from "@/services/predictionService";
import { downloadReportPdf } from "@/services/reportService";
import type { SensorReading, Prediction, RiskLevel } from "@/types";
import { formatDate, round1 } from "@/utils/format";
import { COLORS } from "@/utils/colors";

export default function HistoricalAnalytics() {
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
    soil_moisture: round1(r.soil_moisture),
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
    <div className="flex flex-col gap-8">
      <Card>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Filter size={16} color={COLORS.textSecondary} />
            <span className="text-[13px] text-textSecondary mr-1">Range:</span>
            {[7, 14, 30].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`py-1.5 px-3.5 rounded-lg text-[13px] font-semibold border ${range === r ? "bg-primaryLight text-primary border-primary" : "bg-white text-textSecondary border-borderC"}`}
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
          <SectionTitle icon={FileText}>Prediction History</SectionTitle>
          <div className="flex gap-2">
            {(["All", "Low", "Medium", "High"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`py-1.5 px-3 rounded-full text-[12.5px] font-semibold border ${riskFilter === f ? "bg-primaryLight text-primary border-primary" : "bg-white text-textSecondary border-borderC"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA]">
                {["Date", "Crop", "Disease", "Risk", "Confidence"].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[13px] font-bold text-textPrimary border-b border-borderC ${i >= 4 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTable.map((r, i) => (
                <tr key={r.id ?? i} className="h-14 hover:bg-secondaryLight" style={{ background: i % 2 ? "#FAFBFC" : "#fff" }}>
                  <td className="px-5 text-[13.5px] text-textPrimary">{formatDate(r.created_at)}</td>
                  <td className="px-5 text-[13.5px] text-textPrimary">{r.crop}</td>
                  <td className="px-5 text-[13.5px] text-textPrimary">{r.disease}</td>
                  <td className="px-5"><RiskChip level={r.risk_level} size="sm" /></td>
                  <td className="px-5 text-[13.5px] text-textPrimary text-right">{r.confidence}%</td>
                </tr>
              ))}
              {filteredTable.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-textSecondary">No predictions match this filter yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
