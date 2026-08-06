import { api } from "./api";
import type { AppSettings } from "@/types";

export async function fetchSettings(): Promise<AppSettings> {
  const { data } = await api.get<AppSettings>("/api/settings");
  return data;
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const { data } = await api.put<AppSettings>("/api/settings", partial);
  return data;
}
