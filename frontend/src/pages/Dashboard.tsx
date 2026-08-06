import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea,
} from "recharts";
import {
  AlertTriangle, Gauge, Stethoscope, Thermometer, TrendingUp, BellRing,
  ClipboardCheck, Activity, BarChart3, MapPin, FileText, ClipboardList, MapPinned,
} from "lucide-react";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import RiskChip from "@/components/RiskChip";
import Skeleton from "@/components/Skeleton";
import { usePolling } from "@/hooks/usePolling";
import { fetchDashboard } from "@/services/dashboardService";
import type { DashboardData } from "@/types";
import { round1 } from "@/utils/format";
import { COLORS } from "@/utils/colors";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await fetchDashboard();
      setData(result);
    } catch {
      // Header status dot already reflects connectivity issues; keep last-known data.
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(load, 10000);

  const prediction = data?.latest_prediction;
  const sensor = data?.latest_sensor;
  const trend = data?.trend_7d ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="fade-in flex flex-wrap gap-4 items-center justify-between">
        <div>
          <div className="text-[13px] text-textSecondary mb-1">Monitored Field</div>
          <div className="text-lg font-bold text-textPrimary flex items-center gap-2">
            <MapPinned size={18} color={COLORS.secondary} /> Thanjavur Field Station · {sensor?.crop ?? "-"}
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" icon={Stethoscope} onClick={() => navigate("/disease-prediction")}>View Prediction</Button>
          <Button variant="primary" icon={ClipboardList} onClick={() => navigate("/decision-support")}>Decision Support</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Card key={i}><Skeleton h={100} /></Card>)
        ) : (
          <>
            <StatCard icon={AlertTriangle} iconColor={prediction?.risk_level === "High" ? COLORS.error : prediction?.risk_level === "Medium" ? COLORS.warning : COLORS.success}
              title="Current Disease Risk" value={prediction?.risk_level ?? "-"} trendLabel={prediction ? `${prediction.risk_score}/100 risk score` : "No data yet"} trend="up" />
            <StatCard icon={Gauge} iconColor={COLORS.primary} title="Field Readiness Score" value={prediction?.readiness_score ?? "-"} unit="/ 100" trendLabel={prediction?.readiness_label ?? "-"} trendUp />
            <StatCard icon={Stethoscope} iconColor={COLORS.secondary} title="Latest Prediction" value={prediction?.disease ?? "-"} trendLabel={prediction ? `${prediction.confidence}% confidence` : "-"} />
            <StatCard icon={Thermometer} iconColor={COLORS.accent} title="Environmental Summary" value={sensor ? `${round1(sensor.temperature)}°C` : "-"} trendLabel={sensor ? `${round1(sensor.humidity)}% humidity · ${round1(sensor.soil_moisture)}% soil` : "-"} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-5">
        <Card>
          <SectionTitle icon={TrendingUp}>Disease Risk Trend (7 days)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#EEEEEE" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: COLORS.textSecondary }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.textSecondary }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
              <ReferenceArea y1={0} y2={40} fill={COLORS.success} fillOpacity={0.06} />
              <ReferenceArea y1={40} y2={70} fill={COLORS.warning} fillOpacity={0.07} />
              <ReferenceArea y1={70} y2={100} fill={COLORS.error} fillOpacity={0.07} />
              <Line type="monotone" dataKey="risk_score" name="Risk Score" stroke={COLORS.error} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle icon={BellRing}>Recent Alerts</SectionTitle>
          <div className="flex flex-col">
            {(data?.alerts ?? []).length === 0 && <div className="text-sm text-textSecondary py-2">No alerts yet.</div>}
            {(data?.alerts ?? []).map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-borderC last:border-b-0">
                <RiskChip level={a.level} size="sm" />
                <div className="flex-1 text-sm text-textPrimary">{a.text}</div>
                <div className="text-xs text-textDisabled whitespace-nowrap">{a.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <div className="text-[13px] text-textSecondary mb-2.5 font-semibold">Temperature Trend</div>
          <ResponsiveContainer width="100%" height={90}>
            <LineChart data={trend}><Line type="monotone" dataKey="temperature" stroke={COLORS.secondary} strokeWidth={2} dot={false} isAnimationActive animationDuration={300} /></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="text-[13px] text-textSecondary mb-2.5 font-semibold">Humidity Trend</div>
          <ResponsiveContainer width="100%" height={90}>
            <AreaChart data={trend}><Area type="monotone" dataKey="humidity" stroke={COLORS.teal} fill={`${COLORS.teal}33`} strokeWidth={2} isAnimationActive animationDuration={300} /></AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="text-[13px] text-textSecondary mb-2.5 font-semibold">Soil Moisture Trend</div>
          <ResponsiveContainer width="100%" height={90}>
            <LineChart data={trend}><Line type="monotone" dataKey="soil_moisture" stroke={COLORS.primary} strokeWidth={2} dot={false} isAnimationActive animationDuration={300} /></LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={ClipboardCheck}>Quick Actions</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => navigate("/live-monitoring")} className="flex flex-col items-center gap-2 py-4 px-2.5 rounded-[10px] border border-borderC bg-white hover:bg-bg hover:border-primary transition text-[13.5px] font-semibold text-textPrimary">
            <Activity size={20} color={COLORS.secondary} /> View Live Sensors
          </button>
          <button onClick={() => navigate("/historical-analytics")} className="flex flex-col items-center gap-2 py-4 px-2.5 rounded-[10px] border border-borderC bg-white hover:bg-bg hover:border-primary transition text-[13.5px] font-semibold text-textPrimary">
            <BarChart3 size={20} color={COLORS.primary} /> Open Analytics
          </button>
          <button onClick={() => navigate("/gis-map")} className="flex flex-col items-center gap-2 py-4 px-2.5 rounded-[10px] border border-borderC bg-white hover:bg-bg hover:border-primary transition text-[13.5px] font-semibold text-textPrimary">
            <MapPin size={20} color={COLORS.accent} /> View Field Map
          </button>
          <button onClick={() => navigate("/reports")} className="flex flex-col items-center gap-2 py-4 px-2.5 rounded-[10px] border border-borderC bg-white hover:bg-bg hover:border-primary transition text-[13.5px] font-semibold text-textPrimary">
            <FileText size={20} color={COLORS.error} /> Generate Report
          </button>
        </div>
      </Card>
    </div>
  );
}
