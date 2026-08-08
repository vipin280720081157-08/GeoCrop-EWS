import React, { useEffect, useState } from "react";
import { Sprout, Ruler, SlidersHorizontal, Sun, Moon, RadioTower, Info, Check } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import Row from "@/components/Row";
import StatusDot from "@/components/StatusDot";
import Skeleton from "@/components/Skeleton";
import { fetchSettings, updateSettings } from "@/services/settingsService";
import { useSensorData } from "@/hooks/useSensorData";
import type { AppSettings, Crop } from "@/types";
import { useApp } from "@/context/AppContext";
import { SUPPORTED_CROPS, type SupportedCrop } from "@/utils/constants";

export default function Settings() {
  const { connected } = useSensorData();
  const { crop, setCrop, theme, toggleTheme, systemStatus } = useApp();

  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettingsState).finally(() => setLoading(false));
  }, []);

  const update = (partial: Partial<AppSettings>) => setSettingsState((prev) => (prev ? { ...prev, ...partial } : prev));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const result = await updateSettings(settings);
      setSettingsState(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <Card><Skeleton h={300} /></Card>;
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {saved && (
        <div className="fade-in flex items-center gap-2.5 bg-successLight text-success px-4 py-3 rounded-lg text-sm font-semibold border border-success">
          <Check size={18} /> Settings saved successfully.
        </div>
      )}

      {/* 1. Crop Selection */}
      <Card>
        <SectionTitle icon={Sprout}>Active Crop Selection</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUPPORTED_CROPS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCrop(c as SupportedCrop);
                update({ crop: c as Crop });
              }}
              className={`p-3.5 rounded-lg border-[1.5px] font-semibold flex flex-col items-center gap-2 transition-all ${
                crop === c
                  ? "border-primary bg-primaryLight text-primary shadow-sm"
                  : "border-borderC bg-card text-textPrimary hover:bg-bg"
              }`}
            >
              <Sprout size={24} />
              <span>{c}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* 2. Theme & 3. Display Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={Sun}>Theme Preference</SectionTitle>
          <div className="flex gap-3">
            <button
              onClick={() => theme === "dark" && toggleTheme()}
              className={`flex-1 p-3.5 rounded-lg border-[1.5px] font-semibold flex items-center justify-center gap-2 ${
                theme === "light"
                  ? "border-primary bg-primaryLight text-primary"
                  : "border-borderC bg-card text-textSecondary"
              }`}
            >
              <Sun size={20} /> Light Theme
            </button>
            <button
              onClick={() => theme === "light" && toggleTheme()}
              className={`flex-1 p-3.5 rounded-lg border-[1.5px] font-semibold flex items-center justify-center gap-2 ${
                theme === "dark"
                  ? "border-primary bg-primaryLight text-primary"
                  : "border-borderC bg-card text-textSecondary"
              }`}
            >
              <Moon size={20} /> Dark Theme
            </button>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Ruler}>Display Units</SectionTitle>
          <div className="flex flex-col gap-2">
            <ToggleRow
              label="Temperature Unit"
              options={["Celsius", "Fahrenheit"]}
              value={settings.temp_unit}
              onChange={(v) => update({ temp_unit: v as AppSettings["temp_unit"] })}
            />
            <ToggleRow
              label="Rainfall Unit"
              options={["mm", "inches"]}
              value={settings.rain_unit}
              onChange={(v) => update({ rain_unit: v as AppSettings["rain_unit"] })}
            />
          </div>
        </Card>
      </div>

      {/* 4. Alert Threshold Values */}
      <Card>
        <SectionTitle icon={SlidersHorizontal}>Decision Support Rule Thresholds</SectionTitle>
        <ThresholdSlider
          label="Humidity Warning Threshold"
          value={settings.humidity_threshold}
          min={40}
          max={100}
          unit="%"
          onChange={(v) => update({ humidity_threshold: v })}
        />
        <ThresholdSlider
          label="Soil Moisture Warning Threshold"
          value={settings.soil_threshold}
          min={30}
          max={100}
          unit="%"
          onChange={(v) => update({ soil_threshold: v })}
        />
        <ThresholdSlider
          label="High Risk Score Threshold"
          value={settings.risk_threshold}
          min={50}
          max={95}
          unit=""
          onChange={(v) => update({ risk_threshold: v })}
        />
      </Card>

      {/* 5. System Information & 6. About */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={RadioTower}>System Information</SectionTitle>
          <div className="flex flex-col">
            <Row label="Hardware Device ID" value="ESP32_01" />
            <Row label="Hardware Connection" value={<StatusDot connected={connected} />} />
            <Row label="Data Telemetry Rate" value="30 seconds" />
            <Row
              label="AI Model Status"
              value={systemStatus.aiModel === "available" ? "Trained Model Active" : "Baseline Rule Engine Active"}
            />
            <Row label="Database Engine" value={import.meta.env.PROD ? "PostgreSQL" : "SQLite"} />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Info}>About GeoCrop</SectionTitle>
          <p className="text-sm text-textPrimary leading-relaxed m-0">
            <strong>GeoCrop</strong> — Geographic Crop Disease Early Warning &amp; Decision Support System.
            Combines real-time IoT sensing, agronomic machine learning, GIS mapping, and decision support
            to detect crop disease risk before visible symptoms appear for Paddy, Turmeric, and Tomato.
          </p>
          <div className="mt-4 text-xs text-textSecondary border-t border-borderC pt-3">
            GeoCrop · Operational Instrument v1.0.0
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => fetchSettings().then(setSettingsState)}>Cancel</Button>
        <Button variant="primary" icon={Check} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-borderC last:border-b-0">
      <span className="text-sm text-textSecondary">{label}</span>
      <div className="flex bg-bg rounded-lg p-0.5 border border-borderC">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`py-1 px-3 rounded-md text-xs font-semibold ${
              value === o ? "bg-primary text-white" : "text-textSecondary"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function ThresholdSlider({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between mb-1.5 text-sm">
        <span className="text-textSecondary font-medium">{label}</span>
        <span className="font-bold text-textPrimary">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary h-1.5 bg-borderC rounded-lg cursor-pointer"
      />
    </div>
  );
}
