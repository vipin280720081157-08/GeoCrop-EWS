import React, { useState } from "react";
import { Brain, Cpu, Gauge, TrendingUp, Info, ChevronDown, ChevronUp } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import RiskChip from "@/components/RiskChip";
import { useGeoCrop } from "@/context/AppContext";
import { COLORS, riskColor } from "@/utils/colors";

export default function DiseasePrediction() {
  const { selectedCrop, selectedStage, prediction } = useGeoCrop();
  const [showModelDetails, setShowModelDetails] = useState(false);

  const level = prediction?.risk_level ?? "LOW";

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header Banner */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <div>
            <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary font-medium">
              Crop Intelligence &amp; Predictive Analytics
            </div>
            <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary capitalize">
              Crop Risk Analysis
            </div>
            <div className="text-xs text-textSecondary mt-0.5">
              Understand what current environmental conditions mean for {selectedCrop} during {selectedStage.replace(/_/g, " ")}.
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
            <Cpu size={12} /> ML MODEL
          </span>
        </div>
      </Card>

      {/* Disease Risk & Overall Field Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-5">
        <Card>
          <SectionTitle icon={Brain}>Disease Risk Assessment</SectionTitle>
          <div className="flex items-center gap-4 flex-wrap mb-3">
            <div>
              <div className="text-xs text-textSecondary">Predicted Condition</div>
              <div className="text-2xl font-bold text-textPrimary capitalize">
                {prediction?.disease ? prediction.disease.replace(/_/g, " ") : "Normal / No Disease"}
              </div>
            </div>
            <RiskChip level={level} />
            <div className="ml-auto text-right">
              <div className="text-xs text-textSecondary">Model Confidence</div>
              <div className="text-2xl font-bold text-secondary">{prediction?.confidence ?? 94}%</div>
            </div>
          </div>
          <div className="p-3 bg-bg dark:bg-darkBg rounded-lg border border-borderC dark:border-darkBorderC text-xs sm:text-sm text-textSecondary leading-relaxed">
            {prediction?.explanation || "Current environmental conditions do not indicate strong disease pressure."}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Gauge}>Overall Field Risk</SectionTitle>
          <div className="flex flex-col items-center justify-center py-2">
            <div className="text-4xl font-extrabold" style={{ color: riskColor(level) }}>
              {prediction?.risk_score ?? 35}
            </div>
            <div className="text-xs text-textSecondary mt-1">out of 100 Risk Scale</div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${prediction?.risk_score ?? 35}%`,
                  background: riskColor(level),
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* B. WHY THIS RISK? (Explainability Breakdown) */}
      <Card>
        <SectionTitle icon={TrendingUp}>WHY THIS RISK? (Contributing Factors)</SectionTitle>
        <div className="flex flex-col gap-3">
          {(prediction?.factors ?? [
            { factor: "Relative Humidity", importance: 40, detail: "Moderate canopy wetness" },
            { factor: "Ambient Temperature", importance: 30, detail: "Favorable germination window" },
            { factor: "7-Day Rainfall", importance: 20, detail: "Moderate moisture availability" },
            { factor: "Crop Stage Susceptibility", importance: 10, detail: "Panicle initiation susceptibility" },
          ]).map((f) => (
            <div key={f.factor} className="p-3 bg-bg dark:bg-darkBg rounded-lg border border-borderC dark:border-darkBorderC">
              <div className="flex justify-between text-xs sm:text-sm font-semibold mb-1">
                <span className="text-textPrimary">{f.factor}</span>
                <span className="text-textSecondary">{f.importance}% Impact · {f.detail}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: `${f.importance}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* C. Model Information Expandable Section */}
      <Card padded={false}>
        <button
          onClick={() => setShowModelDetails(!showModelDetails)}
          className="w-full p-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-textSecondary hover:bg-bg transition"
        >
          <span>Model Architecture &amp; Technical Details</span>
          {showModelDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showModelDetails && (
          <div className="p-4 pt-0 border-t border-borderC dark:border-darkBorderC text-xs flex flex-col gap-2">
            <div className="flex justify-between py-1.5 border-b border-borderC dark:border-darkBorderC">
              <span className="text-textSecondary">Model Architecture:</span>
              <span className="font-mono font-bold text-textPrimary">GeoCrop Disease Risk Model (LightGBM / XGBoost)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-borderC dark:border-darkBorderC">
              <span className="text-textSecondary">Input Features:</span>
              <span className="font-mono font-bold text-textPrimary">Temp, Humidity, Soil Moisture, 7d Rain, Crop &amp; Growth Stage</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-textSecondary">Assessment Basis:</span>
              <span className="font-mono font-bold text-textPrimary">Real-time telemetry + meteorological context</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
