import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import CustomForm from "../../components/CustomForm";
import CustomInput from "../../components/CustomInput";
import PublicLayout from "../../layout/PublicLayout";
import { useAuth } from "../../components/AuthContext";
import logo from "../../assets/logo.png";
import bgImage from "../../assets/bg.png";
import { api } from "../../services/api";
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

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();
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
          window.location.href = `/profile/${userId}`;
        } else {
          window.location.href = "/profile-setup";
        }
        break;
      case 'admin':
        window.location.href = `/admin/dashboard/${userId}`;
        break;
      case 'staff':
        window.location.href = `/staff/dashboard/${userId}`;
        break;
      default:
        window.location.href = `/profile/${userId}`;
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
        console.log("Login successful, user data:", userData);
        handleRedirect(userData);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({
        general: error.message || "Login failed. Please try again.",
      });
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

  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Background Section */}
        <section className="relative h-screen overflow-hidden">
          {/* Background Image with Blur Effect */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{
              backgroundImage: `url(${bgImage})`,
              filter: "blur(2px)",
            }}
          />

          {/* Login Form */}
          <div className="relative z-10 flex items-center justify-center h-full p-4">
            <div className="w-full max-w-md mx-auto">
              <CustomForm
                title="Login as Volunteer"
                logo={logo}
                onSubmit={handleSubmit}
              >
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                    {successMessage}
                  </div>
                )}

                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {errors.general}
                  </div>
                )}

                <CustomInput
                  label="Email"
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

                <div className="text-right">
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="text-sm text-blue-500 hover:text-blue-600 underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <a
                    href="/signup"
                    className="text-blue-500 underline hover:text-blue-600 transition-colors"
                  >
                    Sign up
                  </a>
                </div>
              </CustomForm>
            </div>
          </div>
        </section>
      </div>

      {/* Forgot Password Alert Dialog */}
      <AlertDialog
        open={isForgotPasswordOpen}
        onOpenChange={(open) => {
          // Only allow closing if not currently submitting and no error is showing
          if (!isForgotPasswordSubmitting && !forgotPasswordError) {
            setIsForgotPasswordOpen(open);
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-4">
              <img src={logo} alt="Logo" className="h-12 w-auto" />
            </div>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isForgotPasswordSubmitting}
              />
            </div>

            {forgotPasswordError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                {forgotPasswordError}
              </div>
            )}

            {forgotPasswordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-md text-sm">
                {forgotPasswordSuccess}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel key="cancel" disabled={isForgotPasswordSubmitting}>
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
