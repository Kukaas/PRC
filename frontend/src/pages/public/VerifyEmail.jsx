import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import PublicLayout from "../../layout/PublicLayout";
import { useAuth } from "../../components/AuthContext";
import logo from "../../assets/logo.png";
import bgImage from "../../assets/bg.png";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyEmailToken();
    } else {
      setStatus("error");
      setMessage("No verification token provided");
      setIsLoading(false);
    }
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      setIsLoading(true);
      const result = await verifyEmail(token);

      if (result.success) {
        setStatus("success");
        setMessage(result.data.message || "Email verified successfully!");
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(result.error || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = () => {
    navigate("/login");
  };

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Go to Login
              </Button>
              <p className="text-sm text-gray-500">
                You can request a new verification email from the login page.
              </p>
            </div>
          </div>
        );

      default:
        return null;
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

          {/* Verification Content */}
          <div className="relative z-10 flex items-center justify-center h-full p-4">
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-xl p-8">
                {/* Logo */}
                <div className="text-center mb-6">
                  <img
                    src={logo}
                    alt="Philippine Red Cross Logo"
                    className="w-16 h-16 object-contain mx-auto mb-4"
                  />
                </div>

                {/* Content */}
                {renderContent()}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default VerifyEmail;
