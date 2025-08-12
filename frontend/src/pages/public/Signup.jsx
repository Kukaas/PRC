import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import CustomForm from "../../components/CustomForm";
import CustomInput from "../../components/CustomInput";
import PublicLayout from "../../layout/PublicLayout";
import { useAuth } from "../../components/AuthContext";
import logo from "../../assets/logo.png";
import bgImage from "../../assets/bg.png";

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
        <div className="min-h-screen">
          <section className="relative h-screen">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
              style={{
                backgroundImage: `url(${bgImage})`,
                filter: "blur(2px)",
              }}
            />
            <div className="relative z-10 flex items-center justify-center h-full p-4">
              <div className="text-center bg-white p-8 rounded-lg shadow-xl max-w-md mx-auto">
                <div className="mb-6">
                  <img
                    src={logo}
                    alt="Philippine Red Cross Logo"
                    className="w-16 h-16 object-contain mx-auto mb-4"
                  />
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Signup Successful!
                  </h2>
                  <p className="text-gray-600">
                    Please check your email to verify your account before
                    logging in.
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
            </div>
          </section>
        </div>
      </PublicLayout>
    );
  }

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

          {/* Signup Form */}
          <div className="relative z-10 flex items-center justify-center h-full p-4">
            <div className="w-full max-w-md mx-auto">
              <CustomForm
                title="Sign up as Volunteer"
                logo={logo}
                onSubmit={handleSubmit}
              >
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {errors.general}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomInput
                    label="First name"
                    name="givenName"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.givenName}
                    onChange={handleChange}
                    required
                    error={errors.givenName}
                  />

                  <CustomInput
                    label="Last name"
                    name="familyName"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.familyName}
                    onChange={handleChange}
                    required
                    error={errors.familyName}
                  />
                </div>

                <CustomInput
                  label="Middle Name"
                  name="middleName"
                  type="text"
                  placeholder="Enter your middle name (optional)"
                  value={formData.middleName}
                  onChange={handleChange}
                  error={errors.middleName}
                />

                <CustomInput
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  error={errors.dateOfBirth}
                />

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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={errors.password}
                />

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

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Sign up"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-blue-500 underline hover:text-blue-600 transition-colors"
                  >
                    Login
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

export default Signup;
