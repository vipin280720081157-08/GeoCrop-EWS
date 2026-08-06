import { api } from "./api";
import type { Prediction } from "@/types";

export interface PredictionRequestBody {
  crop: string;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  rainfall_7d: number;
  growth_stage?: string;
}

export async function runPrediction(body?: PredictionRequestBody): Promise<Prediction> {
  const { data } = await api.post<Prediction>("/api/predict", body ?? undefined);
  return data;
}

export async function fetchLatestPrediction(): Promise<Prediction> {
  const { data } = await api.get<Prediction>("/api/predictions/latest");
  return data;
}

export async function fetchPredictionHistory(limit = 50): Promise<Prediction[]> {
  const { data } = await api.get<Prediction[]>("/api/predictions/history", { params: { limit } });
  return data;
}
