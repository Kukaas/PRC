import React, { useState, useEffect } from "react";
import { api } from "../../../../services/api";

const ServicesStep = ({ formData, setFormData, errors }) => {
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Service recommendations based on skills
  const serviceRecommendations = {
    "Strong Communication skills": ["Welfare Services", "Youth Services", "Health Services"],
    "First Aid and CPR/BLS Certification": ["Health Services", "Safety Services", "Blood Services"],
    "Swimming and Lifesaving Skills": ["Safety Services", "Wash Services"],
    "Fire Safety Knowledge": ["Safety Services"],
    "Disaster Preparedness Training": ["Safety Services", "Welfare Services"],
    "Public Speaking and Teaching Skills": ["Youth Services", "Health Services", "Welfare Services"],
    "Physical Fitness": ["Safety Services", "Youth Services"],
    "Leadership and Organizing": ["Youth Services", "Welfare Services", "Health Services"],
    "First Aid and Disaster Preparedness": ["Health Services", "Safety Services", "Welfare Services"],
    "Communication and Advocacy": ["Welfare Services", "Youth Services", "Health Services"],
    "Creativity and Event Planning": ["Youth Services", "Welfare Services"],
  };

  // Fetch services from maintenance API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await api.maintenance.getActiveServices();
        // The API returns { success: true, data: [...] }
        if (response.success && response.data) {
          setAvailableServices(response.data.map(service => service.name));
        } else {
          // Fallback to predefined services
          setAvailableServices([
            "Welfare Services",
            "Safety Services",
            "Health Services",
            "Youth Services",
            "Blood Services",
            "Wash Services",
          ]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to predefined services if API fails
        setAvailableServices([
          "Welfare Services",
          "Safety Services",
          "Health Services",
          "Youth Services",
          "Blood Services",
          "Wash Services",
        ]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceChange = (service, checked) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, service],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s !== service),
      }));
    }
  };

  // Get recommended services based on selected skills
  const getRecommendedServices = () => {
    const recommended = new Set();
    formData.skills.forEach(skill => {
      if (serviceRecommendations[skill]) {
        serviceRecommendations[skill].forEach(service => recommended.add(service));
      }
    });
    return Array.from(recommended);
  };

  const recommendedServices = getRecommendedServices();

  return (
    <div className="space-y-6">
      <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
        Services
      </h3>

      <div className="space-y-6 lg:space-y-8">
        {/* Skill-based recommendations */}
        {recommendedServices.length > 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
              <h4 className="font-medium text-blue-800 mb-2 text-base md:text-lg">
                💡 Recommended Services Based on Your Skills
              </h4>
              <p className="text-sm md:text-base text-blue-700 mb-3 md:mb-4">
                These services align well with your selected skills and experience.
              </p>
              {loadingServices ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading services...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {recommendedServices.map((service) => (
                    <label key={service} className="flex items-center space-x-3 cursor-pointer p-2 md:p-3 bg-white rounded-md border border-blue-100 hover:border-blue-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={(e) => handleServiceChange(service, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-blue-800 font-medium text-sm md:text-base block truncate">
                          {service}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full inline-block mt-1">
                          Recommended
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* All services */}
        <div className="space-y-4 md:space-y-6">
          <div>
            <h4 className="font-medium text-gray-700 text-base md:text-lg mb-2">
              All Available Services
            </h4>
            <p className="text-sm md:text-base text-gray-500">
              Select any services you're interested in, regardless of your current skills.
            </p>
          </div>
          {loadingServices ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-2 text-gray-600">Loading services...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-3 md:gap-4">
              {availableServices.map((service) => {
                const isRecommended = recommendedServices.includes(service);
                return (
                  <label key={service} className="flex items-center space-x-3 cursor-pointer p-3 md:p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm hover:shadow-md">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={(e) => handleServiceChange(service, e.target.checked)}
                      className={`h-4 w-4 focus:ring-2 rounded flex-shrink-0 ${isRecommended
                        ? "text-blue-600 focus:ring-blue-500 border-blue-300"
                        : "text-red-600 focus:ring-red-500 border-gray-300"
                        }`}
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-gray-700 text-sm md:text-base block truncate ${isRecommended ? "font-medium" : ""}`}>
                        {service}
                      </span>
                      {isRecommended && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full inline-block mt-1">
                          Matches your skills
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {errors.services && (
          <p className="text-sm md:text-base text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {errors.services}
          </p>
        )}
      </div>
    </div>
  );
};

export default ServicesStep;
