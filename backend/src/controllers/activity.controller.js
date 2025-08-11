import Activity from "../models/activity.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import VolunteerApplication from "../models/volunteerApplication.model.js";
import { notifyUsersForNewActivity, notifyActivityParticipants } from "../services/notification.service.js";

// Create a new activity (Admin/Staff only)
export const createActivity = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      timeFrom,
      timeTo,
      location,
      requiredSkills,
      requiredServices,
      maxParticipants,
      isUrgent,
      tags,
      notes,
    } = req.body;

    // Check if user has permission to create activities
    if (!["admin", "staff"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only admin and staff can create activities",
      });
    }

    // Validate required fields
    if (!title || !description || !date || !timeFrom || !timeTo || !location || !requiredSkills || !requiredServices) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate location fields
    if (!location.barangay || !location.municipality || !location.province) {
      return res.status(400).json({
        success: false,
        message: "All location fields are required",
      });
    }

    // Validate skills and services arrays
    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one skill is required",
      });
    }

    if (!Array.isArray(requiredServices) || requiredServices.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one service type is required",
      });
    }

    // Create the activity
    const activity = await Activity.create({
      title,
      description,
      date: new Date(date),
      timeFrom,
      timeTo,
      location,
      requiredSkills,
      requiredServices,
      maxParticipants: maxParticipants || 50,
      isUrgent: isUrgent || false,
      tags: tags || [],
      notes: notes || "",
      createdBy: req.user.userId,
    });

    const createdActivity = await Activity.findById(activity._id)
      .populate("createdBy", "givenName familyName email")
      .populate("participants.userId", "givenName familyName email");

    // Send notifications to users with matching skills and services
    try {
      await notifyUsersForNewActivity(activity._id);
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the activity creation if notifications fail
    }

    return res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: createdActivity
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all activities with filtering and pagination
export const getAllActivities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      location,
      skills,
      services,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by location
    if (location) {
      if (location.province) query["location.province"] = location.province;
      if (location.municipality) query["location.municipality"] = location.municipality;
      if (location.barangay) query["location.barangay"] = location.barangay;
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(",");
      query.requiredSkills = { $in: skillsArray };
    }

    // Filter by services
    if (services) {
      const servicesArray = services.split(",");
      query.requiredServices = { $in: servicesArray };
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination info
    const total = await Activity.countDocuments(query);

    // Get activities with pagination
    const activities = await Activity.find(query)
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate([
        { path: "createdBy", select: "givenName familyName email" },
        { path: "participants.userId", select: "givenName familyName email" },
      ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    const paginationInfo = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage,
    };

    return res.status(200).json({
      success: true,
      message: "Activities retrieved successfully",
      data: activities,
      pagination: paginationInfo
    });
  } catch (error) {
    console.error("Error in getAllActivities:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get activity by ID
export const getActivityById = async (req, res) => {
  const { id } = req.params;

  const activity = await Activity.findById(id)
    .populate("createdBy", "givenName familyName email")
    .populate("participants.userId", "givenName familyName email");

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Activity retrieved successfully",
    data: activity
  });
};

// Update activity (Admin/Staff only)
export const updateActivity = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if user has permission to update activities
  if (!["admin", "staff"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Only admin and staff can update activities",
    });
  }

  const activity = await Activity.findById(id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  // Check if user is the creator or has admin role
  if (activity.createdBy.toString() !== req.user.userId.toString() && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You can only update activities you created",
    });
  }

  // Remove fields that shouldn't be updated
  delete updateData.createdBy;
  delete updateData.participants;
  delete updateData.currentParticipants;
  // Prevent status changes here; must use dedicated endpoint with transition rules
  if (typeof updateData.status !== 'undefined') {
    delete updateData.status;
  }

  const updatedActivity = await Activity.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate("createdBy", "givenName familyName email")
   .populate("participants.userId", "givenName familyName email");

  // Send notifications to existing participants about activity updates
  if (updatedActivity.participants.length > 0) {
    try {
      await notifyActivityParticipants(updatedActivity._id, "activity_update", {
        title: "Activity Updated",
        message: `The activity "${updatedActivity.title}" has been updated. Please check the new details.`
      });
    } catch (notificationError) {
      console.error('Error sending update notifications to participants:', notificationError);
      // Don't fail the update if notifications fail
    }
  }

  return res.status(200).json({
    success: true,
    message: "Activity updated successfully",
    data: updatedActivity
  });
};

