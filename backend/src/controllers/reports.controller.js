import Activity from "../models/activity.model.js";
import User from "../models/user.model.js";

// Admin/Staff: Get volunteer hours per user for a given year
export const getVolunteerHoursByYear = async (req, res) => {
  try {
    if (!["admin", "staff"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only admin and staff can view reports" });
    }

    const yearParam = parseInt(req.query.year, 10);
    const now = new Date();
    const year = Number.isFinite(yearParam) ? yearParam : now.getFullYear();

    const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    // Aggregate hours per user for attended participants within the year
    const aggregation = await Activity.aggregate([
      { $match: { date: { $gte: startOfYear, $lte: endOfYear } } },
      { $unwind: "$participants" },
      { $match: { "participants.status": "attended" } },
      {
        $group: {
          _id: "$participants.userId",
          totalHours: { $sum: { $ifNull: ["$participants.totalHours", 0] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          _id: 0,
          totalHours: { $round: ["$totalHours", 2] },
          givenName: "$user.givenName",
          familyName: "$user.familyName",
          contactNumber: {
            $ifNull: [
              "$user.personalInfo.mobileNumber",
              "$user.personalInfo.contactNumber",
            ],
          },
          address: {
            barangay: "$user.personalInfo.address.districtBarangayVillage",
            municipality: "$user.personalInfo.address.municipalityCity",
          },
          services: {
            $map: {
              input: "$user.services",
              as: "s",
              in: { $ifNull: ["$$s.type", "$$s"] },
            },
          },
        },
      },
      { $sort: { familyName: 1, givenName: 1 } },
    ]);

    // Compute active volunteers in last 6 months (rolling window)
    const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - SIX_MONTHS_MS);
    const activeAgg = await Activity.aggregate([
      { $match: { date: { $gte: cutoffDate, $lte: new Date() } } },
      { $unwind: "$participants" },
      { $match: { "participants.status": "attended" } },
      { $group: { _id: "$participants.userId" } },
    ]);
    const activeSet = new Set(activeAgg.map((d) => String(d._id)));

    // Format results with status
    const results = aggregation.map((r) => ({
      userId: r.userId,
      name: `${r.givenName ?? ""} ${r.familyName ?? ""}`.trim(),
      address: r.address,
      services: Array.isArray(r.services)
        ? r.services.filter(Boolean)
        : [],
      hours: r.totalHours || 0,
      contactNumber: r.contactNumber || null,
      status: activeSet.has(String(r.userId)) ? 'Active' : 'Inactive',
    }));

    return res.status(200).json({ success: true, data: results, year });
  } catch (error) {
    console.error("Error in getVolunteerHoursByYear:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


