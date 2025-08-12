import User from "../models/user.model.js";
import Activity from "../models/activity.model.js";
import Notification from "../models/notification.model.js";
import { sendActivityMatchEmail, sendActivityReminderEmail, sendGeneralNotificationEmail, sendApplicationAcceptedEmail } from "./email.service.js";

// Service to notify users about new activities that match their skills/services
export const notifyUsersForNewActivity = async (activityId) => {
  try {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    // Find all users who have matching skills or services
    const eligibleUsers = await User.find({
      $or: [
        { skills: { $in: activity.requiredSkills } },
        { 'services.type': { $in: activity.requiredServices } }
      ],
      role: 'volunteer',
      isProfileComplete: true
    });

    const notifications = [];
    const emailPromises = [];

    for (const user of eligibleUsers) {
      // Check if user should receive notifications
      if (user.shouldReceiveNotification('activity_match')) {
        // Create notification
        const notification = await Notification.createActivityMatchNotification(
          user._id,
          activity._id,
          activity.title
        );
        notifications.push(notification);

        // Send email notification
        if (user.notificationPreferences.emailNotifications) {
          const emailPromise = sendActivityMatchEmail(
            user.email,
            user.givenName,
            activity.title,
            activity.description,
            activity.date,
            activity.location,
            user.getActivityMatchPercentage(activity.requiredSkills, activity.requiredServices)
          );
          emailPromises.push(emailPromise);
        }
      }
    }

    // Send all emails
    await Promise.all(emailPromises);

    return {
      success: true,
      message: `Created ${notifications.length} notifications for ${eligibleUsers.length} eligible users`,
      notificationsCount: notifications.length,
      eligibleUsersCount: eligibleUsers.length
    };

  } catch (error) {
    console.error('Error notifying users for new activity:', error);
    throw error;
  }
};

// Service to send activity reminders to registered participants
export const sendActivityReminders = async (activityId) => {
  try {
    const activity = await Activity.findById(activityId).populate('participants.userId');
    if (!activity) {
      throw new Error('Activity not found');
    }

    const notifications = [];
    const emailPromises = [];

    for (const participant of activity.participants) {
      const user = participant.userId;

      if (user && user.shouldReceiveNotification('activity_reminder')) {
        // Create reminder notification
        const notification = await Notification.createActivityReminderNotification(
          user._id,
          activity._id,
          activity.title,
          activity.date
        );
        notifications.push(notification);

        // Send email reminder
        if (user.notificationPreferences.emailNotifications) {
          const emailPromise = sendActivityReminderEmail(
            user.email,
            user.givenName,
            activity.title,
            activity.date,
            activity.timeFrom,
            activity.timeTo,
            activity.location
          );
          emailPromises.push(emailPromise);
        }
      }
    }

    // Send all emails
    await Promise.all(emailPromises);

    return {
      success: true,
      message: `Sent ${notifications.length} reminder notifications`,
      notificationsCount: notifications.length
    };

  } catch (error) {
    console.error('Error sending activity reminders:', error);
    throw error;
  }
};

// Service to create time tracking notifications
export const createTimeTrackingNotification = async (userId, activityId, action) => {
  try {
    const [user, activity] = await Promise.all([
      User.findById(userId),
      Activity.findById(activityId)
    ]);

    if (!user || !activity) {
      throw new Error('User or activity not found');
    }

    if (user.shouldReceiveNotification('time_tracking')) {
      const notification = await Notification.createTimeTrackingNotification(
        user._id,
        activity._id,
        activity.title,
        action
      );

      return {
        success: true,
        notification
      };
    }

    return {
      success: true,
      message: 'User has disabled time tracking notifications'
    };

  } catch (error) {
    console.error('Error creating time tracking notification:', error);
    throw error;
  }
};

