"use client";

import React from "react";
import { useShelterStore } from "../store/useShelterStore";

export function ShelterForm() {
  const { config, updateConfig, triggerSimulation, isLoading } = useShelterStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateConfig({ [name]: parseFloat(value) || 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSimulation();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-900 text-white rounded-xl space-y-6 max-w-xl border border-slate-800 shadow-lg">
      <h2 className="text-xl font-bold border-b border-slate-800 pb-2">Shelter Parameters</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Length (m)</label>
          <input
            type="number"
            name="length"
            step="0.1"
            value={config.length}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Width (m)</label>
          <input
            type="number"
            name="width"
            step="0.1"
            value={config.width}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Height (m)</label>
          <input
            type="number"
            name="height"
            step="0.1"
            value={config.height}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Orientation (° from S)</label>
          <input
            type="number"
            name="orientation"
            step="5"
            value={config.orientation}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Wall Insulation (m)</label>
          <input
            type="number"
            name="wall_insulation_thickness"
            step="0.01"
            value={config.wall_insulation_thickness}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Window Area (m²)</label>
          <input
            type="number"
            name="window_area"
            step="0.5"
            value={config.window_area}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-500 font-semibold py-2.5 rounded transition duration-200 disabled:opacity-50"
      >
        {isLoading ? "Running Simulation..." : "Run Thermal Simulation"}
      </button>
    </form>
  );
}