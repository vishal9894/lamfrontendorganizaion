import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleCreateBanner, 
  handleGetBanner, 
  handlePublishBanner, 
  handleDeleteBanner 
} from '../api/allApi.js';

// Query keys for cache management
export const bannerKeys = {
  all: ['banners'],
  lists: () => [...bannerKeys.all, 'list'],
  list: (filters) => [...bannerKeys.lists(), { filters }],
  details: () => [...bannerKeys.all, 'detail'],
  detail: (id) => [...bannerKeys.details(), id],
};

// Get banners with pagination and caching
export const useBanners = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: bannerKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetBanner(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000, // 5 minutes (banners may change frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
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

// Get single banner details
export const useBanner = (id) => {
  return useQuery({
    queryKey: bannerKeys.detail(id),
    queryFn: () => handleGetBanner(1, 1, { bannerId: id }),
    enabled: !!id,
    staleTime: 8 * 60 * 1000, // 8 minutes
    gcTime: 16 * 60 * 1000, // 16 minutes
  });
};

// Create banner mutation
export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
    onError: (error) => {
      console.error('Create banner error:', error);
    },
  });
};

// Publish/unpublish banner mutation with optimistic updates
export const usePublishBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, publish }) => handlePublishBanner(id, publish),
    onMutate: async ({ id, publish }) => {
      await queryClient.cancelQueries({ queryKey: bannerKeys.all });
      
      const previousBanners = queryClient.getQueryData(bannerKeys.lists());
      
      queryClient.setQueriesData({ queryKey: bannerKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(banner => 
            banner._id === id ? { ...banner, publish } : banner
          )
        };
      });
      
      return { previousBanners };
    },
    onError: (err, variables, context) => {
      if (context?.previousBanners) {
        queryClient.setQueriesData({ queryKey: bannerKeys.lists() }, context.previousBanners);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bannerKeys.detail(variables.id) });
    },
  });
};

// Delete banner mutation with optimistic updates
export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteBanner,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bannerKeys.all });
      
      const previousBanners = queryClient.getQueryData(bannerKeys.lists());
      
      queryClient.setQueriesData({ queryKey: bannerKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(banner => banner._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousBanners };
    },
    onError: (err, id, context) => {
      if (context?.previousBanners) {
        queryClient.setQueriesData({ queryKey: bannerKeys.lists() }, context.previousBanners);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
};

// Prefetch banners for better UX
export const prefetchBanners = (queryClient, page = 1, limit = 10, additionalParams = {}) => {
  return queryClient.prefetchQuery({
    queryKey: bannerKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetBanner(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
  });
};
