import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // User who receives the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Activity that triggered the notification
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "activity_match", // Skills/services match with activity
        "activity_reminder", // Reminder about upcoming activity
        "time_tracking", // Time in/out related
        "activity_update", // Activity details changed
        "activity_cancelled", // Activity cancelled
        "new_participant", // New participant joined
        "participant_left", // Participant left
        "general" // General notifications
      ],
      default: "activity_match",
    },

    // Notification title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Notification message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Whether the notification has been read
    isRead: {
      type: Boolean,
      default: false,
    },

    // Whether the notification has been sent via email
    isEmailSent: {
      type: Boolean,
      default: false,
    },

    // Additional data for the notification
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // When the notification expires (optional)
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Static method to create activity match notification
notificationSchema.statics.createActivityMatchNotification = function(recipientId, activityId, activityTitle) {
  return this.create({
    recipient: recipientId,
    activity: activityId,
    type: "activity_match",
    title: "New Activity Matches Your Skills!",
    message: `A new activity "${activityTitle}" matches your skills and services. Check it out and consider joining!`,
    metadata: {
      activityTitle,
      notificationType: "skill_match"
    }
  });
};

// Static method to create activity reminder notification
notificationSchema.statics.createActivityReminderNotification = function(recipientId, activityId, activityTitle, activityDate) {
  return this.create({
    recipient: recipientId,
    activity: activityId,
    type: "activity_reminder",
    title: "Activity Reminder",
    message: `Reminder: You have an upcoming activity "${activityTitle}" on ${new Date(activityDate).toLocaleDateString()}`,
    metadata: {
      activityTitle,
      activityDate,
      notificationType: "reminder"
    }
  });
};

// Static method to create time tracking notification
notificationSchema.statics.createTimeTrackingNotification = function(recipientId, activityId, activityTitle, action) {
  const actionText = action === 'timeIn' ? 'Time In' : 'Time Out';
  return this.create({
    recipient: recipientId,
    activity: activityId,
    type: "time_tracking",
    title: `Activity ${actionText} Recorded`,
    message: `Your ${actionText.toLowerCase()} has been recorded for activity "${activityTitle}"`,
    metadata: {
      activityTitle,
      action,
      notificationType: "time_tracking"
    }
  });
};

// Static method to create new participant notification
notificationSchema.statics.createNewParticipantNotification = function(recipientId, activityId, activityTitle, participantName) {
  return this.create({
    recipient: recipientId,
    activity: activityId,
    type: "new_participant",
    title: "New Participant Joined",
    message: `${participantName} has joined your activity "${activityTitle}"`,
    metadata: {
      activityTitle,
      participantName,
      notificationType: "new_participant"
    }
  });
};

// Static method to create participant left notification
notificationSchema.statics.createParticipantLeftNotification = function(recipientId, activityId, activityTitle, participantName) {
  return this.create({
    recipient: recipientId,
    activity: activityId,
    type: "participant_left",
    title: "Participant Left Activity",
    message: `${participantName} has left your activity "${activityTitle}"`,
    metadata: {
      activityTitle,
      participantName,
      notificationType: "participant_left"
    }
  });
};

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to mark notification as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  return this.save();
};

// Method to mark email as sent
notificationSchema.methods.markEmailAsSent = function() {
  this.isEmailSent = true;
  return this.save();
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadNotifications = function(userId) {
  return this.find({
    recipient: userId,
    isRead: false
  }).sort({ createdAt: -1 });
};

// Static method to get all notifications for a user
notificationSchema.statics.getUserNotifications = function(userId, limit = 50) {
  return this.find({
    recipient: userId
  }).sort({ createdAt: -1 }).limit(limit);
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

// Static method to delete expired notifications
notificationSchema.statics.deleteExpiredNotifications = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
