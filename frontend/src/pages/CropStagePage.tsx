import React from "react";
import { Sprout, Info, CheckCircle2 } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Row from "@/components/Row";
import { useGeoCrop } from "@/context/AppContext";
import { LOCKED_CROPS, CROP_STAGES } from "@/utils/constants";

export default function CropStagePage() {
  const { selectedCrop, selectedStage, setCropAndStage } = useGeoCrop();

  const stagesForCrop = CROP_STAGES[selectedCrop] || [];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div>
            <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary font-medium">
              Crop Profile &amp; Phenological Context
            </div>
            <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary capitalize">
              Crop &amp; Growth Stage Context
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            USER SELECTED
          </span>
        </div>
        <p className="text-xs sm:text-sm text-textSecondary dark:text-darkTextSecondary m-0">
          Changing crop or growth stage synchronizes risk models, reference targets, and advisories globally.
        </p>
      </Card>

      <Card>
        <SectionTitle icon={Sprout}>Crop &amp; Stage Selection</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-textSecondary mb-1.5">
              Select Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setCropAndStage(e.target.value, selectedStage)}
              className="w-full h-11 px-3 rounded-lg border border-borderC dark:border-darkBorderC bg-bg dark:bg-darkBg text-textPrimary dark:text-darkTextPrimary font-semibold text-sm outline-none focus:border-primary transition"
            >
              {LOCKED_CROPS.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-textSecondary mb-1.5">
              Select Growth Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setCropAndStage(selectedCrop, e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-borderC dark:border-darkBorderC bg-bg dark:bg-darkBg text-textPrimary dark:text-darkTextPrimary font-semibold text-sm outline-none focus:border-primary transition"
            >
              {stagesForCrop.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={CheckCircle2}>Active Field Profile</SectionTitle>
          <div className="flex flex-col">
            <Row label="Monitored Crop" value={<span className="capitalize font-bold">{selectedCrop}</span>} />
            <Row label="Active Growth Stage" value={<span className="capitalize font-bold">{selectedStage.replace(/_/g, " ")}</span>} />
            <Row label="Available Crop Stages" value={`${stagesForCrop.length} stages defined`} />
            <Row label="Regional Station" value="Perundurai / Main Erode" />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Info}>Why Growth Stage Matters</SectionTitle>
          <div className="p-4 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC flex gap-3 items-start">
            <Info size={20} className="text-secondary flex-shrink-0 mt-0.5" />
            <p className="m-0 text-xs sm:text-sm text-textSecondary leading-relaxed">
              Crop sensitivity, canopy thickness, and pathogen susceptibility vary across growth stages. GeoCrop incorporates the selected phenological stage to weight risk factors accurately.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
