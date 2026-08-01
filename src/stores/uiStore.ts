import { create } from "zustand";

interface UIStore {
  tensorInspectorOpen: boolean;
  equationPanelOpen: boolean;
  toggleTensorInspector: () => void;
  toggleEquationPanel: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  tensorInspectorOpen: true,
  equationPanelOpen: true,
  toggleTensorInspector: () =>
    set((state) => ({ tensorInspectorOpen: !state.tensorInspectorOpen })),
  toggleEquationPanel: () =>
    set((state) => ({ equationPanelOpen: !state.equationPanelOpen })),
}));
