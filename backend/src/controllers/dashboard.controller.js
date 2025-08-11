import Activity from "../models/activity.model.js";
import User from "../models/user.model.js";
import VolunteerApplication from "../models/volunteerApplication.model.js";

// Admin/Staff: Get dashboard overview stats
export const getDashboardOverview = async (req, res) => {
  try {
    if (!["admin", "staff"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only admin and staff can view dashboard" });
    }

    // Applicants counts
    const [totalApplications, pendingApplications, underReviewApplications, acceptedApplications, rejectedApplications] = await Promise.all([
      VolunteerApplication.countDocuments({}),
      VolunteerApplication.countDocuments({ status: "pending" }),
      VolunteerApplication.countDocuments({ status: "under_review" }),
      VolunteerApplication.countDocuments({ status: "accepted" }),
      VolunteerApplication.countDocuments({ status: "rejected" }),
    ]);

    // Volunteers counts
    const totalVolunteers = await User.countDocuments({ role: "volunteer" });

    // Active volunteers = attended at least one activity in last 6 months
    const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - SIX_MONTHS_MS);

    const activeAggregation = await Activity.aggregate([
      { $match: { date: { $gte: cutoffDate } } },
      { $unwind: "$participants" },
      { $match: { "participants.status": "attended" } },
      { $group: { _id: "$participants.userId" } },
      { $project: { _id: 1 } }
    ]);

    const activeVolunteerIds = new Set(activeAggregation.map((d) => String(d._id)));
    const activeVolunteers = Math.min(activeVolunteerIds.size, totalVolunteers);
    const inactiveVolunteers = Math.max(totalVolunteers - activeVolunteers, 0);

    return res.status(200).json({
      success: true,
      data: {
        applicants: {
          total: totalApplications,
          pending: pendingApplications,
          underReview: underReviewApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
        },
        volunteers: {
          total: totalVolunteers,
          active: activeVolunteers,
          inactive: inactiveVolunteers,
          windowMonths: 6,
        },
      },
    });
  } catch (error) {
    console.error("Error in getDashboardOverview:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


