import { Navigate, Outlet } from "react-router-dom";

const ProtectRoutes = () => {
  // Change this logic to match how you store auth state
  const token = localStorage.getItem('authToken') // e.g. JWT or any auth flag
  const isAuthenticated = !!token

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If authenticated, render nested routes
  return <Outlet />
}

export default ProtectRoutes