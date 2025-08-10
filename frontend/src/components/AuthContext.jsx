import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await api.auth.getProfile();
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        // Get profile completion status
        try {
          const completionResponse = await api.profile.getCompletionStatus();
          if (completionResponse.success) {
            setProfileCompletion(completionResponse.data);
          }
        } catch (error) {
          console.error("Error fetching profile completion:", error);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      setProfileCompletion(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.auth.login(credentials);

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setProfileCompletion(response.data.profileCompletion);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await api.auth.signup(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Signup failed:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setProfileCompletion(null);
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await api.profile.update(profileData);

      // Refresh profile completion status
      try {
        const completionResponse = await api.profile.getCompletionStatus();
        if (completionResponse.success) {
          setProfileCompletion(completionResponse.data);
        }
      } catch (completionError) {
        console.error("Error fetching completion status:", completionError);
      }

      // Update user data with the new profile data
      if (response.data) {
        setUser((prev) => ({ ...prev, ...response.data }));
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Profile update failed:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await api.auth.resendVerification({ email });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Resend verification failed:", error);
      return { success: false, error: error.message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await api.auth.verifyEmail(token);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Email verification failed:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    profileCompletion,
    login,
    signup,
    logout,
    updateProfile,
    resendVerification,
    verifyEmail,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
