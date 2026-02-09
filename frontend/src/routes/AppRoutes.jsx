import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/login/Login.jsx";
import Signup from "../pages/signup/Signup.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import VendorsPage from "../pages/vendors/index.jsx";
import ProtectedRoute from "../components/layout/ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendors"
        element={
          <ProtectedRoute role="admin">
            <VendorsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
