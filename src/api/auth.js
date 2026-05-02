// Authentication and User Management APIs
import api from './index';
import { toast } from "react-toastify";

// User Management
export const handleGetAllUsers = async (page = 1, limit = 10, additionalParams = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    // Add additional params
    Object.keys(additionalParams).forEach(key => {
      if (additionalParams[key]) {
        params.append(key, additionalParams[key]);
      }
    });

    const res = await api.get(`/users?${params.toString()}`);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch users";
    toast.error(message);
    return { success: false, message, data: [] };
  }
};

export const handleUpdateUser = async (id, data) => {
  try {
    const res = await api.put(`/auth/${id}`, data);
    toast.success("User updated successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update user";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleDeleteUser = async (id) => {
  try {
    const res = await api.delete(`/users/${id}`);
    toast.success("User deleted successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete user";
    toast.error(message);
    return { success: false, message };
  }
};

export const handleLogout = async () => {
  try {
    const res = await api.post(`api/admin/logout`);
    return res.data;
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false };
  }
};

// Profile Management
export const handleGetProfile = async () => {
  try {
    const res = await api.get('/auth/profile');
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch profile";
    toast.error(message);
    return { success: false, message };
  }
};

export const handleUpdateProfile = async (data) => {
  try {
    const res = await api.put('/auth/profile', data);
    toast.success("Profile updated successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update profile";
    toast.error(message);
    return { success: false, message };
  }
};
