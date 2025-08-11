import VolunteerApplication from "../models/volunteerApplication.model.js";
import User from "../models/user.model.js";

// Submit a new volunteer application
export const submitApplication = async (req, res) => {
  try {
    const {
      isRedCrossVolunteer,
      monthYearStarted,
      hasMembershipWithAccidentAssistanceBenefits,
      maabSerialNo,
      validityPeriod,
      underwentBasicVolunteerOrientation,
      basicVolunteerOrientationYear,
      underwentBasicRC143OrientationTraining,
      basicRC143OrientationTrainingYear,
      otherRedCrossTrainingCourses,
      exclusiveDates,
      references,
      signupAgreement,
      signupAgreementReason,
      volunteerWaiver,
      certificationAndConfidentiality,
    } = req.body;

    const applicantId = req.user.userId;

    // Check if user already has an application
    const existingApplication = await VolunteerApplication.getLatestByApplicant(applicantId);

    if (existingApplication && existingApplication.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: "You already have a volunteer application submitted",
      });
    }

    // If user has a rejected application, delete it to allow new submission
    if (existingApplication && existingApplication.status === 'rejected') {
      await VolunteerApplication.findByIdAndDelete(existingApplication._id);
    }

    // Validate references (max 2)
    if (references && references.length > 2) {
      return res.status(400).json({
        success: false,
        message: "Maximum of 2 references allowed",
      });
    }

    // Create new application
    const application = new VolunteerApplication({
      applicant: applicantId,
      isRedCrossVolunteer,
      monthYearStarted: monthYearStarted || undefined,
      hasMembershipWithAccidentAssistanceBenefits,
      maabSerialNo: maabSerialNo || undefined,
      validityPeriod: validityPeriod || undefined,
      underwentBasicVolunteerOrientation,
      basicVolunteerOrientationYear: basicVolunteerOrientationYear || undefined,
      underwentBasicRC143OrientationTraining,
      basicRC143OrientationTrainingYear: basicRC143OrientationTrainingYear || undefined,
      otherRedCrossTrainingCourses: otherRedCrossTrainingCourses || undefined,
      exclusiveDates: exclusiveDates || undefined,
      references,
      signupAgreement,
      signupAgreementReason: signupAgreementReason || undefined,
      volunteerWaiver,
      certificationAndConfidentiality,
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: "Volunteer application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get user's own application
export const getMyApplication = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const application = await VolunteerApplication.findOne({
      applicant: applicantId,
    }).populate("applicant", "givenName familyName email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Error getting application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update user's own application (only if pending)
export const updateApplication = async (req, res) => {
  try {
    const applicantId = req.user.userId;
    const updateData = req.body;

    const application = await VolunteerApplication.findOne({
      applicant: applicantId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found",
      });
    }

    // Only allow updates if application is pending
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot update application that is not pending",
      });
    }

    // Remove fields that shouldn't be updated by applicant
    delete updateData.status;
    delete updateData.referenceChecks;
    delete updateData.overallEvaluation;
    delete updateData.finalDecision;
    delete updateData.adminComments;
    delete updateData.reviewedAt;
    delete updateData.reviewedBy;

    const updatedApplication = await VolunteerApplication.findByIdAndUpdate(
      application._id,
      updateData,
      { new: true, runValidators: true }
    ).populate("applicant", "givenName familyName email");

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin: Get all applications with filters
export const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Search by applicant name or email
    if (search) {
      const users = await User.find({
        $or: [
          { givenName: { $regex: search, $options: "i" } },
          { familyName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      query.applicant = { $in: users.map(user => user._id) };
    }

    const applications = await VolunteerApplication.find(query)
      .populate("applicant")
      .populate("reviewedBy", "givenName familyName")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VolunteerApplication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting applications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin: Get single application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await VolunteerApplication.findById(id)
      .populate("applicant")
      .populate("reviewedBy", "givenName familyName");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Error getting application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin: Update application status and evaluation
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      referenceChecks,
      overallEvaluation,
      finalDecision,
      adminComments,
    } = req.body;

    const adminId = req.user.id;

    const application = await VolunteerApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application
    const updateData = {
      status,
      referenceChecks,
      overallEvaluation,
      finalDecision,
      adminComments,
      reviewedAt: new Date(),
      reviewedBy: adminId,
    };

    const updatedApplication = await VolunteerApplication.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("applicant", "givenName familyName email")
      .populate("reviewedBy", "givenName familyName");

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin: Get application statistics
export const getApplicationStats = async (req, res) => {
  try {
    // Get basic counts
    const totalApplications = await VolunteerApplication.countDocuments();
    const pendingApplications = await VolunteerApplication.countDocuments({
      status: "pending",
    });
    const acceptedApplications = await VolunteerApplication.countDocuments({
      status: "accepted",
    });
    const rejectedApplications = await VolunteerApplication.countDocuments({
      status: "rejected",
    });

    // Get applications from this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthApplications = await VolunteerApplication.countDocuments({
      submittedAt: { $gte: thisMonth }
    });

    // Get applications from last month
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthApplications = await VolunteerApplication.countDocuments({
      submittedAt: { $gte: lastMonth, $lt: thisMonth }
    });

    // Calculate month-over-month change
    const monthOverMonthChange = lastMonthApplications > 0
      ? ((thisMonthApplications - lastMonthApplications) / lastMonthApplications * 100).toFixed(1)
      : 0;

    const formattedStats = {
      total: totalApplications,
      pending: pendingApplications,
      accepted: acceptedApplications,
      rejected: rejectedApplications,
      underReview: totalApplications - pendingApplications - acceptedApplications - rejectedApplications,
      thisMonth: thisMonthApplications,
      lastMonth: lastMonthApplications,
      monthOverMonthChange: monthOverMonthChange,
      // Calculate percentages
      pendingPercentage: totalApplications > 0 ? ((pendingApplications / totalApplications) * 100).toFixed(1) : 0,
      acceptedPercentage: totalApplications > 0 ? ((acceptedApplications / totalApplications) * 100).toFixed(1) : 0,
      rejectedPercentage: totalApplications > 0 ? ((rejectedApplications / totalApplications) * 100).toFixed(1) : 0
    };

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Error getting application stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Check if user can resubmit application
export const canResubmitApplication = async (req, res) => {
  try {
    const applicantId = req.user.id;

    const application = await VolunteerApplication.getLatestByApplicant(applicantId);

    if (!application) {
      return res.status(200).json({
        success: true,
        canResubmit: false,
        message: "No application found",
      });
    }

    const canResubmit = application.canBeResubmitted();

    res.status(200).json({
      success: true,
      canResubmit,
      currentStatus: application.status,
      message: canResubmit
        ? "You can resubmit your application"
        : "You cannot resubmit your application at this time",
    });
  } catch (error) {
    console.error("Error checking resubmission status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete application (only for pending applications)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await VolunteerApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Only allow deletion if user owns the application and it's pending
    if (application.applicant.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this application",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete application that is not pending",
      });
    }

    await VolunteerApplication.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
