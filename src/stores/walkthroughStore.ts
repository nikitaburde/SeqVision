import { create } from "zustand";

interface WalkthroughStore {
  chapterId: string | null;
  setChapterId: (chapterId: string) => void;
}

export const useWalkthroughStore = create<WalkthroughStore>((set) => ({
  chapterId: null,
  setChapterId: (chapterId) => set({ chapterId }),
}));
