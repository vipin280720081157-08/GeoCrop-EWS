import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Gauge, AlertTriangle, CalendarClock, ClipboardList, Check, ArrowRight, ShieldAlert } from "lucide-react";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import SectionTitle from "@/components/SectionTitle";
import Skeleton from "@/components/Skeleton";
import RiskChip from "@/components/RiskChip";
import { usePrediction } from "@/hooks/usePrediction";
import { useSensorData } from "@/hooks/useSensorData";
import { getThemeColors } from "@/utils/colors";
import { useApp } from "@/context/AppContext";
import { formatDateTime } from "@/utils/format";

export default function DecisionSupport() {
  const navigate = useNavigate();
  const { crop, theme } = useApp();
  const isDark = theme === "dark";
  const colors = getThemeColors(isDark);

  const { latest: sensor } = useSensorData();
  const { prediction, loading } = usePrediction(true);

  const timeline = useMemo(() => ([
    { day: "Today", action: "Increase field inspection; confirm current environmental readings.", done: true },
    { day: "Day 2", action: "Re-evaluate soil moisture & drainage effectiveness.", done: false },
    { day: "Day 3–4", action: "Monitor for early visual symptoms consistent with prediction.", done: false },
    { day: "Day 5–7", action: "Reassess disease risk trend; adjust preventive plan if risk persists.", done: false },
  ]), []);

  if (loading || !prediction) {
    return <Card><Skeleton h={300} /></Card>;
  }

  const priorityColors: Record<string, string> = { High: colors.error, Medium: colors.warning, Low: colors.success };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Prediction Reference Chip at the top */}
      <div className="p-4 bg-card border border-borderC rounded-card flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <ShieldAlert size={20} className="text-secondary" />
          <div>
            <span className="font-semibold text-textPrimary">Prediction Reference: </span>
            <span className="text-textSecondary">{crop} · Risk level: </span>
            <RiskChip level={prediction.risk_level} size="sm" />
            <span className="text-textDisabled text-xs ml-2">({formatDateTime(prediction.created_at)})</span>
          </div>
        </div>
        <button
          onClick={() => navigate("/disease-prediction")}
          className="text-secondary font-medium hover:underline text-xs flex items-center gap-1 ml-auto"
        >
          View disease prediction detail <ArrowRight size={14} />
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon={Gauge}
          iconColor={colors.primary}
          title="Field Readiness Score"
          value={prediction.readiness_score != null ? prediction.readiness_score : "-"}
          unit="/ 100"
          trendLabel={prediction.readiness_label ?? "Awaiting data"}
        />
        <StatCard
          icon={AlertTriangle}
          iconColor={priorityColors[prediction.risk_level] ?? colors.success}
          title="Early Warning Risk"
          value={prediction.risk_level}
          trendLabel={`Targeting ${prediction.disease}`}
        />
        <StatCard
          icon={CalendarClock}
          iconColor={colors.secondary}
          title="Inspection Frequency"
          value={prediction.risk_level === "High" ? "Twice Daily" : prediction.risk_level === "Medium" ? "Daily" : "Every 3 Days"}
          trendLabel="Recommended operational schedule"
        />
      </div>

      {/* Recommended Actions */}
      <Card>
        <SectionTitle icon={ClipboardList}>Actionable Preventive Recommendations</SectionTitle>
        <div className="flex flex-col">
          {prediction.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b border-borderC last:border-b-0">
              <div className="w-6 h-6 rounded-full bg-primaryLight flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={14} className="text-primary" />
              </div>
              <div className="flex-1 text-sm text-textPrimary leading-relaxed font-medium">{r.text}</div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{ background: `${priorityColors[r.priority]}1A`, color: priorityColors[r.priority] }}
              >
                {r.priority} Priority
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Environmental Warnings & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={AlertTriangle}>Environmental Warnings</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {sensor && prediction.factors.length > 0 ? (
              prediction.factors.filter((f) => f.importance > 20).map((f, i) => (
                <div key={i} className="flex gap-2.5 items-start p-3 rounded-lg bg-warningLight border border-warning/20">
                  <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm text-textPrimary">
                    <strong>{f.factor}</strong> is a significant contributor: {f.detail}.
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-textSecondary">No active environmental warnings.</div>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={CalendarClock}>Decision &amp; Inspection Timeline</SectionTitle>
          <div className="relative pl-5">
            <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-borderC" />
            {timeline.map((t, i) => (
              <div key={i} className="relative mb-4">
                <span
                  className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: t.done ? colors.primary : colors.card, borderColor: t.done ? colors.primary : colors.textDisabled }}
                />
                <div className="text-xs font-bold text-textPrimary">{t.day}</div>
                <div className="text-xs md:text-sm text-textSecondary mt-0.5">{t.action}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
