import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import CustomForm from "../../components/CustomForm";
import CustomInput from "../../components/CustomInput";
import PublicLayout from "../../layout/PublicLayout";
import { useAuth } from "../../components/AuthContext";
import logo from "../../assets/logo.png";
import bgImage from "../../assets/bg.png";

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    </PublicLayout>
  );
};

export default Login;
