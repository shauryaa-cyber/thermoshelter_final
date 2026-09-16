"use client";

import dynamic from "next/dynamic";
import { useDesignStore } from "@/store/designStore";

const ShelterScene = dynamic(
  () => import("@/components/three/ShelterScene"),
  { ssr: false }
);

export default function Home() {
  const { design, updateDesign, updateSideAperture } = useDesignStore();

  const sides: Array<{ key: 'south' | 'north' | 'east' | 'west'; label: string }> = [
    { key: 'south', label: 'South (Primary Solar Gain)' },
    { key: 'north', label: 'North' },
    { key: 'east', label: 'East' },
    { key: 'west', label: 'West' },
  ];

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
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
          Design state connected
        </span>
      </header>

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-3">
        {/* Design Inputs Panel */}
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-5">
          <h2 className="font-medium text-lg border-b border-slate-800 pb-2">
            Structure Dimensions
          </h2>

          <div className="grid grid-cols-3 gap-2">
            <label className="block text-xs text-slate-400">
              Length (m)
              <input
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-slate-100"
                type="number"
                step="0.5"
                value={design.lengthM ?? 6}
                onChange={(e) =>
                  updateDesign({ lengthM: Number(e.target.value) })
                }
              />
            </label>

            <label className="block text-xs text-slate-400">
              Width (m)
              <input
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-slate-100"
                type="number"
                step="0.5"
                value={design.widthM ?? 4}
                onChange={(e) =>
                  updateDesign({ widthM: Number(e.target.value) })
                }
              />
            </label>

            <label className="block text-xs text-slate-400">
              Height (m)
              <input
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-slate-100"
                type="number"
                step="0.1"
                value={design.heightM ?? 2.8}
                onChange={(e) =>
                  updateDesign({ heightM: Number(e.target.value) })
                }
              />
            </label>
          </div>

          {/* Wall Openings Config */}
          <div className="border-t border-slate-800 pt-4 space-y-4">
            <h3 className="text-sm font-medium text-cyan-400">
              Per-Wall Apertures (Max 1 Door, Max 2 Windows)
            </h3>

            {sides.map(({ key, label }) => {
              const config = design.apertures?.[key] ?? { hasDoor: false, windowCount: 0 };
              return (
                <div key={key} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    {label}
                  </span>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.hasDoor}
                        onChange={(e) =>
                          updateSideAperture(key, { hasDoor: e.target.checked })
                        }
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                      />
                      Include Door (1 max)
                    </label>

                    <label className="flex items-center gap-2">
                      Windows:
                      <input
                        type="number"
                        min="0"
                        max="2"
                        value={config.windowCount}
                        onChange={(e) =>
                          updateSideAperture(key, { windowCount: Number(e.target.value) })
                        }
                        className="w-14 rounded border border-slate-700 bg-slate-900 p-1 text-center text-slate-100"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        {/* 3D Viewport Panel */}
        <article className="md:col-span-2 flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-medium text-lg border-b border-slate-800 pb-2">
            3D Shelter View
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Dimensions: {design.lengthM ?? 6}m × {design.widthM ?? 4}m ×{" "}
            {design.heightM ?? 2.8}m
          </p>
          <div className="mt-4 h-[500px] w-full overflow-hidden rounded-lg">
            <ShelterScene />
          </div>
        </article>
      </section>
    </main>
  );
}