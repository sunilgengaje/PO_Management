import { create } from "zustand";
import { fetchVendors, createVendor, updateVendor } from "../api/vendorApi.js";

export const useVendorStore = create((set) => ({
  vendors: [],
  loading: false,
  error: "",
  loadVendors: async () => {
    set({ loading: true, error: "" });
    try {
      const data = await fetchVendors();
      set({ vendors: data.items || [], loading: false });
    } catch (error) {
      set({ loading: false, error: error?.response?.data?.message || "Failed to load vendors" });
    }
  },
  addVendor: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const data = await createVendor(payload);
      set((state) => ({ vendors: [data, ...state.vendors], loading: false }));
    } catch (error) {
      set({ loading: false, error: error?.response?.data?.message || "Failed to add vendor" });
    }
  },
  editVendor: async (id, payload) => {
    set({ loading: true, error: "" });
    try {
      const data = await updateVendor(id, payload);
      set((state) => ({
        vendors: state.vendors.map((vendor) => (vendor.id === id ? data : vendor)),
        loading: false
      }));
    } catch (error) {
      set({ loading: false, error: error?.response?.data?.message || "Failed to update vendor" });
    }
  }
}));
