import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, requireProfileComplete = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Get user ID - handle both _id and id properties
  const userId = user?.id || user?._id;

  // Handle role-based routing
  if (user && location.pathname.includes('/profile/')) {
    const pathId = location.pathname.split('/profile/')[1];

    // If user is trying to access their own profile but profile is not complete
    if (pathId === userId && !user.isProfileComplete && !location.pathname.includes('/profile-setup')) {
      navigate("/profile-setup");
      return null;
    }

    // If user is trying to access someone else's profile, redirect to their own
    if (pathId !== userId && pathId !== 'setup') {
      navigate(`/profile/${userId}`);
      return null;
    }
  }

  // Handle admin routes
  if (user && location.pathname.includes('/admin/') && user.role !== 'admin') {
    navigate(`/profile/${userId}`);
    return null;
  }

  // Handle staff routes
  if (user && location.pathname.includes('/staff/') && user.role !== 'staff') {
    navigate(`/profile/${userId}`);
    return null;
  }

  return children;
};

export default PrivateRoute;
