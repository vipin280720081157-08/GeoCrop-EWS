import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea
} from "recharts";
import {
  AlertTriangle, Gauge, Thermometer, TrendingUp, BellRing,
  ClipboardList, MapPin, Cpu, CheckCircle2, AlertCircle, XCircle, Clock
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
import { round1, formatTime } from "@/utils/format";
import { getThemeColors } from "@/utils/colors";
import { useApp } from "@/context/AppContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { crop, theme, systemStatus } = useApp();
  const isDark = theme === "dark";
  const colors = getThemeColors(isDark);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await fetchDashboard();
      setData(result);
    } catch {
      // Handled via system status
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(load, 10000);

  const prediction = data?.latest_prediction;
  const sensor = data?.latest_sensor;
  const trend = data?.trend_7d ?? [];

  // Filter trend / prediction by active crop if present
  const cropPrediction = prediction && prediction.crop === crop ? prediction : prediction;

  const topRecommendation = cropPrediction?.recommendations?.[0];

  const hasCoords = !!(sensor?.latitude && sensor?.longitude);
  const gpsText = hasCoords
    ? `${sensor!.latitude!.toFixed(4)}°N, ${sensor!.longitude!.toFixed(4)}°E`
    : systemStatus.gps === "waiting"
    ? "Waiting for GPS location"
    : "GPS location unavailable";

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header Row */}
      <div className="fade-in flex flex-wrap gap-4 items-center justify-between">
        <div>
          <div className="text-[13px] text-textSecondary mb-0.5">Active Crop Focus</div>
          <div className="text-xl font-bold text-textPrimary flex items-center gap-2">
            {crop} Monitoring &amp; Warning
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" icon={Cpu} onClick={() => navigate("/disease-prediction")}>View Prediction</Button>
          <Button variant="primary" icon={ClipboardList} onClick={() => navigate("/decision-support")}>Decision Support</Button>
        </div>
      </div>

      {/* System Status Row (Non-blocking status sweep) */}
      <Card padded={false} className="p-3.5 bg-card border border-borderC">
        <div className="text-xs font-semibold text-textSecondary mb-2 uppercase tracking-wider px-1">System Status</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <StatusItem label="Application" state={systemStatus.application} text="Ready" />
          <StatusItem
            label="Backend"
            state={systemStatus.backend}
            text={systemStatus.backend === "online" ? "Online" : systemStatus.backend === "checking" ? "Checking..." : "Unavailable"}
          />
          <StatusItem
            label="Data Service"
            state={systemStatus.dataService}
            text={systemStatus.dataService === "receiving" ? "Receiving data" : systemStatus.dataService === "checking" ? "Checking..." : "No recent data"}
          />
          <StatusItem
            label="Hardware"
            state={systemStatus.hardware}
            text={systemStatus.hardware === "connected" ? "Connected" : systemStatus.hardware === "checking" ? "Checking..." : "Offline"}
          />
          <StatusItem
            label="AI Model"
            state={systemStatus.aiModel}
            text={systemStatus.aiModel === "available" ? "Available" : systemStatus.aiModel === "checking" ? "Checking..." : "Baseline in use"}
          />
          <StatusItem
            label="GPS"
            state={systemStatus.gps}
            text={systemStatus.gps === "fixed" ? "Fixed" : systemStatus.gps === "waiting" ? "Waiting for GPS" : "Unavailable"}
          />
        </div>
      </Card>

      {/* Primary Stat Grid (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Card key={i}><Skeleton h={100} /></Card>)
        ) : (
          <>
            {/* 1. Disease Risk */}
            <StatCard
              icon={AlertTriangle}
              iconColor={cropPrediction?.risk_level === "High" ? colors.error : cropPrediction?.risk_level === "Medium" ? colors.warning : colors.success}
              title="Current Disease Risk"
              value={cropPrediction?.risk_level ?? "No prediction yet"}
              trendLabel={cropPrediction ? `${cropPrediction.disease} (${cropPrediction.risk_score}/100)` : "Waiting for prediction"}
            />

            {/* 2. Field Readiness */}
            <StatCard
              icon={Gauge}
              iconColor={colors.primary}
              title="Field Readiness Score"
              value={cropPrediction?.readiness_score != null ? cropPrediction.readiness_score : "Not available"}
              unit={cropPrediction?.readiness_score != null ? "/ 100" : undefined}
              trendLabel={cropPrediction?.readiness_label ?? "Awaiting data"}
              trendUp
            />

            {/* 3. Environmental Snapshot */}
            {(() => {
              if (!sensor) {
                return (
                  <StatCard
                    icon={Thermometer}
                    iconColor={colors.accent}
                    title="Environmental Snapshot"
                    value="Waiting for sensor data"
                    trendLabel="No sensor data available yet."
                  />
                );
              }
              const ageMs = Date.now() - new Date(sensor.created_at).getTime();
              const ageMins = Math.floor(ageMs / 60000);
              const isFresh = ageMins < 5;
              const ageStr = ageMins >= 60 ? `${Math.floor(ageMins / 60)}h ago` : `${ageMins}m ago`;
              const statusStr = isFresh ? `Live · as of ${formatTime(sensor.created_at)}` : `Last known — ${ageStr} (Hardware Offline)`;

              return (
                <StatCard
                  icon={Thermometer}
                  iconColor={colors.accent}
                  title="Environmental Snapshot"
                  value={`${round1(sensor.temperature)}°C`}
                  trendLabel={`${statusStr} (${round1(sensor.humidity)}% hum)`}
                />
              );
            })()}

            {/* 4. Model Status */}
            <StatCard
              icon={Cpu}
              iconColor={colors.secondary}
              title="Model Status"
              value={cropPrediction?.source === "trained_model" ? "Model-based" : "Baseline Estimate"}
              trendLabel={cropPrediction?.source === "trained_model" ? "Random Forest Classifier" : "Agronomic Rule Engine"}
            />
          </>
        )}
      </div>

      {/* Disease Risk Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-5">
        <Card>
          <SectionTitle icon={TrendingUp}>Disease Risk Trend (7 Days)</SectionTitle>
          {trend.length < 2 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-textSecondary">
              Historical trends will appear here as data accumulates.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={colors.border} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: colors.textSecondary }} axisLine={{ stroke: colors.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, background: colors.card, borderColor: colors.border, color: colors.textSecondary }} />
                <ReferenceArea y1={0} y2={40} fill={colors.success} fillOpacity={0.06} />
                <ReferenceArea y1={40} y2={70} fill={colors.warning} fillOpacity={0.07} />
                <ReferenceArea y1={70} y2={100} fill={colors.error} fillOpacity={0.07} />
                <Line type="monotone" dataKey="risk_score" name="Risk Score" stroke={colors.error} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recent Alerts */}
        <Card>
          <SectionTitle icon={BellRing}>Recent Alerts</SectionTitle>
          <div className="flex flex-col">
            {(data?.alerts ?? []).length === 0 ? (
              <div className="text-sm text-textSecondary py-4 text-center">No recent alerts.</div>
            ) : (
              (data?.alerts ?? []).map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-borderC last:border-b-0">
                  <RiskChip level={a.level} size="sm" />
                  <div className="flex-1 text-sm text-textPrimary">{a.text}</div>
                  <div className="text-xs text-textDisabled whitespace-nowrap">{a.time}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Third Row: Recommendation Summary & Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recommendation Summary */}
        <Card>
          <SectionTitle icon={ClipboardList}>Recommendation Summary</SectionTitle>
          {topRecommendation ? (
            <div className="flex flex-col gap-3">
              <div className="p-3.5 bg-bg rounded-lg border border-borderC flex items-start gap-3">
                <RiskChip level={topRecommendation.priority} size="sm" />
                <p className="text-sm text-textPrimary m-0 font-medium leading-relaxed">{topRecommendation.text}</p>
              </div>
              <div className="text-right">
                <button onClick={() => navigate("/decision-support")} className="text-secondary text-xs font-semibold hover:underline inline-flex items-center gap-1">
                  View full decision support &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-textSecondary py-4">
              No recommendations yet — available once a prediction has run.
            </div>
          )}
        </Card>

        {/* Location & GPS Fix */}
        <Card>
          <SectionTitle icon={MapPin}>Field Location</SectionTitle>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-textPrimary flex items-center justify-between">
              <span>GPS Status</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                systemStatus.gps === "fixed"
                  ? "bg-successLight text-success"
                  : systemStatus.gps === "waiting"
                  ? "bg-warningLight text-warning"
                  : "bg-bg text-textSecondary"
              }`}>
                {systemStatus.gps === "fixed" ? "GPS Fixed" : systemStatus.gps === "waiting" ? "GPS Waiting" : "GPS Unavailable"}
              </span>
            </div>
            <div className="text-xs text-textSecondary">{gpsText}</div>
            <div className="mt-2 text-right">
              <button onClick={() => navigate("/gis-map")} className="text-secondary text-xs font-semibold hover:underline inline-flex items-center gap-1">
                Open full GIS map &rarr;
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatusItem({ label, state, text }: { label: string; state: string; text: string }) {
  const isOk = state === "ready" || state === "online" || state === "receiving" || state === "connected" || state === "available" || state === "fixed";
  const isChecking = state === "checking" || state === "waiting";

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded bg-bg border border-borderC">
      {isOk ? (
        <CheckCircle2 size={14} className="text-success flex-shrink-0" />
      ) : isChecking ? (
        <Clock size={14} className="text-warning flex-shrink-0 animate-pulse" />
      ) : (
        <AlertCircle size={14} className="text-textSecondary flex-shrink-0" />
      )}
      <div className="truncate">
        <span className="font-medium text-textPrimary">{label}: </span>
        <span className="text-textSecondary">{text}</span>
      </div>
    </div>
  );
}
