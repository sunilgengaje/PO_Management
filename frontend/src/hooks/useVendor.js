import { useEffect } from "react";
import { useVendorStore } from "../store/vendorStore.js";

export function useVendor() {
  const { vendors, loading, error, loadVendors, addVendor, editVendor } = useVendorStore();

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  return { vendors, loading, error, addVendor, editVendor };
}
