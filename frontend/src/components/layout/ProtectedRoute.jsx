import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";

export default function ProtectedRoute({ children, role }) {
  const { accessToken, role: currentRole } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentRole !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
