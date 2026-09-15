import { create } from "zustand";

export type ShelterDesign = {
  lengthM: number;
  widthM: number;
  heightM: number;
  wallInsulationMm: number;
  roofInsulationMm: number;
  orientationDeg: number;
};

const initialDesign: ShelterDesign = {
  lengthM: 6,
  widthM: 4,
  heightM: 2.5,
  wallInsulationMm: 100,
  roofInsulationMm: 150,
  orientationDeg: 180,
};

type DesignStore = {
  design: ShelterDesign;
  updateDesign: (changes: Partial<ShelterDesign>) => void;
  resetDesign: () => void;
};

export const useDesignStore = create<DesignStore>((set) => ({
  design: initialDesign,
  updateDesign: (changes) =>
    set((state) => ({ design: { ...state.design, ...changes } })),
  resetDesign: () => set({ design: initialDesign }),
}));