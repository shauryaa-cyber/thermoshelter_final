import { create } from "zustand";
import { ShelterConfig, SimulationResult, runSimulation } from "../lib/api";

export interface SideAperture {
  hasDoor: boolean;
  windowCount: number;
}

interface ShelterState {
  config: ShelterConfig;
  apertures: Record<"south" | "north" | "east" | "west", SideAperture>;
  result: SimulationResult | null;
  isLoading: boolean;
  error: string | null;
  updateConfig: (partialConfig: Partial<ShelterConfig>) => void;
  updateSideAperture: (
    side: "south" | "north" | "east" | "west",
    aperture: Partial<SideAperture>
  ) => void;
  triggerSimulation: () => Promise<void>;
}

export const useShelterStore = create<ShelterState>((set, get) => ({
  config: {
    length: 6.0,
    width: 4.0,
    height: 2.8,
    orientation: 0,
    wall_insulation_thickness: 0.15,
    window_area: 4.0,
    target_temp_min: 18,
    target_temp_max: 26,
  },
  apertures: {
    south: { hasDoor: false, windowCount: 1 },
    north: { hasDoor: true, windowCount: 0 },
    east: { hasDoor: false, windowCount: 0 },
    west: { hasDoor: false, windowCount: 0 },
  },
  result: null,
  isLoading: false,
  error: null,

  updateConfig: (partialConfig) =>
    set((state) => ({
      config: { ...state.config, ...partialConfig },
    })),

  updateSideAperture: (side, aperture) =>
    set((state) => {
      const updatedAperture = { ...state.apertures[side], ...aperture };

      // Enforce the 2-window maximum cap at state level
      if (updatedAperture.windowCount !== undefined) {
        updatedAperture.windowCount = Math.min(
          2,
          Math.max(0, updatedAperture.windowCount)
        );
      }

      return {
        apertures: {
          ...state.apertures,
          [side]: updatedAperture,
        },
      };
    }),

  triggerSimulation: async () => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const payload: ShelterConfig = {
        ...state.config,
        apertures: state.apertures,
      };
      const data = await runSimulation(payload);
      set({ result: data, isLoading: false });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to run simulation";
      set({ error: errorMessage, isLoading: false });
    }
  },
}));