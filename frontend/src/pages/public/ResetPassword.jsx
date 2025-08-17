import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import CustomInput from "../../components/CustomInput";
import PublicLayout from "../../layout/PublicLayout";
import logo from "../../assets/logo.png";
import { api } from "../../services/api";
import { Heart, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setErrors({ general: "Invalid reset link. Please request a new password reset." });
      setIsLoading(false);
      return;
    }
    setIsValidToken(true);
    setIsLoading(false);
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.auth.resetPassword({
        token,
        newPassword: formData.newPassword,
      });

      if (result.success) {
        // Redirect to login with success message
        navigate("/login", {
          state: { message: "Password reset successfully! You can now log in with your new password." }
        });
      } else {
        setErrors({ general: result.message || "Failed to reset password. Please try again." });
      }
    } catch (error) {
      setErrors({
        general: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!isValidToken) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={logo}
                      alt="Philippine Red Cross Logo"
                      className="w-16 h-16 object-contain"
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
                <p className="text-gray-600">The password reset link is invalid or has expired</p>
              </div>

              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {errors.general}
              </div>

              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors font-semibold"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Reset Password Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={logo}
                    alt="Philippine Red Cross Logo"
                    className="w-16 h-16 object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
              <p className="text-gray-600">Enter your new password below</p>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {errors.general}
              </div>
            )}

            {/* Reset Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <CustomInput
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                error={errors.newPassword}
              />

              <CustomInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                error={errors.confirmPassword}
              />

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                    At least 6 characters long
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                    Passwords must match
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors disabled:opacity-50 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <a
                  href="/login"
                  className="text-red-600 underline hover:text-red-700 transition-colors font-medium"
                >
                  Login here
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ResetPassword;
