import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
export const PSGC_API_URL = import.meta.env.VITE_PSGC_API || "https://psgc.gitlab.io/api";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;

      // For forgot password, return the response data even for 404
      if (error.response.status === 404 && error.config.url?.includes('/forgot-password')) {
        return errorData;
      }

      // Don't throw errors for 401/403 during auth check to prevent automatic logout
      if (error.response.status === 401 || error.response.status === 403) {
        // Create a custom error that can be handled by the calling code
        const customError = new Error(
          errorData.message || `HTTP error! status: ${error.response.status}`
        );
        customError.status = error.response.status;
        customError.response = error.response;
        throw customError;
      }

      throw new Error(
        errorData.message || `HTTP error! status: ${error.response.status}`
      );
    } else if (error.request) {
      // Request was made but no response received
      const networkError = new Error("No response received from server");
      networkError.isNetworkError = true;
      throw networkError;
    } else {
      // Something else happened
      throw new Error(error.message || "Request failed");
    }
  }
);

export const api = {
  auth: {
    signup: (data) => apiClient.post("/auth/signup", data),
    login: (data) => apiClient.post("/auth/login", data),
    logout: () => apiClient.post("/auth/logout"),
    resendVerification: (data) =>
      apiClient.post("/auth/resend-verification", data),
    verifyEmail: (token) => apiClient.get(`/auth/verify-email/${token}`),
    getProfile: () => apiClient.get("/auth/profile"),
    forgotPassword: (data) => apiClient.post("/auth/forgot-password", data),
    resetPassword: (data) => apiClient.post("/auth/reset-password", data),
  },
  profile: {
    update: (data) => apiClient.put("/profile/update", data),
    getCompletionStatus: () => apiClient.get("/profile/completion-status"),
    getSetupStatus: () => apiClient.get("/profile/setup-status"),
    updatePhoto: (photoData) => apiClient.put("/profile/photo", photoData),
  },
  volunteerApplication: {
    submit: (data) => apiClient.post("/volunteer-application/submit", data),
    resubmit: (data) => apiClient.post("/volunteer-application/resubmit", data),
    canResubmit: () => apiClient.get("/volunteer-application/can-resubmit"),
    getMyApplication: () => apiClient.get("/volunteer-application/my-application"),
    update: (data) => apiClient.put("/volunteer-application/update", data),
    delete: (id) => apiClient.delete(`/volunteer-application/delete/${id}`),
    // Admin routes
    getAll: (params) => apiClient.get("/volunteer-application/admin/all", { params }),
    getById: (id) => apiClient.get(`/volunteer-application/admin/${id}`),
    updateStatus: (id, data) => apiClient.put(`/volunteer-application/admin/${id}/status`, data),
    getStats: () => apiClient.get("/volunteer-application/admin/stats"),
    sendTrainingNotification: (id, data) => apiClient.post(`/volunteer-application/admin/${id}/training-notification`, data),
    updateTrainingStatus: (id, data) => apiClient.put(`/volunteer-application/admin/${id}/training-status`, data),
    bulkSendTrainingNotifications: (data) => apiClient.post(`/volunteer-application/admin/bulk-training-notification`, data),
  },
  activities: {
    // Public routes
    getAll: (params) => apiClient.get("/activities", { params }),
    getById: (id) => apiClient.get(`/activities/${id}`),
    getMyActivities: (params) => apiClient.get("/activities/my-activities", { params }),
    getVolunteerActivities: (params) => apiClient.get("/activities/volunteer-activities", { params }),
    getMyStatus: () => apiClient.get("/activities/my-status"),
    getMembersStatus: (params) => apiClient.get("/activities/members-status", { params }),
    join: (id) => apiClient.post(`/activities/${id}/join`),
    leave: (id) => apiClient.post(`/activities/${id}/leave`),

    // Admin/Staff routes
    create: (data) => apiClient.post("/activities", data),
    update: (id, data) => apiClient.put(`/activities/${id}`, data),
    delete: (id) => apiClient.delete(`/activities/${id}`),
    getCreated: (params) => apiClient.get("/activities/created", { params }),
    updateStatus: (id, data) => apiClient.patch(`/activities/${id}/status`, data),

    // Attendance routes
    recordAttendance: (activityId, data) => apiClient.post(`/activities/${activityId}/attendance`, data),
    getAttendanceReport: (activityId) => apiClient.get(`/activities/${activityId}/attendance`),
    getOngoingWithAttendance: () => apiClient.get(`/activities/ongoing-with-attendance`),
  },
  notifications: {
    getAll: (params) => apiClient.get("/notifications", { params }),
    markAsRead: (notificationId) => apiClient.patch(`/notifications/${notificationId}/read`),
    markAllAsRead: () => apiClient.patch("/notifications/mark-all-read"),
  },
  dashboard: {
    getOverview: () => apiClient.get('/dashboard/overview'),
  },
  reports: {
    getVolunteerHours: (year) => apiClient.get('/reports/volunteer-hours', { params: { year } }),
  },
};
