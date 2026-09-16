"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useShelterStore } from "../../store/useShelterStore";

export function ThermalCharts() {
  const { result } = useShelterStore();

  if (!result) return null;

  const { hourly_temperatures, heat_loss_breakout } = result;

  // Format heat loss breakout for BarChart
  const heatLossData = [
    { name: "Walls", value: heat_loss_breakout.walls },
    { name: "Roof", value: heat_loss_breakout.roof },
    { name: "Floor", value: heat_loss_breakout.floor },
    { name: "Windows", value: heat_loss_breakout.windows },
    ...(heat_loss_breakout.doors !== undefined
      ? [{ name: "Doors", value: heat_loss_breakout.doors }]
      : []),
    { name: "Ventilation", value: heat_loss_breakout.ventilation },
  ];

  const BAR_COLORS = ["#38bdf8", "#818cf8", "#a78bfa", "#f43f5e", "#fb923c", "#facc15"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* 24-Hour Temperature Profile Line Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          24-Hour Diurnal Temperature Profile
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Indoor temperature stability vs winter outdoor ambient cold in Leh
        </p>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourly_temperatures} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="hour" stroke="#94a3b8" tickFormatter={(h) => `${h}:00`} />
              <YAxis stroke="#94a3b8" unit="°C" />
              <Tooltip
  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }}
  formatter={(value) => [`${value} °C`, "Temperature"]}
  labelFormatter={(h) => `Time: ${h}:00`}
/>
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="t_outdoor"
                name="Outdoor Temp"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="t_indoor"
                name="Indoor Temp"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heat Loss Breakdown Bar Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          Peak Thermal Heat Loss Channels
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Distribution of conductive and infiltration losses (Watts)
        </p>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatLossData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" unit=" W" />
             <Tooltip
  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }}
  formatter={(value) => [`${value} W`, "Heat Loss"]}
/>
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {heatLossData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}