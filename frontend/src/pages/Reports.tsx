import React, { useEffect, useState } from "react";
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
import { useApp } from "@/context/AppContext";

export default function Reports() {
  const { crop, systemStatus } = useApp();
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

  const handleDownload = async (type: ReportType) => {
    setDownloading(type);
    try {
      await downloadReportPdf(type);
      fetchReports().then(setReports).catch(() => {});
    } finally {
      setDownloading(null);
    }
  };

  const isModelBased = prediction?.source === "trained_model";

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Report Metadata Block */}
        <Card>
          <SectionTitle icon={FileText}>Daily Summary Report — {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</SectionTitle>
          <div className="flex flex-col">
            <Row label="Selected Crop" value={crop} />
            {sensor && <Row label="Air Temperature" value={`${round1(sensor.temperature)} °C`} />}
            {sensor && <Row label="Relative Humidity" value={`${round1(sensor.humidity)} %`} />}
            {sensor && <Row label="Soil Moisture" value={`${round1(sensor.soil_moisture)} %`} />}
            {prediction && <Row label="Predicted Disease Risk" value={prediction.disease} />}
            {prediction && <Row label="Risk Level" value={<RiskChip level={prediction.risk_level} size="sm" />} />}
            {isModelBased && prediction?.confidence != null && (
              <Row label="Model Confidence" value={`${prediction.confidence}%`} />
            )}
            {prediction?.readiness_score != null && (
              <Row label="Field Readiness Score" value={`${prediction.readiness_score} / 100`} />
            )}
            <Row label="Prediction Engine" value={isModelBased ? "Trained ML Model" : "Baseline Rule Engine"} />
            <Row
              label="GPS Fix Status"
              value={systemStatus.gps === "fixed" ? "GPS Fixed" : systemStatus.gps === "waiting" ? "GPS Waiting" : "GPS Unavailable"}
            />
          </div>
          <div className="mt-4">
            <Button variant="primary" icon={Download} onClick={() => handleDownload("daily")} disabled={downloading === "daily"}>
              {downloading === "daily" ? "Generating PDF…" : "Download Daily PDF"}
            </Button>
          </div>
        </Card>

        {/* Weekly Summary */}
        <Card>
          <SectionTitle icon={BarChart3}>Weekly Aggregated Metrics</SectionTitle>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-bg border border-borderC rounded-lg text-center py-3">
              <div className="text-xs text-textSecondary mb-1">Avg Temp</div>
              <div className="text-lg font-bold text-textPrimary">{avgTemp}°C</div>
            </div>
            <div className="bg-bg border border-borderC rounded-lg text-center py-3">
              <div className="text-xs text-textSecondary mb-1">Avg Humidity</div>
              <div className="text-lg font-bold text-textPrimary">{avgHumidity}%</div>
            </div>
            <div className="bg-bg border border-borderC rounded-lg text-center py-3">
              <div className="text-xs text-textSecondary mb-1">Readings</div>
              <div className="text-lg font-bold text-textPrimary">{weekly.length}</div>
            </div>
          </div>
          <div className="text-sm text-textSecondary leading-relaxed mb-4">
            Weekly reports aggregate environmental trends over the past 7 days, highlighting risk transitions and key preventive measures for {crop}.
          </div>
          <div>
            <Button variant="secondary" icon={Download} onClick={() => handleDownload("weekly")} disabled={downloading === "weekly"}>
              {downloading === "weekly" ? "Generating PDF…" : "Download Weekly PDF"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Action Recommendations Summary */}
      <Card>
        <SectionTitle icon={ClipboardList}>Active Recommendations Included in PDF</SectionTitle>
        <div className="flex flex-col">
          {(prediction?.recommendations ?? []).map((r, i) => (
            <div key={i} className="flex gap-2.5 items-start py-2.5 border-b border-borderC last:border-b-0">
              <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-textPrimary font-medium">{r.text}</span>
            </div>
          ))}
          {(!prediction || prediction.recommendations.length === 0) && (
            <div className="text-sm text-textSecondary py-2">No recommendations available yet — run a prediction first.</div>
          )}
        </div>
      </Card>

      {/* Generated Report History (Desktop Table + Mobile Cards) */}
      <Card padded={false}>
        <div className="p-4 md:p-5 border-b border-borderC">
          <SectionTitle icon={FileText}>Generated Report Archives</SectionTitle>
        </div>

        {/* Desktop Table (≥768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg">
                <th className="text-left px-5 py-3 text-xs font-bold text-textPrimary border-b border-borderC">Report Name</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-textPrimary border-b border-borderC">Generated Date</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-textPrimary border-b border-borderC">Type</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-textPrimary border-b border-borderC">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.id} className="h-12 hover:bg-secondaryLight border-b border-borderC last:border-b-0">
                  <td className="px-5 text-sm text-textPrimary font-medium flex items-center gap-2 h-12">
                    <FileText size={15} className="text-textSecondary" /> {r.file_name}
                  </td>
                  <td className="px-5 text-sm text-textPrimary">{formatDateTime(r.created_at)}</td>
                  <td className="px-5 text-sm text-textPrimary capitalize">{r.report_type}</td>
                  <td className="px-5 text-right">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownload(r.report_type as ReportType);
                      }}
                      className="text-secondary text-xs font-semibold inline-flex items-center gap-1 hover:underline"
                    >
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

        {/* Mobile Stacked Cards (<768px) */}
        <div className="md:hidden flex flex-col divide-y divide-borderC">
          {reports.map((r) => (
            <div key={r.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-textSecondary">
                <span className="capitalize">{r.report_type} report</span>
                <span>{formatDate(r.created_at)}</span>
              </div>
              <div className="font-semibold text-textPrimary text-sm truncate">{r.file_name}</div>
              <div className="mt-1">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(r.report_type as ReportType);
                  }}
                  className="text-secondary text-xs font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <Download size={14} /> Download PDF
                </a>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="p-6 text-center text-sm text-textSecondary">No reports generated yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
