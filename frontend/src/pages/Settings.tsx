import React, { useEffect, useState } from "react";
import { Sprout, Ruler, SlidersHorizontal, LayoutDashboard, BellRing, RadioTower, Info, Check } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Button from "@/components/Button";
import Row from "@/components/Row";
import StatusDot from "@/components/StatusDot";
import Skeleton from "@/components/Skeleton";
import { fetchSettings, updateSettings } from "@/services/settingsService";
import { useSensorData } from "@/hooks/useSensorData";
import type { AppSettings } from "@/types";

export default function Settings() {
  const { connected } = useSensorData();
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
    <div className="flex flex-col gap-8">
      {saved && (
        <div className="fade-in flex items-center gap-2.5 bg-successLight text-success px-4 py-3 rounded-lg text-sm font-semibold">
          <Check size={18} /> Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={Sprout}>Crop Selection</SectionTitle>
          <div className="flex gap-2.5">
            {(["Rice", "Tomato"] as const).map((c) => (
              <button
                key={c}
                onClick={() => update({ crop: c })}
                className={`flex-1 p-3 rounded-lg border-[1.5px] font-semibold flex flex-col items-center gap-1.5 ${settings.crop === c ? "border-primary bg-primaryLight text-primary" : "border-borderC text-textPrimary"}`}
              >
                <Sprout size={22} /> {c}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Ruler}>Units</SectionTitle>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={LayoutDashboard}>Theme Preference</SectionTitle>
          <div className="flex gap-2.5">
            <button className="flex-1 p-3 rounded-lg border-[1.5px] border-primary bg-primaryLight text-primary font-semibold">Light (Active)</button>
            <button disabled className="flex-1 p-3 rounded-lg border-[1.5px] border-borderC bg-gray-100 text-textDisabled font-semibold cursor-not-allowed">Dark (Coming soon)</button>
          </div>
        </Card>

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
            <Row label="Device ID" value="ESP32_01" />
            <Row label="Connection" value={<StatusDot connected={connected} />} />
            <Row label="Sensor Update Interval" value="30 seconds" />
            <Row label="Database" value={import.meta.env.PROD ? "PostgreSQL" : "SQLite"} />
            <Row label="ML Model" value="Random Forest (see backend/model)" />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Info}>About This Project</SectionTitle>
          <p className="text-sm text-textPrimary leading-relaxed m-0">
            The Geographic Crop Disease Early Warning and Decision Support System combines IoT
            sensing, machine learning, GIS, and decision support to help farmers identify crop
            disease risk before visible symptoms appear — enabling timely, preventive
            agricultural management for rice and tomato crops.
          </p>
          <div className="mt-3 text-xs text-textSecondary">GeoCrop EWS · v1.0.0</div>
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
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-textSecondary">{label}</span>
      <div className="flex bg-bg rounded-lg p-0.5 border border-borderC">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} className={`py-1.5 px-3 rounded-md text-xs font-semibold ${value === o ? "bg-primary text-white" : "text-textSecondary"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function ThresholdSlider({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2 text-sm">
        <span className="text-textSecondary">{label}</span>
        <span className="font-bold text-textPrimary">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary h-1.5" />
    </div>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-textPrimary">{label}</span>
      <button onClick={() => onChange(!value)} className="w-[42px] h-6 rounded-full relative transition-colors" style={{ background: value ? "#2E7D32" : "#CFD8DC" }}>
        <span className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all shadow" style={{ left: value ? 21 : 3 }} />
      </button>
    </div>
  );
}
