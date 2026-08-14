import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { SensorReading, WeatherData, Prediction, NPKData } from "@/types";
import { useSensorData } from "@/hooks/useSensorData";
import { fetchWeather, fetchNPK } from "@/services/weatherService";
import { runPrediction, fetchLatestPrediction } from "@/services/predictionService";
import { useNotifications } from "./NotificationContext";
import { LOCKED_CROPS, CROP_STAGES } from "@/utils/constants";

interface AppContextType {
  selectedCrop: string;
  selectedStage: string;
  sensor: SensorReading | null;
  connected: boolean;
  sensorLoading: boolean;
  weather: WeatherData | null;
  weatherLoading: boolean;
  npk: NPKData | null;
  npkLoading: boolean;
  prediction: Prediction | null;
  predicting: boolean;
  setCropAndStage: (crop: string, stage: string) => void;
  executePrediction: () => Promise<void>;
  refreshWeather: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const GeoCropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { latest: sensor, connected, loading: sensorLoading } = useSensorData();
  const { evaluateRules } = useNotifications();

  // Single Source of Truth for Crop & Growth Stage
  const [selectedCrop, setSelectedCropState] = useState<string>("turmeric");
  const [selectedStage, setSelectedStageState] = useState<string>("seed_rhizome_sprouting");

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [npk, setNpk] = useState<NPKData | null>(null);
  const [npkLoading, setNpkLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predicting, setPredicting] = useState(false);

  // Set crop and automatically adjust growth stage if invalid
  const setCropAndStage = useCallback((crop: string, stage: string) => {
    setSelectedCropState(crop);
    const validStages = CROP_STAGES[crop] || [];
    if (validStages.length > 0 && !validStages.some((s) => s.id === stage)) {
      setSelectedStageState(validStages[0].id);
    } else {
      setSelectedStageState(stage);
    }
  }, []);

  // Weather fetch
  const refreshWeather = useCallback(async () => {
    setWeatherLoading(true);
    try {
      const lat = sensor?.latitude ?? 11.2742;
      const lon = sensor?.longitude ?? 77.5828;
      const data = await fetchWeather(lat, lon);
      setWeather(data);
    } catch (err) {
      console.error("Weather fetch error:", err);
    } finally {
      setWeatherLoading(false);
    }
  }, [sensor?.latitude, sensor?.longitude]);

  // NPK fetch when crop/stage changes
  useEffect(() => {
    let isMounted = true;
    setNpkLoading(true);
    fetchNPK(selectedCrop, selectedStage)
      .then((data) => {
        if (isMounted) setNpk(data);
      })
      .catch((err) => console.error("NPK fetch error:", err))
      .finally(() => {
        if (isMounted) setNpkLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedCrop, selectedStage]);

  // Execute trained-model prediction
  const executePrediction = useCallback(async () => {
    setPredicting(true);
    try {
      const reqPayload = {
        crop: selectedCrop,
        growth_stage: selectedStage,
        temperature: sensor ? sensor.temperature : (weather?.temperature ?? 26.5),
        humidity: sensor ? sensor.humidity : (weather?.humidity ?? 75.0),
        soil_moisture: sensor ? (sensor.soil_moisture === 0 ? 58.0 : sensor.soil_moisture) : 55.0,
        rainfall_7d: sensor?.rainfall_7d || weather?.rainfall_7d || 4.8,
      };
      const result = await runPrediction(reqPayload);
      setPrediction(result);
    } catch (err) {
      console.error("Prediction execution error:", err);
    } finally {
      setPredicting(false);
    }
  }, [selectedCrop, selectedStage, sensor, weather]);

  // Initial prediction & weather load
  useEffect(() => {
    refreshWeather();
    executePrediction();
  }, [refreshWeather, executePrediction]);

  // Automatically re-run ML prediction whenever crop or growth stage changes
  useEffect(() => {
    executePrediction();
  }, [selectedCrop, selectedStage, executePrediction]);

  // Trigger alert rule evaluation whenever telemetry updates
  useEffect(() => {
    evaluateRules(sensor, weather, prediction, selectedCrop, selectedStage);
  }, [sensor, weather, prediction, selectedCrop, selectedStage, evaluateRules]);


  return (
    <AppContext.Provider
      value={{
        selectedCrop,
        selectedStage,
        sensor,
        connected,
        sensorLoading,
        weather,
        weatherLoading,
        npk,
        npkLoading,
        prediction,
        predicting,
        setCropAndStage,
        executePrediction,
        refreshWeather,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useGeoCrop(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useGeoCrop must be used within a GeoCropProvider");
  }
  return context;
}
