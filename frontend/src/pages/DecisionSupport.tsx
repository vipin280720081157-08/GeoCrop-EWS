import React, { useState } from "react";
import { Lightbulb, Check, ChevronDown, ChevronUp, Info, AlertTriangle } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import { useGeoCrop } from "@/context/AppContext";
import { COLORS } from "@/utils/colors";

const PRIORITY_COLOR: Record<string, string> = { High: COLORS.error, Medium: COLORS.warning, Low: COLORS.success };

export default function DecisionSupport() {
  const { selectedCrop, selectedStage, sensor, weather, prediction } = useGeoCrop();
  const [showEvidence, setShowEvidence] = useState(false);

  const recommendations = prediction?.recommendations ?? [
    { text: "Inspect crop canopy for early leaf spot or lesion symptoms", priority: "High" },
    { text: "Check irrigation condition and confirm field drainage channel flow", priority: "Medium" },
    { text: "Review 7-day weather forecast before applying additional water", priority: "Low" },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header Banner */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <div>
            <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary font-medium">
              Agronomic Field Guidance
            </div>
            <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary capitalize">
              Recommended Actions
            </div>
            <div className="text-xs text-textSecondary mt-0.5">
              Practical field actions derived from environmental risk and telemetry analysis.
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-primaryLight text-primary font-semibold">
            AGRONOMIC GUIDANCE
          </span>
        </div>
      </Card>

      {/* Priority Recommendation Card */}
      <Card className="border-l-4 border-l-primary">
        <SectionTitle icon={Lightbulb}>PRIMARY RECOMMENDED ACTION</SectionTitle>
        <div className="text-lg font-bold text-textPrimary mb-2">
          {recommendations[0]?.text ?? "Inspect crop leaves and verify canopy ventilation today."}
        </div>
        <p className="m-0 text-xs sm:text-sm text-textSecondary leading-relaxed mb-3">
          Why? Current environmental metrics and ML risk assessment (<strong>{prediction?.risk_level ?? "LOW"} risk</strong> of <strong>{prediction?.disease ? prediction.disease.replace(/_/g, " ") : "disease"}</strong>) warrant close monitoring during <strong className="capitalize">{selectedCrop} ({selectedStage.replace(/_/g, " ")})</strong>.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-warningLight text-warning">
          Priority: {recommendations[0]?.priority ?? "Medium"}
        </div>
      </Card>

      {/* Other Recommendations */}
      <Card>
        <SectionTitle icon={Check}>Categorized Recommendations</SectionTitle>
        <div className="flex flex-col gap-3">
          {recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC">
              <div className="w-[26px] h-[26px] rounded-full bg-primaryLight flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={15} color={COLORS.primary} />
              </div>
              <div className="flex-1 text-xs sm:text-sm text-textPrimary font-medium leading-snug">{r.text}</div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: `${PRIORITY_COLOR[r.priority]}1A`, color: PRIORITY_COLOR[r.priority] }}>
                {r.priority} Priority
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Evidence / "Why this recommendation?" Section */}
      <Card padded={false}>
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="w-full p-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-textSecondary hover:bg-bg transition"
        >
          <div className="flex items-center gap-2">
            <Info size={16} className="text-secondary" />
            <span>Why This Recommendation? (Telemetry Evidence)</span>
          </div>
          {showEvidence ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showEvidence && (
          <div className="p-4 pt-0 border-t border-borderC dark:border-darkBorderC text-xs flex flex-col gap-2">
            <div className="flex justify-between py-1.5 border-b border-borderC dark:border-darkBorderC">
              <span className="text-textSecondary">Monitored Crop:</span>
              <span className="font-bold text-textPrimary capitalize">{selectedCrop}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-borderC dark:border-darkBorderC">
              <span className="text-textSecondary">Growth Stage:</span>
              <span className="font-bold text-textPrimary capitalize">{selectedStage.replace(/_/g, " ")}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-borderC dark:border-darkBorderC">
              <span className="text-textSecondary">Relative Humidity:</span>
              <span className="font-bold text-textPrimary">{sensor?.humidity ?? weather?.humidity ?? 51.6}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-borderC dark:border-darkBorderC">
              <span className="text-textSecondary">Ambient Temperature:</span>
              <span className="font-bold text-textPrimary">{sensor?.temperature ?? weather?.temperature ?? 27.7}°C</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-textSecondary">7-Day Regional Rainfall:</span>
              <span className="font-bold text-textPrimary">{weather?.rainfall_7d ?? 30.1} mm</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
