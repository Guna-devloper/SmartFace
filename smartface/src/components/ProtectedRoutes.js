import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { auth } from "../firebase"; // Firebase Authentication

const PrivateRoute = () => {
  const user = auth.currentUser; // Check if user is logged in

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
