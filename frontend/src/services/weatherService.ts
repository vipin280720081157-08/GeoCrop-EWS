import { api } from "./api";
import type { WeatherData, NPKData } from "@/types";

export async function fetchWeather(lat?: number, lon?: number): Promise<WeatherData> {
  const params: Record<string, number> = {};
  if (lat !== undefined && lat !== null) params.lat = lat;
  if (lon !== undefined && lon !== null) params.lon = lon;
  
  const { data } = await api.get<WeatherData>("/api/weather", { params });
  return data;
}

export async function fetchNPK(crop?: string, growth_stage?: string): Promise<NPKData> {
  const params: Record<string, string> = {};
  if (crop) params.crop = crop;
  if (growth_stage) params.growth_stage = growth_stage;
  
  const { data } = await api.get<NPKData>("/api/npk", { params });
  return data;
}
