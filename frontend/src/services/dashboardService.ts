import { api } from "./api";
import type { DashboardData } from "@/types";

export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>("/api/dashboard");
  return data;
}
