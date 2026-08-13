import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { MapPin, Info, Navigation } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import RiskChip from "@/components/RiskChip";
import Row from "@/components/Row";
import { useGeoCrop } from "@/context/AppContext";
import { COLORS, riskColor } from "@/utils/colors";

const PERUNDURAI_CENTER: [number, number] = [11.2742, 77.5828]; // Perundurai, Erode District, Tamil Nadu

export default function GISMap() {
  const { selectedCrop, selectedStage, sensor, prediction } = useGeoCrop();

  const hasCoords = !!(sensor?.latitude && sensor?.longitude);
  const center: [number, number] = hasCoords ? [sensor!.latitude!, sensor!.longitude!] : PERUNDURAI_CENTER;
  const level = prediction?.risk_level ?? "LOW";

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Monitored Crop Banner */}
      <Card>
        <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary mb-1 font-medium">
          GIS Field Mapping Active Target
        </div>
        <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary capitalize">
          {selectedCrop} — {selectedStage.replace(/_/g, " ")}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-5 items-start">
        <Card padded={false} className="overflow-hidden">
          <div className="px-5 pt-4">
            <SectionTitle icon={MapPin}>Field Location Map (Perundurai / Erode Region)</SectionTitle>
          </div>
          <div style={{ height: 420 }}>
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <CircleMarker center={center} radius={12} pathOptions={{ color: riskColor(level), fillColor: riskColor(level), fillOpacity: 0.85, weight: 2 }}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold mb-1">Perundurai Field Station</div>
                    <div>Division: Perundurai Division</div>
                    <div>Monitored Crop: {selectedCrop} ({selectedStage.replace(/_/g, " ")})</div>
                    <div>Disease Risk: {level}</div>
                    <div>{center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E</div>
                  </div>
                </Popup>
              </CircleMarker>
            </MapContainer>
          </div>
          <div className="flex gap-4 px-5 py-4 text-[12.5px] text-textSecondary dark:text-darkTextSecondary border-t border-borderC dark:border-darkBorderC">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.success }} /> Low Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.warning }} /> Medium Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.error }} /> High Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.error }} /> Critical Risk</span>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Info}>Location Details</SectionTitle>
          <div className="text-base sm:text-lg font-bold text-textPrimary dark:text-darkTextPrimary mb-1">
            Perundurai Field Station — Primary Station
          </div>
          <div className="mb-3">
            <RiskChip level={level} size="sm" />
          </div>
          <div className="flex flex-col">
            <Row label="Division" value="Perundurai Division" />
            <Row label="Latitude" value={`${center[0].toFixed(4)}°N`} />
            <Row label="Longitude" value={`${center[1].toFixed(4)}°E`} />
            <Row label="Monitored Crop" value={<span className="capitalize">{selectedCrop}</span>} />
            <Row label="Growth Stage" value={<span className="capitalize">{selectedStage.replace(/_/g, " ")}</span>} />
            <Row label="Disease Risk Level" value={level} />
            <Row label="Hardware Device ID" value={sensor?.device_id ?? "ESP32_01"} />
          </div>
          <div className="mt-4 p-3 bg-bg dark:bg-darkBg rounded-lg text-xs sm:text-[13px] text-textSecondary dark:text-darkTextSecondary flex gap-2 border border-borderC dark:border-darkBorderC">
            <Navigation size={16} color={COLORS.secondary} className="flex-shrink-0 mt-0.5" />
            <span>
              Station coordinates fixed to Perundurai, Erode District, TN. Regional boundaries belong to the 5 locked Erode divisions.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
