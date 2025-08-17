import React, { useEffect } from "react";
import { Button } from "../../components/ui/button";
import logo from "../../assets/logo.png";
import { useAuth } from "@/components/AuthContext";
import { useNavigate } from "react-router-dom";
import { Heart, Users, Calendar, MapPin } from "lucide-react";

const Home = () => {
  const {user} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'volunteer':
          if (user.isProfileComplete) {
            navigate(`/profile/${user._id}`);
          } else {
            navigate("/profile-setup");
          }
          break;
        case 'admin':
          navigate(`/admin/dashboard/${user._id}`);
          break;
        case 'staff':
          navigate(`/staff/dashboard/${user._id}`);
          break;
        default:
          navigate(`/profile/${user._id}`);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src={logo}
                  alt="Philippine Red Cross Logo"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Welcome to{" "}
              <span className="text-red-600">Philippine Red Cross</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Join us in our mission to help those in need. Become a volunteer
              and make a difference in your community through meaningful service.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <a href="/signup">Get Started</a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                asChild
              >
                <a href="/login">Sign In</a>
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Join Our Community
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Connect with like-minded individuals who share your passion for helping others and making a positive impact.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Participate in Events
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Take part in various activities and events designed to serve communities and provide essential assistance.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <MapPin className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Serve Your Area
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Make a difference in your local community through targeted programs and emergency response initiatives.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">
              Our Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-2">10K+</div>
                <div className="text-gray-600 text-sm sm:text-base">Volunteers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600 text-sm sm:text-base">Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-cyan-600 mb-2">50+</div>
                <div className="text-gray-600 text-sm sm:text-base">Communities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-600 text-sm sm:text-base">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
