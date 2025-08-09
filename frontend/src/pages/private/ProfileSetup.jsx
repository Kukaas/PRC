import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import CustomInput from "../../components/CustomInput";
import { useAuth } from "../../components/AuthContext";
import logo from "../../assets/logo.png";

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
    mobileNumber: "",
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
    },
    // Educational Background
    educationalBackground: {
      elementary: {
        school: "",
        yearGraduated: "",
      },
      highSchool: {
        school: "",
        yearGraduated: "",
      },
      vocational: {
        school: "",
        yearGraduated: "",
      },
      higherStudies: {
        school: "",
        yearGraduated: "",
      },
      college: {
        school: "",
        course: "",
        yearGraduated: "",
      },
    },
    // Talents and Skills
    primaryTalent: "",
    additionalSkills: [],
    // Services
    services: [],
  });

  const steps = [
    { title: "Personal Information", fields: ["personalInfo"] },
    { title: "Medical History", fields: ["medicalHistory"] },
    { title: "Family Background", fields: ["familyBackground"] },
    {
      title: "Education & Skills",
      fields: ["educationalBackground", "talentsAndSkills"],
    },
    { title: "Services", fields: ["services"] },
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
        // Education and skills are optional for profile completion
        break;
      case 5: // Services
        if (!formData.services.length)
          newErrors.services = "At least one service must be selected";
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
          mobileNumber: formData.mobileNumber,
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
        talentsAndSkills: {
          primaryTalent: formData.primaryTalent,
          additionalSkills: formData.additionalSkills,
        },
        services: formData.services,
      };

      console.log("Submitting profile data:", structuredData);

      const result = await updateProfile(structuredData);
      if (result.success) {
        // Redirect to dashboard
        window.location.href = "/dashboard";
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput
                label="Nickname"
                name="nickname"
                type="text"
                placeholder="Enter your nickname"
                value={formData.nickname}
                onChange={handleChange}
                required
                error={errors.nickname}
              />
              <CustomInput
                label="Sex"
                name="sex"
                type="select"
                value={formData.sex}
                onChange={handleChange}
                required
                error={errors.sex}
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </CustomInput>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput
                label="Birth Place"
                name="birthPlace"
                type="text"
                placeholder="Enter your birth place"
                value={formData.birthPlace}
                onChange={handleChange}
                required
                error={errors.birthPlace}
              />
              <CustomInput
                label="Civil Status"
                name="civilStatus"
                type="select"
                value={formData.civilStatus}
                onChange={handleChange}
                required
                error={errors.civilStatus}
              >
                <option value="">Select civil status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </CustomInput>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput
                label="Height (cm)"
                name="height"
                type="number"
                placeholder="Enter your height in cm"
                value={formData.height}
                onChange={handleChange}
                required
                error={errors.height}
              />
              <CustomInput
                label="Weight (kg)"
                name="weight"
                type="number"
                placeholder="Enter your weight in kg"
                value={formData.weight}
                onChange={handleChange}
                required
                error={errors.weight}
              />
            </div>

            <CustomInput
              label="Mobile Number"
              name="mobileNumber"
              type="tel"
              placeholder="Enter your mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              error={errors.mobileNumber}
            />

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Address</h4>
              <p className="text-sm text-gray-500 mb-4">
                For optional fields like house number or street, you can enter
                "N/A" if not applicable.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="House No."
                  name="address.houseNo"
                  type="text"
                  placeholder="Enter house number (optional)"
                  value={formData.address.houseNo}
                  onChange={handleChange}
                  error={errors["address.houseNo"]}
                />
                <CustomInput
                  label="Street/Block/Lot"
                  name="address.streetBlockLot"
                  type="text"
                  placeholder="Enter street/block/lot (optional)"
                  value={formData.address.streetBlockLot}
                  onChange={handleChange}
                  error={errors["address.streetBlockLot"]}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="District/Barangay/Village"
                  name="address.districtBarangayVillage"
                  type="text"
                  placeholder="Enter district/barangay/village"
                  value={formData.address.districtBarangayVillage}
                  onChange={handleChange}
                  required
                  error={errors["address.districtBarangayVillage"]}
                />
                <CustomInput
                  label="Municipality/City"
                  name="address.municipalityCity"
                  type="text"
                  placeholder="Enter municipality/city"
                  value={formData.address.municipalityCity}
                  onChange={handleChange}
                  required
                  error={errors["address.municipalityCity"]}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="Province"
                  name="address.province"
                  type="text"
                  placeholder="Enter province"
                  value={formData.address.province}
                  onChange={handleChange}
                  required
                  error={errors["address.province"]}
                />
                <CustomInput
                  label="Zip Code"
                  name="address.zipcode"
                  type="text"
                  placeholder="Enter zip code"
                  value={formData.address.zipcode}
                  onChange={handleChange}
                  required
                  error={errors["address.zipcode"]}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Medical History
            </h3>

            <CustomInput
              label="Blood Type"
              name="bloodType"
              type="select"
              value={formData.bloodType}
              onChange={handleChange}
              required
              error={errors.bloodType}
            >
              <option value="">Select blood type</option>
              <option value="A-">A-</option>
              <option value="A+">A+</option>
              <option value="AB-">AB-</option>
              <option value="AB+">AB+</option>
              <option value="B-">B-</option>
              <option value="B+">B+</option>
              <option value="O-">O-</option>
              <option value="O+">O+</option>
              <option value="Not Applicable">Not Applicable</option>
            </CustomInput>

            <CustomInput
              label="Pre-existing Medical or Health Conditions/Disabilities/Allergies"
              name="preExistingConditions"
              type="textarea"
              placeholder="Enter any pre-existing medical conditions, disabilities, or allergies (if none, enter 'None')"
              value={formData.preExistingConditions}
              onChange={handleChange}
              error={errors.preExistingConditions}
            />

            <CustomInput
              label="Current Medications"
              name="currentMedications"
              type="textarea"
              placeholder="Enter any current medications you are taking (if none, enter 'None')"
              value={formData.currentMedications}
              onChange={handleChange}
              error={errors.currentMedications}
            />

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">
                Emergency Contact (Immediate Family)
              </h4>
              <CustomInput
                label="Name"
                name="emergencyContact.immediateFamily.name"
                type="text"
                placeholder="Enter emergency contact name"
                value={formData.emergencyContact.immediateFamily.name}
                onChange={handleChange}
                required
                error={errors["emergencyContact.immediateFamily.name"]}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="Relationship to you"
                  name="emergencyContact.immediateFamily.relationship"
                  type="text"
                  placeholder="Enter relationship"
                  value={formData.emergencyContact.immediateFamily.relationship}
                  onChange={handleChange}
                  required
                  error={
                    errors["emergencyContact.immediateFamily.relationship"]
                  }
                />
                <CustomInput
                  label="Mobile Number"
                  name="emergencyContact.immediateFamily.mobileNumber"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={formData.emergencyContact.immediateFamily.mobileNumber}
                  onChange={handleChange}
                  required
                  error={
                    errors["emergencyContact.immediateFamily.mobileNumber"]
                  }
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Family Background
            </h3>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">
                Father's Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CustomInput
                  label="Name"
                  name="familyBackground.father.name"
                  type="text"
                  placeholder="Enter father's name"
                  value={formData.familyBackground.father.name}
                  onChange={handleChange}
                  required
                  error={errors["familyBackground.father.name"]}
                />
                <CustomInput
                  label="Age"
                  name="familyBackground.father.age"
                  type="number"
                  placeholder="Enter age"
                  value={formData.familyBackground.father.age}
                  onChange={handleChange}
                />
                <CustomInput
                  label="Occupation"
                  name="familyBackground.father.occupation"
                  type="text"
                  placeholder="Enter occupation"
                  value={formData.familyBackground.father.occupation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">
                Mother's Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CustomInput
                  label="Name"
                  name="familyBackground.mother.name"
                  type="text"
                  placeholder="Enter mother's name"
                  value={formData.familyBackground.mother.name}
                  onChange={handleChange}
                  required
                  error={errors["familyBackground.mother.name"]}
                />
                <CustomInput
                  label="Age"
                  name="familyBackground.mother.age"
                  type="number"
                  placeholder="Enter age"
                  value={formData.familyBackground.mother.age}
                  onChange={handleChange}
                />
                <CustomInput
                  label="Occupation"
                  name="familyBackground.mother.occupation"
                  type="text"
                  placeholder="Enter occupation"
                  value={formData.familyBackground.mother.occupation}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Education & Skills
            </h3>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">
                Educational Background
              </h4>

              {/* Elementary */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-600">Elementary</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomInput
                    label="School"
                    name="educationalBackground.elementary.school"
                    type="text"
                    placeholder="Enter elementary school name"
                    value={formData.educationalBackground.elementary.school}
                    onChange={handleChange}
                    required
                    error={errors["educationalBackground.elementary.school"]}
                  />
                  <CustomInput
                    label="Year Graduated"
                    name="educationalBackground.elementary.yearGraduated"
                    type="number"
                    placeholder="Enter year graduated"
                    value={
                      formData.educationalBackground.elementary.yearGraduated
                    }
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* High School */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-600">High School</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomInput
                    label="School"
                    name="educationalBackground.highSchool.school"
                    type="text"
                    placeholder="Enter high school name"
                    value={formData.educationalBackground.highSchool.school}
                    onChange={handleChange}
                  />
                  <CustomInput
                    label="Year Graduated"
                    name="educationalBackground.highSchool.yearGraduated"
                    type="number"
                    placeholder="Enter year graduated"
                    value={
                      formData.educationalBackground.highSchool.yearGraduated
                    }
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Vocational */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-600">Vocational</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomInput
                    label="School"
                    name="educationalBackground.vocational.school"
                    type="text"
                    placeholder="Enter vocational school name"
                    value={formData.educationalBackground.vocational.school}
                    onChange={handleChange}
                  />
                  <CustomInput
                    label="Year Graduated"
                    name="educationalBackground.vocational.yearGraduated"
                    type="number"
                    placeholder="Enter year graduated"
                    value={
                      formData.educationalBackground.vocational.yearGraduated
                    }
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Higher Studies */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-600">Higher Studies</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomInput
                    label="School"
                    name="educationalBackground.higherStudies.school"
                    type="text"
                    placeholder="Enter higher studies school name"
                    value={formData.educationalBackground.higherStudies.school}
                    onChange={handleChange}
                  />
                  <CustomInput
                    label="Year Graduated"
                    name="educationalBackground.higherStudies.yearGraduated"
                    type="number"
                    placeholder="Enter year graduated"
                    value={
                      formData.educationalBackground.higherStudies.yearGraduated
                    }
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* College */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-600">College</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <CustomInput
                    label="School"
                    name="educationalBackground.college.school"
                    type="text"
                    placeholder="Enter college/university name"
                    value={formData.educationalBackground.college.school}
                    onChange={handleChange}
                  />
                  <CustomInput
                    label="Course"
                    name="educationalBackground.college.course"
                    type="text"
                    placeholder="Enter course/degree"
                    value={formData.educationalBackground.college.course}
                    onChange={handleChange}
                  />
                  <CustomInput
                    label="Year Graduated"
                    name="educationalBackground.college.yearGraduated"
                    type="number"
                    placeholder="Enter year graduated"
                    value={
                      formData.educationalBackground.college.yearGraduated
                    }
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Talents and Skills</h4>
              <CustomInput
                label="Primary Talent"
                name="primaryTalent"
                type="select"
                value={formData.primaryTalent}
                onChange={handleChange}
                required
                error={errors.primaryTalent}
              >
                <option value="">Select primary talent</option>
                <option value="Strong Communication skills">
                  Strong Communication skills
                </option>
                <option value="First Aid and CPR/BLS Certification">
                  First Aid and CPR/BLS Certification
                </option>
                <option value="Swimming and Lifesaving Skills">
                  Swimming and Lifesaving Skills
                </option>
                <option value="Fire Safety Knowledge">
                  Fire Safety Knowledge
                </option>
                <option value="Disaster Preparedness Training">
                  Disaster Preparedness Training
                </option>
                <option value="Public Speaking and Teaching Skills">
                  Public Speaking and Teaching Skills
                </option>
                <option value="Physical Fitness">Physical Fitness</option>
                <option value="Leadership and Organizing">
                  Leadership and Organizing
                </option>
                <option value="First Aid and Disaster Preparedness">
                  First Aid and Disaster Preparedness
                </option>
                <option value="Communication and Advocacy">
                  Communication and Advocacy
                </option>
                <option value="Creativity and Event Planning">
                  Creativity and Event Planning
                </option>
              </CustomInput>
            </div>
          </div>
        );

      case 5:
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
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            services: [...prev.services, service],
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            services: prev.services.filter(
                              (s) => s !== service
                            ),
                          }));
                        }
                      }}
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

      default:
        return null;
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

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
              {errors.general}
            </div>
          )}

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2"
            >
              Previous
            </Button>

            <div className="flex space-x-4">
              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                >
                  {isSubmitting ? "Saving..." : "Complete Profile"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
