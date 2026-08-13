import { useCallback, useEffect, useState } from "react";
import type { SensorReading } from "@/types";
import { fetchLatestSensorReading, fetchSensorHistory } from "@/services/sensorService";
import { usePolling } from "./usePolling";
import { POLL_INTERVAL_MS } from "@/utils/constants";

interface UseSensorDataResult {
  latest: SensorReading | null;
  history: SensorReading[];
  loading: boolean;
  connected: boolean;
  error: string | null;
  refresh: () => void;
}

/** Polls the backend for the latest sensor reading + recent history (Live Monitoring page). */
export function useSensorData(days = 1): UseSensorDataResult {
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [latestReading, historyReadings] = await Promise.all([
        fetchLatestSensorReading(),
        fetchSensorHistory(days),
      ]);
      setLatest(latestReading);
      setHistory(historyReadings);
      if (latestReading?.created_at) {
        const rawDateStr = latestReading.created_at;
        const utcIso = rawDateStr.endsWith("Z") || rawDateStr.includes("+")
          ? rawDateStr
          : rawDateStr.replace(" ", "T") + "Z";
        const readingTime = new Date(utcIso).getTime();
        const ageMs = Math.abs(Date.now() - readingTime);
        setConnected(!isNaN(readingTime) && ageMs < 15 * 60 * 1000);
      } else {
        setConnected(false);
      }
      setError(null);
    } catch (err) {
      setConnected(false);
      setError("Unable to reach the backend. Check that the API is running.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  usePolling(load, POLL_INTERVAL_MS, [days]);

  return { latest, history, loading, connected, error, refresh: load };
}
