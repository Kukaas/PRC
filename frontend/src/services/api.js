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
  },
  profile: {
    update: (data) => apiClient.put("/profile/update", data),
    getCompletionStatus: () => apiClient.get("/profile/completion-status"),
    getSetupStatus: () => apiClient.get("/profile/setup-status"),
    updatePhoto: (photoData) => apiClient.put("/profile/photo", photoData),
  },
};
