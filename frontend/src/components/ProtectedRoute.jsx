import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // If no user, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, allow access
  return children;
};

export default ProtectedRoute;
