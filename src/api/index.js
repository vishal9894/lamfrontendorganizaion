// API Configuration and Base Instance
import axios from "axios";
import { toast } from "react-toastify";
import { handleAuthError } from "../utils/authUtils";

const BaseUrl = import.meta.env.VITE_BACKEND_API;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BaseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthError = handleAuthError(error);
    if (!isAuthError) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;
