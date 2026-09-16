import { create } from 'zustand';

export interface SideApertureConfig {
  hasDoor: boolean;
  windowCount: number; // Max 2
}

export interface DesignState {
  lengthM: number;
  widthM: number;
  heightM: number;
  windowWidthM: number;
  windowHeightM: number;
  apertures: {
    south: SideApertureConfig;
    north: SideApertureConfig;
    east: SideApertureConfig;
    west: SideApertureConfig;
  };
}

interface DesignStore {
  design: DesignState;
  updateDesign: (params: Partial<DesignState>) => void;
  updateSideAperture: (
    side: 'south' | 'north' | 'east' | 'west',
    config: Partial<SideApertureConfig>
  ) => void;
}

export const useDesignStore = create<DesignStore>((set) => ({
  design: {
    lengthM: 6,
    widthM: 4,
    heightM: 2.8,
    windowWidthM: 1.2,
    windowHeightM: 1.4,
    apertures: {
      south: { hasDoor: true, windowCount: 2 },
      north: { hasDoor: false, windowCount: 0 },
      east: { hasDoor: false, windowCount: 1 },
      west: { hasDoor: false, windowCount: 1 },
    },
  },
  updateDesign: (params) =>
    set((state) => ({
      design: { ...state.design, ...params },
    })),
  updateSideAperture: (side, config) =>
    set((state) => ({
      design: {
        ...state.design,
        apertures: {
          ...state.design.apertures,
          [side]: {
            ...state.design.apertures[side],
            ...config,
            windowCount: Math.min(2, Math.max(0, config.windowCount ?? state.design.apertures[side].windowCount)),
          },
        },
      },
    })),
}));