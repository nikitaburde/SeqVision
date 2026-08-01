import { create } from "zustand";

import type { ModelId } from "@/types";

interface ModelStore {
  selectedModel: ModelId;
  setSelectedModel: (model: ModelId) => void;
}

export const useModelStore = create<ModelStore>((set) => ({
  selectedModel: "lstm",
  setSelectedModel: (selectedModel) => set({ selectedModel }),
}));
