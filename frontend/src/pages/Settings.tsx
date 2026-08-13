import React, { useEffect, useState } from "react";
import { Sprout, Ruler, SlidersHorizontal, LayoutDashboard, BellRing, RadioTower, Info, Check, Sun, Moon } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import Row from "@/components/Row";
import StatusDot from "@/components/StatusDot";
import Skeleton from "@/components/Skeleton";
import { fetchSettings, updateSettings } from "@/services/settingsService";
import { useSensorData } from "@/hooks/useSensorData";
import { useTheme } from "@/context/ThemeContext";
import { useGeoCrop } from "@/context/AppContext";
import { LOCKED_CROPS, ERODE_DIVISIONS } from "@/utils/constants";
import type { AppSettings } from "@/types";

export default function Settings() {
  const { connected } = useSensorData();
  const { theme, setTheme } = useTheme();
  const { setCropAndStage, selectedStage } = useGeoCrop();
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
    <div className="flex flex-col gap-6 sm:gap-8">
      {saved && (
        <div className="fade-in flex items-center gap-2.5 bg-successLight text-success px-4 py-3 rounded-lg text-sm font-semibold">
          <Check size={18} /> Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={Sprout}>Default Crop Configuration</SectionTitle>
          <p className="text-xs text-textSecondary dark:text-darkTextSecondary mb-3">
            Select the default crop to display on startup across monitoring panels:
          </p>
          <select
            value={settings.crop}
            onChange={(e) => {
              const val = e.target.value;
              update({ crop: val });
              setCropAndStage(val, selectedStage);
            }}
            className="w-full h-11 px-3 rounded-lg border border-borderC dark:border-darkBorderC bg-bg dark:bg-darkBg text-textPrimary dark:text-darkTextPrimary font-semibold text-sm outline-none"
          >
            {LOCKED_CROPS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Card>

        <Card>
          <SectionTitle icon={Ruler}>Measurement Units</SectionTitle>
          <div className="flex flex-col">
            <ToggleRow label="Temperature Unit" options={["Celsius", "Fahrenheit"]} value={settings.temp_unit} onChange={(v) => update({ temp_unit: v as AppSettings["temp_unit"] })} />
            <ToggleRow label="Rainfall Unit" options={["mm", "inches"]} value={settings.rain_unit} onChange={(v) => update({ rain_unit: v as AppSettings["rain_unit"] })} />
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={SlidersHorizontal}>Alert Threshold Values</SectionTitle>
        <ThresholdSlider label="Humidity Warning Threshold" value={settings.humidity_threshold} min={40} max={100} unit="%" onChange={(v) => update({ humidity_threshold: v })} />
        <ThresholdSlider label="Soil Moisture Warning Threshold" value={settings.soil_threshold} min={30} max={100} unit="%" onChange={(v) => update({ soil_threshold: v })} />
        <ThresholdSlider label="High Risk Score Threshold" value={settings.risk_threshold} min={50} max={95} unit="" onChange={(v) => update({ risk_threshold: v })} />
      </Card>

      <div className="grid grid-cols-1 gap-5">
        <Card>
          <SectionTitle icon={BellRing}>Notification Preferences</SectionTitle>
          <div className="flex flex-col">
            <SwitchRow label="High risk disease alerts" value={settings.notify_high_risk} onChange={(v) => update({ notify_high_risk: v })} />
            <SwitchRow label="Daily report ready" value={settings.notify_daily_report} onChange={(v) => update({ notify_daily_report: v })} />
            <SwitchRow label="Sensor offline warning" value={settings.notify_sensor_offline} onChange={(v) => update({ notify_sensor_offline: v })} />
            <SwitchRow label="Weekly summary email" value={settings.notify_weekly_summary} onChange={(v) => update({ notify_weekly_summary: v })} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={RadioTower}>System Information</SectionTitle>
          <div className="flex flex-col">
            <Row label="Hardware Device ID" value="ESP32_01" />
            <Row label="Connection Status" value={<StatusDot connected={connected} />} />
            <Row label="Monitored Region" value="Erode District (5 Divisions)" />
            <Row label="Supported Crops" value="8 Locked Crops" />
            <Row label="ML Architecture" value="LightGBM Risk Model + XGBoost Disease Model (geocrop_v1)" />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Info}>About GeoCrop EWS</SectionTitle>
          <p className="text-sm text-textPrimary dark:text-darkTextPrimary leading-relaxed m-0">
            The Geographic Crop Disease Early Warning System combines real IoT sensing (DHT22, Soil Moisture, NEO-6M GPS),
            calibrated Machine Learning models, and agronomic decision support for the 8 supported crops across Erode district.
          </p>
          <div className="mt-3 text-xs text-textSecondary dark:text-darkTextSecondary font-medium">GeoCrop EWS · v1.0.0 (Production Build)</div>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => fetchSettings().then(setSettingsState)}>Cancel</Button>
        <Button variant="primary" icon={Check} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</Button>
      </div>
    </div>
  );
}

function ToggleRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-borderC dark:border-darkBorderC last:border-b-0">
      <span className="text-sm text-textSecondary dark:text-darkTextSecondary">{label}</span>
      <div className="flex bg-bg dark:bg-darkBg rounded-lg p-0.5 border border-borderC dark:border-darkBorderC">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} className={`py-1.5 px-3 rounded-md text-xs font-semibold ${value === o ? "bg-primary text-white" : "text-textSecondary dark:text-darkTextSecondary"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function ThresholdSlider({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2 text-sm">
        <span className="text-textSecondary dark:text-darkTextSecondary">{label}</span>
        <span className="font-bold text-textPrimary dark:text-darkTextPrimary">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary h-1.5" />
    </div>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-borderC dark:border-darkBorderC last:border-b-0">
      <span className="text-sm text-textPrimary dark:text-darkTextPrimary">{label}</span>
      <button onClick={() => onChange(!value)} className="w-[42px] h-6 rounded-full relative transition-colors" style={{ background: value ? "#2E7D32" : "#CFD8DC" }}>
        <span className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all shadow" style={{ left: value ? 21 : 3 }} />
      </button>
    </div>
  );
}
