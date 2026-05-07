// Central export point for all React Query hooks
// This makes it easy to import hooks from a single location

// User management hooks
export {
  useUsers,
  useUser,
  useUserWallet,
  useUpdateUser,
  useDeleteUser,
  useLogout,
  useAddBalance,
  prefetchUsers,
  userKeys
} from './useUsers.js';

// Course management hooks
export {
  useCourses,
  useCourse,
  useShortCourseDetails,
  useAssignedCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  usePublishCourse,
  useAssignCourses,
  useDeleteAssignedCourse,
  prefetchCourses,
  prefetchShortCourseDetails,
  courseKeys
} from './useCourses.js';

// Quiz management hooks
export {
  useQuizzes,
  useQuiz,
  useQuizQuestions,
  useCreateQuiz,
  useCreateQuestions,
  useDeleteQuiz,
  useDeleteQuestion,
  useUpdateQuestion,
  prefetchQuizzes,
  prefetchQuizQuestions,
  quizKeys
} from './useQuizzes.js';

// Dashboard hooks
export {
  useDashboardStats,
  useDashboardAnalytics,
  useRefreshDashboard,
  prefetchDashboardData,
  invalidateDashboardQueries,
  dashboardKeys
} from './useDashboard.js';

// Folder management hooks
export {
  useFolders,
  useFolder,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useCreateFile,
  useDeleteFile,
  prefetchFolders,
  folderKeys
} from './useFolders.js';

// Stream management hooks
export {
  useStreams,
  useStream,
  useSuperStreams,
  useSuperStream,
  useCreateStream,
  useUpdateStream,
  useDeleteStream,
  useCreateSuperStream,
  useUpdateSuperStream,
  useDeleteSuperStream,
  prefetchStreams,
  prefetchSuperStreams,
  streamKeys
} from './useStreams.js';

// Teacher management hooks
export {
  useTeachers,
  useTeacher,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
  prefetchTeachers,
  teacherKeys
} from './useTeachers.js';

// Event management hooks
export {
  useEvents,
  useEvent,
  useEventAttachments,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useCreateAttachment,
  useUpdateAttachment,
  useDeleteAttachment,
  prefetchEvents,
  eventKeys
} from './useEvents.js';

// Banner management hooks
export {
  useBanners,
  useBanner,
  useCreateBanner,
  usePublishBanner,
  useDeleteBanner,
  prefetchBanners,
  bannerKeys
} from './useBanners.js';

// OMR sheet management hooks
export {
  useOmrSheets,
  useOmrSheet,
  useOmrSheetKeys,
  useCreateOmrSheet,
  useDeleteOmrSheet,
  prefetchOmrSheets,
  omrKeys
} from './useOmrSheets.js';

// Social media management hooks
export {
  useSocialMedia,
  useSocialMediaDetail,
  useCreateSocialMedia,
  useUpdateSocialMedia,
  useDeleteSocialMedia,
  prefetchSocialMedia,
  socialMediaKeys
} from './useSocialMedia.js';

// Top content management hooks
export {
  useTopTeachers,
  useTopStudents,
  useBulkQuestions,
  useCreateTopTeacher,
  useUpdateTopTeacher,
  useDeleteTopTeacher,
  useCreateTopStudent,
  useUpdateTopStudent,
  useDeleteTopStudent,
  useCreateBulkQuestion,
  useDeleteBulkQuestion,
  useDeleteAllBulkQuestions,
  prefetchTopTeachers,
  prefetchTopStudents,
  prefetchBulkQuestions,
  topContentKeys
} from './useTopContent.js';

// Role management hooks
export {
  useRoles,
  useRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUpdateRolePermissions,
  prefetchRoles,
  roleKeys
} from './useRoles.js';

// Utility function to invalidate all queries
export const invalidateAllQueries = (queryClient) => {
  queryClient.invalidateQueries();
};

// Utility function to clear all queries
export const clearAllQueries = (queryClient) => {
  queryClient.clear();
};

// Utility function to prefetch common data
export const prefetchCommonData = (queryClient) => {
  return Promise.all([
    prefetchDashboardData(queryClient),
    prefetchShortCourseDetails(queryClient),
    prefetchSocialMedia(queryClient),
  ]);
};