// Service to get user notifications
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const notifications = await Notification.getUserNotifications(userId, limit);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return {
      success: true,
      notifications,
      unreadCount
    };

  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Service to mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }
    if (!notification.recipient) {
      throw new Error('Notification recipient not found');
    }
    if (!userId) {
      throw new Error('User ID not provided');
    }

    if (notification.recipient.toString() !== userId.toString()) {
      throw new Error('Unauthorized to modify this notification');
    }

    await notification.markAsRead();

    return {
      success: true,
      message: 'Notification marked as read'
    };

  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Service to mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    await Notification.markAllAsRead(userId);

    return {
      success: true,
      message: 'All notifications marked as read'
    };

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Service to update user notification preferences
export const updateUserNotificationPreferences = async (userId, preferences) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.updateNotificationPreferences(preferences);

    return {
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: user.notificationPreferences
    };

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

// Service to notify activity participants about updates
export const notifyActivityParticipants = async (activityId, notificationType, notificationData) => {
  try {
    const activity = await Activity.findById(activityId).populate('participants.userId');
    if (!activity) {
      throw new Error('Activity not found');
    }

    const notifications = [];
    const emailPromises = [];

    for (const participant of activity.participants) {
      const user = participant.userId;

      if (user && user.shouldReceiveNotification('general')) {
        // Create notification based on type
        let notification;
        switch (notificationType) {
          case 'activity_update':
            notification = await Notification.create({
              recipient: user._id,
              activity: activityId,
              type: 'activity_update',
              title: notificationData.title,
              message: notificationData.message,
              metadata: {
                activityTitle: activity.title,
                notificationType: 'activity_update'
              }
            });
            break;
          case 'activity_cancelled':
            notification = await Notification.create({
              recipient: user._id,
              activity: activityId,
              type: 'activity_cancelled',
              title: notificationData.title,
              message: notificationData.message,
              metadata: {
                activityTitle: activity.title,
                notificationType: 'activity_cancelled'
              }
            });
            break;
          default:
            notification = await Notification.create({
              recipient: user._id,
              activity: activityId,
              type: 'general',
              title: notificationData.title,
              message: notificationData.message,
              metadata: {
                activityTitle: activity.title,
                notificationType: 'general'
              }
            });
        }

        notifications.push(notification);

        // Send email notification if enabled
        if (user.notificationPreferences.emailNotifications) {
          const emailPromise = sendGeneralNotificationEmail(
            user.email,
            user.givenName,
            notificationData.title,
            notificationData.message,
            activity.title
          );
          emailPromises.push(emailPromise);
        }
      }
    }

    // Send all emails
    await Promise.all(emailPromises);

    return {
      success: true,
      message: `Sent ${notifications.length} notifications to participants`,
      notificationsCount: notifications.length
    };

  } catch (error) {
    console.error('Error notifying activity participants:', error);
    throw error;
  }
};

// Service: notify user on application acceptance (in-app + email)
export const notifyApplicationAccepted = async (user) => {
  try {
    if (!user) throw new Error('User not provided');

    // Send email first (do not block on in-app notification)
    if (user.notificationPreferences?.emailNotifications !== false) {
      await sendApplicationAcceptedEmail(user.email, user.givenName || 'Volunteer', user._id);
    }

    // Create in-app notification (no activity required)
    const notification = await Notification.create({
      recipient: user._id,
      type: 'application_accepted',
      title: 'Application Accepted',
      message: 'Congratulations! Your volunteer application has been accepted.',
      metadata: { notificationType: 'application_accepted' },
    });

    return { success: true, notificationId: notification._id };
  } catch (error) {
    console.error('Error notifying application acceptance:', error);
    return { success: false, message: error.message };
  }
};

// Service to clean up expired notifications
export const cleanupExpiredNotifications = async () => {
  try {
    const result = await Notification.deleteExpiredNotifications();

    return {
      success: true,
      message: `Cleaned up ${result.deletedCount} expired notifications`,
      deletedCount: result.deletedCount
    };

  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    throw error;
  }
};
