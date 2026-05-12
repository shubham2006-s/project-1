import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminGuard = ({ children }) => {
  const { isLoggedIn, user, loading } = useContext(AuthContext);

  // wait until auth restore finishes
  if (loading) {
    return null;
  }

  // not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // not admin
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminGuard;