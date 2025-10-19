import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const userRole = localStorage.getItem("userRole");
  const accessType = localStorage.getItem("accessType");

  // Check if user is authenticated (either as registered user with token or as guest with session)
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const guestSessionId = localStorage.getItem("guestSessionId");
    return !!(token || (accessType === "guest" && guestSessionId));
  };

  // Allow access if user role is in allowed roles and user is authenticated
  if (!allowedRoles.includes(userRole || "") || !isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
