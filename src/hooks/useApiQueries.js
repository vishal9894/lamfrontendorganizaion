import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiKeys } from '../api/optimizedApi';

// Custom hooks for queries
export const useUsers = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.users, page, limit, additionalParams],
    queryFn: () => api.user.getAll(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useUserCount = () => {
  return useQuery({
    queryKey: apiKeys.userCount,
    queryFn: api.user.getCount,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useWallet = (id) => {
  return useQuery({
    queryKey: apiKeys.wallet(id),
    queryFn: () => api.wallet.getWallet(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useCourses = (courseType, page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.courses, courseType, page, limit, additionalParams],
    queryFn: () => api.course.get(courseType, page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useActiveCoursesCount = () => {
  return useQuery({
    queryKey: apiKeys.activeCourses,
    queryFn: api.course.getActiveCount,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useAssignedCourses = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.assignedCourses, page, limit, additionalParams],
    queryFn: () => api.course.getAssigned(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useQuizzes = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.quizzes, page, limit, additionalParams],
    queryFn: () => api.quiz.getAll(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useQuizQuestions = (quizId) => {
  return useQuery({
    queryKey: ['quizQuestions', quizId],
    queryFn: () => api.quiz.getQuestions(quizId),
    enabled: !!quizId,
    staleTime: 10 * 60 * 1000, // 10 minutes for quiz questions
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
};

export const useTeachers = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.teachers, page, limit, additionalParams],
    queryFn: () => api.teacher.getAll(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useEvents = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.events, page, limit, additionalParams],
    queryFn: () => api.event.getAll(page, limit, additionalParams),
    staleTime: 3 * 60 * 1000, // 3 minutes for events
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => api.event.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};

export const useStreams = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.streams, page, limit, additionalParams],
    queryFn: () => api.stream.getAll(page, limit, additionalParams),
    staleTime: 2 * 60 * 1000, // 2 minutes for live streams
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useAdmins = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.admins, page, limit, additionalParams],
    queryFn: () => api.admin.getAll(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useAdminProfile = () => {
  return useQuery({
    queryKey: ['adminProfile'],
    queryFn: api.admin.getProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes for profile
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

export const useRoles = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.roles, page, limit, additionalParams],
    queryFn: () => api.role.getAll(page, limit, additionalParams),
    staleTime: 10 * 60 * 1000, // 10 minutes for roles
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useRole = (id) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => api.role.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
};

export const useNotifications = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.notifications, page, limit, additionalParams],
    queryFn: () => api.notification.getHistory(page, limit, additionalParams),
    staleTime: 1 * 60 * 1000, // 1 minute for notifications
    gcTime: 3 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useNotificationDetails = (id) => {
  return useQuery({
    queryKey: ['notificationDetails', id],
    queryFn: () => api.notification.getDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};

export const useSuperStreams = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.superStreams, page, limit, additionalParams],
    queryFn: () => api.superStream.getAll(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useTopTeachers = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.topTeachers, page, limit, additionalParams],
    queryFn: () => api.topTeacher.getAll(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useTopStudents = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.topStudents, page, limit, additionalParams],
    queryFn: () => api.topStudent.getAll(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useBanners = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.banners, page, limit, additionalParams],
    queryFn: () => api.banner.getAll(page, limit, additionalParams),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useSocialMedia = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.socialMedia, page, limit, additionalParams],
    queryFn: () => api.socialMedia.getAll(page, limit, additionalParams),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useBulkQuestions = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.bulkQuestions, page, limit, additionalParams],
    queryFn: () => api.bulkQuestion.getAll(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useOmrSheets = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: [...apiKeys.omrSheets, page, limit, additionalParams],
    queryFn: () => api.omrSheet.getAll(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: api.dashboard.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Custom hooks for mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.user.update, // Using update for create as well
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.users });
      queryClient.invalidateQueries({ queryKey: apiKeys.userCount });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.user.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.users });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.user.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.users });
      queryClient.invalidateQueries({ queryKey: apiKeys.userCount });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.course.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.courses });
      queryClient.invalidateQueries({ queryKey: apiKeys.activeCourses });
    },
    onError: (error) => {
      console.error('Error creating course:', error);
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.course.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.courses });
      queryClient.invalidateQueries({ queryKey: apiKeys.activeCourses });
    },
    onError: (error) => {
      console.error('Error updating course:', error);
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.course.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.courses });
      queryClient.invalidateQueries({ queryKey: apiKeys.activeCourses });
      queryClient.invalidateQueries({ queryKey: apiKeys.assignedCourses });
    },
    onError: (error) => {
      console.error('Error deleting course:', error);
    },
  });
};

export const usePublishCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => api.course.publish(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.courses });
      queryClient.invalidateQueries({ queryKey: apiKeys.activeCourses });
    },
    onError: (error) => {
      console.error('Error publishing course:', error);
    },
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.quiz.createMcq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.quizzes });
    },
    onError: (error) => {
      console.error('Error creating quiz:', error);
    },
  });
};

