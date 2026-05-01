import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api, { apiKeys } from '../api/optimizedApi';
import { PAGINATION_CONFIG, getPaginatedQueryKey, getAdjacentPagesToPrefetch, calculatePagination, generatePageNumbers } from '../utils/pagination';

// Aggressive caching configuration for production
const CACHE_CONFIG = {
  // Static data - long cache
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  // User data - medium cache
  USER: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
  },
  // Dynamic data - short cache
  DYNAMIC: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
  // Real-time data - very short cache
  REALTIME: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 1 * 60 * 1000, // 1 minute
  }
};

// Optimized user hooks with pagination
export const useUsers = (page = 1, limit = PAGINATION_CONFIG.USERS.default, additionalParams = {}, options = {}) => {
  const queryKey = getPaginatedQueryKey(apiKeys.users, page, limit, additionalParams);

  return useQuery({
    queryKey,
    queryFn: () => api.user.getAll(page, limit, additionalParams),
    ...CACHE_CONFIG.USER,
    ...options,
    select: (data) => ({
      ...data,
      // Pre-computed values for faster rendering
      totalUsers: data.total || 0,
      activeUsers: data.data?.filter(u => u.status === 'active')?.length || 0,
      pagination: calculatePagination(data.total, data.page, data.limit),
      pageNumbers: generatePageNumbers(data.page, data.totalPages),
    }),
  });
};

export const useUserCount = (options = {}) => {
  return useQuery({
    queryKey: apiKeys.userCount,
    queryFn: () => api.user.getCount(),
    ...CACHE_CONFIG.DYNAMIC,
    ...options,
    // Optimistic updates
    staleTime: 5 * 60 * 1000, // 5 minutes for count
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.user.update(id, data),
    // Optimistic update for instant UI feedback
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: apiKeys.users });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(apiKeys.users);

      // Optimistically update to the new value
      queryClient.setQueryData(apiKeys.users, (old) => ({
        ...old,
        data: old?.data?.map(user =>
          user.id === id ? { ...user, ...data } : user
        ) || [],
      }));

      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      queryClient.setQueryData(apiKeys.users, context.previousUsers);
      toast.error('Failed to update user');
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.users });
      queryClient.invalidateQueries({ queryKey: apiKeys.userCount });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.user.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: apiKeys.users });
      const previousUsers = queryClient.getQueryData(apiKeys.users);

      queryClient.setQueryData(apiKeys.users, (old) => ({
        ...old,
        data: old?.data?.filter(user => user.id !== id) || [],
        total: (old?.total || 0) - 1,
      }));

      return { previousUsers };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(apiKeys.users, context.previousUsers);
      toast.error('Failed to delete user');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.users });
      queryClient.invalidateQueries({ queryKey: apiKeys.userCount });
    },
  });
};

// Optimized wallet hooks
export const useWallet = (id, options = {}) => {
  return useQuery({
    queryKey: apiKeys.wallet(id),
    queryFn: () => api.wallet.getWallet(id),
    enabled: !!id,
    ...CACHE_CONFIG.USER,
    ...options,
    // Wallet data is critical, cache longer
    staleTime: 15 * 60 * 1000,
  });
};

export const useAddBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.wallet.addBalance(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: apiKeys.wallet(data.userId) });
      const previousWallet = queryClient.getQueryData(apiKeys.wallet(data.userId));

      // Optimistically update wallet balance
      queryClient.setQueryData(apiKeys.wallet(data.userId), (old) => ({
        ...old,
        balance: (old?.balance || 0) + data.amount,
      }));

      return { previousWallet };
    },
    onError: (err, data, context) => {
      queryClient.setQueryData(apiKeys.wallet(data.userId), context.previousWallet);
      toast.error('Failed to add balance');
    },
    onSettled: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiKeys.wallet(variables.userId) });
    },
  });
};

// Optimized course hooks with pagination
export const useCourses = (courseType, page = 1, limit = PAGINATION_CONFIG.COURSES.default, additionalParams = {}, options = {}) => {
  const queryKey = getPaginatedQueryKey([...apiKeys.courses, courseType], page, limit, additionalParams);

  return useQuery({
    queryKey,
    queryFn: () => api.course.get(courseType, page, limit, additionalParams),
    enabled: !!courseType,
    ...CACHE_CONFIG.USER,
    ...options,
    select: (data) => ({
      ...data,
      activeCourses: data.data?.filter(c => c.status === 'active')?.length || 0,
      totalCourses: data.data?.length || 0,
      pagination: calculatePagination(data.total, data.page, data.limit),
      pageNumbers: generatePageNumbers(data.page, data.totalPages),
    }),
  });
};

