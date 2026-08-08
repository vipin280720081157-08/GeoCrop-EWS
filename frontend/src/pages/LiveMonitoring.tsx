import React from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Thermometer, Droplets, Waves, CloudRain, RadioTower, AlertTriangle } from "lucide-react";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import SectionTitle from "@/components/SectionTitle";
import Row from "@/components/Row";
import StatusDot from "@/components/StatusDot";
import Skeleton from "@/components/Skeleton";
import { useSensorData } from "@/hooks/useSensorData";
import { round1, formatTime } from "@/utils/format";
import { getThemeColors } from "@/utils/colors";
import { useApp } from "@/context/AppContext";
import { STATE_COPY } from "@/utils/constants";

export default function LiveMonitoring() {
  const { latest, history, connected, loading, error } = useSensorData(1);
  const { theme, systemStatus } = useApp();
  const isDark = theme === "dark";
  const colors = getThemeColors(isDark);

  const recent = history.slice(-30).map((h, i) => ({ ...h, t: i }));

  const ageMs = latest ? Date.now() - new Date(latest.created_at).getTime() : 0;
  const ageMins = Math.floor(ageMs / 60000);
  const ageStr = ageMins >= 60 ? `${Math.floor(ageMins / 60)}h ago` : `${ageMins}m ago`;

  const freshnessLabel = connected
    ? "Live · polling every 5s"
    : latest
    ? `Last known — ${ageStr} (Hardware Offline)`
    : STATE_COPY.noSensorData;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><Skeleton h={100} /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {error && (
        <div className="text-sm text-error bg-errorLight rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{STATE_COPY.backendUnreachable}</span>
        </div>
      )}

      {/* Sensor Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon={Thermometer}
          iconColor={colors.secondary}
          title="Air Temperature"
          value={latest ? `${round1(latest.temperature)}` : STATE_COPY.noSensorData}
          unit={latest ? "°C" : undefined}
          trendLabel={freshnessLabel}
        />
        <StatCard
          icon={Droplets}
          iconColor={colors.teal}
          title="Relative Humidity"
          value={latest ? `${round1(latest.humidity)}` : STATE_COPY.noSensorData}
          unit={latest ? "%" : undefined}
          trendLabel={freshnessLabel}
        />
        <StatCard
          icon={Waves}
          iconColor={colors.primary}
          title="Soil Moisture"
          value={latest ? `${round1(latest.soil_moisture)}` : STATE_COPY.noSensorData}
          unit={latest ? "%" : undefined}
          trendLabel={freshnessLabel}
        />
        <StatCard
          icon={CloudRain}
          iconColor={colors.accent}
          title="Rainfall (7 Days)"
          value={latest ? `${round1(latest.rainfall_7d ?? 0)}` : STATE_COPY.noSensorData}
          unit={latest ? "mm" : undefined}
          trendLabel="Cumulative 7-day total"
        />
      </div>

      {/* 3 Real-time Sensor Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <SectionTitle icon={Thermometer}>Temperature (°C)</SectionTitle>
          {recent.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-textSecondary">{STATE_COPY.noSensorData}</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={recent}>
                <CartesianGrid stroke={colors.border} vertical={false} />
                <XAxis dataKey="t" hide />
                <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ fontSize: 13, background: colors.card, borderColor: colors.border }} />
                <Line type="monotone" dataKey="temperature" stroke={colors.secondary} strokeWidth={2.5} dot={false} isAnimationActive animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <SectionTitle icon={Droplets}>Humidity (%)</SectionTitle>
          {recent.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-textSecondary">{STATE_COPY.noSensorData}</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={recent}>
                <CartesianGrid stroke={colors.border} vertical={false} />
                <XAxis dataKey="t" hide />
                <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ fontSize: 13, background: colors.card, borderColor: colors.border }} />
                <Area type="monotone" dataKey="humidity" stroke={colors.teal} fill={`${colors.teal}33`} strokeWidth={2.5} isAnimationActive animationDuration={300} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <SectionTitle icon={Waves}>Soil Moisture (%)</SectionTitle>
          {recent.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-textSecondary">{STATE_COPY.noSensorData}</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={recent}>
                <CartesianGrid stroke={colors.border} vertical={false} />
                <XAxis dataKey="t" hide />
                <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ fontSize: 13, background: colors.card, borderColor: colors.border }} />
                <Line type="monotone" dataKey="soil_moisture" stroke={colors.primary} strokeWidth={2.5} dot={false} isAnimationActive animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Device & Field Hardware Status */}
      <Card>
        <SectionTitle icon={RadioTower}>Device &amp; Telemetry Status</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row label="Hardware Status" value={<StatusDot connected={connected} />} />
          <Row label="Device ID" value={latest?.device_id ?? "ESP32_01"} />
          <Row
            label="GPS State"
            value={
              systemStatus.gps === "fixed"
                ? `${latest?.latitude?.toFixed(4)}°N, ${latest?.longitude?.toFixed(4)}°E`
                : systemStatus.gps === "waiting"
                ? STATE_COPY.gpsWaiting
                : STATE_COPY.gpsUnavailable
            }
          />
          <Row label="Last Sensor Packet" value={latest ? formatTime(latest.created_at) : STATE_COPY.noSensorData} />
        </div>
      </Card>
    </div>
  );
}
