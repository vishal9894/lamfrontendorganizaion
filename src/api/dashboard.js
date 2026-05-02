// Dashboard and Analytics APIs
import api from './index';
import { toast } from "react-toastify";

export const handleGetDashboardData = async () => {
  try {
    const res = await api.get(`/dashboard/stats`);
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch dashboard data";
    toast.error(message);
    return { success: false, message, data: {} };
  }
};

export const handleGetAnalytics = async (type, period = '7d') => {
  try {
    const res = await api.get(`/analytics/${type}?period=${period}`);
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch analytics";
    toast.error(message);
    return { success: false, message, data: {} };
  }
};

export const handleGetReports = async (reportType, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('type', reportType);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const res = await api.get(`/reports?${params.toString()}`);
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to generate report";
    toast.error(message);
    return { success: false, message, data: {} };
  }
};
