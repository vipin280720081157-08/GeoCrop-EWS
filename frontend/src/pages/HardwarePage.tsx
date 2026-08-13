import React, { useState } from "react";
import {
  Cpu, Radio, RotateCw, Info, ArrowRight, HelpCircle
} from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Hardware3DScene, { HARDWARE_COMPONENTS, type ComponentInfo } from "@/components/Hardware3DScene";
import { useTheme } from "@/context/ThemeContext";

export default function HardwarePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedId, setSelectedId] = useState<string | null>("esp32");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const activeComponent: ComponentInfo = selectedId
    ? HARDWARE_COMPONENTS[selectedId] || HARDWARE_COMPONENTS.esp32
    : HARDWARE_COMPONENTS.esp32;

  const connectedCount = Object.values(HARDWARE_COMPONENTS).filter((c) => c.status === "CONNECTED").length;
  const plannedCount = Object.values(HARDWARE_COMPONENTS).filter((c) => c.status === "NOT CONNECTED").length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* 1. Header Banner & Status Summary */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary font-medium">
              GeoCrop Physical &amp; Circuit Architecture
            </div>
            <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary flex items-center gap-2">
              <Cpu size={24} className="text-primary flex-shrink-0" />
              <span>3D Hardware Setup</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              ● {connectedCount} Connected
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-slate-900 text-amber-300 border border-amber-500/50 flex items-center gap-1.5">
              ○ {plannedCount} Planned
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-textSecondary dark:text-darkTextSecondary m-0">
          Explore the GeoCrop sensing system and see how each physical component connects to the ESP32 controller node for early-warning intelligence.
        </p>
      </Card>

      {/* 2. Interactive 3D Viewport & Selection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr,1fr] gap-5 items-start">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold uppercase tracking-wider text-textSecondary dark:text-darkTextSecondary flex items-center gap-1.5">
              <Radio size={14} className="text-primary" /> Interactive 3D Circuit Canvas
            </div>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                autoRotate
                  ? "bg-primaryLight text-primary border-primary dark:bg-primary/20"
                  : "bg-bg dark:bg-darkBg text-textSecondary border-borderC dark:border-darkBorderC"
              }`}
            >
              <RotateCw size={13} className={autoRotate ? "animate-spin" : ""} /> Auto-Rotate
            </button>
          </div>

          <Hardware3DScene
            selectedId={selectedId}
            onSelectComponent={(id) => setSelectedId(id)}
            autoRotate={autoRotate}
            isDark={isDark}
          />

          {/* Component Legend */}
          <div className="p-3 rounded-xl bg-card dark:bg-darkCard border border-borderC dark:border-darkBorderC flex flex-wrap gap-4 text-xs text-textSecondary dark:text-darkTextSecondary justify-around">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <strong>Connected Hardware</strong> (Solid Wire)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <strong>Planned Extension</strong> (Dashed Wire)
            </span>
          </div>
        </div>

        {/* Selected Component Inspection Card */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-borderC dark:border-darkBorderC">
              <SectionTitle icon={Info}>Component Inspector</SectionTitle>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  activeComponent.status === "CONNECTED"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-900 text-amber-300 border border-amber-500/50"
                }`}
              >
                {activeComponent.status}
              </span>
            </div>

            <div className="text-xl font-bold text-textPrimary dark:text-darkTextPrimary mb-1">
              {activeComponent.name}
            </div>
            <div className="text-xs text-secondary font-semibold mb-3">
              {activeComponent.description}
            </div>

            <div className="p-3.5 rounded-xl bg-bg dark:bg-darkBg border border-borderC dark:border-darkBorderC flex flex-col gap-2.5 mb-4 text-xs">
              <div>
                <strong className="text-textPrimary dark:text-darkTextPrimary block mb-0.5">Primary Purpose:</strong>
                <p className="m-0 text-textSecondary dark:text-darkTextSecondary leading-relaxed">{activeComponent.purpose}</p>
              </div>

              {activeComponent.details && (
                <div className="pt-2 border-t border-borderC dark:border-darkBorderC">
                  <strong className="text-textPrimary dark:text-darkTextPrimary block mb-0.5">Hardware Specification:</strong>
                  <p className="m-0 text-textSecondary dark:text-darkTextSecondary leading-relaxed">{activeComponent.details}</p>
                </div>
              )}
            </div>

            {activeComponent.id === "gps" && (
              <div className="p-3 rounded-lg bg-amber-950/80 border border-amber-500/50 text-xs text-amber-200 flex gap-2">
                <HelpCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-300" />
                <span><strong>GPS Note:</strong> NEO-6M module hardware is connected, but acquiring satellite fix indoors may be limited.</span>
              </div>
            )}

            {activeComponent.status === "NOT CONNECTED" && (
              <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/50 text-xs text-amber-300 flex gap-2">
                <HelpCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-300" />
                <span><strong>Future Hardware:</strong> Planned hardware extension. GeoCrop currently uses meteorological API / crop reference values.</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-borderC dark:border-darkBorderC text-xs text-textSecondary">
            Click any 3D component label or object above to inspect.
          </div>
        </Card>
      </div>

      {/* 3. Component Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.values(HARDWARE_COMPONENTS).map((comp) => {
          const isSelected = comp.id === activeComponent.id;
          const isConnected = comp.status === "CONNECTED";
          return (
            <div
              key={comp.id}
              onClick={() => setSelectedId(comp.id)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-primaryLight/30 dark:bg-primary/20 border-primary shadow-sm"
                  : "bg-card dark:bg-darkCard border-borderC dark:border-darkBorderC hover:border-primary/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-textPrimary dark:text-darkTextPrimary">{comp.name}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isConnected
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-900 text-amber-300 border border-amber-500/50"
                    }`}
                  >
                    {comp.status}
                  </span>
                </div>
                <div className="text-xs text-textSecondary dark:text-darkTextSecondary leading-relaxed mb-3">
                  {comp.description}
                </div>
              </div>

              <div className="text-xs font-semibold text-primary flex items-center gap-1 pt-2 border-t border-borderC dark:border-darkBorderC">
                <span>{isSelected ? "● Currently Inspecting" : "Inspect Component"}</span>
                <ArrowRight size={13} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. End-to-End System Flow Diagram */}
      <Card>
        <SectionTitle icon={Radio}>End-to-End Sensing &amp; Early Warning System Flow</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC text-center">
            <div className="w-8 h-8 rounded-full bg-primaryLight text-primary mx-auto flex items-center justify-center font-bold text-xs mb-2">1</div>
            <div className="text-xs font-bold text-textPrimary mb-0.5">Sensors</div>
            <div className="text-[11px] text-textSecondary">DHT22, Soil Sensor, NEO-6M GPS</div>
          </div>

          <div className="p-3 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC text-center">
            <div className="w-8 h-8 rounded-full bg-secondaryLight text-secondary mx-auto flex items-center justify-center font-bold text-xs mb-2">2</div>
            <div className="text-xs font-bold text-textPrimary mb-0.5">ESP32 Node</div>
            <div className="text-[11px] text-textSecondary">Micro-controller &amp; Wi-Fi Transmission</div>
          </div>

          <div className="p-3 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC text-center">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 mx-auto flex items-center justify-center font-bold text-xs mb-2">3</div>
            <div className="text-xs font-bold text-textPrimary mb-0.5">GeoCrop Backend</div>
            <div className="text-[11px] text-textSecondary">FastAPI Gateway &amp; Open-Meteo API</div>
          </div>

          <div className="p-3 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC text-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-bold text-xs mb-2">4</div>
            <div className="text-xs font-bold text-textPrimary mb-0.5">Risk Engine</div>
            <div className="text-[11px] text-textSecondary">LightGBM &amp; XGBoost Prediction</div>
          </div>

          <div className="p-3 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC text-center">
            <div className="w-8 h-8 rounded-full bg-successLight text-success mx-auto flex items-center justify-center font-bold text-xs mb-2">5</div>
            <div className="text-xs font-bold text-textPrimary mb-0.5">Farmer Dashboard</div>
            <div className="text-[11px] text-textSecondary">Advisories, Risk &amp; Action Plan</div>
          </div>
        </div>

        <div className="mt-4 text-[11px] text-textSecondary dark:text-darkTextSecondary italic text-center">
          * Future components are shown for planned system expansion and are not currently connected.
        </div>
      </Card>
    </div>
  );
}
