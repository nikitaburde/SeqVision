import { create } from "zustand";

import { DEFAULT_CONTROLS } from "@/constants/config";
import type { SimulationControls } from "@/types";

interface SimulationStore {
  controls: SimulationControls;
  playhead: number;
  isPlaying: boolean;
  setControls: (controls: Partial<SimulationControls>) => void;
  setPlayhead: (playhead: number) => void;
  setPlaying: (isPlaying: boolean) => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  controls: DEFAULT_CONTROLS,
  playhead: 0,
  isPlaying: false,
  setControls: (controls) =>
    set((state) => ({ controls: { ...state.controls, ...controls } })),
  setPlayhead: (playhead) => set({ playhead }),
  setPlaying: (isPlaying) => set({ isPlaying }),
}));
