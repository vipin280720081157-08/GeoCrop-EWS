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
import { getThemeColors } from "@/utils/colors";
import { useApp } from "@/context/AppContext";
import { STATE_COPY } from "@/utils/constants";

export default function HistoricalAnalytics() {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const colors = getThemeColors(isDark);

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

  const hasSparseData = predictions.length < 3;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Controls & Export Bar */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Filter size={16} className="text-textSecondary" />
            <span className="text-xs md:text-sm text-textSecondary mr-1">Time Range:</span>
            {[7, 14, 30].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`py-1 px-3 rounded-lg text-xs md:text-sm font-semibold border ${
                  range === r ? "bg-primaryLight text-primary border-primary" : "bg-card text-textSecondary border-borderC"
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

      {/* Sparse Data State OR 4-Chart Grid */}
      {hasSparseData ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-textSecondary m-0">
            Historical trends will appear here as data accumulates. {readings.length} readings recorded so far.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <SectionTitle icon={Thermometer}>Temperature Trend</SectionTitle>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke={colors.border} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: colors.textSecondary }} axisLine={{ stroke: colors.border }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 13, background: colors.card, borderColor: colors.border }} />
                  <Line type="monotone" dataKey="temperature" stroke={colors.secondary} strokeWidth={2} dot={false} isAnimationActive animationDuration={300} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionTitle icon={Droplets}>Humidity Trend</SectionTitle>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid stroke={colors.border} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: colors.textSecondary }} axisLine={{ stroke: colors.border }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 13, background: colors.card, borderColor: colors.border }} />
                  <Area type="monotone" dataKey="humidity" stroke={colors.teal} fill={`${colors.teal}33`} strokeWidth={2} isAnimationActive animationDuration={300} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <SectionTitle icon={Waves}>Soil Moisture Trend</SectionTitle>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke={colors.border} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: colors.textSecondary }} axisLine={{ stroke: colors.border }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 13, background: colors.card, borderColor: colors.border }} />
                  <Line type="monotone" dataKey="soil_moisture" stroke={colors.primary} strokeWidth={2} dot={false} isAnimationActive animationDuration={300} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionTitle icon={AlertTriangle}>Disease Risk Trend</SectionTitle>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={riskTrend}>
                  <CartesianGrid stroke={colors.border} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: colors.textSecondary }} axisLine={{ stroke: colors.border }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 13, background: colors.card, borderColor: colors.border }} />
                  <ReferenceArea y1={0} y2={40} fill={colors.success} fillOpacity={0.06} />
                  <ReferenceArea y1={40} y2={70} fill={colors.warning} fillOpacity={0.07} />
                  <ReferenceArea y1={70} y2={100} fill={colors.error} fillOpacity={0.07} />
                  <Line type="monotone" dataKey="risk_score" stroke={colors.error} strokeWidth={2} dot={false} isAnimationActive animationDuration={300} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {/* Prediction History Table with Mobile Card View (<768px) */}
      <Card padded={false}>
        <div className="p-4 md:p-5 flex items-center justify-between flex-wrap gap-3 border-b border-borderC">
          <SectionTitle icon={FileText}>Prediction History</SectionTitle>
          <div className="flex gap-2">
            {(["All", "Low", "Medium", "High"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`py-1 px-3 rounded-full text-xs font-semibold border ${
                  riskFilter === f ? "bg-primaryLight text-primary border-primary" : "bg-card text-textSecondary border-borderC"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table (≥768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg">
                <th className="px-5 py-3 text-left text-xs font-bold text-textPrimary border-b border-borderC">Date</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-textPrimary border-b border-borderC">Crop</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-textPrimary border-b border-borderC">Disease</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-textPrimary border-b border-borderC">Risk</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-textPrimary border-b border-borderC">Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredTable.map((r, i) => (
                <tr key={r.id ?? i} className="h-12 hover:bg-secondaryLight border-b border-borderC last:border-b-0">
                  <td className="px-5 text-sm text-textPrimary">{formatDate(r.created_at)}</td>
                  <td className="px-5 text-sm text-textPrimary">{r.crop}</td>
                  <td className="px-5 text-sm text-textPrimary">{r.disease}</td>
                  <td className="px-5"><RiskChip level={r.risk_level} size="sm" /></td>
                  <td className="px-5 text-sm text-textSecondary text-right capitalize">
                    {r.source === "trained_model" ? "Model-based" : "Baseline"}
                  </td>
                </tr>
              ))}
              {filteredTable.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-textSecondary">No predictions match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards (<768px) */}
        <div className="md:hidden flex flex-col divide-y divide-borderC">
          {filteredTable.map((r, i) => (
            <div key={r.id ?? i} className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-textSecondary">
                <span>{formatDate(r.created_at)}</span>
                <span className="capitalize">{r.source === "trained_model" ? "Model-based" : "Baseline"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-textPrimary text-sm">{r.disease}</div>
                  <div className="text-xs text-textSecondary">{r.crop}</div>
                </div>
                <RiskChip level={r.risk_level} size="sm" />
              </div>
            </div>
          ))}
          {filteredTable.length === 0 && (
            <div className="p-6 text-center text-sm text-textSecondary">No predictions match this filter.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
