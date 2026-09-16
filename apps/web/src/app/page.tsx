"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useShelterStore } from "../../store/useShelterStore";
import { ThermalDashboard } from "@/components/ThermalDashboard";

const ShelterScene = dynamic(
  () => import("@/components/three/ShelterScene"),
  { ssr: false }
);

export default function Home() {
  const {
    config,
    apertures,
    updateConfig,
    updateSideAperture,
    triggerSimulation,
    isLoading,
    error,
  } = useShelterStore();

  const sides: Array<{ key: "south" | "north" | "east" | "west"; label: string }> = [
  { key: "south", label: "Back" },
  { key: "north", label: "Front" },
  { key: "east", label: "Left" },
  { key: "west", label: "Right" },
];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    updateConfig({
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSimulationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSimulation();
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <p className="text-sm font-medium tracking-[0.2em] text-cyan-400">
            THERMOSHELTER
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Passive Shelter Thermal Design
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400 border border-red-500/20">
              {error}
            </span>
          )}
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
            Design state connected
          </span>
        </div>
      </header>

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-3">
        {/* Controls Panel */}
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-5">
          <form onSubmit={handleSimulationSubmit} className="space-y-5">
            <h2 className="font-medium text-lg border-b border-slate-800 pb-2">
              Structure Dimensions
            </h2>

            <div className="grid grid-cols-3 gap-2">
              <label className="block text-xs text-slate-400">
                Length (m)
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-slate-100"
                  type="number"
                  name="length"
                  step="0.5"
                  value={config.length}
                  onChange={handleInputChange}
                />
              </label>

              <label className="block text-xs text-slate-400">
                Width (m)
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-slate-100"
                  type="number"
                  name="width"
                  step="0.5"
                  value={config.width}
                  onChange={handleInputChange}
                />
              </label>

              <label className="block text-xs text-slate-400">
                Height (m)
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-slate-100"
                  type="number"
                  name="height"
                  step="0.1"
                  value={config.height}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <h2 className="font-medium text-lg border-b border-slate-800 pb-2 pt-2">
              Materials & Passive Strategy
            </h2>

            <div className="space-y-3">
              <label className="block text-xs text-slate-400">
                Wall Insulation Thickness ({config.wall_insulation_thickness ?? 0.15} m)
                <input
                  className="mt-1 w-full accent-cyan-400 cursor-pointer"
                  type="range"
                  name="wall_insulation_thickness"
                  min="0.02"
                  max="0.40"
                  step="0.01"
                  value={config.wall_insulation_thickness ?? 0.15}
                  onChange={handleInputChange}
                />
              </label>

              <label className="block text-xs text-slate-400">
                Building Orientation ({config.orientation ?? 0}° relative to True South)
                <input
                  className="mt-1 w-full accent-cyan-400 cursor-pointer"
                  type="range"
                  name="orientation"
                  min="-90"
                  max="90"
                  step="5"
                  value={config.orientation ?? 0}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            {/* Per-Wall Apertures Section */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h3 className="text-sm font-medium text-cyan-400">
                Per-Wall Apertures
              </h3>

              {sides.map(({ key, label }) => {
                const sideAperture = apertures?.[key] ?? {
                  hasDoor: false,
                  windowCount: 0,
                };

                return (
                  <div
                    key={key}
                    className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 space-y-2"
                  >
                    <span className="text-xs font-semibold text-slate-300 block">
                      {label}
                    </span>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sideAperture.hasDoor}
                          onChange={(e) =>
                            updateSideAperture(key, {
                              hasDoor: e.target.checked,
                            })
                          }
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                        />
                        Include Door
                      </label>

                      <label className="flex items-center gap-2">
                        Windows:
                        <input
                          type="number"
                          min="0"
                          max="2"
                          value={sideAperture.windowCount}
                          onChange={(e) =>
                            updateSideAperture(key, {
                              windowCount: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-14 rounded border border-slate-700 bg-slate-900 p-1 text-center text-slate-100"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 font-semibold py-2.5 rounded transition duration-200 disabled:opacity-50"
            >
              {isLoading ? "Running Simulation..." : "Run Thermal Simulation"}
            </button>
          </form>
        </article>

        {/* 3D Viewport & KPI Dashboard */}
        <article className="md:col-span-2 flex flex-col space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-medium text-lg border-b border-slate-800 pb-2">
              3D Shelter View
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Dimensions: {config.length}m × {config.width}m × {config.height}m |
              Orientation: {config.orientation ?? 0}° S
            </p>
            <div className="mt-4 h-96 w-full overflow-hidden rounded-lg border border-slate-800">
              <ShelterScene />
            </div>
          </div>

          {/* Full Thermal Dashboard with KPI Cards */}
          <ThermalDashboard />
        </article>
      </section>
    </main>
  );
}