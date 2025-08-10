import { Button } from "@/components/ui/button";
import React from "react";

const NavigationButtons = ({
  currentStep,
  steps,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting
}) => {
  return (
    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={currentStep === 1}
        className="px-6 py-2"
      >
        Previous
      </Button>

      <div className="flex space-x-4">
        {currentStep < steps.length ? (
          <Button
            onClick={onNext}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
          >
            {isSubmitting ? "Saving..." : "Complete Profile"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavigationButtons;
