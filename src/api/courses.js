// Course Management APIs
import api from './index';
import { toast } from "react-toastify";

export const handleCreateCourse = async (data) => {
  try {
    const isFormData = data instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};

    const res = await api.post("/courses", data, config);
    toast.success("Course created successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to create course";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleUpdateCourse = async (data) => {
  try {
    const res = await api.put("/api/course/update-course", data);
    toast.success("Course updated successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update course";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleDeleteCourse = async (courseId) => {
  try {
    const res = await api.delete(`/courses/${courseId}`);
    toast.success("Course deleted successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete course";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleGetCourse = async (courseType, page = 1, limit = 10, additionalParams = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    if (courseType) params.append('type', courseType);
    
    Object.keys(additionalParams).forEach(key => {
      if (additionalParams[key]) {
        params.append(key, additionalParams[key]);
      }
    });

    const res = await api.get(`/courses?${params.toString()}`);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch courses";
    toast.error(message);
    return { success: false, message, data: [] };
  }
};

export const handlePublishCourse = async (id, publish) => {
  try {
    const res = await api.patch(`/courses/${id}`, {
      status: publish
    });

    return {
      success: true,
      data: res.data,
      message: res.data.message || "Course publish status updated successfully"
    };
  } catch (error) {
    const message = error?.response?.data?.message || "Failed to update publish status";
    toast.error(message);
    return {
      success: false,
      message,
      error: error?.response?.data || error.message
    };
  }
};

export const handleAssignMultipleCourses = async (assignData) => {
  try {
    const res = await api.post('/api/course/assign-course', assignData);

    if (res.data) {
      return {
        success: true,
        data: res.data.data || res.data,
        message: res.data.message || "Courses assigned successfully"
      };
    }

    return { success: false, message: "Failed to assign courses" };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to assign courses";
    toast.error(message);
    return { success: false, message };
  }
};

export const handleGetAssignCourse = async (page = 1, limit = 10, additionalParams = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    Object.keys(additionalParams).forEach(key => {
      if (additionalParams[key]) {
        params.append(key, additionalParams[key]);
      }
    });

    const res = await api.get(`/api/course/get-assign-course?${params.toString()}`);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch assigned courses";
    toast.error(message);
    return { success: false, message, data: [] };
  }
};

export const handleDeleteAssignCourse = async (courseId, userId) => {
  try {
    const res = await api.delete(`/api/course/delete-assign-course?userId=${userId}&courseId=${courseId}`);
    toast.success("Course assignment deleted successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete assignment";
    toast.error(message);
    return { success: false, message };
  }
};
