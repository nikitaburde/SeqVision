import { create } from "zustand";

interface AppStore {
  researchMode: boolean;
  setResearchMode: (researchMode: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  researchMode: false,
  setResearchMode: (researchMode) => set({ researchMode }),
}));