// Delete activity (Admin/Staff only)
export const deleteActivity = async (req, res) => {
  const { id } = req.params;

  // Check if user has permission to delete activities
  if (!["admin", "staff"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Only admin and staff can delete activities",
    });
  }

  const activity = await Activity.findById(id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  // Check if user is the creator or has admin role
  if (activity.createdBy.toString() !== req.user.userId.toString() && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You can only delete activities you created",
    });
  }

  // Check if activity has participants
  if (activity.participants.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete activity with registered participants",
    });
  }

  await Activity.findByIdAndDelete(id);

  return res.status(200).json(
    {success: true,
    message: "Activity deleted successfully",}
  );
};

// Join activity (Volunteers only)
export const joinActivity = async (req, res) => {
  const { id } = req.params;

  // Check if user is a volunteer
  if (req.user.role !== "volunteer") {
    return res.status(403).json({
      success: false,
      message: "Only volunteers can join activities",
    });
  }

  const activity = await Activity.findById(id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  // Check if activity is published
  if (activity.status !== "published") {
    return res.status(400).json({
      success: false,
      message: "Activity is not available for joining",
    });
  }

  // Check if activity is in the past
  const now = new Date();
  const activityDate = new Date(activity.date);

  // Set the activity start and end times for the date
  const [startHours, startMinutes] = activity.timeFrom.split(':').map(Number);
  const [endHours, endMinutes] = activity.timeTo.split(':').map(Number);

  const activityStartTime = new Date(activityDate);
  activityStartTime.setHours(startHours, startMinutes, 0, 0);

  const activityEndTime = new Date(activityDate);
  activityEndTime.setHours(endHours, endMinutes, 0, 0);

  // Check if current time is after the activity end time
  if (now > activityEndTime) {
    return res.status(400).json({
      success: false,
      message: "Cannot join activities that have already ended",
    });
  }

  // Check if activity is starting very soon (within the next hour)
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  if (now > activityStartTime && now < oneHourFromNow) {
    return res.status(400).json({
      success: false,
      message: "Activity is starting soon. Please contact the organizer for late registration.",
    });
  }

  // Check if activity is full
  if (activity.currentParticipants >= activity.maxParticipants) {
    return res.status(400).json({
      success: false,
      message: "Activity is already full",
    });
  }

  // Check if user is already registered
  const isAlreadyRegistered = activity.participants.some(
    (p) => p.userId.toString() === req.user.userId.toString()
  );

  if (isAlreadyRegistered) {
    return res.status(400).json({
      success: false,
      message: "You are already registered for this activity",
    });
  }

  // Add user to participants
  await activity.addParticipant(req.user.userId);

  const updatedActivity = await Activity.findById(id)
    .populate("createdBy", "givenName familyName email")
    .populate("participants.userId", "givenName familyName email");

  // Send notification to activity creator about new participant
  try {
    if (updatedActivity.createdBy._id.toString() !== req.user.userId.toString()) {
      // Get user details for notification
      const user = await User.findById(req.user.userId);
      const userName = user ? `${user.givenName} ${user.familyName}` : 'Unknown User';

      await Notification.createNewParticipantNotification(
        updatedActivity.createdBy._id,
        id,
        updatedActivity.title,
        userName
      );
    }
  } catch (notificationError) {
    console.error('Error sending notification to activity creator:', notificationError);
    // Don't fail the join operation if notifications fail
  }

  return res.status(200).json(
    {success: true,
    message: "Successfully joined activity",}
  );
};

// Leave activity (Volunteers only)
export const leaveActivity = async (req, res) => {
  const { id } = req.params;

  // Check if user is a volunteer
  if (req.user.role !== "volunteer") {
    return res.status(403).json({
      success: false,
      message: "Only volunteers can leave activities",
    });
  }

  const activity = await Activity.findById(id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  // Check if user is registered
  const isRegistered = activity.participants.some(
    (p) => p.userId.toString() === req.user.userId.toString()
  );

  if (!isRegistered) {
    return res.status(400).json({
      success: false,
      message: "You are not registered for this activity",
    });
  }

  // Remove user from participants
  await activity.removeParticipant(req.user.userId);

  const updatedActivity = await Activity.findById(id)
    .populate("createdBy", "givenName familyName email")
    .populate("participants.userId", "givenName familyName email");

  // Send notification to activity creator about participant leaving
  try {
    if (updatedActivity.createdBy._id.toString() !== req.user.userId.toString()) {
      // Get user details for notification
      const user = await User.findById(req.user.userId);
      const userName = user ? `${user.givenName} ${user.familyName}` : 'Unknown User';

      await Notification.createParticipantLeftNotification(
        updatedActivity.createdBy._id,
        id,
        updatedActivity.title,
        userName
      );
    }
  } catch (notificationError) {
    console.error('Error sending notification to activity creator:', notificationError);
    // Don't fail the leave operation if notifications fail
  }

  return res.status(200).json(
    {success: true,
    message: "Successfully left activity",}
  );
};

// Get user's joined activities
export const getMyActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.userId;

    const query = {
      "participants.userId": userId,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination info
    const total = await Activity.countDocuments(query);

    // Get activities with pagination
    const activities = await Activity.find(query)
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate([
        { path: "createdBy", select: "givenName familyName email" },
        { path: "participants.userId", select: "givenName familyName email" },
      ]);

    // Add current user's participant data to each activity
    const activitiesWithUserData = activities.map(activity => {
      const userParticipant = activity.participants.find(
        p => p.userId._id.toString() === userId.toString()
      );

      return {
        ...activity.toObject(),
        userParticipant: userParticipant ? {
          timeIn: userParticipant.timeIn,
          timeOut: userParticipant.timeOut,
          totalHours: userParticipant.totalHours,
          status: userParticipant.status,
          joinedAt: userParticipant.joinedAt
        } : null
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    const paginationInfo = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage,
    };

    return res.status(200).json({
      success: true,
      message: "Your activities retrieved successfully",
      data: activitiesWithUserData,
      pagination: paginationInfo
    });
  } catch (error) {
    console.error("Error in getMyActivities:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get member status summary (Volunteers only)
export const getMyStatusSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

    // Find activities the user attended
    const attendedActivities = await Activity.find({
      participants: { $elemMatch: { userId, status: "attended" } },
      date: { $lte: now },
    }).select("date requiredServices participants");

    let lastAttendedDate = null;
    let hoursServedThisYear = 0;
    const servicesJoinedSet = new Set();

    attendedActivities.forEach((activity) => {
      const participant = activity.participants.find(
        (p) => p.userId && p.userId.toString() === userId.toString()
      );
      if (!participant || participant.status !== "attended") return;

      // Track last attended date based on activity date
      if (!lastAttendedDate || activity.date > lastAttendedDate) {
        lastAttendedDate = new Date(activity.date);
      }

      // Sum hours within current year
      if (new Date(activity.date) >= startOfYear) {
        hoursServedThisYear += Number(participant.totalHours || 0);
      }

      // Aggregate services from attended activities
      if (Array.isArray(activity.requiredServices)) {
        activity.requiredServices.forEach((s) => servicesJoinedSet.add(s));
      }
    });

    // Determine active/inactive based on last attendance within 6 months (≈180 days)
    const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
    const isActive = !!lastAttendedDate && now - lastAttendedDate <= SIX_MONTHS_MS;

    // Get user contact info
    const user = await User.findById(userId).select(
      "personalInfo.mobileNumber personalInfo.contactNumber givenName familyName"
    );
    const contactNumber =
      user?.personalInfo?.mobileNumber || user?.personalInfo?.contactNumber || null;

    // Determine training status from latest volunteer application
    let trainedStatus = "Not Trained";
    try {
      const latestApplication = await VolunteerApplication.getLatestByApplicant(
        userId
      );
      if (latestApplication) {
        const yes = (val) =>
          val === "yes" || val === true || val === "yes_i_agree";
        const trained =
          yes(latestApplication.underwentBasicVolunteerOrientation) ||
          yes(latestApplication.underwentBasicRC143OrientationTraining);
        trainedStatus = trained ? "Trained" : "Not Trained";
      }
    } catch (e) {
      // Ignore application lookup errors for status computation
    }

    return res.status(200).json({
      success: true,
      message: "Member status summary retrieved successfully",
      data: {
        trainedStatus,
        lastActivityDate: lastAttendedDate,
        activeStatus: isActive ? "Active" : "Inactive",
        hoursServedThisYear: Math.round(hoursServedThisYear * 100) / 100,
        services: Array.from(servicesJoinedSet),
        contactNumber,
      },
    });
  } catch (error) {
    console.error("Error in getMyStatusSummary:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin: Get member status summary for all volunteers (with basic filters)
export const getMembersStatusSummary = async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only admin and staff can view member status' });
    }

    const { search = '', barangay = '', municipality = '', service = '', status = '' } = req.query;

    // Base user query
    const userQuery = { role: 'volunteer' };
    if (search) {
      userQuery.$or = [
        { givenName: { $regex: search, $options: 'i' } },
        { familyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (barangay) userQuery['personalInfo.address.districtBarangayVillage'] = barangay;
    if (municipality) userQuery['personalInfo.address.municipalityCity'] = municipality;
    if (service) userQuery['services.type'] = service;

    const volunteers = await User.find(userQuery).select(
      'givenName familyName personalInfo services createdAt'
    );

    const now = new Date();
    const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

    const results = [];
    for (const user of volunteers) {
      // Anniversary-based yearly period start (resets each year on signup date)
      const signup = new Date(user.createdAt || now);
      const currYear = now.getFullYear();
      let periodStart = new Date(currYear, signup.getMonth(), signup.getDate(), 0, 0, 0, 0);
      if (now < periodStart) {
        periodStart = new Date(currYear - 1, signup.getMonth(), signup.getDate(), 0, 0, 0, 0);
      }

      // Find activities where the user attended
      const activities = await Activity.find({
        'participants.userId': user._id,
        date: { $lte: now },
      }).select('date participants requiredServices');

      let lastAttendedDate = null;
      let hoursServedThisYear = 0;

      activities.forEach((activity) => {
        const participant = activity.participants.find(
          (p) => p.userId && p.userId.toString() === user._id.toString()
        );
        if (!participant || participant.status !== 'attended') return;

        if (!lastAttendedDate || activity.date > lastAttendedDate) {
          lastAttendedDate = new Date(activity.date);
        }
        if (new Date(activity.date) >= periodStart) {
          hoursServedThisYear += Number(participant.totalHours || 0);
        }
      });

      const isActive = !!lastAttendedDate && now - lastAttendedDate <= SIX_MONTHS_MS;

      const services = (user.services || [])
        .map((s) => (typeof s === 'string' ? s : s?.type))
        .filter(Boolean);

      const contactNumber =
        user?.personalInfo?.mobileNumber || user?.personalInfo?.contactNumber || null;
      const barangayName = user?.personalInfo?.address?.districtBarangayVillage || null;
      const municipalityName = user?.personalInfo?.address?.municipalityCity || null;

      const record = {
        userId: user._id,
        name: `${user.givenName} ${user.familyName}`.trim(),
        address: {
          barangay: barangayName,
          municipality: municipalityName,
        },
        services,
        hoursServedThisYear: Math.round(hoursServedThisYear * 100) / 100,
        contactNumber,
        status: isActive ? 'Active' : 'Inactive',
        lastActivityDate: lastAttendedDate,
      };

      results.push(record);
    }

    // Post-filter by active/inactive if requested
    let filtered = results;
    if (status) {
      filtered = filtered.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    }

    return res.status(200).json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error in getMembersStatusSummary:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update activity status (Admin/Staff only)
export const updateActivityStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if user has permission
  if (!["admin", "staff"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Only admin and staff can update activity status",
    });
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  const validStatuses = ["draft", "published", "ongoing", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  const activity = await Activity.findById(id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  // Check if user is the creator or has admin role
  if (activity.createdBy.toString() !== req.user.userId.toString() && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You can only update activities you created",
    });
  }

  // Enforce forward-only transitions and lock terminal states
  const STATUS_ORDER = ["draft", "published", "ongoing", "completed", "cancelled"]; // index increases forward
  const currentIndex = STATUS_ORDER.indexOf(activity.status);
  const nextIndex = STATUS_ORDER.indexOf(status);

  // If current is completed or cancelled, disallow any further changes
  if (["completed", "cancelled"].includes(activity.status)) {
    return res.status(400).json({
      success: false,
      message: "Cannot change status after completion or cancellation",
    });
  }

  // Disallow moving backwards
  if (nextIndex < currentIndex) {
    return res.status(400).json({
      success: false,
      message: "Status cannot be reverted to a previous state",
    });
  }

  // Disallow transitioning from ongoing to cancelled
  if (activity.status === 'ongoing' && status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: "Cannot cancel an ongoing activity",
    });
  }

  // Update status
  const updatedActivity = await Activity.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("createdBy", "givenName familyName email")
   .populate("participants.userId", "givenName familyName email");

  // If status is completed, finalize attendance
  if (status === 'completed') {
    await updatedActivity.finalizeAttendance();
  }

  // Send notifications when activity is published (made available for joining)
  if (status === "published" && activity.status !== "published") {
    try {
      await notifyUsersForNewActivity(id);
    } catch (notificationError) {
      console.error('Error sending notifications for published activity:', notificationError);
      // Don't fail the status update if notifications fail
    }
  }

  // Send notifications when activity is cancelled
  if (status === "cancelled") {
    try {
      await notifyActivityParticipants(id, "activity_cancelled", {
        title: "Activity Cancelled",
        message: `The activity "${activity.title}" has been cancelled.`
      });
    } catch (notificationError) {
      console.error('Error sending cancellation notifications:', notificationError);
      // Don't fail the status update if notifications fail
    }
  }

  return res.status(200).json(
    {success: true,
    message: "Activity status updated successfully",}
  );
};

// Get activities by creator (Admin/Staff only)
export const getActivitiesByCreator = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Check if user has permission
    if (!["admin", "staff"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only admin and staff can view their created activities",
      });
    }

    const query = {
      createdBy: req.user.userId,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination info
    const total = await Activity.countDocuments(query);

    // Get activities with pagination
    const activities = await Activity.find(query)
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate([
        { path: "createdBy", select: "givenName familyName email" },
        { path: "participants.userId", select: "givenName familyName email" },
      ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    const paginationInfo = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage,
    };

    return res.status(200).json({
      success: true,
      message: "Your created activities retrieved successfully",
      data: activities,
      pagination: paginationInfo
    });
  } catch (error) {
    console.error("Error in getActivitiesByCreator:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// QR Code Attendance Tracking (Admin/Staff only)
export const recordAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { qrData, action } = req.body;

    // Check if user has permission
    if (!["admin", "staff"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only admin and staff can record attendance",
      });
    }

    if (!qrData || !action) {
      return res.status(400).json({
        success: false,
        message: "QR data and action are required",
      });
    }

    if (!["timeIn", "timeOut"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'timeIn' or 'timeOut'",
      });
    }

    // Parse QR data (should contain userId, name, etc.)
    let parsedQRData;
    try {
      parsedQRData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code data format",
      });
    }

    const { userId, activityId } = parsedQRData;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "QR code data must contain userId",
      });
    }

    // Validate that the QR code is for the correct activity
    if (activityId && activityId !== id) {
      return res.status(400).json({
        success: false,
        message: "QR code is for a different activity",
      });
    }

    // Find the activity
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Check if user is the creator or has admin role
    if (activity.createdBy.toString() !== req.user.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only record attendance for activities you created",
      });
    }

    // Check if user is registered for the activity
    const participant = activity.participants.find(
      p => p.userId.toString() === userId
    );

    if (!participant) {
      return res.status(400).json({
        success: false,
        message: "User is not registered for this activity",
      });
    }

    let result;
    if (action === "timeIn") {
      result = await activity.recordTimeIn(userId);
    } else if (action === "timeOut") {
      result = await activity.recordTimeOut(userId);
    }

    // Send notification to the user about attendance recording
    try {
      const user = await User.findById(userId);
      if (user && user.shouldReceiveNotification('time_tracking')) {
        await Notification.createTimeTrackingNotification(
          userId,
          id,
          activity.title,
          action
        );
      }
    } catch (notificationError) {
      console.error('Error sending attendance notification:', notificationError);
      // Don't fail the attendance recording if notifications fail
    }

    const updatedActivity = await Activity.findById(id)
      .populate("createdBy", "givenName familyName email")
      .populate("participants.userId", "givenName familyName email");

    return res.status(200).json({
      success: true,
      message: `Attendance ${action} recorded successfully`,
      data: {
        participant: {
          userId: participant.userId,
          name: `${parsedQRData.name || 'Unknown'}`,
          action: action,
          timestamp: action === 'timeIn' ? participant.timeIn : participant.timeOut
        }
      }
    });
  } catch (error) {
    console.error('Error recording attendance:', error);

    // Handle specific activity model errors
    if (error.message.includes('already recorded')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('must be recorded before')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get attendance report for an activity (Admin/Staff only)
export const getAttendanceReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has permission
    if (!["admin", "staff"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only admin and staff can view attendance reports",
      });
    }

    const activity = await Activity.findById(id)
      .populate("participants.userId", "givenName familyName email personalInfo")
      .populate("createdBy", "givenName familyName email");

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Check if user is the creator or has admin role
    if (activity.createdBy._id.toString() !== req.user.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only view attendance reports for activities you created",
      });
    }

    // Format attendance data
    const attendanceData = activity.participants.map(participant => ({
      userId: participant.userId._id,
      name: `${participant.userId.givenName} ${participant.userId.familyName}`,
      email: participant.userId.email,
      contactNumber: participant.userId.personalInfo?.mobileNumber || participant.userId.personalInfo?.contactNumber,
      joinedAt: participant.joinedAt,
      status: participant.status,
      timeIn: participant.timeIn,
      timeOut: participant.timeOut,
      totalHours: participant.totalHours,
    }));

    const report = {
      activity: {
        id: activity._id,
        title: activity.title,
        date: activity.date,
        timeFrom: activity.timeFrom,
        timeTo: activity.timeTo,
        location: activity.location,
      },
      attendance: attendanceData,
      summary: {
        totalRegistered: activity.participants.length,
        totalAttended: activity.participants.filter(p => p.status === 'attended').length,
        totalAbsent: activity.participants.filter(p => p.status === 'absent').length,
        averageHours: activity.participants
          .filter(p => p.totalHours > 0)
          .reduce((sum, p) => sum + p.totalHours, 0) /
          activity.participants.filter(p => p.totalHours > 0).length || 0,
      }
    };

    return res.status(200).json({
      success: true,
      message: "Attendance report retrieved successfully",
      data: report
    });
  } catch (error) {
    console.error('Error getting attendance report:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get activities for volunteers with skill matching prioritization
export const getVolunteerActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const userId = req.user.userId;

    // Get user profile to extract skills and services
    const user = await User.findById(userId).select('skills services');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const userSkills = user.skills || [];
    const userServices = user.services || [];

    // Build base query for available activities
    const baseQuery = {
      status: { $in: ['published', 'ongoing'] } // Only show published and ongoing activities
    };

    // Build final query
    let query = { ...baseQuery };

    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Add search filter if provided
    if (search) {
      query = {
        $and: [
          query,
          {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
            ]
          }
        ]
      };
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination info
    const total = await Activity.countDocuments(query);

    // Get activities with pagination
    const activities = await Activity.find(query)
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate([
        { path: "createdBy", select: "givenName familyName email" },
        { path: "participants.userId", select: "givenName familyName email" },
      ]);

    // Calculate skill and service matching scores for prioritization
    const activitiesWithScores = activities.map(activity => {
      let skillMatchScore = 0;
      let serviceMatchScore = 0;
      let totalScore = 0;

      // Calculate skill matching score
      if (activity.requiredSkills && userSkills.length > 0) {
        const matchingSkills = activity.requiredSkills.filter(skill =>
          userSkills.includes(skill)
        );
        skillMatchScore = (matchingSkills.length / activity.requiredSkills.length) * 100;
      }

      // Calculate service matching score
      if (activity.requiredServices && userServices.length > 0) {
        const matchingServices = activity.requiredServices.filter(service =>
          userServices.includes(service)
        );
        serviceMatchScore = (matchingServices.length / activity.requiredServices.length) * 100;
      }

      // Calculate total score (weighted average)
      if (activity.requiredSkills && activity.requiredServices) {
        totalScore = (skillMatchScore + serviceMatchScore) / 2;
      } else if (activity.requiredSkills) {
        totalScore = skillMatchScore;
      } else if (activity.requiredServices) {
        totalScore = serviceMatchScore;
      }

      return {
        ...activity.toObject(),
        skillMatchScore: Math.round(skillMatchScore),
        serviceMatchScore: Math.round(serviceMatchScore),
        totalScore: Math.round(totalScore),
        isJoined: activity.participants.some(p => p.userId._id.toString() === userId),
        participantCount: activity.participants.length,
        maxParticipants: activity.maxParticipants || 0
      };
    });

    // Sort by total score (highest first), then by date
    activitiesWithScores.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return new Date(a.date) - new Date(b.date);
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    const paginationInfo = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage,
    };

          return res.status(200).json({
        success: true,
        message: "Volunteer activities retrieved successfully",
        data: activitiesWithScores,
        pagination: paginationInfo,
      userSkills,
      userServices
    });
  } catch (error) {
    console.error("Error in getVolunteerActivities:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