export const useActiveCourseCount = (options = {}) => {
  return useQuery({
    queryKey: apiKeys.activeCourses,
    queryFn: () => api.course.getActiveCount(),
    ...CACHE_CONFIG.DYNAMIC,
    ...options,
    staleTime: 10 * 60 * 1000, // Cache course counts longer
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.courses });
      queryClient.invalidateQueries({ queryKey: apiKeys.activeCourses });
      toast.success('Course created successfully');
    },
    onError: () => {
      toast.error('Failed to create course');
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.courses });
      queryClient.invalidateQueries({ queryKey: apiKeys.activeCourses });
      toast.success('Course deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete course');
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.courses });
      toast.success('Course updated successfully');
    },
    onError: () => {
      toast.error('Failed to update course');
    },
  });
};

export const usePublishCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => api.course.publish(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.courses });
      toast.success('Course status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update course status');
    },
  });
};

// Optimized quiz hooks with pagination
export const useQuizzes = (page = 1, limit = PAGINATION_CONFIG.QUIZZES.default, additionalParams = {}, options = {}) => {
  const queryKey = getPaginatedQueryKey(apiKeys.quizzes, page, limit, additionalParams);

  return useQuery({
    queryKey,
    queryFn: () => api.quiz.getAll(page, limit, additionalParams),
    ...CACHE_CONFIG.USER,
    ...options,
    select: (data) => ({
      ...data,
      totalQuizzes: data.data?.length || 0,
      pagination: calculatePagination(data.total, data.page, data.limit),
      pageNumbers: generatePageNumbers(data.page, data.totalPages),
    }),
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.quiz.createMcq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.quizzes });
      toast.success('Quiz created successfully');
    },
    onError: () => {
      toast.error('Failed to create quiz');
    },
  });
};

// Optimized teacher hooks with pagination
export const useTeachers = (page = 1, limit = PAGINATION_CONFIG.TEACHERS.default, additionalParams = {}, options = {}) => {
  const queryKey = getPaginatedQueryKey(apiKeys.teachers, page, limit, additionalParams);

  return useQuery({
    queryKey,
    queryFn: () => api.teacher.getAll(page, limit, additionalParams),
    ...CACHE_CONFIG.USER,
    ...options,
    select: (data) => ({
      ...data,
      totalTeachers: data.data?.length || 0,
      pagination: calculatePagination(data.total, data.page, data.limit),
      pageNumbers: generatePageNumbers(data.page, data.totalPages),
    }),
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.teacher.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.teachers });
      toast.success('Teacher created successfully');
    },
    onError: () => {
      toast.error('Failed to create teacher');
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.teacher.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.teachers });
      toast.success('Teacher updated successfully');
    },
    onError: () => {
      toast.error('Failed to update teacher');
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.teacher.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.teachers });
      toast.success('Teacher deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete teacher');
    },
  });
};

// Optimized event hooks with pagination
export const useEvents = (page = 1, limit = PAGINATION_CONFIG.EVENTS.default, additionalParams = {}, options = {}) => {
  const queryKey = getPaginatedQueryKey(apiKeys.events, page, limit, additionalParams);

  return useQuery({
    queryKey,
    queryFn: () => api.event.getAll(page, limit, additionalParams),
    ...CACHE_CONFIG.USER,
    ...options,
    select: (data) => ({
      ...data,
      totalEvents: data.data?.length || 0,
      pagination: calculatePagination(data.total, data.page, data.limit),
      pageNumbers: generatePageNumbers(data.page, data.totalPages),
    }),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.events });
      toast.success('Event created successfully');
    },
    onError: () => {
      toast.error('Failed to create event');
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.events });
      toast.success('Event updated successfully');
    },
    onError: () => {
      toast.error('Failed to update event');
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.events });
      toast.success('Event deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete event');
    },
  });
};

