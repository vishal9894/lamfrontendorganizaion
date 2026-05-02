// Quiz and Question Management APIs
import api from './index';
import { toast } from "react-toastify";

export const handleCreateMcq = async (data) => {
  try {
    const res = await api.post("/quizs", data);
    toast.success("Quiz created successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to create quiz";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleCreateQuestions = async (data) => {
  try {
    const isFormData = data instanceof FormData;

    if (isFormData) {
      const quizId = data.get('quizId');
      const response = await api.post(`/quizs/${quizId}/questions`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success("Question created successfully");
      return { success: true, data: response.data };
    } else {
      const questionsArray = Array.isArray(data) ? data : [data];
      if (questionsArray.length === 0) {
        return { success: true, message: "No questions to create" };
      }

      const quizId = questionsArray[0].quizId;
      const response = await api.post(`/quizs/${quizId}/questions/bulk`, {
        questions: questionsArray
      });
      toast.success("Questions created successfully");
      return { success: true, data: response.data };
    }
  } catch (error) {
    const message = error.response?.data?.message || "Failed to create questions";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleGetMcq = async (page = 1, limit = 10, additionalParams = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    Object.keys(additionalParams).forEach(key => {
      if (additionalParams[key]) {
        params.append(key, additionalParams[key]);
      }
    });

    const res = await api.get(`/quizs?${params.toString()}`);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch quizzes";
    toast.error(message);
    return { success: false, message, data: [] };
  }
};

export const handleDeleteQuiz = async (id) => {
  try {
    const res = await api.delete(`/quizs/${id}`);
    toast.success("Quiz deleted successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete quiz";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleGetQuizQuestions = async (quizId) => {
  try {
    const res = await api.get(`/quizs/${quizId}/questions`);
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch quiz questions";
    toast.error(message);
    return { success: false, message, data: { questions: [], total: 0 } };
  }
};

export const handleDeleteQuestion = async (id) => {
  try {
    const res = await api.delete(`/quizs/questions/${id}`);
    toast.success("Question deleted successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete question";
    toast.error(message);
    return { success: false, message };
  }
};

export const handleUpdateQuestion = async (id, data) => {
  try {
    const res = await api.put(`/quizs/questions/${id}`, data);
    toast.success("Question updated successfully");
    return { success: true, data: res.data };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update question";
    toast.error(message);
    return { success: false, message };
  }
};
