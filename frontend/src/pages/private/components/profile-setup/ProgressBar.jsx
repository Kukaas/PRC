import React from "react";

const ProgressBar = ({ currentStep, steps }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex-1 h-2 mx-1 rounded-full ${
              index + 1 <= currentStep ? "bg-red-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
