import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleCreateOmrSheet, 
  handleGetOmrSheet, 
  handleMatchOmrSheetKey, 
  handleDeleteOmrSheet 
} from '../api/allApi.js';

// Query keys for cache management
export const omrKeys = {
  all: ['omrSheets'],
  lists: () => [...omrKeys.all, 'list'],
  list: (filters) => [...omrKeys.lists(), { filters }],
  details: () => [...omrKeys.all, 'detail'],
  detail: (id) => [...omrKeys.details(), id],
  keys: () => [...omrKeys.all, 'keys'],
};

// Get OMR sheets with caching
export const useOmrSheets = () => {
  return useQuery({
    queryKey: omrKeys.list(),
    queryFn: handleGetOmrSheet,
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

// Get OMR sheet keys with caching
export const useOmrSheetKeys = () => {
  return useQuery({
    queryKey: omrKeys.keys(),
    queryFn: handleMatchOmrSheetKey,
    staleTime: 15 * 60 * 1000, // 15 minutes (keys change rarely)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// Get single OMR sheet details
export const useOmrSheet = (id) => {
  return useQuery({
    queryKey: omrKeys.detail(id),
    queryFn: () => handleGetOmrSheet(),
    enabled: !!id,
    staleTime: 12 * 60 * 1000, // 12 minutes
    gcTime: 24 * 60 * 1000, // 24 minutes
  });
};

// Create OMR sheet mutation
export const useCreateOmrSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateOmrSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: omrKeys.lists() });
      queryClient.invalidateQueries({ queryKey: omrKeys.keys() });
    },
    onError: (error) => {
      console.error('Create OMR sheet error:', error);
    },
  });
};

// Delete OMR sheet mutation with optimistic updates
export const useDeleteOmrSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteOmrSheet,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: omrKeys.all });
      
      const previousSheets = queryClient.getQueryData(omrKeys.lists());
      
      queryClient.setQueryData(omrKeys.lists(), (old) => {
        if (!Array.isArray(old?.data)) return old;
        return {
          ...old,
          data: old.data.filter(sheet => sheet._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousSheets };
    },
    onError: (err, id, context) => {
      if (context?.previousSheets) {
        queryClient.setQueryData(omrKeys.lists(), context.previousSheets);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: omrKeys.lists() });
      queryClient.invalidateQueries({ queryKey: omrKeys.keys() });
    },
  });
};

// Prefetch OMR sheets for better UX
export const prefetchOmrSheets = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: omrKeys.list(),
    queryFn: handleGetOmrSheet,
    staleTime: 10 * 60 * 1000,
  });
};
