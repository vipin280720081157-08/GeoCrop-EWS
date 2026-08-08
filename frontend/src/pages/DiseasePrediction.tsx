import React from "react";
import { Stethoscope, Gauge, Thermometer, TrendingUp, Info, Cpu, AlertTriangle } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import RiskChip from "@/components/RiskChip";
import Row from "@/components/Row";
import Skeleton from "@/components/Skeleton";
import { usePrediction } from "@/hooks/usePrediction";
import { useSensorData } from "@/hooks/useSensorData";
import { formatDateTime, round1 } from "@/utils/format";
import { getThemeColors } from "@/utils/colors";
import { useApp } from "@/context/AppContext";

export default function DiseasePrediction() {
  const { crop, theme } = useApp();
  const isDark = theme === "dark";
  const colors = getThemeColors(isDark);

  const { latest: sensor } = useSensorData();
  const { prediction, loading, error } = usePrediction(true);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Card><Skeleton h={60} /></Card>
        <Card><Skeleton h={200} /></Card>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="p-8 text-center">
          <Stethoscope size={40} className="mx-auto mb-3 text-textDisabled" />
          <h3 className="text-lg font-bold text-textPrimary mb-1">No Prediction Available Yet</h3>
          <p className="text-sm text-textSecondary m-0 max-w-md mx-auto">
            No prediction available yet for {crop}. Predictions run automatically as sensor data arrives.
          </p>
        </Card>
      </div>
    );
  }

  const isModelBased = prediction.source === "trained_model";

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Model Source Banner */}
      <div className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 text-xs md:text-sm font-medium ${
        isModelBased
          ? "bg-primaryLight text-primary border-primary"
          : "bg-warningLight text-warning border-warning"
      }`}>
        <div className="flex items-center gap-2">
          {isModelBased ? <Cpu size={18} /> : <AlertTriangle size={18} />}
          <span>
            {isModelBased
              ? `Model-based prediction active for ${crop}`
              : `AI model for ${crop} is not yet available. Showing baseline environmental estimate.`}
          </span>
        </div>
        <span className="text-xs uppercase font-bold tracking-wider opacity-80">
          {isModelBased ? "ML Model" : "Rule Engine"}
        </span>
      </div>

      {/* Selected Crop & Timestamp */}
      <Card>
        <div className="flex flex-wrap justify-between gap-4 items-start">
          <div>
            <div className="text-[13px] text-textSecondary mb-1">Monitored Crop</div>
            <div className="text-xl md:text-2xl font-bold text-textPrimary">{crop}</div>
          </div>
          <div className="text-right">
            <div className="text-[13px] text-textSecondary mb-1">Prediction Timestamp</div>
            <div className="text-sm font-semibold text-textPrimary">{formatDateTime(prediction.created_at)}</div>
          </div>
        </div>
      </Card>

      {/* Prediction Result & Risk Score */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-5">
        <Card>
          <SectionTitle icon={Stethoscope}>Prediction Result</SectionTitle>
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <div>
              <div className="text-xs text-textSecondary mb-0.5">Predicted Disease Risk</div>
              <div className="text-2xl md:text-3xl font-bold text-textPrimary">{prediction.disease}</div>
            </div>
            <RiskChip level={prediction.risk_level} />

            {/* Confidence is ONLY shown when provided by a trained model */}
            {isModelBased && prediction.confidence != null && (
              <div className="ml-auto text-right">
                <div className="text-xs text-textSecondary mb-0.5">Model Confidence</div>
                <div className="text-2xl font-bold text-secondary">{prediction.confidence}%</div>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-bg rounded-lg border border-borderC">
            <div className="flex gap-2.5 items-start">
              <Info size={18} className="text-secondary flex-shrink-0 mt-0.5" />
              <p className="m-0 text-sm text-textPrimary leading-relaxed">{prediction.explanation}</p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Gauge}>Risk Score</SectionTitle>
          <div className="flex flex-col items-center justify-center h-[140px]">
            <div
              className="text-4xl md:text-5xl font-bold"
              style={{
                color: prediction.risk_level === "High" ? colors.error : prediction.risk_level === "Medium" ? colors.warning : colors.success,
              }}
            >
              {prediction.risk_score}
            </div>
            <div className="text-xs text-textSecondary mt-1">out of 100</div>
            <div className="w-full h-2 bg-borderC rounded mt-3 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${prediction.risk_score}%`,
                  background: prediction.risk_level === "High" ? colors.error : prediction.risk_level === "Medium" ? colors.warning : colors.success,
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Context & Contributing Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={Thermometer}>Environmental Context at Prediction</SectionTitle>
          <div className="flex flex-col">
            <Row label="Temperature" value={sensor ? `${round1(sensor.temperature)} °C` : "-"} />
            <Row label="Humidity" value={sensor ? `${round1(sensor.humidity)} %` : "-"} />
            <Row label="Soil Moisture" value={sensor ? `${round1(sensor.soil_moisture)} %` : "-"} />
            <Row label="Rainfall (7d)" value={sensor ? `${round1(sensor.rainfall_7d ?? 0)} mm` : "-"} />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={TrendingUp}>
            {isModelBased ? "Contributing Environmental Factors" : "Estimated Contributing Factors (Baseline Heuristic)"}
          </SectionTitle>
          <div className="flex flex-col gap-3">
            {prediction.factors.map((f) => (
              <div key={f.factor}>
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span className="text-textPrimary font-medium">{f.factor}</span>
                  <span className="text-textSecondary">{f.importance}% · {f.detail}</span>
                </div>
                <div className="h-1.5 bg-borderC rounded overflow-hidden">
                  <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${f.importance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
