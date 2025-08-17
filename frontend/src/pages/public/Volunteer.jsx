import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import PublicLayout from "../../layout/PublicLayout";
import logo from "../../assets/logo.png";
import { Heart, Users, Calendar, MapPin, Star, Award, Shield, Clock } from "lucide-react";

const Volunteer = () => {
  const volunteerBenefits = [
    {
      icon: <Award className="w-8 h-8 text-red-600" />,
      title: "Skill Development",
      description: "Learn first aid, disaster response, and community service skills that benefit you and others."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Community Impact",
      description: "Make a real difference in your community by helping those in need during emergencies."
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: "Personal Growth",
      description: "Develop leadership skills, build confidence, and gain valuable life experience."
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Emergency Response",
      description: "Be part of a critical network that responds to disasters and emergencies."
    }
  ];

  const volunteerAreas = [
    {
      title: "First Aid & Health Services",
      description: "Provide first aid during events, conduct health screenings, and support medical missions.",
      icon: <Heart className="w-6 h-6 text-red-600" />
    },
    {
      title: "Disaster Response",
      description: "Assist during natural disasters, help with evacuation, and provide emergency relief.",
      icon: <Shield className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Community Outreach",
      description: "Participate in community programs, health education, and awareness campaigns.",
      icon: <Users className="w-6 h-6 text-green-600" />
    },
    {
      title: "Blood Donation Support",
      description: "Help organize blood drives, assist donors, and promote blood donation awareness.",
      icon: <Heart className="w-6 h-6 text-red-600" />
    },
    {
      title: "Youth Programs",
      description: "Mentor young volunteers, lead youth activities, and develop leadership skills.",
      icon: <Star className="w-6 h-6 text-yellow-600" />
    },
    {
      title: "Administrative Support",
      description: "Help with office tasks, data entry, event planning, and coordination.",
      icon: <Clock className="w-6 h-6 text-purple-600" />
    }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
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
                Become a <span className="text-red-600">Volunteer</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Join our dedicated team of volunteers and help us serve communities in need.
                Your time and skills can make a life-changing difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link to="/signup">Join Now</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                  asChild
                >
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Why Volunteer With Us?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Volunteering with the Philippine Red Cross offers numerous benefits for both you and your community.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {volunteerBenefits.map((benefit, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Volunteer Areas Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Areas of Service
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find your passion and contribute in areas that match your skills and interests.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteerAreas.map((area, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-center mb-4">
                    {area.icon}
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">
                      {area.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {area.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                How to Get Started
              </h2>
              <p className="text-lg text-gray-600">
                Ready to make a difference? Here's what you need to know.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Requirements</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">Must be 18 years or older</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">Valid government-issued ID</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">Commitment to serve the community</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">Willingness to undergo training</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Process</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</div>
                    <span className="text-gray-700">Register and create your account</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</div>
                    <span className="text-gray-700">Complete your profile information</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</div>
                    <span className="text-gray-700">Attend orientation and training</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4</div>
                    <span className="text-gray-700">Start volunteering in your chosen area</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of volunteers who are already making an impact in their communities.
              Your journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link to="/signup">Become a Volunteer</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                asChild
              >
                <Link to="/login">Sign In to Your Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default Volunteer;
