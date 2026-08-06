import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { MapPin, Info, Navigation } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import RiskChip from "@/components/RiskChip";
import Row from "@/components/Row";
import { useSensorData } from "@/hooks/useSensorData";
import { usePrediction } from "@/hooks/usePrediction";
import { COLORS, riskColor } from "@/utils/colors";

const DEFAULT_CENTER: [number, number] = [10.7867, 79.1378]; // Thanjavur, Tamil Nadu

export default function GISMap() {
  const { latest: sensor } = useSensorData();
  const { prediction } = usePrediction();

  const hasCoords = !!(sensor?.latitude && sensor?.longitude);
  const center: [number, number] = hasCoords ? [sensor!.latitude!, sensor!.longitude!] : DEFAULT_CENTER;
  const level = prediction?.risk_level ?? "Low";

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-5 items-start">
        <Card padded={false} className="overflow-hidden">
          <div className="px-5 pt-4"><SectionTitle icon={MapPin}>Field Location Map</SectionTitle></div>
          <div style={{ height: 420 }}>
            <MapContainer center={center} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <CircleMarker center={center} radius={12} pathOptions={{ color: riskColor(level), fillColor: riskColor(level), fillOpacity: 0.85, weight: 2 }}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold mb-1">Thanjavur Field Station</div>
                    <div>Crop: {sensor?.crop ?? "-"}</div>
                    <div>Disease Risk: {level}</div>
                    <div>{center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E</div>
                  </div>
                </Popup>
              </CircleMarker>
            </MapContainer>
          </div>
          <div className="flex gap-4 px-5 py-4 text-[12.5px] text-textSecondary">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.success }} /> Low Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.warning }} /> Medium Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.error }} /> High Risk</span>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Info}>Location Details</SectionTitle>
          <div className="text-[17px] font-bold text-textPrimary mb-1">Thanjavur Field Station — Primary Field</div>
          <RiskChip level={level} size="sm" />
          <div className="flex flex-col mt-4">
            <Row label="Latitude" value={`${center[0].toFixed(4)}°N`} />
            <Row label="Longitude" value={`${center[1].toFixed(4)}°E`} />
            <Row label="Crop" value={sensor?.crop ?? "-"} />
            <Row label="Disease Risk" value={level} />
            <Row label="Device ID" value={sensor?.device_id ?? "-"} />
          </div>
          <div className="mt-4 p-3 bg-bg rounded-lg text-[13px] text-textSecondary flex gap-2">
            <Navigation size={16} color={COLORS.secondary} className="flex-shrink-0" />
            The marker reflects the GPS coordinates most recently reported by the ESP32 field device. Additional monitoring points will appear automatically as more devices are deployed.
          </div>
        </Card>
      </div>
    </div>
  );
}
