import { create } from "zustand";

export const useUiStore = create((set) => ({
  loading: false,
  setLoading: (val) => set({ loading: val }),
}));
