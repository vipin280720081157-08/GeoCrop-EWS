import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { MapPin, Info, Satellite } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import RiskChip from "@/components/RiskChip";
import Row from "@/components/Row";
import { useSensorData } from "@/hooks/useSensorData";
import { usePrediction } from "@/hooks/usePrediction";
import { riskColor } from "@/utils/colors";
import { useApp } from "@/context/AppContext";
import { STATE_COPY } from "@/utils/constants";

const DEFAULT_CENTER: [number, number] = [11.0, 78.0]; // Generic Regional View

export default function GISMap() {
  const { latest: sensor } = useSensorData();
  const { prediction } = usePrediction();
  const { crop, theme, systemStatus } = useApp();
  const isDark = theme === "dark";

  const hasCoords = !!(sensor?.latitude && sensor?.longitude);
  const center: [number, number] = hasCoords ? [sensor!.latitude!, sensor!.longitude!] : DEFAULT_CENTER;
  const level = prediction?.risk_level ?? "Low";

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* GPS Status Banner */}
      <div className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 text-xs md:text-sm font-medium ${
        systemStatus.gps === "fixed"
          ? "bg-successLight text-success border-success"
          : systemStatus.gps === "waiting"
          ? "bg-warningLight text-warning border-warning"
          : "bg-bg text-textSecondary border-borderC"
      }`}>
        <div className="flex items-center gap-2">
          <Satellite size={18} />
          <span>
            {systemStatus.gps === "fixed"
              ? `GPS Fixed (${sensor!.latitude!.toFixed(4)}°N, ${sensor!.longitude!.toFixed(4)}°E)`
              : systemStatus.gps === "waiting"
              ? STATE_COPY.gpsWaiting
              : STATE_COPY.gpsUnavailable}
          </span>
        </div>
        <span className="text-xs uppercase font-bold tracking-wider opacity-80">
          {systemStatus.gps === "fixed" ? "Fixed" : systemStatus.gps === "waiting" ? "Waiting" : "Unavailable"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-5 items-start">
        {/* Map View */}
        <Card padded={false} className="overflow-hidden">
          <div className="px-4 pt-4 md:px-5 md:pt-5">
            <SectionTitle icon={MapPin}>Field Location Map</SectionTitle>
          </div>
          <div style={{ height: 400 }}>
            <MapContainer center={center} zoom={hasCoords ? 14 : 7} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {hasCoords && (
                <CircleMarker
                  center={center}
                  radius={12}
                  pathOptions={{
                    color: riskColor(level, isDark),
                    fillColor: riskColor(level, isDark),
                    fillOpacity: 0.85,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-xs md:text-sm">
                      <div className="font-bold mb-1">{crop} Monitoring Point</div>
                      <div>Disease Risk: {level}</div>
                      <div>{center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E</div>
                    </div>
                  </Popup>
                </CircleMarker>
              )}
            </MapContainer>
          </div>

          <div className="flex gap-4 px-5 py-4 text-xs text-textSecondary border-t border-borderC">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Low Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Medium Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-error" /> High Risk</span>
          </div>
        </Card>

        {/* Location Details */}
        <Card>
          <SectionTitle icon={Info}>Location Details</SectionTitle>
          <div className="text-base md:text-lg font-bold text-textPrimary mb-2">
            {crop} Monitoring Point
          </div>
          <RiskChip level={level} size="sm" />

          <div className="flex flex-col mt-4">
            <Row label="Latitude" value={sensor?.latitude != null ? `${sensor.latitude.toFixed(4)}°N` : STATE_COPY.gpsUnavailable} />
            <Row label="Longitude" value={sensor?.longitude != null ? `${sensor.longitude.toFixed(4)}°E` : STATE_COPY.gpsUnavailable} />
            <Row label="Active Crop" value={crop} />
            <Row label="Disease Risk" value={level} />
            <Row label="Device ID" value={sensor?.device_id ?? "ESP32_01"} />
          </div>

          <div className="mt-4 p-3 bg-bg rounded-lg text-xs text-textSecondary flex gap-2 border border-borderC">
            <Info size={16} className="text-secondary flex-shrink-0 mt-0.5" />
            The marker reflects the real GPS fix reported by the field device. If no GPS fix has been acquired, no marker is placed.
          </div>
        </Card>
      </div>
    </div>
  );
}
