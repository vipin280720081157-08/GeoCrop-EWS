import React, { useMemo } from "react";
import { Gauge, AlertTriangle, CalendarClock, ClipboardList, Check } from "lucide-react";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import SectionTitle from "@/components/SectionTitle";
import Skeleton from "@/components/Skeleton";
import { usePrediction } from "@/hooks/usePrediction";
import { useSensorData } from "@/hooks/useSensorData";
import { COLORS } from "@/utils/colors";

const PRIORITY_COLOR: Record<string, string> = { High: COLORS.error, Medium: COLORS.warning, Low: COLORS.success };
const PRIORITY_BG: Record<string, string> = { High: "#FDECEA", Medium: "#FFF3E0", Low: "#E8F5E9" };

export default function DecisionSupport() {
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

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon={Gauge} iconColor={COLORS.primary} title="Field Readiness Score" value={prediction.readiness_score ?? "-"} unit="/ 100" trendLabel={prediction.readiness_label ?? "-"} />
        <StatCard icon={AlertTriangle} iconColor={PRIORITY_COLOR[prediction.risk_level]} title="Early Warning" value={prediction.risk_level} trendLabel={prediction.disease} />
        <StatCard icon={CalendarClock} iconColor={COLORS.secondary} title="Next Inspection" value={prediction.risk_level === "High" ? "Today" : prediction.risk_level === "Medium" ? "Tomorrow" : "In 3 days"} trendLabel="Recommended schedule" />
      </div>

      <Card>
        <SectionTitle icon={ClipboardList}>Recommended Preventive Actions</SectionTitle>
        <div className="flex flex-col">
          {prediction.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b border-borderC last:border-b-0">
              <div className="w-[26px] h-[26px] rounded-full bg-primaryLight flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={15} color={COLORS.primary} />
              </div>
              <div className="flex-1 text-[14.5px] text-textPrimary leading-relaxed">{r.text}</div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: `${PRIORITY_COLOR[r.priority]}1A`, color: PRIORITY_COLOR[r.priority] }}>
                {r.priority} Priority
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={AlertTriangle}>Environmental Warnings</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {sensor && prediction.factors.length > 0 ? (
              prediction.factors.filter((f) => f.importance > 20).map((f, i) => (
                <div key={i} className="flex gap-2.5 items-start p-3 rounded-lg" style={{ background: PRIORITY_BG.Medium }}>
                  <AlertTriangle size={16} color={COLORS.warning} className="flex-shrink-0 mt-0.5" />
                  <span className="text-[13.5px] text-textPrimary">{f.factor} is a significant contributor: {f.detail}.</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-textSecondary">No active warnings.</div>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={CalendarClock}>Decision Timeline</SectionTitle>
          <div className="relative pl-[22px]">
            <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-borderC" />
            {timeline.map((t, i) => (
              <div key={i} className="relative mb-4.5">
                <span
                  className="absolute -left-[22px] top-0.5 w-3 h-3 rounded-full border-2"
                  style={{ background: t.done ? COLORS.primary : "#fff", borderColor: t.done ? COLORS.primary : "#9E9E9E" }}
                />
                <div className="text-[13px] font-bold text-textPrimary">{t.day}</div>
                <div className="text-[13.5px] text-textSecondary mt-0.5">{t.action}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
