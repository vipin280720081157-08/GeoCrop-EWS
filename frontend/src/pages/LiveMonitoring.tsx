import React from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Thermometer, Droplets, Waves, CloudRain, RadioTower } from "lucide-react";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import SectionTitle from "@/components/SectionTitle";
import Row from "@/components/Row";
import StatusDot from "@/components/StatusDot";
import { useSensorData } from "@/hooks/useSensorData";
import { round1, formatTime } from "@/utils/format";
import { COLORS } from "@/utils/colors";

export default function LiveMonitoring() {
  const { latest, history, connected, error } = useSensorData(1);
  const recent = history.slice(-30).map((h, i) => ({ ...h, t: i }));

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <div className="text-sm text-error bg-errorLight rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={Thermometer} iconColor={COLORS.secondary} title="Temperature" value={latest ? round1(latest.temperature) : "-"} unit="°C" trendLabel="Live · polls every 5s" />
        <StatCard icon={Droplets} iconColor={COLORS.teal} title="Humidity" value={latest ? round1(latest.humidity) : "-"} unit="%" trendLabel="Live · polls every 5s" />
        <StatCard icon={Waves} iconColor={COLORS.primary} title="Soil Moisture" value={latest ? round1(latest.soil_moisture) : "-"} unit="%" trendLabel="Live · polls every 5s" />
        <StatCard icon={CloudRain} iconColor={COLORS.accent} title="Rainfall (7d)" value={latest ? round1(latest.rainfall_7d ?? 0) : "-"} unit="mm" trendLabel="Cumulative" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={Thermometer}>Temperature (°C)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={recent}>
              <CartesianGrid stroke="#EEEEEE" vertical={false} />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fontSize: 12, fill: COLORS.textSecondary }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="temperature" stroke={COLORS.secondary} strokeWidth={2.5} dot={false} isAnimationActive animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle icon={Droplets}>Humidity (%)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={recent}>
              <CartesianGrid stroke="#EEEEEE" vertical={false} />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fontSize: 12, fill: COLORS.textSecondary }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ fontSize: 13 }} />
              <Area type="monotone" dataKey="humidity" stroke={COLORS.teal} fill={`${COLORS.teal}33`} strokeWidth={2.5} isAnimationActive animationDuration={300} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={Waves}>Soil Moisture (%)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={recent}>
              <CartesianGrid stroke="#EEEEEE" vertical={false} />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fontSize: 12, fill: COLORS.textSecondary }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="soil_moisture" stroke={COLORS.primary} strokeWidth={2.5} dot={false} isAnimationActive animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle icon={RadioTower}>Device &amp; Field Status</SectionTitle>
          <div className="flex flex-col">
            <Row label="Crop" value={latest?.crop ?? "-"} />
            <Row label="Growth Stage" value={latest?.growth_stage ?? "-"} />
            <Row label="GPS Location" value={latest ? `${latest.latitude?.toFixed(4)}°N, ${latest.longitude?.toFixed(4)}°E` : "-"} />
            <Row label="ESP32 Connection" value={<StatusDot connected={connected} />} />
            <Row label="Device ID" value={latest?.device_id ?? "-"} />
            <Row label="Last Updated" value={latest ? formatTime(latest.created_at) : "-"} />
          </div>
        </Card>
      </div>
    </div>
  );
}
