import { api } from "./api";
import type { SensorReading } from "@/types";

export async function fetchLatestSensorReading(): Promise<SensorReading> {
  const { data } = await api.get<SensorReading>("/api/sensors/latest");
  return data;
}

export async function fetchSensorHistory(days = 30): Promise<SensorReading[]> {
  const { data } = await api.get<SensorReading[]>("/api/sensors/history", { params: { days } });
  return data;
}