export const useCreateQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.quiz.createQuestions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.quizzes });
    },
    onError: (error) => {
      console.error('Error creating questions:', error);
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.quiz.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.quizzes });
    },
    onError: (error) => {
      console.error('Error deleting quiz:', error);
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.quiz.deleteQuestion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizQuestions', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: apiKeys.quizzes });
    },
    onError: (error) => {
      console.error('Error deleting question:', error);
    },
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.teacher.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.teachers });
    },
    onError: (error) => {
      console.error('Error creating teacher:', error);
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.teacher.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.teachers });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['teacher', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating teacher:', error);
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.teacher.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.teachers });
    },
    onError: (error) => {
      console.error('Error deleting teacher:', error);
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.event.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.events });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.event.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.events });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating event:', error);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.event.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.events });
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
    },
  });
};

export const useCreateStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.stream.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.streams });
    },
    onError: (error) => {
      console.error('Error creating stream:', error);
    },
  });
};

export const useUpdateStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.stream.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.streams });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['stream', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating stream:', error);
    },
  });
};

export const useDeleteStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.stream.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.streams });
    },
    onError: (error) => {
      console.error('Error deleting stream:', error);
    },
  });
};

export const useAddBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.wallet.addBalance,
    onSuccess: (_, variables) => {
      if (variables.userId) {
        queryClient.invalidateQueries({ queryKey: apiKeys.wallet(variables.userId) });
      }
    },
    onError: (error) => {
      console.error('Error adding balance:', error);
    },
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.admin.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.admins });
    },
    onError: (error) => {
      console.error('Error creating admin:', error);
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.admin.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.admins });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating admin:', error);
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.admin.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.admins });
    },
    onError: (error) => {
      console.error('Error deleting admin:', error);
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.role.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.roles });
    },
    onError: (error) => {
      console.error('Error creating role:', error);
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.role.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.roles });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating role:', error);
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.role.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.roles });
    },
    onError: (error) => {
      console.error('Error deleting role:', error);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.notification.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.notifications });
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
    },
  });
};

export const useSendPushNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.notification.sendPush,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.notifications });
    },
    onError: (error) => {
      console.error('Error sending push notification:', error);
    },
  });
};

export const useSendInAppNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.notification.sendInApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.notifications });
    },
    onError: (error) => {
      console.error('Error sending in-app notification:', error);
    },
  });
};

export const useDeleteAssignedCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.assignedCourse.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.assignedCourses });
      queryClient.invalidateQueries({ queryKey: apiKeys.courses });
    },
    onError: (error) => {
      console.error('Error deleting assigned course:', error);
    },
  });
};

export const useCreateSuperStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.superStream.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.superStreams });
    },
    onError: (error) => {
      console.error('Error creating super stream:', error);
    },
  });
};

export const useUpdateSuperStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.superStream.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.superStreams });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['superStream', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating super stream:', error);
    },
  });
};

export const useDeleteSuperStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.superStream.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.superStreams });
    },
    onError: (error) => {
      console.error('Error deleting super stream:', error);
    },
  });
};

export const useCreateTopTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.topTeacher.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.topTeachers });
    },
    onError: (error) => {
      console.error('Error creating top teacher:', error);
    },
  });
};

export const useUpdateTopTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.topTeacher.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.topTeachers });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['topTeacher', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating top teacher:', error);
    },
  });
};

export const useDeleteTopTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.topTeacher.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.topTeachers });
    },
    onError: (error) => {
      console.error('Error deleting top teacher:', error);
    },
  });
};

export const useCreateTopStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.topStudent.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.topStudents });
    },
    onError: (error) => {
      console.error('Error creating top student:', error);
    },
  });
};

export const useUpdateTopStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.topStudent.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.topStudents });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['topStudent', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating top student:', error);
    },
  });
};

export const useDeleteTopStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.topStudent.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.topStudents });
    },
    onError: (error) => {
      console.error('Error deleting top student:', error);
    },
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.banner.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.banners });
    },
    onError: (error) => {
      console.error('Error creating banner:', error);
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.banner.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.banners });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['banner', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating banner:', error);
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.banner.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.banners });
    },
    onError: (error) => {
      console.error('Error deleting banner:', error);
    },
  });
};

export const useCreateSocialMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.socialMedia.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.socialMedia });
    },
    onError: (error) => {
      console.error('Error creating social media:', error);
    },
  });
};

export const useUpdateSocialMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.socialMedia.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.socialMedia });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['socialMedia', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating social media:', error);
    },
  });
};

export const useDeleteSocialMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.socialMedia.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.socialMedia });
    },
    onError: (error) => {
      console.error('Error deleting social media:', error);
    },
  });
};

export const useCreateBulkQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.bulkQuestion.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.bulkQuestions });
    },
    onError: (error) => {
      console.error('Error creating bulk question:', error);
    },
  });
};

export const useDeleteBulkQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.bulkQuestion.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.bulkQuestions });
    },
    onError: (error) => {
      console.error('Error deleting bulk question:', error);
    },
  });
};

export const useDeleteAllBulkQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.bulkQuestion.deleteAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.bulkQuestions });
    },
    onError: (error) => {
      console.error('Error deleting all bulk questions:', error);
    },
  });
};

export const useCreateOmrSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.omrSheet.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.omrSheets });
    },
    onError: (error) => {
      console.error('Error creating OMR sheet:', error);
    },
  });
};

export const useDeleteOmrSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.omrSheet.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.omrSheets });
    },
    onError: (error) => {
      console.error('Error deleting OMR sheet:', error);
    },
  });
};
