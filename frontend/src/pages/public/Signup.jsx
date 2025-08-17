import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import CustomInput from "../../components/CustomInput";
import PublicLayout from "../../layout/PublicLayout";
import { useAuth } from "../../components/AuthContext";
import logo from "../../assets/logo.png";
import { Heart, CheckCircle } from "lucide-react";

const Signup = () => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    familyName: "",
    givenName: "",
    middleName: "",
    dateOfBirth: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

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

    if (!formData.familyName.trim()) {
      newErrors.familyName = "Family name is required";
    }
    if (!formData.givenName.trim()) {
      newErrors.givenName = "Given name is required";
    }
    // Middle name is not required
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
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
      const result = await signup({
        familyName: formData.familyName,
        givenName: formData.givenName,
        middleName: formData.middleName,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        setSignupSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({
        general: error.message || "Signup failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (signupSuccess) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="mb-6">
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
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Signup Successful!
                </h2>
                <p className="text-gray-600">
                  Please check your email to verify your account before
                  logging in.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
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
          {/* Signup Form Card */}
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Our Community</h2>
              <p className="text-gray-600">Create your volunteer account</p>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {errors.general}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="First Name"
                  name="givenName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.givenName}
                  onChange={handleChange}
                  required
                  error={errors.givenName}
                />

                <CustomInput
                  label="Last Name"
                  name="familyName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.familyName}
                  onChange={handleChange}
                  required
                  error={errors.familyName}
                />
              </div>

              {/* Middle Name Field */}
              <CustomInput
                label="Middle Name (Optional)"
                name="middleName"
                type="text"
                placeholder="Enter your middle name (optional)"
                value={formData.middleName}
                onChange={handleChange}
                error={errors.middleName}
              />

              {/* Date of Birth Field */}
              <CustomInput
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                error={errors.dateOfBirth}
              />

              {/* Email Field */}
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

              {/* Password Field */}
              <CustomInput
                label="Password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                error={errors.password}
              />

              {/* Confirm Password Field */}
              <CustomInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
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
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-red-600 underline hover:text-red-700 transition-colors font-medium"
                >
                  Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Signup;
