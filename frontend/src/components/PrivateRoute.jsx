import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const PrivateRoute = ({ children, requireProfileComplete = false }) => {
  const { isAuthenticated, loading, user, profileCompletion } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (requireProfileComplete && !user?.isProfileComplete) {
    navigate("/profile-setup");
    return null;
  }

  return children;
};

export default PrivateRoute;
