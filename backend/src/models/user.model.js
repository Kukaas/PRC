import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    // Basic signup fields
    familyName: {
      type: String,
      required: true,
      trim: true,
    },
    givenName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Role and status
    role: {
      type: String,
      enum: ["volunteer", "admin", "staff"],
      default: "volunteer",
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    // Personal Information
    personalInfo: {
      nickname: String,
      sex: {
        type: String,
        enum: ["male", "female"],
      },
      age: Number, // Computed from dateOfBirth
      birthPlace: String,
      height: Number, // in cm
      weight: Number, // in kg
      civilStatus: {
        type: String,
        enum: ["Single", "Married", "Widowed", "Separated"],
      },
      spouseName: String,
      contactNumber: String,
      numberOfChildren: Number,
      mobileNumber: String,
      landlineNumber: String,
      address: {
        houseNo: String,
        streetBlockLot: String,
        districtBarangayVillage: String,
        municipalityCity: String,
        province: String,
        zipcode: String,
      },
    },

    // Medical History
    medicalHistory: {
      preExistingConditions: String,
      currentMedications: String,
      bloodType: {
        type: String,
        enum: ["A-", "A+", "AB-", "AB+", "B-", "B+", "O-", "O+", "Not Applicable"],
      },
      emergencyContact: {
        immediateFamily: {
          name: String,
          relationship: String,
          landlineNumber: String,
          mobileNumber: String,
        },
        other: {
          name: String,
          relationship: String,
          landlineNumber: String,
          mobileNumber: String,
        },
      },
    },

    // Family Background
    familyBackground: {
      father: {
        name: String,
        age: Number,
        occupation: String,
      },
      mother: {
        name: String,
        age: Number,
        occupation: String,
      },
      numberOfSiblings: Number,
      positionInFamily: String,
    },

    // Educational Background
    educationalBackground: {
      elementary: {
        school: String,
        yearGraduated: Number,
        honorsAwards: String,
      },
      highSchool: {
        school: String,
        yearGraduated: Number,
        honorsAwards: String,
      },
      vocational: {
        school: String,
        yearGraduated: Number,
        honorsAwards: String,
      },
      higherStudies: {
        school: String,
        yearGraduated: Number,
        honorsAwards: String,
      },
      college: {
        school: String,
        course: String,
        yearGraduated: Number,
        honorsAwards: String,
      },
    },

    // Skills
    skills: {
      type: [String],
      enum: [
        "Strong Communication skills",
        "First Aid and CPR/BLS Certification",
        "Swimming and Lifesaving Skills",
        "Fire Safety Knowledge",
        "Disaster Preparedness Training",
        "Public Speaking and Teaching Skills",
        "Physical Fitness",
        "Leadership and Organizing",
        "First Aid and Disaster Preparedness",
        "Communication and Advocacy",
        "Creativity and Event Planning"
      ]
    },

    // Socio-Civic & Cultural Religious Involvements
    socioCivicInvolvements: [
      {
        organization: String,
        position: String,
        year: Number,
      },
    ],

    // Work Experience
    workExperience: [
      {
        organization: String,
        position: String,
        year: Number,
      },
    ],

    // Services
    services: [
      {
        type: {
          type: String,
          enum: [
            "Welfare Services",
            "Safety Services",
            "Health Services",
            "Youth Services",
            "Blood Services",
            "Wash Services",
          ],
        },
      },
    ],

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash password and compute age
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Compute age from date of birth
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    this.personalInfo.age = age;
  }

  // Check if profile is complete
  this.isProfileComplete = this.checkProfileCompleteness();

  next();
});

// Method to check if profile is complete
userSchema.methods.checkProfileCompleteness = function () {
  // Check if at least the basic required fields are filled
  const hasBasicInfo = !!(
    this.personalInfo?.nickname &&
    this.personalInfo?.sex &&
    this.personalInfo?.birthPlace &&
    this.personalInfo?.height &&
    this.personalInfo?.weight &&
    this.personalInfo?.civilStatus &&
    this.personalInfo?.mobileNumber
  );

  // Check if address has at least the required fields
  const hasAddress = !!(
    this.personalInfo?.address?.districtBarangayVillage &&
    this.personalInfo?.address?.municipalityCity &&
    this.personalInfo?.address?.province &&
    this.personalInfo?.address?.zipcode
  );

  // Check if medical history has at least blood type
  const hasMedicalHistory = !!(
    this.medicalHistory?.bloodType
  );

  // Check if family background has at least one parent's name
  const hasFamilyBackground = !!(
    this.familyBackground?.father?.name ||
    this.familyBackground?.mother?.name
  );

  // Check if services are selected
  const hasServices = !!(this.services && this.services.length > 0);

  // Check if skills are selected
  const hasSkills = !!(this.skills && this.skills.length > 0);

  // Profile is complete if user has provided basic info, address, medical history, services, and skills
  return hasBasicInfo && hasAddress && hasMedicalHistory && hasServices && hasSkills;
};

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

const User = mongoose.model("User", userSchema);

export default User;
