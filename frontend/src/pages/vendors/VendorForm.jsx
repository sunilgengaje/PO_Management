import { useState } from "react";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { useVendor } from "../../hooks/useVendor.js";

export default function VendorForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { addVendor, loading } = useVendor();

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vendor name required");
      return;
    }
    addVendor({ name });
    setName("");
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <Input
        label="Vendor Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error}
        autoFocus
      />
      <Button type="submit" loading={loading} disabled={loading}>
        Add Vendor
      </Button>
    </form>
  );
}
