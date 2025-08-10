import React from "react";

const ServicesStep = ({ formData, setFormData, errors }) => {
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

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Services
      </h3>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">
          Select Services You're Interested In
        </h4>
        <div className="space-y-3">
          {[
            "Welfare Services",
            "Safety Services",
            "Health Services",
            "Youth Services",
            "Blood Services",
            "Wash Services",
          ].map((service) => (
            <label key={service} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.services.includes(service)}
                onChange={(e) => handleServiceChange(service, e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">{service}</span>
            </label>
          ))}
        </div>
        {errors.services && (
          <p className="text-sm text-red-600">{errors.services}</p>
        )}
      </div>
    </div>
  );
};

export default ServicesStep;
