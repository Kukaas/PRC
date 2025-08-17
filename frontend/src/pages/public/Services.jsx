import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import PublicLayout from "../../layout/PublicLayout";
import logo from "../../assets/logo.png";
import { Heart, Shield, Users, Phone, MapPin, Clock, Award, Star } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "First Aid & Emergency Response",
      description: "Immediate medical assistance during emergencies, accidents, and disasters. Our trained volunteers provide first aid, CPR, and emergency medical support.",
      features: ["First Aid Training", "Emergency Response", "CPR Certification", "Medical Assistance"]
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Disaster Management",
      description: "Comprehensive disaster preparedness, response, and recovery services. We help communities prepare for and respond to natural and man-made disasters.",
      features: ["Disaster Preparedness", "Emergency Relief", "Evacuation Support", "Recovery Assistance"]
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Blood Services",
      description: "Safe and reliable blood collection, testing, and distribution services. We ensure a steady supply of blood for hospitals and medical facilities.",
      features: ["Blood Donation", "Blood Testing", "Blood Distribution", "Donor Recruitment"]
    },
    {
      icon: <Phone className="w-8 h-8 text-purple-600" />,
      title: "Health & Social Services",
      description: "Community health programs, social services, and support for vulnerable populations. We promote health awareness and provide social assistance.",
      features: ["Health Education", "Social Support", "Community Programs", "Vulnerable Care"]
    },
    {
      icon: <MapPin className="w-8 h-8 text-orange-600" />,
      title: "Youth & Volunteer Development",
      description: "Training and development programs for young people and volunteers. We build leadership skills and community service commitment.",
      features: ["Youth Programs", "Volunteer Training", "Leadership Development", "Skill Building"]
    },
    {
      icon: <Clock className="w-8 h-8 text-cyan-600" />,
      title: "24/7 Emergency Hotline",
      description: "Round-the-clock emergency response and support services. Our hotline is always available for emergencies and assistance requests.",
      features: ["24/7 Availability", "Emergency Hotline", "Rapid Response", "Support Services"]
    }
  ];

  const emergencyContacts = [
    {
      title: "Emergency Hotline",
      number: "+63 950 613 1305",
      description: "24/7 emergency response and assistance"
    },
    {
      title: "Office Contact",
      number: "(042) 332-0733",
      description: "Main office for general inquiries"
    },
    {
      title: "Email Support",
      number: "marinduque@redcross.org.ph",
      description: "Email for non-emergency communications"
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
                Our <span className="text-red-600">Services</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                The Philippine Red Cross Marinduque Chapter provides comprehensive humanitarian services
                to support our community in times of need and promote health and safety.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                What We Offer
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From emergency response to community health, we provide a wide range of services
                to support the people of Marinduque.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 mr-4">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {service.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center">
                            <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Contacts Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Emergency Contacts
              </h2>
              <p className="text-lg text-gray-600">
                Need immediate assistance? Contact us through any of these channels.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-gray-100 transition-all duration-300">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {contact.title}
                  </h3>
                  <p className="text-red-600 font-medium text-lg mb-2">
                    {contact.number}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {contact.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location & Hours Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Visit Our Office
              </h2>
              <p className="text-lg text-gray-600">
                Located in the heart of Marinduque, our office is here to serve you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-red-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">Location</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Address:</strong><br />
                    Kasilag St., Brgy. Isok I<br />
                    Boac, Marinduque
                  </p>
                  <p className="text-gray-700">
                    <strong>Province:</strong> Marinduque<br />
                    <strong>Region:</strong> MIMAROPA
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-red-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">Office Hours</h3>
                </div>
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
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">
                      Emergency services available 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
              Need Our Services?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you need emergency assistance or want to volunteer, we're here to help.
              Contact us or visit our office for more information.
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
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default Services;
