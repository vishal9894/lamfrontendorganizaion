import axios from "axios";
import { toast } from "react-toastify";
import { buildPaginationParams, parsePaginatedResponse, PAGINATION_CONFIG } from "../utils/pagination";
import { handleAuthError } from "../utils/authUtils";

const BaseUrl = import.meta.env.VITE_BACKEND_API;

const api = axios.create({
  baseURL: BaseUrl,
  headers: { "Content-Type": "application/json" },
});

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
    // Handle authentication errors using the utility function
    const isAuthError = handleAuthError(error);

    // If it's not an auth error, continue with normal error handling
    if (!isAuthError) {
      return Promise.reject(error);
    }

    // For auth errors, we still reject to allow components to handle if needed
    return Promise.reject(error);
  }
);

/* ================= USER ================= */

export const handleGetAllUsers = async (page = 1, limit = PAGINATION_CONFIG.USERS.default, additionalParams = {}) => {
  try {
    const params = buildPaginationParams(page, limit, additionalParams);
    const url = `/users${params ? `?${params}` : ''}`;
    const res = await api.get(url);
    return parsePaginatedResponse(res.data, limit);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch users";
    toast.error(message);
    return {
      success: false,
      message,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1
    };
  }
};

export const handleUpdateUser = async (id, data) => {
  try {
    const res = await api.put(`/auth/${id}`, data);
    toast.success("User updated successfully");
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Update user error:", error);
    const message = error.response?.data?.message || "Failed to update user";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleDeleteUser = async (id) => {
  try {
    const res = await api.delete(`/users/${id}`)
    return res.data;

  } catch (error) {

  }
}

export const handleLgout = async () => {
  try {
    const res = await api.post(`api/admin/logout`);
    return res.data;

  } catch (error) {
  }
}


// wallet

export const handleAddBallance = async (data) => {

  try {
    const res = await api.post(`/wallets/credit/${data.userId}`, data);

    return res.data;

  } catch (error) {
    throw error;
  }

}
export const handleGetWallet = async (id) => {
  try {
    const res = await api.get(`/wallets/${id}`);
    return res.data;

  } catch (error) {
    throw error;
  }
}

/* ================= QUIZ ================= */

export const handleCreateMcq = async (data) => {
  try {
    const res = await api.post("/quizs", data);
    toast.success("Quiz created successfully");
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Create quiz error:", error);
    const message = error.response?.data?.message || "Failed to create quiz";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleCreateQuestions = async (data) => {
  try {

    const isFormData = data instanceof FormData;

    if (isFormData) {
      // Single question creation with FormData (from modal)
      const quizId = data.get('quizId');
      const response = await api.post(`/quizs/${quizId}/questions`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success("Question created successfully");
      return { success: true, data: response.data };
    } else {
      // Bulk question creation with array (from AddQuiz)
      // data is array of {quizId, category, count, organizationId}
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
    console.error("Create questions error:", error);
    const message = error.response?.data?.message || "Failed to create questions";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleGetMcq = async (page = 1, limit = PAGINATION_CONFIG.QUIZZES.default, additionalParams = {}) => {
  try {
    const params = buildPaginationParams(page, limit, additionalParams);
    const res = await api.get(`/quizs${params ? `?${params}` : ''}`);
    return parsePaginatedResponse(res.data, limit);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch quizzes";
    toast.error(message);
    return {
      success: false,
      message,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1
    };
  }
};


export const handleDeleteQuiz = async (id) => {
  try {
    const res = await api.delete(`/quizs/${id}`);
    toast.success("Quiz deleted successfully");
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Delete quiz error:", error);
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
    console.error("Get quiz questions error:", error);
    const message = error.response?.data?.message || "Failed to fetch quiz questions";
    toast.error(message);
    return { success: false, message, data: { questions: [], total: 0 } };
  }
};

export const handleDeleteQuestion = async (id) => {
  const res = await api.delete(`/quizs/questions/${id}`);
  return { success: true, data: res.data };
}

export const handleUpdateQuestion = async () => {

}

/* ================= COURSE ================= */

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
    console.error("Create course error:", error);
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
    console.error("Update course error:", error);
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
    console.error("Delete course error:", error);
    const message = error.response?.data?.message || "Failed to delete course";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleGetCourse = async (courseType, page = 1, limit = PAGINATION_CONFIG.COURSES.default, additionalParams = {}) => {
  try {
    const params = buildPaginationParams(page, limit, { ...additionalParams, type: courseType });
    const res = await api.get(`/courses${params ? `?${params}` : ''}`);
    return parsePaginatedResponse(res.data, limit);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch courses";
    toast.error(message);
    return {
      success: false,
      message,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1
    };
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
    console.error("Publish course error:", error);

    return {
      success: false,
      message: error?.response?.data?.message || "Failed to update publish status",
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
    console.error("Assign multiple courses error:", error);
    const message = error.response?.data?.message || "Failed to assign courses";
    return { success: false, message };
  }
};

export const handleGetAssignCourse = async (page = 1, limit = PAGINATION_CONFIG.COURSES.default, additionalParams = {}) => {
  try {
    const params = buildPaginationParams(page, limit, additionalParams);
    const res = await api.get(`/api/course/get-assign-course${params ? `?${params}` : ''}`);
    return parsePaginatedResponse(res.data, limit);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch assigned courses";
    toast.error(message);
    return {
      success: false,
      message,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1
    };
  }
};

export const handleDeleteAssignCourse = async (courseId, userId) => {
  try {
    const res = await api.delete(`/api/course/delete-assign-course?userId=${userId}&courseId=${courseId}`);
    return res.data;
  } catch (error) {
    console.error("Delete assign course error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete assignment"
    };
  }
};

// dashboard 

export const handleGetDashboardData = async () => {
  try {
    const res = await api.get(`/dashboard/stats`);
    return res.data;
  } catch (error) {
    console.error("Get dashboard data error:", error);
    const message = error.response?.data?.message || "Failed to fetch dashboard data";
    toast.error(message);
    return { success: false, message, data: {} };
  }
};


/* ================= FOLDER ================= */

export const handleGetFolders = async (courseId) => {
  try {
    const res = await api.get(`/folders/${courseId}`);
    return res.data;
  } catch (error) {
    console.error("Get folders error:", error);
    const message = error.response?.data?.message || "Failed to fetch folders";
    toast.error(message);
    return { success: false, message, data: [] };
  }
};

export const handleCreateFolder = async (data) => {
  try {

    const res = await api.post("/folders", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success("Folder created successfully");
    return res.data;
  } catch (error) {
    console.error("Create folder error:", error);
    const message = error.response?.data?.message || "Failed to create folder";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleUpdateFolder = async (folderId, data) => {
  try {
    const res = await api.put(`/folders/${folderId}`, data);
    toast.success("Folder updated successfully");
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Update folder error:", error);
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
    console.error("Delete folder error:", error);
    const message = error.response?.data?.message || "Failed to delete folder";
    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleCreateFile = async (formData) => {
  try {
    const res = await api.post(
      `/file-contents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success(res.data?.message || "Content uploaded successfully");

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Upload content error:", error);

    const message =
      error.response?.data?.message || "Failed to upload content";

    toast.error(message);

    return {
      success: false,
      message,
      data: null,
    };
  }
};

export const handleDeleteFilecontents = async (id) => {
  try {
    const res = await api.delete(`/file-contents/${id}`);
    toast.success(res.data?.message || "Content deleted successfully");
    return res.data;
  } catch (error) {
    toast.error(message);
  }
};

export const handlecreateSuperStream = async (formData) => {
  try {
    const res = await api.post("/superstream", formData);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const handleGetSuperStream = async () => {
  try {
    const response = await api.get('/superstream');
    return response.data;
  } catch (error) {
    return [];
  }
};


export const handleUpdateSuperStream = async (id, data) => {
  try {
    const res = await api.put(`/superstream/${id}`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
};


export const handleDeleteSuperStream = async (id) => {
  try {
    const res = await api.delete(`/superstream/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};
/* ================= STREAM ================= */

export const handleCreateStream = async (formData) => {
  try {
    const res = await api.post("/stream", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success(res.data?.message || "Stream created successfully");

    return { success: true, data: res.data };
  } catch (error) {
    console.error("Create stream error:", error);

    const message =
      error.response?.data?.message || "Failed to create stream";

    toast.error(message);

    return { success: false, message, data: null };
  }
};

export const handleGetStream = async (page = 1, limit = PAGINATION_CONFIG.STREAMS.default, additionalParams = {}) => {
  try {
    const params = buildPaginationParams(page, limit, additionalParams);
    const res = await api.get(`/stream${params ? `?${params}` : ''}`);
    return parsePaginatedResponse(res.data, limit);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch streams";
    toast.error(message);
    return {
      success: false,
      message,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1
    };
  }
};

export const handleDeleteStream = async (id) => {
  try {
    const res = await api.delete(`/stream/${id}`);

    toast.success(res.data?.message || "Stream deleted successfully");

    return { success: true, data: res.data };
  } catch (error) {
    console.error("Delete stream error:", error);

    const message =
      error.response?.data?.message || "Failed to delete stream";

    toast.error(message);
    return { success: false, message, data: null };
  }
};

export const handleUpdateStream = async (id, formData) => {
  try {
    const res = await api.put(`/stream/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success(res.data?.message || "Stream updated successfully");

    return { success: true, data: res.data };
  } catch (error) {
    console.error("Update stream error:", error);

    const message =
      error.response?.data?.message || "Failed to update stream";

    toast.error(message);

    return { success: false, message, data: null };
  }
};

// test questions

// Question Management APIs

export const handleGetTests = async (testId) => {
  try {
    const res = await api.get(`/file-contents/test/${testId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching tests:", error);
    throw error;
  }
}
export const handleGetTestQuestions = async (testId) => {
  try {
    const response = await api.get(`testquestions?contentId=${testId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const handleCreateTestQuestion = async (testId, questionData) => {
  try {
    const response = await api.post(`/testquestions/${testId}`, questionData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

export const handleBulkUploadQuestions = async (testId, formData) => {
  try {
    const response = await api.post(`/testquestions/bulk/${testId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;

  } catch (error) {
    console.error("Error uploading questions:", error);
    throw error;
  }
};

export const handleDeleteTestQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/testquestions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};


// create omr-sheet

export const handleCreateOmrSheet = async (formData) => {
  try {
    const res = await api.post(`/omr-sheets`, formData);
    return res.data;

  } catch (error) {

  }
}

export const handleGetOmrSheet = async () => {
  try {
    const res = await api.get(`/omr-sheets`);
    return res.data;

  } catch (error) {

  }
}

export const handleMatchOmrSheetKey = async () => {
  try {
    const res = await api.get(`/omr-sheets/keys/all`)
    return res.data;

  } catch (error) {

  }
}


export const handleDeleteOmrSheet = async (id) => {
  try {
    const res = await api.delete(`/omr-sheets/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting OMR sheet:", error);
    throw error.response?.data || error.message || "Failed to delete OMR sheet";
  }
};




// create teacher

export const handleCreateTeacher = async (formData) => {
  try {
    const res = await api.post("/teachers", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success(res.data.message);
    return res.data;
  } catch (error) {
    console.error("Error uploading teacher:", error);
    toast.error("Failed to create teacher. Please try again.");
  }
};

export const handleGetTeacher = async (page = 1, limit = PAGINATION_CONFIG.TEACHERS.default, additionalParams = {}) => {
  try {
    const params = buildPaginationParams(page, limit, additionalParams);
    const res = await api.get(`/teachers${params ? `?${params}` : ''}`);
    return parsePaginatedResponse(res.data, limit);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch teachers";
    toast.error(message);
    return {
      success: false,
      message,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1
    };
  }
}

export const handleUpdateTeacher = async (id, formData) => {
  try {
    const res = await api.put(`/teachers/${id}`, formData);
    return res.data;
  } catch (error) {
  }
}

export const handleDeleteTeacher = async (id) => {
  try {
    const res = await api.delete(`/teachers/${id}`);
    toast.success(res.data.message)
    return res.data

  } catch (error) {

  }
}
// banner
export const handleCreateBanner = async (formData) => {
  try {
    const res = await api.post(`/banners`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const handleGetBanner = async (page = 1, limit = 10, additionalParams = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    // Add additional params if provided
    if (additionalParams.search) {
      params.append('search', additionalParams.search);
    }
    if (additionalParams.type) {
      params.append('type', additionalParams.type);
    }

    const res = await api.get(`/banners?${params.toString()}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const handlePublishBanner = async (id, publish) => {
  try {
    const res = await api.put(`/api/banner/publish-banner/${id}`,
      { publish }
    )
    return res.data;

  } catch (error) {
  }
}

export const handleDeleteBanner = async (id) => {
  try {
    const res = await api.delete(`/banners/${id}`);
    return res.data;
  } catch (error) {
  }
}

// events

export const handleCreateEvent = async (formData) => {
  try {
    const res = await api.post(
      `/events`,
      formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    }
    );
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || error;
  }
};

export const handleGetEvent = async (id) => {
  try {
    const res = await api.get(`/events/${id}`)
    return res.data;

  } catch (error) {
  }
}

export const handleGetAllEvent = async (page = 1, limit = PAGINATION_CONFIG.EVENTS.default, additionalParams = {}) => {
  try {
    const params = buildPaginationParams(page, limit, additionalParams);
    const res = await api.get(`/events${params ? `?${params}` : ''}`);
    return parsePaginatedResponse(res.data, limit);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch events";
    toast.error(message);
    return {
      success: false,
      message,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1
    };
  }
};

export const handleDeleteEvent = async (id) => {
  try {
    const res = api.delete(`/events/${id}`)
    return res.data;
  } catch (error) {
  }
}

export const handleUpdateEvent = async (id, formData) => {
  try {
    const res = await api.put(`/api/event/update-event/${id}`, formData);
    return res.data;
  } catch (error) {
  }
}

export const handleCreateAttachment = async (formData) => {
  try {
    const res = await api.post(`/api/event/create-attachment`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Create attachment error:", error);
    throw error;
  }
};

export const handleGetAttachment = async (id) => {
  try {
    const res = await api.get(`/api/event/get-attachment/${id}`);
    return res.data;

  } catch (error) {
  }
}

export const handleUpdateAttachment = async (id, formData) => {
  try {
    const res = await api.put(`/api/event/update-attachment/${id}`, formData);
    return res.data;
  } catch (error) {
  }
}

export const handleDeleteAttachment = async (id) => {
  try {
    const res = api.delete(`/api/event/delete-attachment/${id}`)
    return res.data;
  } catch (error) {

  }
}

export const handleCreateSocialMedia = async (formData) => {
  try {
    const res = await api.post(`/social-media`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success(res.data.message)
    return res.data;
  } catch (error) {
    console.error("Create social media error:", error);
  }
};

export const handleUpdateSocialMedia = async (id, formData) => {
  try {
    const res = await api.put(`/social-media/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Update social media error:", error);
  }
};

export const handleGetSocialMedia = async () => {
  try {
    const res = await api.get('/social-media');
    return res.data;
  } catch (error) {
  }
}

export const handleDeleteSocialMedia = async (id) => {
  try {
    const res = await api.delete(`/social-media/${id}`);
    toast.success(res.data.message)
    return res.data;
  } catch (error) {
  }
}

// top teachers

export const handleCreateTopTeacher = async (formData) => {
  try {
    const res = await api.post(`/topteacher`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
  }
}

export const handleGetTopTeacher = async () => {
  try {
    const res = await api.get('/topteacher');
    return res.data;
  } catch (error) {
    console.error('Error decrypting top teachers:', error);
    return { success: false, data: [] };
  }
};

export const handleUpdateTopTeacher = async (id, formData) => {
  try {
    const res = await api.patch(`/top-teacher/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { success: true, data: res.data };

  } catch (error) {
    console.error('Error updating teacher:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};
export const handleDeleteTopTeacher = async (id) => {
  try {
    const res = await api.delete(`top-teacher/${id}`);
    return res.data;

  } catch (error) {

  }
}

export const handleCreateTopStudent = async (formData) => {
  try {
    const res = api.post(`/topstudents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return res.data;
  } catch (error) {
  }
}

export const handleGetTopStudent = async () => {
  try {
    const res = await api.get('/topstudents');
    return res.data;
  } catch (error) {
  }
}

export const handleDeleteTopStudent = async (id) => {
  try {
    const res = await api.delete(`/top-student/${id}`);
    return res.data;
  } catch (error) {
    console.error('Delete top student error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to delete top student'
    };
  }
};

export const handleUpdateTopStudent = async (id, formData) => {
  try {
    const res = await api.put(`/top-student/${id}`, formData);
    return res.data;
  } catch (error) {
  }
}

export const handleCreateBulkQuestion = async (formData) => {
  try {
    const res = await api.post('/api/bulkquestion/import-question', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Create bulk question error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to upload questions'
    };
  }
};

export const handleGetBulkQuestion = async () => {
  try {
    const res = await api.get('/api/bulkquestion/get-question');
    return res.data;
  } catch (error) {
    console.error('Get bulk questions error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to fetch questions'
    };
  }
};

export const handleDeleteBulkQuestion = async (id) => {
  try {
    const res = await api.delete(`/api/bulkquestion/delete-question/${id}`);
    return res.data;
  } catch (error) {
    console.error('Delete bulk question error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to delete question'
    };
  }
};

export const handleDeleteAllBulkQuestions = async () => {
  try {
    const res = await api.delete('/api/bulkquestion/delete-question/all');
    return res.data;
  } catch (error) {
    console.error('Delete all bulk questions error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to delete all questions'
    };
  }
};

export const handleCreateSetting = async (data) => {
  try {
    const res = await api.post(`/api/setting/create-setting`, data);
    return res.data;
  } catch (error) {
    console.error('Create setting error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to create setting'
    };
  }
};

export const handleGetAllSettings = async () => {
  try {
    const res = await api.get('/api/setting/get-setting');
    return res.data;
  } catch (error) {
    console.error('Get settings error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to fetch settings'
    };
  }
};

export const handleCreateRouteSetting = async (data) => {
  try {
    const res = await api.post(`/api/setting/create-routing_account`, data);
    return res.data;
  } catch (error) {
    console.error('Create route setting error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to create route setting'
    };
  }
};

export const handleDeleteRoutingAccount = async (id) => {
  try {
    const res = await api.delete(`/api/setting/delete-routing_account/${id}`);
    return res.data;
  } catch (error) {
    console.error('Delete routing account error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to delete routing account'
    };
  }
};

export const handleGetRoutingAccount = async () => {
  try {
    const res = await api.get('/api/setting/get-routing_account');
    return res.data;
  } catch (error) {
    console.error('Get routing account error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to fetch routing accounts'
    };
  }
};

// admin

export const handleGetProfile = async () => {
  const res = await api.get('/admin/profile');
  return res.data.admin;
};

export const handleGetAllAdmin = async (page = 1, limit = PAGINATION_CONFIG.ADMINS.default, additionalParams = {}) => {
  try {
    const params = buildPaginationParams(page, limit, additionalParams);
    const res = await api.get(`/admin/all-organization-admins${params ? `?${params}` : ''}`);
    return parsePaginatedResponse(res.data, limit);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch admins";
    toast.error(message);
    return {
      success: false,
      message,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1
    };
  }
}

// Update handleUpdateAdmin to send JSON
export const handleUpdateAdmin = async (id, data) => {
  try {
    const response = await api.patch(`/admin/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Update admin error:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

export const handleCreateAdmin = async (data) => {
  const res = await axios.post(`${BaseUrl}/admin/org-signup`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.data;
};
export const handleDeleteAdminAccount = async (id) => {
  try {
    const res = await api.delete(`/admin/${id}`)
    return res.data;
  } catch (error) {
  }
}

export const handleOrganizationLogin = async (data, organizationCode) => {
  try {
    const res = await api.post(`/auth/${organizationCode}/login`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const handleUpdateUserPermissions = async (userId, data) => {
  try {
    const res = await api.put(`/api/admin/${userId}/permissions`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error updating permissions:', error);
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to update permissions',
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'No response from server. Please check your network connection.'
      };
    } else {
      return {
        success: false,
        message: error.message || 'An error occurred while updating permissions'
      };
    }
  }
};

/* ================= ROLE & PERMISSION APIS ================= */

export const handleGetAllPermissions = async () => {
  try {
    const res = await api.get("/permissions");
    return res.data;
  } catch (error) {
    console.error("Error getting permissions:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get permissions"
    };
  }
};

export const handleGetAllPermissionsFlat = async () => {
  try {
    const res = await api.get("/api/permission/permissions/flat");
    return res.data;
  } catch (error) {
    console.error("Error getting permissions flat:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get permissions"
    };
  }
};

export const handleGetUserPermissions = async () => {
  try {
    const res = await api.get("/api/permission/user/permissions");

    // The response structure might be different, handle it properly
    if (res.data && res.data.success) {
      return {
        success: true,
        data: res.data.data || {} // Make sure we return the permissions object
      };
    }

    // If the response is directly the permissions object
    if (res.data && typeof res.data === 'object' && !res.data.success) {
      return {
        success: true,
        data: res.data
      };
    }

    return {
      success: false,
      data: {}
    };
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get user permissions",
      data: {}
    };
  }
};

export const handleCheckPermission = async (permissionName) => {
  try {
    const res = await api.get(`/api/permission/user/check-permission?permission=${permissionName}`);
    return res.data;
  } catch (error) {
    console.error("Error checking permission:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to check permission"
    };
  }
};

export const handleGetAllRoles = async (page = 1, limit = PAGINATION_CONFIG.ROLES.default, additionalParams = {}) => {
  try {
    const params = buildPaginationParams(page, limit, additionalParams);
    const res = await api.get(`/roles${params ? `?${params}` : ''}`);
    return parsePaginatedResponse(res.data, limit);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch roles";
    toast.error(message);
    return {
      success: false,
      message,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1
    };
  }
};

export const handleGetRoleById = async (id) => {
  try {
    const res = await api.get(`/roles/${id}`);

    return res.data

  } catch (error) {
    console.error("Error getting role:", error);

  }
};

export const handleCreateRole = async (roleData) => {
  try {
    const res = await api.post("/roles", roleData);
    toast.success(res.data?.message || "Role created successfully");
    return res.data;
  } catch (error) {
    console.error("Error creating role:", error);
    const message = error.response?.data?.message || "Failed to create role";
    toast.error(message);
    return {
      success: false,
      message
    };
  }
};

export const handleUpdateRole = async (id, roleData) => {
  try {
    const res = await api.put(`/api/permission/roles/${id}`, roleData);
    toast.success(res.data?.message || "Role updated successfully");
    return res.data;
  } catch (error) {
    console.error("Error updating role:", error);
    const message = error.response?.data?.message || "Failed to update role";
    toast.error(message);
    return {
      success: false,
      message
    };
  }
};

export const handleDeleteRoleById = async (id) => {
  try {
    const res = await api.delete(`roles/${id}`);
    toast.success(res.data?.message || "Role deleted successfully");
    return res.data;
  } catch (error) {
    console.error("Error deleting role:", error);
    const message = error.response?.data?.message || "Failed to delete role";
    toast.error(message);
    return {
      success: false,
      message
    };
  }
};

export const handleUpdateRolePermissions = async (id, permissionIds, name, description) => {
  try {
    const payload = {
      name: name,
      description: description,
      permissionIds: permissionIds
    };


    const res = await api.put(`/roles/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Error updating role permissions:", error);
    const message = error.response?.data?.message || "Failed to update role permissions";
    toast.error(message);
    return {
      success: false,
      message
    };
  }
};

export const handleAssignRoleToAdmin = async (adminId, role_id) => {
  try {
    const payload = {
      role_id
    };
    const res = await api.put(`/api/permission/admin/${adminId}/assign-role`, payload);
    toast.success(res.data?.message || "Role assigned successfully");
    return res.data;
  } catch (error) {
    console.error("Error assigning role:", error);
    const message = error.response?.data?.message || "Failed to assign role";
    toast.error(message);
    return {
      success: false,
      message
    };
  }
};


// notification


export const handleSendPushNotification = async (formData) => {
  try {
    const res = await api.post(`/notifications`, formData)
    return res.data;

  } catch (error) {
    console.error("Error sending push notification:", error);
    const message = error.response?.data?.message || "Failed to send push notification";
    toast.error(message);
    return {
      success: false,
      message
    };
  }
};

// Send In-App Notification
export const handleSendInAppNotification = async (formData) => {
  try {
    const res = await api.post(`/in-app-notifications`, formData)
    return res.data;

  } catch (error) {
    console.error("Error sending in-app notification:", error);
    const message = error.response?.data?.message || "Failed to send in-app notification";
    toast.error(message);
    return {
      success: false,
      message
    };
  }
};

// Get Notification History
export const handleGetNotificationHistory = async (page = 1, limit = PAGINATION_CONFIG.NOTIFICATIONS.default, additionalParams = {}) => {
  try {
    const params = buildPaginationParams(page, limit, additionalParams);
    const res = await api.get(`/notifications${params ? `?${params}` : ''}`);
    return parsePaginatedResponse(res.data, limit);
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch notification history";
    toast.error(message);
    return {
      success: false,
      message,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 1
    };
  }
};

// Get Notification Details
export const handleGetNotificationDetails = async (notificationId) => {
  try {
    const res = await api.get(`/notifications/${notificationId}`);
    return res.data;
  } catch (error) {
    console.error("Error getting notification details:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get notification details"
    };
  }
};


export const handleDeleteNotifications = async (notificationId) => {

  try {
    const res = await api.delete(`/notifications/${notificationId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);

    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to delete notification"
    };
  }
};


// Get App Versions
export const handleGetAppVersions = async () => {
  try {
    const res = await api.get(`/app-versions`);
    return res.data;
  } catch (error) {
    console.error("Error getting app versions:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get app versions"
    };
  }
};