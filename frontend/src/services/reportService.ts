import { api } from "./api";
import type { ReportMeta } from "@/types";

export type ReportType = "daily" | "weekly" | "historical";

export async function fetchReports(): Promise<ReportMeta[]> {
  const { data } = await api.get<ReportMeta[]>("/api/reports");
  return data;
}

/** Triggers PDF generation on the backend and downloads the resulting file. */
export async function downloadReportPdf(reportType: ReportType): Promise<void> {
  const response = await api.post(
    "/api/reports/pdf",
    { report_type: reportType },
    { responseType: "blob" }
  );
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${reportType}_report_${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
