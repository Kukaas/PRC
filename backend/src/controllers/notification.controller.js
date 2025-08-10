import User from "../models/user.model.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  updateUserNotificationPreferences,
  cleanupExpiredNotifications
} from "../services/notification.service.js";

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const userId = req.user.id;

    const result = await getUserNotifications(userId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await markNotificationAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Update notification preferences
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    const result = await updateUserNotificationPreferences(userId, preferences);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        preferences: result.preferences
      }
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
};

// Get notification preferences
export const getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with notification preferences
    const user = await User.findById(userId).select('notificationPreferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        preferences: user.notificationPreferences
      }
    });

  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message
    });
  }
};

// Cleanup expired notifications (admin only)
export const cleanupNotifications = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const result = await cleanupExpiredNotifications();

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup notifications',
      error: error.message
    });
  }
};
