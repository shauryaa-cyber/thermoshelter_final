"use client";

import React from "react";
import { useShelterStore } from "../../store/useShelterStore";

export function ThermalOptimizer() {
  const { config, apertures, result } = useShelterStore();

  if (!result) return null;

  const recommendations: { status: "good" | "warning" | "critical"; message: string }[] = [];

  // 1. Insulation Check
  const insulation = config.wall_insulation_thickness ?? 0.15;
  if (insulation < 0.10) {
    recommendations.push({
      status: "critical",
      message: "Wall insulation is below 0.10m. Increase insulation to reduce severe conductive night heat loss.",
    });
  } else if (insulation < 0.20) {
    recommendations.push({
      status: "warning",
      message: "Wall insulation is moderate (0.10m–0.20m). Increasing to 0.25m significantly improves thermal inertia.",
    });
  } else {
    recommendations.push({
      status: "good",
      message: "Wall insulation thickness meets cold-desert passive thermal standards.",
    });
  }

  // 2. Orientation Check
  const orientation = Math.abs(config.orientation ?? 0);
  if (orientation > 30) {
    recommendations.push({
      status: "critical",
      message: `Building is rotated ${config.orientation}° from South. Align within ±15° of True South to maximize winter solar gain.`,
    });
  } else if (orientation > 15) {
    recommendations.push({
      status: "warning",
      message: "Orientation is slightly off True South. Fine-tune towards 0° S for maximum daytime heating.",
    });
  } else {
    recommendations.push({
      status: "good",
      message: "Optimal orientation! Directly faces South to capture maximum diurnal solar radiation.",
    });
  }

  // 3. South Glazing Check
  const southWindows = apertures?.south?.windowCount ?? 0;
  const northWindows = apertures?.north?.windowCount ?? 0;

  if (southWindows === 0) {
    recommendations.push({
      status: "critical",
      message: "No windows on the South wall. South glazing is essential for passive solar space heating in Leh.",
    });
  }
  if (northWindows > 0) {
    recommendations.push({
      status: "warning",
      message: "North-facing windows lose significantly more heat than they gain. Consider moving them to the South facade.",
    });
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mt-6 space-y-3">
      <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
        Passive Design Recommendations
      </h3>

      <div className="space-y-2 text-xs">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              rec.status === "good"
                ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-300"
                : rec.status === "warning"
                ? "bg-amber-950/30 border-amber-800/50 text-amber-300"
                : "bg-red-950/30 border-red-800/50 text-red-300"
            }`}
          >
            <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded border border-current">
              {rec.status}
            </span>
            <p className="flex-1 leading-relaxed">{rec.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}