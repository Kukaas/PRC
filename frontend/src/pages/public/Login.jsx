import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import CustomInput from "../../components/CustomInput";
import PublicLayout from "../../layout/PublicLayout";
import { useAuth } from "../../components/AuthContext";
import logo from "../../assets/logo.png";
import { api } from "../../services/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Heart } from "lucide-react";

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Forgot password state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordSubmitting, setIsForgotPasswordSubmitting] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [isCooldownActive, setIsCooldownActive] = useState(false);

  // Resend verification state
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Initialize cooldown timer from localStorage on component mount
  useEffect(() => {
    const savedCooldown = localStorage.getItem('forgotPasswordCooldown');
    if (savedCooldown) {
      const { endTime } = JSON.parse(savedCooldown);
      const now = Date.now();
      const remainingTime = Math.max(0, Math.ceil((endTime - now) / 1000));

      if (remainingTime > 0) {
        setCooldownTimer(remainingTime);
        setIsCooldownActive(true);
      } else {
        // Clear expired cooldown
        localStorage.removeItem('forgotPasswordCooldown');
      }
    }
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    let interval;
    if (isCooldownActive && cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer((prev) => {
          if (prev <= 1) {
            setIsCooldownActive(false);
            localStorage.removeItem('forgotPasswordCooldown');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCooldownActive, cooldownTimer]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && (user._id || user.id)) {
      handleRedirect(user);
    }
  }, [isAuthenticated, user]);

  const handleRedirect = (userData) => {
    // Handle both _id and id properties from the user object
    const userId = userData._id || userData.id;

    if (!userId) {
      console.error("No user ID found:", userData);
      return;
    }

    switch (userData.role) {
      case 'volunteer':
        if (userData.isProfileComplete) {
          navigate(`/profile/${userId}`);
        } else {
          navigate("/profile-setup");
        }
        break;
      case 'admin':
        navigate(`/admin/dashboard/${userId}`);
        break;
      case 'staff':
        navigate(`/staff/dashboard/${userId}`);
        break;
      default:
        navigate(`/profile/${userId}`);
    }
  };

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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
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
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        // Redirect based on user role and profile completion
        const userData = result.data.user;
        handleRedirect(userData);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      // Check if it's an unverified email error
      if (error.message && error.message.includes("verify your email")) {
        setErrors({
          general: error.message,
          showResendOption: true
        });
      } else {
        setErrors({
          general: error.message || "Login failed. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError("Please enter your email address");
      return;
    }

    // Check if cooldown is active
    if (isCooldownActive) {
      const minutes = Math.floor(cooldownTimer / 60);
      const seconds = cooldownTimer % 60;
      setForgotPasswordError(`Please wait ${minutes}:${seconds.toString().padStart(2, '0')} before requesting another reset link.`);
      return;
    }

    setIsForgotPasswordSubmitting(true);
    setForgotPasswordError("");
    setForgotPasswordSuccess("");

    try {
      const result = await api.auth.forgotPassword({ email: forgotPasswordEmail });

      if (result.success) {
        setForgotPasswordSuccess("Password reset link has been sent to your email. Please check your inbox.");
        setForgotPasswordEmail("");

        // Start 2-minute cooldown
        setCooldownTimer(120); // 2 minutes = 120 seconds
        setIsCooldownActive(true);

        // Save cooldown to localStorage
        const endTime = Date.now() + 120 * 1000; // 2 minutes from now
        localStorage.setItem('forgotPasswordCooldown', JSON.stringify({ endTime }));

        // Keep dialog open for 3 seconds to show success message, then close
        setTimeout(() => {
          setIsForgotPasswordOpen(false);
          setForgotPasswordSuccess("");
        }, 3000);
      } else {
        setForgotPasswordError(result.message || "Failed to send reset link. Please try again.");
        // Keep dialog open when there's an error so user can try again
      }
    } catch {
      setForgotPasswordError("An error occurred. Please try again.");
      // Keep dialog open when there's an error so user can try again
    } finally {
      setIsForgotPasswordSubmitting(false);
    }
  };

  const openForgotPassword = () => {
    setIsForgotPasswordOpen(true);
    setForgotPasswordEmail("");
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    // Don't reset cooldown - let it continue if active
  };

  const handleResendVerification = async () => {
    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResendingVerification(true);
    try {
      const result = await api.auth.resendVerification({ email: formData.email });

      if (result.success) {
        toast.success("Verification email sent successfully! Please check your inbox.");
        setErrors({ general: "Verification email sent! Please check your inbox and click the verification link." });
      } else {
        toast.error(result.message || "Failed to send verification email");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Login Form Card */}
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your volunteer account</p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-6">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {errors.general}
                {errors.showResendOption && (
                  <div className="mt-3">
                    <Button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm"
                    >
                      {isResendingVerification ? "Sending..." : "Resend Verification Email"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <CustomInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                error={errors.email}
              />

              <CustomInput
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                error={errors.password}
              />

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-sm text-red-600 hover:text-red-700 underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors disabled:opacity-50 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-red-600 underline hover:text-red-700 transition-colors font-medium"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Alert Dialog */}
      <AlertDialog
        open={isForgotPasswordOpen}
        onOpenChange={(open) => {
          // Allow closing if not currently submitting
          if (!isForgotPasswordSubmitting) {
            setIsForgotPasswordOpen(open);
            // Clear error and success messages when closing
            if (!open) {
              setForgotPasswordError("");
              setForgotPasswordSuccess("");
            }
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <img src={logo} alt="Logo" className="h-12 w-auto" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <CustomInput
              label="Email Address"
              name="forgot-email"
              type="email"
              placeholder="Enter your email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              disabled={isForgotPasswordSubmitting}
            />

            {forgotPasswordError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-sm">
                {forgotPasswordError}
              </div>
            )}

            {forgotPasswordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-xl text-sm">
                {forgotPasswordSuccess}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              key="cancel"
              disabled={isForgotPasswordSubmitting}
              onClick={() => {
                setIsForgotPasswordOpen(false);
                setForgotPasswordError("");
                setForgotPasswordSuccess("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              key="send"
              onClick={handleForgotPassword}
              disabled={isForgotPasswordSubmitting || isCooldownActive}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isForgotPasswordSubmitting ? "Sending..." :
               isCooldownActive ? `Wait ${Math.floor(cooldownTimer / 60)}:${(cooldownTimer % 60).toString().padStart(2, '0')}` :
               "Send Reset Link"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PublicLayout>
  );
};

export default Login;
