import React, { useEffect } from "react";
import { Button } from "../../components/ui/button";
import logo from "../../assets/logo.png";
import bgImage from "../../assets/bg.png";
import { useAuth } from "@/components/AuthContext";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image with Blur Effect */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: `url(${bgImage})`,
            filter: "blur(2px)",
          }}
        />

        {/* Large Logo Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* Large Philippine Red Cross Logo */}
          <div className="mb-8">
            <img
              src={logo}
              alt="Philippine Red Cross Logo"
              className="w-100 h-100 object-contain opacity-90"
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to Philippine Red Cross
            </h1>
            <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
              Join us in our mission to help those in need. Become a volunteer
              and make a difference in your community.
            </p>
          </div>

          {/* Get Started Button */}
          <div className="flex gap-4">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold"
              asChild
            >
              <a href="/signup">Get Started</a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white hover:bg-white hover:text-blue-900 px-8 py-3 text-lg font-semibold"
              asChild
            >
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
