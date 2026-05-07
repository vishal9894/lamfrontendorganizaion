import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleCreateCourse, 
  handleUpdateCourse, 
  handleDeleteCourse, 
  handleGetCourse, 
  handleGetShortCourseDetails,
  handlePublishCourse,
  handleAssignMultipleCourses,
  handleGetAssignCourse,
  handleDeleteAssignCourse
} from '../api/allApi.js';

// Query keys for cache management
export const courseKeys = {
  all: ['courses'],
  lists: () => [...courseKeys.all, 'list'],
  list: (filters) => [...courseKeys.lists(), { filters }],
  details: () => [...courseKeys.all, 'detail'],
  detail: (id) => [...courseKeys.details(), id],
  shortDetails: () => [...courseKeys.all, 'shortDetails'],
  assigned: () => [...courseKeys.all, 'assigned'],
  assignedList: (filters) => [...courseKeys.assigned(), 'list', { filters }],
};

// Get courses with pagination and caching
export const useCourses = (courseType, page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: courseKeys.list({ courseType, page, limit, ...additionalParams }),
    queryFn: () => handleGetCourse(courseType, page, limit, additionalParams),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Get short course details (for dropdowns/selects)
export const useShortCourseDetails = () => {
  return useQuery({
    queryKey: courseKeys.shortDetails(),
    queryFn: handleGetShortCourseDetails,
    staleTime: 30 * 60 * 1000, // 30 minutes (course details change rarely)
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
};

// Get single course details
export const useCourse = (id) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => handleGetCourse(null, 1, 1, { courseId: id }),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get assigned courses
export const useAssignedCourses = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: courseKeys.assignedList({ page, limit, ...additionalParams }),
    queryFn: () => handleGetAssignCourse(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Create course mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateCourse,
    onSuccess: (data) => {
      // Invalidate course lists to refresh
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.shortDetails() });
    },
    onError: (error) => {
      console.error('Create course error:', error);
    },
  });
};

// Update course mutation with optimistic updates
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleUpdateCourse,
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: courseKeys.all });
      
      // Snapshot previous value
      const previousCourses = queryClient.getQueryData(courseKeys.lists());
      
      // Optimistically update
      queryClient.setQueriesData({ queryKey: courseKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(course => 
            course._id === data.courseId ? { ...course, ...data } : course
          )
        };
      });
      
      return { previousCourses };
    },
    onError: (err, variables, context) => {
      if (context?.previousCourses) {
        queryClient.setQueriesData({ queryKey: courseKeys.lists() }, context.previousCourses);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.shortDetails() });
    },
  });
};

// Delete course mutation with optimistic updates
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteCourse,
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: courseKeys.all });
      
      const previousCourses = queryClient.getQueryData(courseKeys.lists());
      
      queryClient.setQueriesData({ queryKey: courseKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(course => course._id !== courseId),
          total: old.total - 1
        };
      });
      
      return { previousCourses };
    },
    onError: (err, courseId, context) => {
      if (context?.previousCourses) {
        queryClient.setQueriesData({ queryKey: courseKeys.lists() }, context.previousCourses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.shortDetails() });
    },
  });
};

// Publish/unpublish course mutation with optimistic updates
export const usePublishCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, publish }) => handlePublishCourse(id, publish),
    onMutate: async ({ id, publish }) => {
      await queryClient.cancelQueries({ queryKey: courseKeys.all });
      
      const previousCourses = queryClient.getQueryData(courseKeys.lists());
      
      queryClient.setQueriesData({ queryKey: courseKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(course => 
            course._id === id ? { ...course, status: publish } : course
          )
        };
      });
      
      return { previousCourses };
    },
    onError: (err, variables, context) => {
      if (context?.previousCourses) {
        queryClient.setQueriesData({ queryKey: courseKeys.lists() }, context.previousCourses);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
    },
  });
};

// Assign courses mutation
export const useAssignCourses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleAssignMultipleCourses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.assigned() });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

// Delete assigned course mutation
export const useDeleteAssignedCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, userId }) => handleDeleteAssignCourse(courseId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.assigned() });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

// Prefetch courses for better UX
export const prefetchCourses = (queryClient, courseType, page = 1, limit = 10, additionalParams = {}) => {
  return queryClient.prefetchQuery({
    queryKey: courseKeys.list({ courseType, page, limit, ...additionalParams }),
    queryFn: () => handleGetCourse(courseType, page, limit, additionalParams),
    staleTime: 10 * 60 * 1000,
  });
};

// Prefetch short course details
export const prefetchShortCourseDetails = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: courseKeys.shortDetails(),
    queryFn: handleGetShortCourseDetails,
    staleTime: 30 * 60 * 1000,
  });
};
