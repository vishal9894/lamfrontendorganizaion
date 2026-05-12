import { Navigate, Outlet } from "react-router-dom";

import { useProfile } from "../context/ProfileContext";

const ProtectRoutes = () => {
  const { loading, isAuthenticated } =
    useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectRoutes;