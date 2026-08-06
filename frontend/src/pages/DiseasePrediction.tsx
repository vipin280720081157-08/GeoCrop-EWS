import React from "react";
import { Stethoscope, Gauge, Thermometer, TrendingUp, Info } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import RiskChip from "@/components/RiskChip";
import Row from "@/components/Row";
import Skeleton from "@/components/Skeleton";
import { usePrediction } from "@/hooks/usePrediction";
import { useSensorData } from "@/hooks/useSensorData";
import { formatDateTime, round1 } from "@/utils/format";
import { COLORS } from "@/utils/colors";

export default function DiseasePrediction() {
  const { latest: sensor } = useSensorData();
  const { prediction, loading } = usePrediction(true);

  if (loading || !prediction) {
    return (
      <div className="flex flex-col gap-8">
        <Card><Skeleton h={60} /></Card>
        <Card><Skeleton h={200} /></Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <div className="flex flex-wrap justify-between gap-4 items-start">
          <div>
            <div className="text-[13px] text-textSecondary mb-1.5">Selected Crop · Growth Stage</div>
            <div className="text-[22px] font-semibold text-textPrimary">{prediction.crop} — {sensor?.growth_stage ?? "-"}</div>
          </div>
          <div className="text-right">
            <div className="text-[13px] text-textSecondary mb-1.5">Prediction Timestamp</div>
            <div className="text-sm font-semibold text-textPrimary">{formatDateTime(prediction.created_at)}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-5">
        <Card>
          <SectionTitle icon={Stethoscope}>Prediction Result</SectionTitle>
          <div className="flex items-center gap-5 flex-wrap">
            <div>
              <div className="text-[13px] text-textSecondary">Predicted Disease</div>
              <div className="text-[26px] font-bold text-textPrimary">{prediction.disease}</div>
            </div>
            <RiskChip level={prediction.risk_level} />
            <div className="ml-auto text-right">
              <div className="text-[13px] text-textSecondary">Confidence Score</div>
              <div className="text-[26px] font-bold text-secondary">{prediction.confidence}%</div>
            </div>
          </div>
          <div className="mt-4.5 mt-[18px] p-3.5 bg-bg rounded-lg border border-borderC">
            <div className="flex gap-2 items-start">
              <Info size={18} color={COLORS.secondary} className="flex-shrink-0 mt-0.5" />
              <p className="m-0 text-[14.5px] text-textPrimary leading-relaxed">{prediction.explanation}</p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Gauge}>Risk Score</SectionTitle>
          <div className="flex flex-col items-center justify-center h-[140px]">
            <div className="text-[44px] font-bold" style={{ color: prediction.risk_level === "High" ? COLORS.error : prediction.risk_level === "Medium" ? COLORS.warning : COLORS.success }}>
              {prediction.risk_score}
            </div>
            <div className="text-[13px] text-textSecondary">out of 100</div>
            <div className="w-full h-2 bg-gray-200 rounded mt-3 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${prediction.risk_score}%`,
                  background: prediction.risk_level === "High" ? COLORS.error : prediction.risk_level === "Medium" ? COLORS.warning : COLORS.success,
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={Thermometer}>Current Environmental Conditions</SectionTitle>
          <div className="flex flex-col">
            <Row label="Temperature" value={sensor ? `${round1(sensor.temperature)} °C` : "-"} />
            <Row label="Humidity" value={sensor ? `${round1(sensor.humidity)} %` : "-"} />
            <Row label="Soil Moisture" value={sensor ? `${round1(sensor.soil_moisture)} %` : "-"} />
            <Row label="Rainfall (7 days)" value={sensor ? `${round1(sensor.rainfall_7d ?? 0)} mm` : "-"} />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={TrendingUp}>Contributing Environmental Factors</SectionTitle>
          <div className="flex flex-col">
            {prediction.factors.map((f) => (
              <div key={f.factor} className="mb-3">
                <div className="flex justify-between text-[13.5px] mb-1.5">
                  <span className="text-textPrimary font-medium">{f.factor}</span>
                  <span className="text-textSecondary">{f.importance}% · {f.detail}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded overflow-hidden">
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
