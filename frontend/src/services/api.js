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

      throw new Error(
        errorData.message || `HTTP error! status: ${error.response.status}`
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("No response received from server");
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
  },
};
