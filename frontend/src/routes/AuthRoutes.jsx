import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const PublicRoute = ({ children }) => {
  if (isLoggedIn()) {
    return <Navigate to="/create" replace />;
  }
  return children;
};