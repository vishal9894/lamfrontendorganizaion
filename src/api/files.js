// File and Content Management APIs
import api from './index';
import { toast } from "react-toastify";

export const handleCreateFolder = async (data) => {
  try {
    const res = await api.post("/folders", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success("Folder created successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to create folder";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleGetFolders = async (courseId) => {
  try {
    const res = await api.get(`/folders/${courseId}`);
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch folders";
    toast.error(message);
    return { success: false, message, data: [] };
  }
};

export const handleUpdateFolder = async (folderId, data) => {
  try {
    const res = await api.put(`/folders/${folderId}`, data);
    toast.success("Folder updated successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update folder";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleDeleteFolder = async (id) => {
  try {
    const res = await api.delete(`/folders/${id}`);
    toast.success("Folder deleted successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete folder";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleCreateFile = async (formData) => {
  try {
    const res = await api.post(`/file-contents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success(res.data?.message || "Content uploaded successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to upload content";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleDeleteFilecontents = async (id) => {
  try {
    const res = await api.delete(`/file-contents/${id}`);
    toast.success(res.data?.message || "Content deleted successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete content";
    toast.error(message);
    return { success: false, message };
  }
};
