import User from "../models/user.model.js";

// Comprehensive profile update function
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = {};

    // Helper function to safely set nested fields
    const setNestedField = (path, value) => {
      if (value !== undefined && value !== null) {
        updateData[path] = value;
      }
    };

    // Personal Information
    if (req.body.personalInfo) {
      const { personalInfo } = req.body;

      setNestedField("personalInfo.nickname", personalInfo.nickname);
      setNestedField("personalInfo.sex", personalInfo.sex);
      setNestedField("personalInfo.birthPlace", personalInfo.birthPlace);
      setNestedField("personalInfo.height", personalInfo.height);
      setNestedField("personalInfo.weight", personalInfo.weight);
      setNestedField("personalInfo.civilStatus", personalInfo.civilStatus);
      setNestedField("personalInfo.spouseName", personalInfo.spouseName);
      setNestedField("personalInfo.contactNumber", personalInfo.contactNumber);
      setNestedField(
        "personalInfo.numberOfChildren",
        personalInfo.numberOfChildren
      );
      setNestedField("personalInfo.mobileNumber", personalInfo.mobileNumber);
      setNestedField(
        "personalInfo.landlineNumber",
        personalInfo.landlineNumber
      );

      // Handle address fields
      if (personalInfo.address) {
        const { address } = personalInfo;
        setNestedField("personalInfo.address.houseNo", address.houseNo);
        setNestedField(
          "personalInfo.address.streetBlockLot",
          address.streetBlockLot
        );
        setNestedField(
          "personalInfo.address.districtBarangayVillage",
          address.districtBarangayVillage
        );
        setNestedField(
          "personalInfo.address.municipalityCity",
          address.municipalityCity
        );
        setNestedField("personalInfo.address.province", address.province);
        setNestedField("personalInfo.address.zipcode", address.zipcode);
      }
    }

    // Medical History
    if (req.body.medicalHistory) {
      const { medicalHistory } = req.body;

      setNestedField(
        "medicalHistory.preExistingConditions",
        medicalHistory.preExistingConditions
      );
      setNestedField(
        "medicalHistory.currentMedications",
        medicalHistory.currentMedications
      );
      setNestedField("medicalHistory.bloodType", medicalHistory.bloodType);

      // Handle emergency contact fields
      if (medicalHistory.emergencyContact) {
        const { emergencyContact } = medicalHistory;

        if (emergencyContact.immediateFamily) {
          const { immediateFamily } = emergencyContact;
          setNestedField(
            "medicalHistory.emergencyContact.immediateFamily.name",
            immediateFamily.name
          );
          setNestedField(
            "medicalHistory.emergencyContact.immediateFamily.relationship",
            immediateFamily.relationship
          );
          setNestedField(
            "medicalHistory.emergencyContact.immediateFamily.landlineNumber",
            immediateFamily.landlineNumber
          );
          setNestedField(
            "medicalHistory.emergencyContact.immediateFamily.mobileNumber",
            immediateFamily.mobileNumber
          );
        }

        if (emergencyContact.otherFamily) {
          const { otherFamily } = emergencyContact;
          setNestedField(
            "medicalHistory.emergencyContact.otherFamily.name",
            otherFamily.name
          );
          setNestedField(
            "medicalHistory.emergencyContact.otherFamily.relationship",
            otherFamily.relationship
          );
          setNestedField(
            "medicalHistory.emergencyContact.otherFamily.landlineNumber",
            otherFamily.landlineNumber
          );
          setNestedField(
            "medicalHistory.emergencyContact.otherFamily.mobileNumber",
            otherFamily.mobileNumber
          );
        }
      }
    }

    // Family Background
    if (req.body.familyBackground) {
      const { familyBackground } = req.body;

      if (familyBackground.father) {
        const { father } = familyBackground;
        setNestedField("familyBackground.father.name", father.name);
        setNestedField("familyBackground.father.age", father.age);
        setNestedField("familyBackground.father.occupation", father.occupation);
      }

      if (familyBackground.mother) {
        const { mother } = familyBackground;
        setNestedField("familyBackground.mother.name", mother.name);
        setNestedField("familyBackground.mother.age", mother.age);
        setNestedField("familyBackground.mother.occupation", mother.occupation);
      }

      setNestedField(
        "familyBackground.numberOfSiblings",
        familyBackground.numberOfSiblings
      );
      setNestedField(
        "familyBackground.positionInFamily",
        familyBackground.positionInFamily
      );
    }

    // Educational Background
    if (req.body.educationalBackground) {
      const { educationalBackground } = req.body;

      if (educationalBackground.elementary) {
        const { elementary } = educationalBackground;
        setNestedField(
          "educationalBackground.elementary.school",
          elementary.school
        );
        setNestedField(
          "educationalBackground.elementary.yearGraduated",
          elementary.yearGraduated
        );
        setNestedField(
          "educationalBackground.elementary.honorsAwards",
          elementary.honorsAwards
        );
      }

      if (educationalBackground.highSchool) {
        const { highSchool } = educationalBackground;
        setNestedField(
          "educationalBackground.highSchool.school",
          highSchool.school
        );
        setNestedField(
          "educationalBackground.highSchool.yearGraduated",
          highSchool.yearGraduated
        );
        setNestedField(
          "educationalBackground.highSchool.honorsAwards",
          highSchool.honorsAwards
        );
      }

      if (educationalBackground.vocational) {
        const { vocational } = educationalBackground;
        setNestedField(
          "educationalBackground.vocational.school",
          vocational.school
        );
        setNestedField(
          "educationalBackground.vocational.yearGraduated",
          vocational.yearGraduated
        );
        setNestedField(
          "educationalBackground.vocational.honorsAwards",
          vocational.honorsAwards
        );
      }

      if (educationalBackground.higherStudies) {
        const { higherStudies } = educationalBackground;
        setNestedField(
          "educationalBackground.higherStudies.school",
          higherStudies.school
        );
        setNestedField(
          "educationalBackground.higherStudies.yearGraduated",
          higherStudies.yearGraduated
        );
        setNestedField(
          "educationalBackground.higherStudies.honorsAwards",
          higherStudies.honorsAwards
        );
      }

      if (educationalBackground.college) {
        const { college } = educationalBackground;
        setNestedField("educationalBackground.college.school", college.school);
        setNestedField("educationalBackground.college.course", college.course);
        setNestedField(
          "educationalBackground.college.yearGraduated",
          college.yearGraduated
        );
        setNestedField(
          "educationalBackground.college.honorsAwards",
          college.honorsAwards
        );
      }
    }

    // Skills
    if (req.body.skills !== undefined) {
      updateData.skills = req.body.skills;
    }

    // Socio-Civic Involvements (replace entire array)
    if (req.body.socioCivicInvolvements !== undefined) {
      updateData.socioCivicInvolvements = req.body.socioCivicInvolvements;
    }

    // Work Experience (replace entire array)
    if (req.body.workExperience !== undefined) {
      updateData.workExperience = req.body.workExperience;
    }

    // Services (replace entire array)
    if (req.body.services !== undefined) {
      // Convert string array to object array if needed
      if (Array.isArray(req.body.services) && req.body.services.length > 0 && typeof req.body.services[0] === 'string') {
        updateData.services = req.body.services.map(service => ({ type: service }));
      } else {
        updateData.services = req.body.services;
      }
    }

    // Check if any fields were provided for update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    // Update the user profile
    let user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -emailVerificationToken -emailVerificationExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if profile should be marked as complete
    const isProfileComplete = user.checkProfileCompleteness();

    // If profile completion status has changed, update it
    if (user.isProfileComplete !== isProfileComplete) {
      user = await User.findByIdAndUpdate(
        userId,
        { $set: { isProfileComplete } },
        { new: true }
      ).select("-password -emailVerificationToken -emailVerificationExpires");
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get profile completion status
export const getProfileCompletionStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select(
      "isProfileComplete personalInfo medicalHistory familyBackground educationalBackground skills services"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate completion percentage for each section
    const sections = {
      personalInfo: calculatePersonalInfoCompletion(user.personalInfo),
      medicalHistory: calculateMedicalHistoryCompletion(user.medicalHistory),
      familyBackground: calculateFamilyBackgroundCompletion(
        user.familyBackground
      ),
      educationalBackground: calculateEducationalBackgroundCompletion(
        user.educationalBackground
      ),
      skills: calculateSkillsCompletion(
        user.skills
      ),
      services: calculateServicesCompletion(user.services),
    };

    const overallCompletion = Math.round(
      Object.values(sections).reduce((sum, val) => sum + val, 0) /
        Object.keys(sections).length
    );

    res.json({
      success: true,
      data: {
        isProfileComplete: user.isProfileComplete,
        overallCompletion,
        sections,
      },
    });
  } catch (error) {
    console.error("Get profile completion status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get profile setup status and missing fields
export const getProfileSetupStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select(
      "isProfileComplete personalInfo medicalHistory familyBackground educationalBackground skills services"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check what fields are missing for each section
    const missingFields = {
      personalInfo: getMissingPersonalInfoFields(user.personalInfo),
      medicalHistory: getMissingMedicalHistoryFields(user.medicalHistory),
      familyBackground: getMissingFamilyBackgroundFields(user.familyBackground),
      educationalBackground: getMissingEducationalBackgroundFields(
        user.educationalBackground
      ),
      skills: getMissingSkillsFields(user.skills),
      services: getMissingServicesFields(user.services),
    };

    // Calculate completion percentage for each section
    const sections = {
      personalInfo: calculatePersonalInfoCompletion(user.personalInfo),
      medicalHistory: calculateMedicalHistoryCompletion(user.medicalHistory),
      familyBackground: calculateFamilyBackgroundCompletion(
        user.familyBackground
      ),
      educationalBackground: calculateEducationalBackgroundCompletion(
        user.educationalBackground
      ),
      skills: calculateSkillsCompletion(
        user.skills
      ),
      services: calculateServicesCompletion(user.services),
    };

    const overallCompletion = Math.round(
      Object.values(sections).reduce((sum, val) => sum + val, 0) /
        Object.keys(sections).length
    );

    // Determine if profile setup is required
    const isSetupRequired = !user.isProfileComplete;
    const nextRecommendedSection = getNextRecommendedSection(sections);

    res.json({
      success: true,
      data: {
        isProfileComplete: user.isProfileComplete,
        isSetupRequired,
        overallCompletion,
        sections,
        missingFields,
        nextRecommendedSection,
        setupInstructions: {
          personalInfo:
            "Complete your basic personal information including contact details and address",
          medicalHistory:
            "Provide your medical information and emergency contacts",
          familyBackground: "Share information about your family members",
          educationalBackground:
            "List your educational achievements and qualifications",
          skills: "Select your skills from the available options",
          services: "Choose which services you'd like to join",
        },
      },
    });
  } catch (error) {
    console.error("Get profile setup status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper functions to calculate completion percentages
export const calculatePersonalInfoCompletion = (personalInfo) => {
  const fields = [
    "nickname",
    "sex",
    "birthPlace",
    "height",
    "weight",
    "civilStatus",
    "mobileNumber",
    "address.houseNo",
    "address.streetBlockLot",
    "address.districtBarangayVillage",
    "address.municipalityCity",
    "address.province",
    "address.zipcode",
  ];
  const completed = fields.filter((field) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      return personalInfo[parent] && personalInfo[parent][child];
    }
    return personalInfo[field];
  }).length;
  return Math.round((completed / fields.length) * 100);
};

export const calculateMedicalHistoryCompletion = (medicalHistory) => {
  const fields = [
    "bloodType",
    "emergencyContact.immediateFamily.name",
    "emergencyContact.immediateFamily.relationship",
    "emergencyContact.immediateFamily.mobileNumber",
  ];
  const completed = fields.filter((field) => {
    if (field.includes(".")) {
      const [parent, child, grandchild] = field.split(".");
      return (
        medicalHistory[parent] &&
        medicalHistory[parent][child] &&
        medicalHistory[parent][child][grandchild]
      );
    }
    return medicalHistory[field];
  }).length;
  return Math.round((completed / fields.length) * 100);
};

export const calculateFamilyBackgroundCompletion = (familyBackground) => {
  const fields = ["father.name", "mother.name"];
  const completed = fields.filter((field) => {
    const [parent, child] = field.split(".");
    return familyBackground[parent] && familyBackground[parent][child];
  }).length;
  return Math.round((completed / fields.length) * 100);
};

export const calculateEducationalBackgroundCompletion = (
  educationalBackground
) => {
  const fields = [
    "elementary.school",
    "highSchool.school",
    "vocational.school",
    "higherStudies.school",
    "college.school",
    "college.course"
  ];
  const completed = fields.filter((field) => {
    const [level, fieldName] = field.split(".");
    return (
      educationalBackground[level] && educationalBackground[level][fieldName]
    );
  }).length;
  return Math.round((completed / fields.length) * 100);
};

export const calculateSkillsCompletion = (skills) => {
  return skills && skills.length > 0 ? 100 : 0;
};

export const calculateServicesCompletion = (services) => {
  return services && services.length > 0 ? 100 : 0;
};

// Helper functions to get missing fields for each section
const getMissingPersonalInfoFields = (personalInfo) => {
  const requiredFields = [
    { field: "nickname", label: "Nickname" },
    { field: "sex", label: "Sex" },
    { field: "birthPlace", label: "Birth Place" },
    { field: "height", label: "Height (cm)" },
    { field: "weight", label: "Weight (kg)" },
    { field: "civilStatus", label: "Civil Status" },
    { field: "mobileNumber", label: "Mobile Number" },
    { field: "address.houseNo", label: "House Number" },
    { field: "address.streetBlockLot", label: "Street/Block/Lot" },
    {
      field: "address.districtBarangayVillage",
      label: "District/Barangay/Village",
    },
    { field: "address.municipalityCity", label: "Municipality/City" },
    { field: "address.province", label: "Province" },
    { field: "address.zipcode", label: "Zipcode" },
  ];

  return requiredFields
    .filter((field) => {
      if (field.field.includes(".")) {
        const [parent, child] = field.field.split(".");
        return !personalInfo[parent] || !personalInfo[parent][child];
      }
      return !personalInfo[field.field];
    })
    .map((field) => field.label);
};

const getMissingMedicalHistoryFields = (medicalHistory) => {
  const requiredFields = [
    { field: "bloodType", label: "Blood Type" },
    {
      field: "emergencyContact.immediateFamily.name",
      label: "Emergency Contact (Immediate Family) - Name",
    },
    {
      field: "emergencyContact.immediateFamily.relationship",
      label: "Emergency Contact (Immediate Family) - Relationship",
    },
    {
      field: "emergencyContact.immediateFamily.mobileNumber",
      label: "Emergency Contact (Immediate Family) - Mobile Number",
    },
  ];

  return requiredFields
    .filter((field) => {
      if (field.field.includes(".")) {
        const parts = field.field.split(".");
        let value = medicalHistory;
        for (const part of parts) {
          if (!value || !value[part]) return true;
          value = value[part];
        }
        return false;
      }
      return !medicalHistory[field.field];
    })
    .map((field) => field.label);
};

const getMissingFamilyBackgroundFields = (familyBackground) => {
  const requiredFields = [
    { field: "father.name", label: "Father's Name" },
    { field: "mother.name", label: "Mother's Name" },
  ];

  return requiredFields
    .filter((field) => {
      const [parent, child] = field.field.split(".");
      return !familyBackground[parent] || !familyBackground[parent][child];
    })
    .map((field) => field.label);
};

const getMissingEducationalBackgroundFields = (educationalBackground) => {
  const requiredFields = [
    { field: "elementary.school", label: "Elementary School" },
    { field: "highSchool.school", label: "High School" },
    { field: "vocational.school", label: "Vocational School" },
    { field: "higherStudies.school", label: "Higher Studies" },
    { field: "college.school", label: "College/University" },
    { field: "college.course", label: "College Course" },
  ];

  return requiredFields
    .filter((field) => {
      const [level, fieldName] = field.field.split(".");
      return (
        !educationalBackground[level] ||
        !educationalBackground[level][fieldName]
      );
    })
    .map((field) => field.label);
};

const getMissingSkillsFields = (skills) => {
  if (!skills || skills.length === 0) {
    return ["Skills Selection"];
  }
  return [];
};

const getMissingServicesFields = (services) => {
  if (!services || services.length === 0) {
    return ["Services Selection"];
  }
  return [];
};

export const getNextRecommendedSection = (sections) => {
  // Find the section with the lowest completion percentage
  let lowestSection = null;
  let lowestPercentage = 100;

  for (const [sectionName, percentage] of Object.entries(sections)) {
    if (percentage < lowestPercentage) {
      lowestPercentage = percentage;
      lowestSection = sectionName;
    }
  }

  return lowestSection;
};

export const updatePhoto = async (req, res) => {
  try {
    const { photo } = req.body;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    // Validate photo data
    if (!photo) {
      return res.status(400).json({
        success: false,
        message: "Photo data is required",
      });
    }

    // Validate base64 format (basic check)
    if (!photo.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: "Invalid photo format. Please provide a valid base64 image.",
      });
    }

    // Check file size (limit to 5MB)
    const base64Size = Buffer.byteLength(photo, 'utf8');
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (base64Size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "Photo size too large. Maximum size is 5MB.",
      });
    }

    // Update user photo
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        photo,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -emailVerificationExpires');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Photo updated successfully",
      data: {
        photo: updatedUser.photo,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating photo:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
