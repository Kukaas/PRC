import React from "react";
import PersonalInfoStep from "./PersonalInfoStep";
import MedicalHistoryStep from "./MedicalHistoryStep";
import FamilyBackgroundStep from "./FamilyBackgroundStep";
import EducationSkillsStep from "./EducationSkillsStep";
import ServicesStep from "./ServicesStep";
import AdditionalInfoStep from "./AdditionalInfoStep";

const StepRenderer = ({ currentStep, formData, handleChange, setFormData, errors }) => {
  switch (currentStep) {
    case 1:
      return (
        <PersonalInfoStep
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
      );
    case 2:
      return (
        <MedicalHistoryStep
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
      );
    case 3:
      return (
        <FamilyBackgroundStep
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
      );
    case 4:
      return (
        <EducationSkillsStep
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
          errors={errors}
        />
      );
    case 5:
      return (
        <ServicesStep
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />
      );
    case 6:
      return (
        <AdditionalInfoStep
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />
      );
    default:
      return null;
  }
};

export default StepRenderer;
