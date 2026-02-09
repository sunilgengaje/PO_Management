import AppLayout from "../../components/layout/AppLayout.jsx";
import { useAuthStore } from "../../store/authStore.js";

export default function Dashboard() {
  const { user, role } = useAuthStore();

  return (
    <AppLayout>
      <h2 style={{ marginBottom: 8 }}>Welcome, {user || "User"}</h2>
      <p style={{ color: "#475569" }}>Role: {role || "viewer"}</p>
    </AppLayout>
  );
}
