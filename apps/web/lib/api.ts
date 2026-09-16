// apps/web/lib/api.ts

export interface SideAperture {
  hasDoor: boolean;
  windowCount: number;
}

export interface ShelterConfig {
  length: number;
  width: number;
  height: number;
  orientation?: number; // degrees from South
  wall_insulation_thickness?: number; // in meters
  window_area?: number; // in m²
  target_temp_min?: number; // e.g., 18
  target_temp_max?: number; // e.g., 26
  apertures?: Record<string, SideAperture>; // Per-wall door and window selections
}

export interface SimulationResult {
  comfort_hours_pct: number;
  total_heating_demand_kwh: number;
  temp_min_c: number;
  temp_max_c: number;
  hourly_temperatures: {
    hour: number;
    t_outdoor: number;
    t_indoor: number;
  }[];
  heat_loss_breakout: {
    walls: number;
    roof: number;
    floor: number;
    windows: number;
    doors?: number;
    ventilation: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function runSimulation(config: ShelterConfig): Promise<SimulationResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`Simulation failed with status: ${response.status}`);
  }

  return response.json();
}