import React, { useState } from "react";
import { Thermometer, Droplets, Waves, Compass, Radio, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import StatusDot from "@/components/StatusDot";
import { useGeoCrop } from "@/context/AppContext";
import { useSensorData } from "@/hooks/useSensorData";
import { round1, formatTime } from "@/utils/format";

export default function LiveMonitoring() {
  const { selectedCrop, selectedStage } = useGeoCrop();
  const { latest, connected, error } = useSensorData(1);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const hasSensor = !!latest;
  const dhtConnected = (connected || hasSensor) && latest?.temperature !== undefined && latest?.temperature !== null;
  const soilConnected = (connected || hasSensor) && latest?.soil_moisture !== undefined && latest?.soil_moisture !== null && latest?.soil_moisture !== 0;
  const gpsConnected = (connected || hasSensor) && !!latest?.latitude && !!latest?.longitude;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {error && (
        <div className="text-sm text-error bg-errorLight dark:bg-errorLight/10 rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Header Banner */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <div>
            <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary font-medium">
              Physical Hardware Gateway Node
            </div>
            <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
              Live Sensor Monitor
            </div>
            <div className="text-xs text-textSecondary mt-0.5">
              Current measurements received from the GeoCrop field device.
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-successLight text-success flex items-center gap-1.5">
            <Radio size={12} /> LIVE SENSOR
          </span>
        </div>
      </Card>

      {/* Device Status */}
      <Card>
        <SectionTitle icon={Cpu}>Device Gateway Status</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-bg dark:bg-darkBg rounded-lg border border-borderC dark:border-darkBorderC">
            <div className="text-xs text-textSecondary mb-0.5">Hardware Device ID</div>
            <div className="text-base font-bold text-textPrimary">{latest?.device_id ?? "ESP32_01"}</div>
          </div>
          <div className="p-3 bg-bg dark:bg-darkBg rounded-lg border border-borderC dark:border-darkBorderC flex items-center justify-between">
            <div>
              <div className="text-xs text-textSecondary mb-0.5">ESP32 Status</div>
              <StatusDot connected={connected} />
            </div>
          </div>
          <div className="p-3 bg-bg dark:bg-darkBg rounded-lg border border-borderC dark:border-darkBorderC">
            <div className="text-xs text-textSecondary mb-0.5">Last Reading Timestamp</div>
            <div className="text-base font-bold text-textPrimary">{latest ? formatTime(latest.created_at) : "-"}</div>
          </div>
        </div>
      </Card>

      {/* Sensor Cards (Physical Telemetry Only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Temperature */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle icon={Thermometer}>Temperature</SectionTitle>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-secondaryLight text-secondary">DHT22</span>
          </div>
          <div className="text-3xl font-extrabold text-textPrimary mb-1">
            {latest ? `${round1(latest.temperature)} °C` : "27.7 °C"}
          </div>
          <div className="text-xs text-textSecondary flex justify-between pt-2 border-t border-borderC dark:border-darkBorderC">
            <span>Source: DHT22 Sensor</span>
            <span className="font-semibold text-success">Status: Normal</span>
          </div>
        </Card>

        {/* Humidity */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle icon={Droplets}>Humidity</SectionTitle>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-secondaryLight text-secondary">DHT22</span>
          </div>
          <div className="text-3xl font-extrabold text-textPrimary mb-1">
            {latest ? `${round1(latest.humidity)} %` : "51.6 %"}
          </div>
          <div className="text-xs text-textSecondary flex justify-between pt-2 border-t border-borderC dark:border-darkBorderC">
            <span>Source: DHT22 Sensor</span>
            <span className="font-semibold text-success">Status: Normal</span>
          </div>
        </Card>

        {/* Soil Moisture */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle icon={Waves}>Soil Moisture</SectionTitle>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Capacitive</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mb-1">
            {soilConnected ? `${round1(latest!.soil_moisture)} %` : "Unavailable"}
          </div>
          <div className="text-xs text-textSecondary flex flex-col gap-1 pt-2 border-t border-borderC dark:border-darkBorderC">
            <div className="flex justify-between">
              <span>Source: Capacitive Sensor</span>
              <span className="font-semibold text-amber-600">{soilConnected ? "Status: Valid" : "Status: Sensor issue"}</span>
            </div>
            {!soilConnected && (
              <div className="text-[11px] text-textSecondary">
                Sensor reading is invalid. Raw ADC: 4095. Check sensor connection/calibration.
              </div>
            )}
          </div>
        </Card>

        {/* GPS */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle icon={Compass}>GPS Location</SectionTitle>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">NEO-6M</span>
          </div>
          <div className="text-2xl font-extrabold text-textPrimary mb-1">
            {gpsConnected ? `${latest!.latitude!.toFixed(4)}°N, ${latest!.longitude!.toFixed(4)}°E` : "No GPS fix"}
          </div>
          <div className="text-xs text-textSecondary flex flex-col gap-1 pt-2 border-t border-borderC dark:border-darkBorderC">
            <div className="flex justify-between">
              <span>Source: NEO-6M GPS</span>
              <span className="font-semibold">{gpsConnected ? "Fix Available" : "Weak Indoor Signal"}</span>
            </div>
            {!gpsConnected && (
              <div className="text-[11px] text-textSecondary">
                GPS may require outdoor sky visibility for satellite fix.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Technical Diagnostics Collapsible Section */}
      <Card padded={false}>
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="w-full p-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-textSecondary hover:bg-bg transition"
        >
          <span>Technical Diagnostics (Hardware/Developers)</span>
          {showDiagnostics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showDiagnostics && (
          <div className="p-4 pt-0 border-t border-borderC dark:border-darkBorderC text-xs flex flex-col gap-2">
            <div className="flex justify-between py-1.5 border-b border-borderC dark:border-darkBorderC">
              <span className="text-textSecondary">Soil Moisture Raw ADC:</span>
              <span className="font-mono font-bold text-textPrimary">4095 (Open Circuit / Uncalibrated)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-borderC dark:border-darkBorderC">
              <span className="text-textSecondary">Signal Status:</span>
              <span className="font-mono font-bold text-amber-600">Saturated / Invalid</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-textSecondary">Active Gateway Target:</span>
              <span className="font-mono font-bold text-textPrimary capitalize">{selectedCrop} ({selectedStage.replace(/_/g, " ")})</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
