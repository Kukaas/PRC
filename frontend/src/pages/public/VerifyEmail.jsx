import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import PublicLayout from "../../layout/PublicLayout";
import { api } from "../../services/api";
import logo from "../../assets/logo.png";
import { toast } from "sonner";
import { Heart, CheckCircle, AlertCircle, Clock, Mail, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error, expired
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const hasVerified = useRef(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true;
      verifyEmailToken();
    } else if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
    }
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      if (hasVerified.current === false) {
        hasVerified.current = true;
      }

      setStatus("verifying");

      const result = await api.auth.verifyEmail(token);

      if (result.success) {
        setStatus("success");
        setMessage(result.data?.message || "Email verified successfully!");
      } else {
        setStatus("error");
        setMessage(result.error || "Verification failed");
      }
    } catch (error) {
      // Check if it's an expired token error
      if (error.message && error.message.includes("expired")) {
        setStatus("expired");
        setMessage("Verification link has expired. Please request a new verification email.");
      } else {
        setStatus("error");
        setMessage(error.message || "Verification failed. Please try again.");
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResending(true);
    try {
      const result = await api.auth.resendVerification({ email });

      if (result.success) {
        toast.success("Verification email sent successfully! Please check your inbox.");
        setStatus("verifying");
        setMessage("");
        navigate('/login')
      } else {
        toast.error(result.message || "Failed to send verification email");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsResending(false);
    }
  };

  const handleManualRedirect = () => {
    navigate("/login");
  };

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
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
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button
              onClick={handleManualRedirect}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors font-semibold"
            >
              Go to Login
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors font-semibold"
              >
                Go to Login
              </Button>
              <p className="text-sm text-gray-500">
                You can request a new verification email from the login page.
              </p>
            </div>
          </div>
        );

      case "expired":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verification Link Expired
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={isResending}
                  />
                </div>
              </div>
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors disabled:opacity-50 font-semibold"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-xl transition-colors"
              >
                Go to Login
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Verification Card */}
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
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default VerifyEmail;
