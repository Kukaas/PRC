import React, { useState } from "react";
import { useAuth } from "../../components/AuthContext";
import logo from "../../assets/logo.png";
import StepRenderer from "./components/profile-setup/StepRenderer";
import ProgressBar from "./components/profile-setup/ProgressBar";
import NavigationButtons from "./components/profile-setup/NavigationButtons";

const ProfileSetup = () => {
  const { updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});



  const [formData, setFormData] = useState({
    // Personal Information
    nickname: "",
    sex: "",
    birthPlace: "",
    height: "",
    weight: "",
    civilStatus: "",
    spouseName: "",
    numberOfChildren: "",
    mobileNumber: "",
    contactNumber: "",
    landlineNumber: "",
    address: {
      houseNo: "",
      streetBlockLot: "",
      districtBarangayVillage: "",
      municipalityCity: "",
      province: "",
      zipcode: "",
    },
    // Medical History
    bloodType: "",
    preExistingConditions: "",
    currentMedications: "",
    emergencyContact: {
      immediateFamily: {
        name: "",
        relationship: "",
        landlineNumber: "",
        mobileNumber: "",
      },
      other: {
        name: "",
        relationship: "",
        landlineNumber: "",
        mobileNumber: "",
      },
    },
    // Family Background
    familyBackground: {
      father: {
        name: "",
        age: "",
        occupation: "",
      },
      mother: {
        name: "",
        age: "",
        occupation: "",
      },
      numberOfSiblings: "",
      positionInFamily: "",
    },
    // Educational Background
    educationalBackground: {
      elementary: {
        school: "",
        yearGraduated: "",
        honorsAwards: "",
      },
      highSchool: {
        school: "",
        yearGraduated: "",
        honorsAwards: "",
      },
      vocational: {
        school: "",
        yearGraduated: "",
        honorsAwards: "",
      },
      higherStudies: {
        school: "",
        yearGraduated: "",
        honorsAwards: "",
      },
      college: {
        school: "",
        course: "",
        yearGraduated: "",
        honorsAwards: "",
      },
    },
    // Skills
    skills: [],
    // Socio-Civic Involvements
    socioCivicInvolvements: [],
    // Work Experience
    workExperience: [],
    // Services
    services: [],
  });

  const steps = [
    { title: "Personal Information", fields: ["personalInfo"] },
    { title: "Medical History", fields: ["medicalHistory"] },
    { title: "Family Background", fields: ["familyBackground"] },
    {
      title: "Education & Skills",
      fields: ["educationalBackground", "skills"],
    },
    { title: "Services", fields: ["services"] },
    { title: "Additional Information", fields: ["socioCivicInvolvements", "workExperience"] },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const parts = name.split(".");
      setFormData((prev) => {
        const newState = { ...prev };
        let current = newState;

        // Navigate to the parent object
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }

        // Set the value on the final property
        current[parts[parts.length - 1]] = value;

        return newState;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.nickname) newErrors.nickname = "Nickname is required";
        if (!formData.sex) newErrors.sex = "Sex is required";
        if (!formData.birthPlace)
          newErrors.birthPlace = "Birth place is required";
        if (!formData.height) newErrors.height = "Height is required";
        if (!formData.weight) newErrors.weight = "Weight is required";
        if (!formData.civilStatus)
          newErrors.civilStatus = "Civil status is required";
        if (!formData.mobileNumber)
          newErrors.mobileNumber = "Mobile number is required";
        // Address fields - only required fields
        if (!formData.address.districtBarangayVillage)
          newErrors["address.districtBarangayVillage"] =
            "District/Barangay/Village is required";
        if (!formData.address.municipalityCity)
          newErrors["address.municipalityCity"] =
            "Municipality/City is required";
        if (!formData.address.province)
          newErrors["address.province"] = "Province is required";
        if (!formData.address.zipcode)
          newErrors["address.zipcode"] = "Zip code is required";
        break;
      case 2: // Medical History
        if (!formData.bloodType) newErrors.bloodType = "Blood type is required";
        // Emergency contact fields are optional for profile completion
        break;
      case 3: // Family Background
        // Family background is optional for profile completion
        break;
      case 4: // Education & Skills
        if (!formData.skills.length)
          newErrors.skills = "At least one skill must be selected";
        break;
      case 5: // Services
        if (!formData.services.length)
          newErrors.services = "At least one service must be selected";
        break;
      case 6: // Additional Information
        // Additional information is optional for profile completion
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Only validate the current step, not all steps
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Structure the data according to backend expectations
      const structuredData = {
        personalInfo: {
          nickname: formData.nickname,
          sex: formData.sex,
          birthPlace: formData.birthPlace,
          height: formData.height,
          weight: formData.weight,
          civilStatus: formData.civilStatus,
          spouseName: formData.spouseName,
          numberOfChildren: formData.numberOfChildren,
          mobileNumber: formData.mobileNumber,
          contactNumber: formData.contactNumber,
          landlineNumber: formData.landlineNumber,
          address: formData.address,
        },
        medicalHistory: {
          bloodType: formData.bloodType,
          preExistingConditions: formData.preExistingConditions,
          currentMedications: formData.currentMedications,
          emergencyContact: formData.emergencyContact,
        },
        familyBackground: formData.familyBackground,
        educationalBackground: formData.educationalBackground,
        skills: formData.skills,
        socioCivicInvolvements: formData.socioCivicInvolvements,
        workExperience: formData.workExperience,
        services: formData.services,
      };


      const result = await updateProfile(structuredData);
      if (result.success) {
        // Redirect to user's profile page
        const userId = result.data._id || result.data.id;
        if (userId) {
          window.location.href = `/profile/${userId}`;
        } else {
          // Fallback to dashboard if no user ID
          window.location.href = "/dashboard";
        }
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setErrors({
        general: error.message || "Profile update failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Philippine Red Cross Logo"
            className="w-16 h-16 object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>



        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} steps={steps} />

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
              {errors.general}
            </div>
          )}

          <StepRenderer
            currentStep={currentStep}
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
            errors={errors}
          />

          {/* Navigation Buttons */}
          <NavigationButtons
            currentStep={currentStep}
            steps={steps}
            onPrev={prevStep}
            onNext={nextStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