// Optimized stream hooks with pagination
export const useStreams = (page = 1, limit = PAGINATION_CONFIG.STREAMS.default, additionalParams = {}, options = {}) => {
  const queryKey = getPaginatedQueryKey(apiKeys.streams, page, limit, additionalParams);

  return useQuery({
    queryKey,
    queryFn: () => api.stream.getAll(page, limit, additionalParams),
    ...CACHE_CONFIG.USER,
    ...options,
    select: (data) => ({
      ...data,
      totalStreams: data.data?.length || 0,
      pagination: calculatePagination(data.total, data.page, data.limit),
      pageNumbers: generatePageNumbers(data.page, data.totalPages),
    }),
  });
};

export const useDeleteStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.stream.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.streams });
      toast.success('Stream deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete stream');
    },
  });
};

// Optimized admin hooks with pagination
export const useAdmins = (page = 1, limit = PAGINATION_CONFIG.ADMINS.default, additionalParams = {}, options = {}) => {
  const queryKey = getPaginatedQueryKey(apiKeys.admins, page, limit, additionalParams);

  return useQuery({
    queryKey,
    queryFn: () => api.admin.getAll(page, limit, additionalParams),
    ...CACHE_CONFIG.USER,
    ...options,
    select: (data) => ({
      ...data,
      totalAdmins: data.data?.length || 0,
      pagination: calculatePagination(data.total, data.page, data.limit),
      pageNumbers: generatePageNumbers(data.page, data.totalPages),
    }),
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.admin.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.admins });
      toast.success('Admin created successfully');
    },
    onError: () => {
      toast.error('Failed to create admin');
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.admin.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.admins });
      toast.success('Admin updated successfully');
    },
    onError: () => {
      toast.error('Failed to update admin');
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.admin.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.admins });
      toast.success('Admin deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete admin');
    },
  });
};

// Optimized role hooks with pagination
export const useRoles = (page = 1, limit = PAGINATION_CONFIG.ROLES.default, additionalParams = {}, options = {}) => {
  const queryKey = getPaginatedQueryKey(apiKeys.roles, page, limit, additionalParams);

  return useQuery({
    queryKey,
    queryFn: () => api.role.getAll(page, limit, additionalParams),
    ...CACHE_CONFIG.USER,
    ...options,
    select: (data) => ({
      ...data,
      totalRoles: data.data?.length || 0,
      pagination: calculatePagination(data.total, data.page, data.limit),
      pageNumbers: generatePageNumbers(data.page, data.totalPages),
    }),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.role.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.roles });
      toast.success('Role created successfully');
    },
    onError: () => {
      toast.error('Failed to create role');
    },
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.role.updatePermissions(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.roles });
      toast.success('Role permissions updated successfully');
    },
    onError: () => {
      toast.error('Failed to update role permissions');
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.role.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.roles });
      toast.success('Role deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete role');
    },
  });
};

// Optimized notification hooks with pagination
export const useNotifications = (page = 1, limit = PAGINATION_CONFIG.NOTIFICATIONS.default, additionalParams = {}, options = {}) => {
  const queryKey = getPaginatedQueryKey(apiKeys.notifications, page, limit, additionalParams);

  return useQuery({
    queryKey,
    queryFn: () => api.notification.getHistory(page, limit, additionalParams),
    ...CACHE_CONFIG.USER,
    ...options,
    select: (data) => ({
      ...data,
      totalNotifications: data.data?.length || 0,
      pagination: calculatePagination(data.total, data.page, data.limit),
      pageNumbers: generatePageNumbers(data.page, data.totalPages),
    }),
  });
};

// Infinite scroll pagination hook for smooth loading
export const useInfiniteUsers = (limit = PAGINATION_CONFIG.USERS.default, additionalParams = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: [...apiKeys.users, 'infinite', limit, additionalParams],
    queryFn: ({ pageParam = 1 }) => api.user.getAll(pageParam, limit, additionalParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    ...CACHE_CONFIG.USER,
    ...options,
  });
};

