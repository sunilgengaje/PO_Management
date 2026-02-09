import { useVendor } from "../../hooks/useVendor.js";

export default function VendorList() {
  const { vendors, loading, error } = useVendor();

  if (loading) return <div>Loading vendors...</div>;
  if (error) return <div style={{ color: "#ef4444" }}>{error}</div>;

  return (
    <ul style={{ maxWidth: 400, marginTop: 24 }}>
      {vendors.map((vendor) => (
        <li key={vendor.id} style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
          {vendor.name}
        </li>
      ))}
    </ul>
  );
}
