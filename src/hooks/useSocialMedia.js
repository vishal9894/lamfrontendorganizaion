import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleCreateSocialMedia, 
  handleUpdateSocialMedia, 
  handleGetSocialMedia, 
  handleDeleteSocialMedia 
} from '../api/allApi.js';

// Query keys for cache management
export const socialMediaKeys = {
  all: ['socialMedia'],
  lists: () => [...socialMediaKeys.all, 'list'],
  list: (filters) => [...socialMediaKeys.lists(), { filters }],
  details: () => [...socialMediaKeys.all, 'detail'],
  detail: (id) => [...socialMediaKeys.details(), id],
};

// Get social media links with caching
export const useSocialMedia = () => {
  return useQuery({
    queryKey: socialMediaKeys.list(),
    queryFn: handleGetSocialMedia,
    staleTime: 20 * 60 * 1000, // 20 minutes (social media links change rarely)
    gcTime: 40 * 60 * 1000, // 40 minutes
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

// Get single social media detail
export const useSocialMediaDetail = (id) => {
  return useQuery({
    queryKey: socialMediaKeys.detail(id),
    queryFn: () => handleGetSocialMedia(),
    enabled: !!id,
    staleTime: 25 * 60 * 1000, // 25 minutes
    gcTime: 50 * 60 * 1000, // 50 minutes
  });
};

// Create social media mutation
export const useCreateSocialMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateSocialMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialMediaKeys.lists() });
    },
    onError: (error) => {
      console.error('Create social media error:', error);
    },
  });
};

// Update social media mutation with optimistic updates
export const useUpdateSocialMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }) => handleUpdateSocialMedia(id, formData),
    onMutate: async ({ id, formData }) => {
      await queryClient.cancelQueries({ queryKey: socialMediaKeys.all });
      
      const previousSocialMedia = queryClient.getQueryData(socialMediaKeys.lists());
      
      queryClient.setQueryData(socialMediaKeys.lists(), (old) => {
        if (!Array.isArray(old?.data)) return old;
        return {
          ...old,
          data: old.data.map(item => 
            item._id === id ? { ...item, ...formData } : item
          )
        };
      });
      
      return { previousSocialMedia };
    },
    onError: (err, variables, context) => {
      if (context?.previousSocialMedia) {
        queryClient.setQueryData(socialMediaKeys.lists(), context.previousSocialMedia);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: socialMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: socialMediaKeys.detail(variables.id) });
    },
  });
};

// Delete social media mutation with optimistic updates
export const useDeleteSocialMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteSocialMedia,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: socialMediaKeys.all });
      
      const previousSocialMedia = queryClient.getQueryData(socialMediaKeys.lists());
      
      queryClient.setQueryData(socialMediaKeys.lists(), (old) => {
        if (!Array.isArray(old?.data)) return old;
        return {
          ...old,
          data: old.data.filter(item => item._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousSocialMedia };
    },
    onError: (err, id, context) => {
      if (context?.previousSocialMedia) {
        queryClient.setQueryData(socialMediaKeys.lists(), context.previousSocialMedia);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: socialMediaKeys.lists() });
    },
  });
};

// Prefetch social media for better UX
export const prefetchSocialMedia = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: socialMediaKeys.list(),
    queryFn: handleGetSocialMedia,
    staleTime: 20 * 60 * 1000,
  });
};
