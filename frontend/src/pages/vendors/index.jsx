import AppLayout from "../../components/layout/AppLayout.jsx";
import VendorForm from "./VendorForm.jsx";
import VendorList from "./VendorList.jsx";

export default function VendorsPage() {
  return (
    <AppLayout>
      <h2>Vendors</h2>
      <VendorForm />
      <VendorList />
    </AppLayout>
  );
}
