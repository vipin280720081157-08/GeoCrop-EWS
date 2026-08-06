import React, { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { FileText, BarChart3, ClipboardList, Download, Check } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import RiskChip from "@/components/RiskChip";
import Row from "@/components/Row";
import { useSensorData } from "@/hooks/useSensorData";
import { usePrediction } from "@/hooks/usePrediction";
import { fetchReports, downloadReportPdf, type ReportType } from "@/services/reportService";
import { fetchSensorHistory } from "@/services/sensorService";
import type { ReportMeta, SensorReading } from "@/types";
import { formatDate, formatDateTime, round1 } from "@/utils/format";
import { COLORS } from "@/utils/colors";

export default function Reports() {
  const { latest: sensor } = useSensorData();
  const { prediction } = usePrediction();
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

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={FileText}>Daily Report — {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</SectionTitle>
          <div className="flex flex-col">
            <Row label="Crop" value={sensor?.crop ?? "-"} />
            <Row label="Temperature" value={sensor ? `${round1(sensor.temperature)} °C` : "-"} />
            <Row label="Humidity" value={sensor ? `${round1(sensor.humidity)} %` : "-"} />
            <Row label="Soil Moisture" value={sensor ? `${round1(sensor.soil_moisture)} %` : "-"} />
            <Row label="Disease Prediction" value={prediction?.disease ?? "-"} />
            <Row label="Risk Level" value={prediction ? <RiskChip level={prediction.risk_level} size="sm" /> : "-"} />
            <Row label="Confidence Score" value={prediction ? `${prediction.confidence}%` : "-"} />
            <Row label="Field Readiness Score" value={prediction ? `${prediction.readiness_score}/100` : "-"} />
          </div>
          <div className="mt-4">
            <Button variant="primary" icon={Download} onClick={() => handleDownload("daily")} disabled={downloading === "daily"}>
              {downloading === "daily" ? "Generating…" : "Download PDF"}
            </Button>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={BarChart3}>Weekly Summary</SectionTitle>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-bg rounded-lg text-center py-2.5"><div className="text-xs text-textSecondary">Avg Temp</div><div className="text-[17px] font-bold text-textPrimary">{avgTemp}°C</div></div>
            <div className="bg-bg rounded-lg text-center py-2.5"><div className="text-xs text-textSecondary">Avg Humidity</div><div className="text-[17px] font-bold text-textPrimary">{avgHumidity}%</div></div>
            <div className="bg-bg rounded-lg text-center py-2.5"><div className="text-xs text-textSecondary">Readings</div><div className="text-[17px] font-bold text-textPrimary">{weekly.length}</div></div>
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
              {downloading === "weekly" ? "Generating…" : "Download PDF"}
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={ClipboardList}>Recent Recommendations</SectionTitle>
        <div className="flex flex-col">
          {(prediction?.recommendations ?? []).map((r, i) => (
            <div key={i} className="flex gap-2.5 items-start py-2.5 border-b border-borderC last:border-b-0">
              <Check size={16} color={COLORS.primary} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm text-textPrimary">{r.text}</span>
            </div>
          ))}
          {(!prediction || prediction.recommendations.length === 0) && (
            <div className="text-sm text-textSecondary py-2">No recommendations available yet — run a prediction first.</div>
          )}
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-5"><SectionTitle icon={FileText}>Report History</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA]">
                {["Report Name", "Date", "Type", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[13px] font-bold text-textPrimary border-b border-borderC">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.id} className="h-14" style={{ background: i % 2 ? "#FAFBFC" : "#fff" }}>
                  <td className="px-5 text-[13.5px] text-textPrimary flex items-center gap-2 h-14"><FileText size={15} color={COLORS.textSecondary} /> {r.file_name}</td>
                  <td className="px-5 text-[13.5px] text-textPrimary">{formatDateTime(r.created_at)}</td>
                  <td className="px-5 text-[13.5px] text-textPrimary capitalize">{r.report_type}</td>
                  <td className="px-5 text-right">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleDownload(r.report_type as ReportType); }} className="text-secondary text-[13px] font-semibold inline-flex items-center gap-1">
                      <Download size={14} /> Download
                    </a>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-textSecondary">No reports generated yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
