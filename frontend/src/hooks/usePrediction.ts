import { useCallback, useEffect, useState } from "react";
import type { Prediction } from "@/types";
import { fetchLatestPrediction, runPrediction, type PredictionRequestBody } from "@/services/predictionService";

interface UsePredictionResult {
  prediction: Prediction | null;
  loading: boolean;
  error: string | null;
  predict: (body?: PredictionRequestBody) => Promise<void>;
}

/** Fetches the latest stored prediction on mount; exposes `predict()` to trigger a fresh run. */
export function usePrediction(autoRun = false): UsePredictionResult {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (body?: PredictionRequestBody) => {
    setLoading(true);
    try {
      const result = body ? await runPrediction(body) : await runPrediction();
      setPrediction(result);
      setError(null);
    } catch (err) {
      setError("Prediction failed. Ensure the backend has sensor data available.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const latest = await fetchLatestPrediction();
        setPrediction(latest);
        setError(null);
      } catch {
        if (autoRun) {
          await predict();
        } else {
          setError("No predictions available yet.");
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { prediction, loading, error, predict };
}
