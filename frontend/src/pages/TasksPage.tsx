import React, { useState } from "react";
import { ClipboardList, CheckSquare, Square, Filter } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";

interface TaskItem {
  id: string;
  text: string;
  category: "Monitoring" | "Irrigation" | "Crop Inspection" | "General";
  completed: boolean;
  priority: "High" | "Medium" | "Low";
}

export default function TasksPage() {
  const [filter, setFilter] = useState<string>("All");
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: "t1", text: "Inspect leaf canopy for early lesion symptoms", category: "Crop Inspection", completed: false, priority: "High" },
    { id: "t2", text: "Confirm field drainage channel status before next rain cycle", category: "Irrigation", completed: false, priority: "High" },
    { id: "t3", text: "Monitor relative humidity and canopy wetness twice daily", category: "Monitoring", completed: true, priority: "Medium" },
    { id: "t4", text: "Verify ESP32 telemetry hardware connection status", category: "General", completed: true, priority: "Low" },
    { id: "t5", text: "Reassess soil moisture baseline when sensor recalibrates", category: "Monitoring", completed: false, priority: "Medium" },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const filteredTasks = tasks.filter(
    (t) => filter === "All" || t.category === filter
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <div>
            <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary font-medium">
              Field Action Checklist
            </div>
            <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
              Field Tasks &amp; Actions
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={15} className="text-textSecondary" />
            {["All", "Monitoring", "Irrigation", "Crop Inspection", "General"].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                  filter === c
                    ? "bg-primaryLight text-primary border-primary"
                    : "bg-bg border-borderC text-textSecondary hover:text-textPrimary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={ClipboardList}>Today's Action Tasks</SectionTitle>
        <div className="flex flex-col gap-2.5">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition cursor-pointer select-none ${
                t.completed
                  ? "bg-successLight/40 border-success/30 text-textSecondary line-through"
                  : "bg-bg dark:bg-darkBg border-borderC dark:border-darkBorderC text-textPrimary hover:border-primary"
              }`}
            >
              {t.completed ? (
                <CheckSquare size={20} className="text-success flex-shrink-0" />
              ) : (
                <Square size={20} className="text-textSecondary flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="text-xs sm:text-sm font-semibold">{t.text}</div>
                <div className="text-[11px] text-textSecondary mt-0.5">
                  Category: {t.category} · Priority: {t.priority}
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-xs text-textSecondary p-6 text-center">
              No tasks found in this category.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
