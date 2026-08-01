import { create } from "zustand";

interface AnimationStore {
  speed: number;
  setSpeed: (speed: number) => void;
}

export const useAnimationStore = create<AnimationStore>((set) => ({
  speed: 1,
  setSpeed: (speed) => set({ speed }),
}));