// Prefetch adjacent pages for smooth navigation
export const usePrefetchAdjacentPages = (queryKey, currentPage, totalPages, limit, additionalParams = {}) => {
  const queryClient = useQueryClient();

  const prefetchPages = () => {
    const pagesToPrefetch = getAdjacentPagesToPrefetch(currentPage, totalPages);

    pagesToPrefetch.forEach(page => {
      const pageQueryKey = getPaginatedQueryKey(queryKey, page, limit, additionalParams);
      queryClient.prefetchQuery({
        queryKey: pageQueryKey,
        queryFn: () => {
          // This will be replaced by the actual query function based on the key
          return Promise.resolve({});
        },
        staleTime: CACHE_CONFIG.USER.staleTime,
      });
    });
  };

  return { prefetchPages };
};

// Prefetching hook for dashboard optimization
export const usePrefetchDashboard = () => {
  const queryClient = useQueryClient();

  const prefetchDashboardData = (userId) => {
    // Prefetch all dashboard data in parallel
    queryClient.prefetchQuery({
      queryKey: apiKeys.wallet(userId),
      queryFn: () => api.wallet.getWallet(userId),
      staleTime: 15 * 60 * 1000,
    });

    queryClient.prefetchQuery({
      queryKey: apiKeys.activeCourses,
      queryFn: () => api.course.getActiveCount(),
      staleTime: 10 * 60 * 1000,
    });

    queryClient.prefetchQuery({
      queryKey: apiKeys.userCount,
      queryFn: () => api.user.getCount(),
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchDashboardData };
};

// Batch loading hook for multiple API calls
export const useBatchLoad = (queries) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['batch', ...queries.map(q => q.queryKey)],
    queryFn: async () => {
      const results = await Promise.allSettled(
        queries.map(({ queryKey, queryFn }) =>
          queryClient.fetchQuery({ queryKey, queryFn })
        )
      );

      return results.map((result, index) => ({
        queryKey: queries[index].queryKey,
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null,
      }));
    },
    ...CACHE_CONFIG.DYNAMIC,
    // Don't refetch batch queries automatically
    refetchInterval: false,
  });
};

// Request deduplication hook
export const useDeduplicatedQuery = (queryKey, queryFn, options = {}) => {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
    // Enable structural sharing for memory efficiency
    structuralSharing: true,
    // Prevent multiple identical requests
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Optimistic update helper
export const useOptimisticMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel related queries
      const queriesToCancel = options.relatedQueries || [];
      await Promise.all(
        queriesToCancel.map(queryKey =>
          queryClient.cancelQueries({ queryKey })
        )
      );

      // Snapshot previous values
      const previousValues = {};
      queriesToCancel.forEach(queryKey => {
        previousValues[queryKey] = queryClient.getQueryData(queryKey);
      });

      // Apply optimistic updates
      if (options.onOptimisticUpdate) {
        options.onOptimisticUpdate(variables, queryClient);
      }

      return { previousValues };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      Object.entries(context.previousValues).forEach(([queryKey, value]) => {
        queryClient.setQueryData(queryKey, value);
      });

      if (options.onError) {
        options.onError(error, variables);
      }
    },
    onSettled: (data, error, variables, context) => {
      // Refetch related queries
      const queriesToInvalidate = options.relatedQueries || [];
      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      if (options.onSettled) {
        options.onSettled(data, error, variables);
      }
    },
  });
};

export default {
  // User hooks
  useUsers,
  useUserCount,
  useUpdateUser,
  useDeleteUser,
  useInfiniteUsers,

  // Wallet hooks
  useWallet,
  useAddBalance,

  // Course hooks
  useCourses,
  useActiveCourseCount,
  useCreateCourse,
  useDeleteCourse,
  useUpdateCourse,
  usePublishCourse,

  // Quiz hooks
  useQuizzes,
  useCreateQuiz,

  // Teacher hooks
  useTeachers,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,

  // Event hooks
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,

  // Stream hooks
  useStreams,
  useDeleteStream,

  // Admin hooks
  useAdmins,
  useCreateAdmin,
  useUpdateAdmin,
  useDeleteAdmin,

  // Role hooks
  useRoles,
  useCreateRole,
  useUpdateRolePermissions,
  useDeleteRole,

  // Notification hooks
  useNotifications,

  // Utility hooks
  usePrefetchDashboard,
  usePrefetchAdjacentPages,
  useBatchLoad,
  useDeduplicatedQuery,
  useOptimisticMutation,

  // Cache config for reference
  CACHE_CONFIG,
};
