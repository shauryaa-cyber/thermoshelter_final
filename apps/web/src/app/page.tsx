"use client";

import { useDesignStore } from "@/store/designStore";

export default function Home() {
  const { design, updateDesign } = useDesignStore();

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

      <section className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-medium">Design inputs</h2>
          <label className="mt-4 block text-sm text-slate-400">
            Shelter length (m)
            <input
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-slate-100"
              type="number"
              value={design.lengthM}
              onChange={(event) =>
                updateDesign({ lengthM: Number(event.target.value) })
              }
            />
          </label>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-medium">Thermal performance</h2>
          <p className="mt-2 text-sm text-slate-400">
            Physics calculations will appear here in Phase 2.
          </p>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-medium">3D shelter view</h2>
          <p className="mt-2 text-sm text-slate-400">
            Current length: {design.lengthM} m
          </p>
        </article>
      </section>
    </main>
  );
}