import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleCreateTeacher, 
  handleGetTeacher, 
  handleUpdateTeacher, 
  handleDeleteTeacher 
} from '../api/allApi.js';

// Query keys for cache management
export const teacherKeys = {
  all: ['teachers'],
  lists: () => [...teacherKeys.all, 'list'],
  list: (filters) => [...teacherKeys.lists(), { filters }],
  details: () => [...teacherKeys.all, 'detail'],
  detail: (id) => [...teacherKeys.details(), id],
};

// Get teachers with pagination and caching
export const useTeachers = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: teacherKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetTeacher(page, limit, additionalParams),
    staleTime: 8 * 60 * 1000, // 8 minutes
    gcTime: 16 * 60 * 1000, // 16 minutes
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

// Get single teacher details
export const useTeacher = (id) => {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => handleGetTeacher(1, 1, { teacherId: id }),
    enabled: !!id,
    staleTime: 12 * 60 * 1000, // 12 minutes
    gcTime: 24 * 60 * 1000, // 24 minutes
  });
};

// Create teacher mutation
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
    },
    onError: (error) => {
      console.error('Create teacher error:', error);
    },
  });
};

// Update teacher mutation with optimistic updates
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }) => handleUpdateTeacher(id, formData),
    onMutate: async ({ id, formData }) => {
      await queryClient.cancelQueries({ queryKey: teacherKeys.all });
      
      const previousTeachers = queryClient.getQueryData(teacherKeys.lists());
      
      queryClient.setQueriesData({ queryKey: teacherKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(teacher => 
            teacher._id === id ? { ...teacher, ...formData } : teacher
          )
        };
      });
      
      return { previousTeachers };
    },
    onError: (err, variables, context) => {
      if (context?.previousTeachers) {
        queryClient.setQueriesData({ queryKey: teacherKeys.lists() }, context.previousTeachers);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(variables.id) });
    },
  });
};

// Delete teacher mutation with optimistic updates
export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteTeacher,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: teacherKeys.all });
      
      const previousTeachers = queryClient.getQueryData(teacherKeys.lists());
      
      queryClient.setQueriesData({ queryKey: teacherKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(teacher => teacher._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousTeachers };
    },
    onError: (err, id, context) => {
      if (context?.previousTeachers) {
        queryClient.setQueriesData({ queryKey: teacherKeys.lists() }, context.previousTeachers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
    },
  });
};

// Prefetch teachers for better UX
export const prefetchTeachers = (queryClient, page = 1, limit = 10, additionalParams = {}) => {
  return queryClient.prefetchQuery({
    queryKey: teacherKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetTeacher(page, limit, additionalParams),
    staleTime: 8 * 60 * 1000,
  });
};
