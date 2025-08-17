import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import PublicLayout from "../../layout/PublicLayout";
import logo from "../../assets/logo.png";
import { Heart, MapPin, Phone, Mail, Clock, Users, Award, Shield, Star } from "lucide-react";

const About = () => {
  const organizationInfo = {
    name: "PHILIPPINE RED CROSS",
    chapter: "MARINDUQUE CHAPTER",
    address: "Kasilag St., Brgy. Isok I, Boac, Marinduque",
    telefax: "(042) 332-0733",
    mobile: "+639506131305",
    email: "marinduque@redcross.org.ph"
  };

  const missionVision = [
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Our Mission",
      description: "To be the foremost humanitarian organization in the Philippines, committed to provide quality life-saving services that protect the life and dignity especially of indigent Filipinos in vulnerable situations."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Our Vision",
      description: "The Philippine Red Cross is the foremost humanitarian organization in the Philippines, with the most extensive volunteer network, dedicated to saving lives and building resilient communities."
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: "Our Values",
      description: "Humanity, Impartiality, Neutrality, Independence, Voluntary Service, Unity, and Universality guide everything we do in serving our community."
    }
  ];

  const history = [
    {
      year: "1947",
      title: "Foundation",
      description: "The Philippine Red Cross was established as an independent humanitarian organization."
    },
    {
      year: "1950",
      title: "Marinduque Chapter",
      description: "The Marinduque Chapter was established to serve the local community."
    },
    {
      year: "1987",
      title: "Expansion",
      description: "Expanded services to include disaster response, blood services, and community health programs."
    },
    {
      year: "Present",
      title: "Modern Era",
      description: "Continuing to serve with modern technology and comprehensive humanitarian services."
    }
  ];

  const achievements = [
    {
      number: "10K+",
      label: "Volunteers Served",
      description: "Trained and mobilized volunteers across Marinduque"
    },
    {
      number: "500+",
      label: "Disasters Responded",
      description: "Emergency responses to natural and man-made disasters"
    },
    {
      number: "50+",
      label: "Communities Served",
      description: "Barangays and municipalities across the province"
    },
    {
      number: "24/7",
      label: "Emergency Support",
      description: "Round-the-clock emergency response services"
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
                About <span className="text-red-600">Us</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                The Philippine Red Cross Marinduque Chapter has been serving our community
                with dedication and compassion for decades, providing essential humanitarian services.
              </p>
            </div>
          </div>
        </section>

        {/* Organization Info Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                {organizationInfo.name}
              </h2>
              <h3 className="text-2xl font-bold text-red-600 mb-6">
                {organizationInfo.chapter}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-red-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">Location</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {organizationInfo.address}
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Province:</strong> Marinduque<br />
                  <strong>Region:</strong> MIMAROPA
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <Phone className="w-6 h-6 text-red-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">Contact Information</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Telefax:</strong> {organizationInfo.telefax}
                  </p>
                  <p className="text-gray-700">
                    <strong>Mobile:</strong> {organizationInfo.mobile}
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> {organizationInfo.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Our Mission, Vision & Values
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Guided by our core principles, we strive to serve humanity with compassion and dedication.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {missionVision.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-center">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Our History
              </h2>
              <p className="text-lg text-gray-600">
                A journey of service and commitment to the people of Marinduque.
              </p>
            </div>
            <div className="space-y-8">
              {history.map((event, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg mr-6 flex-shrink-0">
                    {event.year}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Our Impact
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Through the years, we've made a significant difference in the lives of countless individuals and communities.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base font-medium mb-1">
                    {achievement.label}
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">
                    {achievement.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Office Hours Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Visit Our Office
              </h2>
              <p className="text-lg text-gray-600">
                We welcome visitors and are here to serve you during our office hours.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <Clock className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-800">Office Hours</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Monday - Friday:</span>
                    <span className="font-medium">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Saturday:</span>
                    <span className="font-medium">8:00 AM - 12:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Sunday:</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-700 font-medium">
                    Emergency services are available 24/7 through our hotline: {organizationInfo.mobile}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
              Join Our Mission
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Be part of our humanitarian mission. Whether you want to volunteer, donate, or learn more about our services,
              we're here to help you make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link to="/volunteer">Become a Volunteer</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                asChild
              >
                <Link to="/services">Our Services</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default About;
