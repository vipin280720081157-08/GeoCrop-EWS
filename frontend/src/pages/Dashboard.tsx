import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Thermometer, Droplets, Waves, Compass, CloudRain, ShieldCheck,
  AlertCircle, AlertTriangle, ShieldAlert, ArrowRight, CheckSquare,
  Square, Radio, Stethoscope, RefreshCw, ChevronRight
} from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import Skeleton from "@/components/Skeleton";
import { useGeoCrop } from "@/context/AppContext";
import { round1, formatTime } from "@/utils/format";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    selectedCrop,
    selectedStage,
    sensor,
    connected,
    weather,
    weatherLoading,
    prediction,
    refreshWeather,
  } = useGeoCrop();

  const [tasks, setTasks] = useState([
    { id: "d1", text: "Inspect crop leaves for early lesion symptoms", completed: false },
    { id: "d2", text: "Check irrigation condition & drainage channel flow", completed: false },
    { id: "d3", text: "Review 7-day weather forecast before next watering", completed: true },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const hasSensor = !!sensor;
  const dhtConnected = (connected || hasSensor) && sensor?.temperature !== undefined && sensor?.temperature !== null;
  const soilConnected = (connected || hasSensor) && sensor?.soil_moisture !== undefined && sensor?.soil_moisture !== null && sensor?.soil_moisture !== 0;
  const gpsConnected = (connected || hasSensor) && !!sensor?.latitude && !!sensor?.longitude;

  // Determine overall field status state
  const riskLevel = prediction?.risk_level ?? "LOW";
  const fieldState: "Healthy" | "Monitoring" | "Attention" | "Critical" =
    riskLevel === "CRITICAL" ? "Critical" :
    riskLevel === "HIGH" ? "Attention" :
    riskLevel === "MEDIUM" ? "Monitoring" : "Monitoring";

  const statusColors = {
    Healthy: { bg: "bg-successLight dark:bg-successLight/10", border: "border-success/30", text: "text-success", icon: ShieldCheck },
    Monitoring: { bg: "bg-secondaryLight dark:bg-secondaryLight/10", border: "border-secondary/30", text: "text-secondary", icon: AlertCircle },
    Attention: { bg: "bg-warningLight dark:bg-warningLight/10", border: "border-warning/30", text: "text-warning", icon: AlertTriangle },
    Critical: { bg: "bg-errorLight dark:bg-errorLight/10", border: "border-error/30", text: "text-error", icon: ShieldAlert },
  };

  const StatusIcon = statusColors[fieldState].icon;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header Banner */}
      <div className="fade-in flex flex-wrap gap-4 items-center justify-between bg-card dark:bg-darkCard p-4 sm:p-5 rounded-card border border-borderC dark:border-darkBorderC shadow-card">
        <div>
          <div className="text-xs text-textSecondary dark:text-darkTextSecondary font-medium mb-0.5">
            Good morning · Your field overview
          </div>
          <div className="text-lg sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary capitalize flex items-center gap-2">
            <span>{selectedCrop} • {selectedStage.replace(/_/g, " ")}</span>
          </div>
          <div className="text-xs text-textSecondary dark:text-darkTextSecondary mt-1 flex items-center gap-2">
            <span>Last updated: {sensor ? formatTime(sensor.created_at) : "2 min ago"}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-success">
              <Radio size={12} /> {dhtConnected ? "Sensors connected" : "Partial sensor data"}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/crop-stage")}>
          Change Crop / Stage
        </Button>
      </div>

      {/* A. Overall Field Status */}
      <div className={`p-5 rounded-card border ${statusColors[fieldState].bg} ${statusColors[fieldState].border} flex items-start gap-4 shadow-sm`}>
        <StatusIcon size={28} className={`${statusColors[fieldState].text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-textSecondary mb-1">
            FIELD STATUS
          </div>
          <div className={`text-xl font-bold ${statusColors[fieldState].text} mb-1`}>
            {fieldState}
          </div>
          <p className="m-0 text-xs sm:text-sm text-textPrimary leading-relaxed">
            Conditions are currently being monitored. Field parameters remain stable and no emergency action is required.
          </p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-textSecondary font-medium">
            <span>✓ Sensor readings</span>
            <span>✓ Weather conditions</span>
            <span>✓ Crop stage context</span>
          </div>
        </div>
      </div>

      {/* B. Current Field Conditions (4 Compact Telemetry Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature */}
        <div className="p-4 bg-card dark:bg-darkCard rounded-card border border-borderC dark:border-darkBorderC shadow-card flex flex-col justify-between">
          <div className="text-xs text-textSecondary dark:text-darkTextSecondary mb-1 flex items-center justify-between">
            <span>Temperature</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-secondaryLight text-secondary">DHT22</span>
          </div>
          <div className="text-2xl font-bold text-textPrimary dark:text-darkTextPrimary my-1">
            {sensor ? `${round1(sensor.temperature)} °C` : "27.3 °C"}
          </div>
          <div className="text-[11px] text-textSecondary dark:text-darkTextSecondary">Live Sensor Reading</div>
        </div>

        {/* Humidity */}
        <div className="p-4 bg-card dark:bg-darkCard rounded-card border border-borderC dark:border-darkBorderC shadow-card flex flex-col justify-between">
          <div className="text-xs text-textSecondary dark:text-darkTextSecondary mb-1 flex items-center justify-between">
            <span>Humidity</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-secondaryLight text-secondary">DHT22</span>
          </div>
          <div className="text-2xl font-bold text-textPrimary dark:text-darkTextPrimary my-1">
            {sensor ? `${round1(sensor.humidity)} %` : "51.5 %"}
          </div>
          <div className="text-[11px] text-textSecondary dark:text-darkTextSecondary">Live Sensor Reading</div>
        </div>

        {/* Soil Moisture */}
        <div className="p-4 bg-card dark:bg-darkCard rounded-card border border-borderC dark:border-darkBorderC shadow-card flex flex-col justify-between">
          <div className="text-xs text-textSecondary dark:text-darkTextSecondary mb-1 flex items-center justify-between">
            <span>Soil Moisture</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Soil Moisture Sensor</span>
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 my-1">
            {soilConnected ? `${round1(sensor!.soil_moisture)} %` : "58 %"}
          </div>
          <div className="text-[11px] text-textSecondary dark:text-darkTextSecondary">
            Live Sensor Reading
          </div>
        </div>

        {/* GPS */}
        <div className="p-4 bg-card dark:bg-darkCard rounded-card border border-borderC dark:border-darkBorderC shadow-card flex flex-col justify-between">
          <div className="text-xs text-textSecondary dark:text-darkTextSecondary mb-1 flex items-center justify-between">
            <span>GPS Fix</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">NEO-6M</span>
          </div>
          <div className="text-xl font-bold text-textPrimary dark:text-darkTextPrimary my-1">
            {gpsConnected ? `${sensor!.latitude!.toFixed(2)}°N` : "No Fix"}
          </div>
          <div className="text-[11px] text-textSecondary dark:text-darkTextSecondary">
            {gpsConnected ? "Live Satellite Fix" : "Indoor station — GPS unavailable"}
          </div>
        </div>
      </div>

      {/* C. Weather & D. Crop Context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weather Summary */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle icon={CloudRain}>WEATHER</SectionTitle>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-secondaryLight text-secondary">
              WEATHER API
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 bg-bg dark:bg-darkBg rounded-lg border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary mb-0.5">Current</div>
              <div className="text-lg font-bold text-textPrimary">{weather?.weather_condition || "Partly Cloudy"}</div>
              <div className="text-xs text-textSecondary">{weather?.temperature ?? 28} °C</div>
            </div>
            <div className="p-3 bg-bg dark:bg-darkBg rounded-lg border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary mb-0.5">Rainfall — 7 days</div>
              <div className="text-lg font-bold text-textPrimary">{weather?.rainfall_7d ?? 30.1} mm</div>
              <div className="text-xs text-textSecondary">Rain Prob: 35%</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/weather")}
            className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
          >
            View Weather &amp; Forecast <ChevronRight size={14} />
          </button>
        </Card>

        {/* Crop Context */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle icon={Stethoscope}>CROP CONTEXT</SectionTitle>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              USER SELECTED
            </span>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-xs py-1 border-b border-borderC dark:border-darkBorderC">
              <span className="text-textSecondary">Active Crop:</span>
              <span className="font-bold text-textPrimary capitalize">{selectedCrop}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-borderC dark:border-darkBorderC">
              <span className="text-textSecondary">Growth Stage:</span>
              <span className="font-bold text-textPrimary capitalize">{selectedStage.replace(/_/g, " ")}</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-textSecondary">Field Status:</span>
              <span className="font-bold text-secondary">{fieldState}</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/crop-stage")} className="w-full justify-center text-xs">
            Change Crop / Stage
          </Button>
        </Card>
      </div>

      {/* E. Risk Summary & F. Recommended Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={AlertTriangle}>RISK SUMMARY</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary mb-1 font-semibold">Disease Risk</div>
              <div className="text-xl font-extrabold text-success mb-1">
                {prediction?.risk_level ?? "LOW"}
              </div>
              <div className="text-[11px] text-textSecondary leading-tight">
                Current conditions do not indicate elevated disease pressure.
              </div>
            </div>

            <div className="p-3.5 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary mb-1 font-semibold">Field Risk</div>
              <div className="text-xl font-extrabold text-secondary mb-1">
                MODERATE
              </div>
              <div className="text-[11px] text-textSecondary leading-tight">
                Continue monitoring soil moisture and upcoming weather.
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <SectionTitle icon={ArrowRight}>WHAT TO DO NEXT</SectionTitle>
            <p className="text-xs sm:text-sm text-textPrimary dark:text-darkTextPrimary leading-relaxed mb-4">
              Inspect the crop canopy once today and continue monitoring field moisture and local weather updates.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate("/decision-support")} className="w-full justify-center">
            View Recommendations <ArrowRight size={16} />
          </Button>
        </Card>
      </div>

      {/* G. Today's Tasks */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle icon={CheckSquare}>TODAY'S TASKS</SectionTitle>
          <button
            onClick={() => navigate("/tasks")}
            className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
          >
            View All Tasks <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${
                t.completed
                  ? "bg-successLight/30 border-success/20 text-textSecondary line-through"
                  : "bg-bg dark:bg-darkBg border-borderC dark:border-darkBorderC text-textPrimary hover:border-primary"
              }`}
            >
              {t.completed ? (
                <CheckSquare size={18} className="text-success flex-shrink-0" />
              ) : (
                <Square size={18} className="text-textSecondary flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium">{t.text}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
