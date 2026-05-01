import * as allApi from './allApi';
import { PAGINATION_CONFIG } from '../utils/pagination';

// Query keys for React Query
export const apiKeys = {
  users: ['users'],
  userCount: ['userCount'],
  wallet: (id) => ['wallet', id],
  courses: ['courses'],
  activeCourses: ['activeCourses'],
  quizzes: ['quizzes'],
  teachers: ['teachers'],
  events: ['events'],
  streams: ['streams'],
  admins: ['admins'],
  roles: ['roles'],
  notifications: ['notifications'],
  assignedCourses: ['assignedCourses'],
  superStreams: ['superStreams'],
  topTeachers: ['topTeachers'],
  topStudents: ['topStudents'],
  banners: ['banners'],
  socialMedia: ['socialMedia'],
  bulkQuestions: ['bulkQuestions'],
  omrSheets: ['omrSheets'],
};

// Optimized API functions with pagination support
export const api = {
  // User APIs
  user: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.USERS.default, additionalParams = {}) =>
      allApi.handleGetAllUsers(page, limit, additionalParams),
    getCount: () => allApi.handleGetUserCount?.() || Promise.resolve({ total: 0 }),
    update: (id, data) => allApi.handleUpdateUser(id, data),
    delete: (id) => allApi.handleDeleteUser(id),
  },

  // Wallet APIs
  wallet: {
    getWallet: (id) => allApi.handleGetWallet(id),
    addBalance: (data) => allApi.handleAddBallance(data),
  },

  // Course APIs
  course: {
    get: (courseType, page = 1, limit = PAGINATION_CONFIG.COURSES.default, additionalParams = {}) =>
      allApi.handleGetCourse(courseType, page, limit, additionalParams),
    getActiveCount: () => allApi.handleGetActiveCourse?.() || Promise.resolve({ active: 0, inactive: 0, total: 0 }),
    create: (data) => allApi.handleCreateCourse(data),
    update: (data) => allApi.handleUpdateCourse(data),
    delete: (courseId) => allApi.handleDeleteCourse(courseId),
    publish: (id, status) => allApi.handlePublishCourse(id, status),
    getAssigned: (page = 1, limit = PAGINATION_CONFIG.COURSES.default, additionalParams = {}) =>
      allApi.handleGetAssignCourse(page, limit, additionalParams),
  },

  // Quiz APIs
  quiz: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.QUIZZES.default, additionalParams = {}) =>
      allApi.handleGetMcq(page, limit, additionalParams),
    createMcq: (data) => allApi.handleCreateMcq(data),
    createQuestions: (data) => allApi.handleCreateQuestions(data),
    delete: (id) => allApi.handleDeleteQuiz(id),
    getQuestions: (quizId) => allApi.handleGetQuizQuestions(quizId),
    deleteQuestion: (id) => allApi.handleDeleteQuestion(id),
  },

  // Teacher APIs
  teacher: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.TEACHERS.default, additionalParams = {}) =>
      allApi.handleGetTeacher(page, limit, additionalParams),
    create: (data) => allApi.handleCreateTeacher(data),
    update: (id, data) => allApi.handleUpdateTeacher(id, data),
    delete: (id) => allApi.handleDeleteTeacher(id),
  },

  // Event APIs
  event: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.EVENTS.default, additionalParams = {}) =>
      allApi.handleGetAllEvent(page, limit, additionalParams),
    get: (id) => allApi.handleGetEvent(id),
    create: (data) => allApi.handleCreateEvent(data),
    update: (id, data) => allApi.handleUpdateEvent(id, data),
    delete: (id) => allApi.handleDeleteEvent(id),
  },

  // Stream APIs
  stream: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.STREAMS.default, additionalParams = {}) =>
      allApi.handleGetStream(page, limit, additionalParams),
    create: (data) => allApi.handleCreateStream(data),
    update: (id, data) => allApi.handleUpdateStream(id, data),
    delete: (id) => allApi.handleDeleteStream(id),
  },

  // Admin APIs
  admin: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.ADMINS.default, additionalParams = {}) =>
      allApi.handleGetAllAdmin(page, limit, additionalParams),
    getProfile: () => allApi.handleGetProfile(),
    create: (data) => allApi.handleCreateAdmin(data),
    update: (id, data) => allApi.handleUpdateAdmin(id, data),
    delete: (id) => allApi.handleDeleteAdminAccount(id),
  },

  // Role APIs
  role: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.ROLES.default, additionalParams = {}) =>
      allApi.handleGetAllRoles(page, limit, additionalParams),
    getById: (id) => allApi.handleGetRoleById(id),
    create: (data) => allApi.handleCreateRole(data),
    update: (id, data) => allApi.handleUpdateRole(id, data),
    delete: (id) => allApi.handleDeleteRoleById(id),
  },

  // Notification APIs
  notification: {
    getHistory: (page = 1, limit = PAGINATION_CONFIG.NOTIFICATIONS.default, additionalParams = {}) =>
      allApi.handleGetNotificationHistory(page, limit, additionalParams),
    getDetails: (id) => allApi.handleGetNotificationDetails(id),
    delete: (id) => allApi.handleDeleteNotifications(id),
    sendPush: (data) => allApi.handleSendPushNotification(data),
    sendInApp: (data) => allApi.handleSendInAppNotification(data),
  },

  // Assigned Course APIs
  assignedCourse: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.COURSES.default, additionalParams = {}) =>
      allApi.handleGetAssignCourse(page, limit, additionalParams),
    delete: (courseId, userId) => allApi.handleDeleteAssignCourse(courseId, userId),
  },

  // Super Stream APIs
  superStream: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.STREAMS.default, additionalParams = {}) =>
      allApi.handleGetSuperStream(page, limit, additionalParams),
    create: (data) => allApi.handlecreateSuperStream(data),
    update: (id, data) => allApi.handleUpdateSuperStream(id, data),
    delete: (id) => allApi.handleDeleteSuperStream(id),
  },

  // Top Teacher APIs
  topTeacher: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.TEACHERS.default, additionalParams = {}) =>
      allApi.handleGetTopTeacher(page, limit, additionalParams),
    create: (data) => allApi.handleCreateTopTeacher(data),
    update: (id, data) => allApi.handleUpdateTopTeacher(id, data),
    delete: (id) => allApi.handleDeleteTopTeacher(id),
  },

  // Top Student APIs
  topStudent: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.USERS.default, additionalParams = {}) =>
      allApi.handleGetTopStudent(page, limit, additionalParams),
    create: (data) => allApi.handleCreateTopStudent(data),
    update: (id, data) => allApi.handleUpdateTopStudent(id, data),
    delete: (id) => allApi.handleDeleteTopStudent(id),
  },

  // Banner APIs
  banner: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.COURSES.default, additionalParams = {}) =>
      allApi.handleGetBanner(page, limit, additionalParams),
    create: (data) => allApi.handleCreateBanner(data),
    update: (id, publish) => allApi.handlePublishBanner(id, publish),
    delete: (id) => allApi.handleDeleteBanner(id),
  },

  // Social Media APIs
  socialMedia: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.COURSES.default, additionalParams = {}) =>
      allApi.handleGetSocialMedia(page, limit, additionalParams),
    create: (data) => allApi.handleCreateSocialMedia(data),
    update: (id, data) => allApi.handleUpdateSocialMedia(id, data),
    delete: (id) => allApi.handleDeleteSocialMedia(id),
  },

  // Bulk Question APIs
  bulkQuestion: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.QUIZZES.default, additionalParams = {}) =>
      allApi.handleGetBulkQuestion(page, limit, additionalParams),
    create: (data) => allApi.handleCreateBulkQuestion(data),
    delete: (id) => allApi.handleDeleteBulkQuestion(id),
    deleteAll: () => allApi.handleDeleteAllBulkQuestions(),
  },

  // OMR Sheet APIs
  omrSheet: {
    getAll: (page = 1, limit = PAGINATION_CONFIG.COURSES.default, additionalParams = {}) =>
      allApi.handleGetOmrSheet(page, limit, additionalParams),
    create: (data) => allApi.handleCreateOmrSheet(data),
    delete: (id) => allApi.handleDeleteOmrSheet(id),
  },

  // Dashboard API
  dashboard: {
    getStats: () => allApi.handleGetDashboardData(),
  },
};

export default api;
