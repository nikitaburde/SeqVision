import { create } from "zustand";

import type { CameraMode } from "@/types";

interface CameraStore {
  mode: CameraMode;
  zoom: number;
  setMode: (mode: CameraMode) => void;
  setZoom: (zoom: number) => void;
  resetCamera: () => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  mode: "orbit",
  zoom: 1,
  setMode: (mode) => set({ mode }),
  setZoom: (zoom) => set({ zoom }),
  resetCamera: () => set({ mode: "orbit", zoom: 1 }),
}));
