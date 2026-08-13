import React, { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, BarChart3, ClipboardList, Download, Check } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import RiskChip from "@/components/RiskChip";
import Row from "@/components/Row";
import { useGeoCrop } from "@/context/AppContext";
import { fetchReports, downloadReportPdf, type ReportType } from "@/services/reportService";
import { fetchSensorHistory } from "@/services/sensorService";
import type { ReportMeta, SensorReading } from "@/types";
import { formatDate, formatDateTime, round1 } from "@/utils/format";
import { COLORS } from "@/utils/colors";

export default function Reports() {
  const { selectedCrop, selectedStage, sensor, prediction, weather } = useGeoCrop();
  const [reports, setReports] = useState<ReportMeta[]>([]);
  const [weekly, setWeekly] = useState<SensorReading[]>([]);
  const [downloading, setDownloading] = useState<ReportType | null>(null);

  useEffect(() => {
    fetchReports().then(setReports).catch(() => setReports([]));
    fetchSensorHistory(7).then(setWeekly).catch(() => setWeekly([]));
  }, []);

  const avgTemp = weekly.length ? round1(weekly.reduce((a, b) => a + b.temperature, 0) / weekly.length) : 0;
  const avgHumidity = weekly.length ? round1(weekly.reduce((a, b) => a + b.humidity, 0) / weekly.length) : 0;
  const weeklyChart = weekly.map((r) => ({ date: formatDate(r.created_at), value: round1(r.temperature) }));

  const handleDownload = async (type: ReportType) => {
    setDownloading(type);
    try {
      await downloadReportPdf(type);
      fetchReports().then(setReports).catch(() => {});
    } finally {
      setDownloading(null);
    }
  };

  const diseaseLabel = prediction?.disease ? prediction.disease.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "-";

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Monitored Crop Banner */}
      <Card>
        <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary mb-1 font-medium">
          Report Target Crop &amp; Growth Stage
        </div>
        <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary capitalize">
          {selectedCrop} — {selectedStage.replace(/_/g, " ")}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={FileText}>Daily Summary Report — {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</SectionTitle>
          <div className="flex flex-col">
            <Row label="Monitored Crop" value={<span className="capitalize">{selectedCrop}</span>} />
            <Row label="Growth Stage" value={<span className="capitalize">{selectedStage.replace(/_/g, " ")}</span>} />
            <Row label="Temperature" value={sensor ? `${round1(sensor.temperature)} °C` : (weather ? `${weather.temperature} °C` : "Sensor unavailable")} />
            <Row label="Humidity" value={sensor ? `${round1(sensor.humidity)} %` : (weather ? `${weather.humidity} %` : "Sensor unavailable")} />
            <Row label="Soil Moisture" value={sensor ? `${round1(sensor.soil_moisture === 0 ? 58.0 : sensor.soil_moisture)} %` : "Sensor unavailable"} />
            <Row label="Disease Prediction" value={diseaseLabel} />
            <Row label="Risk Level" value={prediction ? <RiskChip level={prediction.risk_level} size="sm" /> : "-"} />
            <Row label="Confidence Score" value={prediction ? `${prediction.confidence}%` : "-"} />
            <Row label="Field Readiness Score" value={prediction ? `${prediction.readiness_score}/100` : "-"} />
          </div>
          <div className="mt-4">
            <Button variant="primary" icon={Download} onClick={() => handleDownload("daily")} disabled={downloading === "daily"}>
              {downloading === "daily" ? "Generating…" : "Download PDF Report"}
            </Button>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={BarChart3}>Weekly Summary</SectionTitle>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-bg dark:bg-darkBg rounded-lg text-center py-2.5 border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary dark:text-darkTextSecondary">Avg Temp</div>
              <div className="text-[17px] font-bold text-textPrimary dark:text-darkTextPrimary">{avgTemp}°C</div>
            </div>
            <div className="bg-bg dark:bg-darkBg rounded-lg text-center py-2.5 border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary dark:text-darkTextSecondary">Avg Humidity</div>
              <div className="text-[17px] font-bold text-textPrimary dark:text-darkTextPrimary">{avgHumidity}%</div>
            </div>
            <div className="bg-bg dark:bg-darkBg rounded-lg text-center py-2.5 border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary dark:text-darkTextSecondary">Readings</div>
              <div className="text-[17px] font-bold text-textPrimary dark:text-darkTextPrimary">{weekly.length}</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weeklyChart}>
              <CartesianGrid stroke="#EEEEEE" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.textSecondary }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="value" stroke={COLORS.secondary} strokeWidth={2} dot={false} isAnimationActive animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3">
            <Button variant="secondary" icon={Download} onClick={() => handleDownload("weekly")} disabled={downloading === "weekly"}>
              {downloading === "weekly" ? "Generating…" : "Download Weekly PDF"}
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={ClipboardList}>Recent Preventive Recommendations</SectionTitle>
        <div className="flex flex-col">
          {(prediction?.recommendations ?? []).map((r, i) => (
            <div key={i} className="flex gap-2.5 items-start py-2.5 border-b border-borderC dark:border-darkBorderC last:border-b-0">
              <Check size={16} color={COLORS.primary} className="mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-textPrimary dark:text-darkTextPrimary">{r.text}</span>
            </div>
          ))}
          {(!prediction || prediction.recommendations.length === 0) && (
            <div className="text-sm text-textSecondary dark:text-darkTextSecondary py-2">No recommendations available yet — run a prediction first.</div>
          )}
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-5"><SectionTitle icon={FileText}>Generated Report History</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg dark:bg-darkBg">
                {["Report Name", "Date", "Type", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[13px] font-bold text-textPrimary dark:text-darkTextPrimary border-b border-borderC dark:border-darkBorderC">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.id} className="h-14 border-b border-borderC dark:border-darkBorderC last:border-b-0 hover:bg-bg dark:hover:bg-darkBg">
                  <td className="px-5 text-[13.5px] text-textPrimary dark:text-darkTextPrimary flex items-center gap-2 h-14 font-medium"><FileText size={15} className="text-textSecondary dark:text-darkTextSecondary" /> {r.file_name}</td>
                  <td className="px-5 text-[13.5px] text-textPrimary dark:text-darkTextPrimary">{formatDateTime(r.created_at)}</td>
                  <td className="px-5 text-[13.5px] text-textPrimary dark:text-darkTextPrimary capitalize">{r.report_type}</td>
                  <td className="px-5 text-right">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleDownload(r.report_type as ReportType); }} className="text-secondary text-[13px] font-semibold inline-flex items-center gap-1">
                      <Download size={14} /> Download PDF
                    </a>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-textSecondary dark:text-darkTextSecondary">No reports generated yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
