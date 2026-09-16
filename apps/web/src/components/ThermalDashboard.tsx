"use client";

import React from "react";
import { useShelterStore } from "../../store/useShelterStore";
import { ThermalCharts } from "./ThermalCharts";

export function ThermalDashboard() {
  const { result } = useShelterStore();

  if (!result) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-slate-400">
        Run a thermal simulation to view performance metrics and KPI breakdown.
      </div>
    );
  }

  const {
    comfort_hours_pct,
    total_heating_demand_kwh,
    temp_min_c,
    temp_max_c,
    heat_loss_breakout,
  } = result;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs font-medium text-slate-400">
            Thermal Comfort
          </span>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {comfort_hours_pct}%
          </p>
          <span className="text-[10px] text-slate-500">
            Hours within 18°C–26°C target
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs font-medium text-slate-400">
            Annual Heating Load
          </span>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            {total_heating_demand_kwh}{" "}
            <span className="text-sm font-normal">kWh</span>
          </p>
          <span className="text-[10px] text-slate-500">
            Auxiliary heat required
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs font-medium text-slate-400">
            Min Indoor Temp
          </span>
          <p
            className={`mt-2 text-2xl font-bold ${
              temp_min_c < 12 ? "text-red-400" : "text-cyan-400"
            }`}
          >
            {temp_min_c}°C
          </p>
          <span className="text-[10px] text-slate-500">
            Worst-case winter overnight
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs font-medium text-slate-400">
            Max Indoor Temp
          </span>
          <p className="mt-2 text-2xl font-bold text-amber-400">
            {temp_max_c}°C
          </p>
          <span className="text-[10px] text-slate-500">
            Peak daytime solar gain
          </span>
        </div>
      </div>

      {/* Heat Loss Breakdown List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 border-b border-slate-800 pb-2">
          Heat Loss Distribution (Watts)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">Walls:</span>
            <span className="font-semibold text-slate-200">
              {heat_loss_breakout.walls} W
            </span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">Roof:</span>
            <span className="font-semibold text-slate-200">
              {heat_loss_breakout.roof} W
            </span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">Floor:</span>
            <span className="font-semibold text-slate-200">
              {heat_loss_breakout.floor} W
            </span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">Windows:</span>
            <span className="font-semibold text-slate-200">
              {heat_loss_breakout.windows} W
            </span>
          </div>
          {heat_loss_breakout.doors !== undefined && (
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Doors:</span>
              <span className="font-semibold text-slate-200">
                {heat_loss_breakout.doors} W
              </span>
            </div>
          )}
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">Ventilation:</span>
            <span className="font-semibold text-slate-200">
              {heat_loss_breakout.ventilation} W
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <ThermalCharts />
    </div>
  );
}