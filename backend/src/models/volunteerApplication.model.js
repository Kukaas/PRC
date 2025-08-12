import mongoose from "mongoose";

const referenceSchema = new mongoose.Schema({
  completeName: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  companyInstitution: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
});

const referenceCheckSchema = new mongoose.Schema({
  nameOfPersonContacted: {
    type: String,
    required: true,
    trim: true,
  },
  companyInstitutionOrganization: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  commentsObservation: {
    type: String,
    trim: true,
  },
});

const volunteerApplicationSchema = new mongoose.Schema(
  {
    // Applicant Information (linked to user)
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Application Status
    status: {
      type: String,
      enum: ["pending", "under_review", "accepted", "rejected"],
      default: "pending",
    },

    // Basic Application Information
    isRedCrossVolunteer: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
    monthYearStarted: {
      type: String,
      trim: true,
      required: function() {
        return this.isRedCrossVolunteer === "yes";
      },
    },

    // Membership with Accident Assistance Benefits
    hasMembershipWithAccidentAssistanceBenefits: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
    maabSerialNo: {
      type: String,
      trim: true,
      required: function() {
        return this.hasMembershipWithAccidentAssistanceBenefits === "yes";
      },
    },
    validityPeriod: {
      type: String,
      trim: true,
      required: function() {
        return this.hasMembershipWithAccidentAssistanceBenefits === "yes";
      },
    },

    // Training Information
    underwentBasicVolunteerOrientation: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
    basicVolunteerOrientationYear: {
      type: Number,
      required: function() {
        return this.underwentBasicVolunteerOrientation === "yes";
      },
    },

    underwentBasicRC143OrientationTraining: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
    basicRC143OrientationTrainingYear: {
      type: Number,
      required: function() {
        return this.underwentBasicRC143OrientationTraining === "yes";
      },
    },

    otherRedCrossTrainingCourses: {
      type: String,
      trim: true,
    },
    exclusiveDates: {
      type: String,
      trim: true,
    },

    // References (can add 2 references)
    references: [referenceSchema],

    // Signup Agreement
    signupAgreement: {
      type: String,
      enum: ["yes_i_agree", "no_i_dont_agree"],
      required: true,
    },
    signupAgreementReason: {
      type: String,
      trim: true,
    },

    // Volunteer Waiver
    volunteerWaiver: {
      completeName: {
        type: String,
        required: true,
        trim: true,
      },
      signature: {
        type: String,
        required: true,
        trim: true,
      },
      dateAndPlace: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Certification and Confidentiality
    certificationAndConfidentiality: {
      signature: {
        type: String,
        required: true,
        trim: true,
      },
      dateAndPlace: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Admin Evaluation Fields
    referenceChecks: [referenceCheckSchema],

    overallEvaluation: {
      type: String,
      enum: ["highly_recommended", "recommended", "not_recommended"],
    },

    finalDecision: {
      type: String,
      enum: ["accepted", "rejected"],
    },

    adminComments: {
      type: String,
      trim: true,
    },

    // Training Status (for accepted volunteers)
    isTrained: {
      type: Boolean,
      default: false,
    },

    // Training notification details
    trainingNotification: {
      trainingDate: Date,
      trainingTime: String,
      trainingLocation: String,
      // Store location codes for easy form population
      provinceCode: String,
      municipalityCode: String,
      barangayCode: String,
      exactLocation: String,
      notifiedAt: Date,
      notifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Timestamps
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
volunteerApplicationSchema.index({ applicant: 1, status: 1 });
volunteerApplicationSchema.index({ status: 1, submittedAt: -1 });

// Instance method to check if application can be resubmitted
volunteerApplicationSchema.methods.canBeResubmitted = function() {
  return this.status === 'rejected';
};

// Static method to get user's latest application
volunteerApplicationSchema.statics.getLatestByApplicant = function(applicantId) {
  return this.findOne({ applicant: applicantId }).sort({ submittedAt: -1 });
};

const VolunteerApplication = mongoose.model("VolunteerApplication", volunteerApplicationSchema);

export default VolunteerApplication;
