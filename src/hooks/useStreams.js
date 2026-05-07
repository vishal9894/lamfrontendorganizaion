import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleCreateStream, 
  handleGetStream, 
  handleDeleteStream, 
  handleUpdateStream,
  handlecreateSuperStream,
  handleGetSuperStream,
  handleUpdateSuperStream,
  handleDeleteSuperStream
} from '../api/allApi.js';

// Query keys for cache management
export const streamKeys = {
  all: ['streams'],
  lists: () => [...streamKeys.all, 'list'],
  list: (filters) => [...streamKeys.lists(), { filters }],
  details: () => [...streamKeys.all, 'detail'],
  detail: (id) => [...streamKeys.details(), id],
  super: () => [...streamKeys.all, 'super'],
  superList: () => [...streamKeys.super(), 'list'],
  superDetail: (id) => [...streamKeys.super(), 'detail', id],
};

// Get streams with pagination and caching
export const useStreams = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: streamKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetStream(page, limit, additionalParams),
    staleTime: 7 * 60 * 1000, // 7 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
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

// Get single stream details
export const useStream = (id) => {
  return useQuery({
    queryKey: streamKeys.detail(id),
    queryFn: () => handleGetStream(1, 1, { streamId: id }),
    enabled: !!id,
    staleTime: 12 * 60 * 1000, // 12 minutes
    gcTime: 25 * 60 * 1000, // 25 minutes
  });
};

// Get super streams with caching
export const useSuperStreams = () => {
  return useQuery({
    queryKey: streamKeys.superList(),
    queryFn: handleGetSuperStream,
    staleTime: 5 * 60 * 1000, // 5 minutes (super streams may change frequently)
    gcTime: 12 * 60 * 1000, // 12 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// Get single super stream details
export const useSuperStream = (id) => {
  return useQuery({
    queryKey: streamKeys.superDetail(id),
    queryFn: () => handleGetSuperStream(),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Create stream mutation
export const useCreateStream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateStream,
    onSuccess: () => {
      // Invalidate stream lists
      queryClient.invalidateQueries({ queryKey: streamKeys.lists() });
    },
    onError: (error) => {
      console.error('Create stream error:', error);
    },
  });
};

// Update stream mutation with optimistic updates
export const useUpdateStream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }) => handleUpdateStream(id, formData),
    onMutate: async ({ id, formData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: streamKeys.all });
      
      // Snapshot previous value
      const previousStreams = queryClient.getQueryData(streamKeys.lists());
      
      // Optimistically update
      queryClient.setQueriesData({ queryKey: streamKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(stream => 
            stream._id === id ? { ...stream, ...formData } : stream
          )
        };
      });
      
      return { previousStreams };
    },
    onError: (err, variables, context) => {
      if (context?.previousStreams) {
        queryClient.setQueriesData({ queryKey: streamKeys.lists() }, context.previousStreams);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: streamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: streamKeys.detail(variables.id) });
    },
  });
};

// Delete stream mutation with optimistic updates
export const useDeleteStream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteStream,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: streamKeys.all });
      
      const previousStreams = queryClient.getQueryData(streamKeys.lists());
      
      queryClient.setQueriesData({ queryKey: streamKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(stream => stream._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousStreams };
    },
    onError: (err, id, context) => {
      if (context?.previousStreams) {
        queryClient.setQueriesData({ queryKey: streamKeys.lists() }, context.previousStreams);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: streamKeys.lists() });
    },
  });
};

// Create super stream mutation
export const useCreateSuperStream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handlecreateSuperStream,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: streamKeys.super() });
    },
    onError: (error) => {
      console.error('Create super stream error:', error);
    },
  });
};

// Update super stream mutation with optimistic updates
export const useUpdateSuperStream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => handleUpdateSuperStream(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: streamKeys.super() });
      
      const previousSuperStreams = queryClient.getQueryData(streamKeys.superList());
      
      queryClient.setQueryData(streamKeys.superList(), (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(stream => 
          stream._id === id ? { ...stream, ...data } : stream
        );
      });
      
      return { previousSuperStreams };
    },
    onError: (err, variables, context) => {
      if (context?.previousSuperStreams) {
        queryClient.setQueryData(streamKeys.superList(), context.previousSuperStreams);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: streamKeys.super() });
      queryClient.invalidateQueries({ queryKey: streamKeys.superDetail(variables.id) });
    },
  });
};

// Delete super stream mutation with optimistic updates
export const useDeleteSuperStream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteSuperStream,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: streamKeys.super() });
      
      const previousSuperStreams = queryClient.getQueryData(streamKeys.superList());
      
      queryClient.setQueryData(streamKeys.superList(), (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter(stream => stream._id !== id);
      });
      
      return { previousSuperStreams };
    },
    onError: (err, id, context) => {
      if (context?.previousSuperStreams) {
        queryClient.setQueryData(streamKeys.superList(), context.previousSuperStreams);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: streamKeys.super() });
    },
  });
};

// Prefetch streams for better UX
export const prefetchStreams = (queryClient, page = 1, limit = 10, additionalParams = {}) => {
  return queryClient.prefetchQuery({
    queryKey: streamKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetStream(page, limit, additionalParams),
    staleTime: 7 * 60 * 1000,
  });
};

// Prefetch super streams
export const prefetchSuperStreams = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: streamKeys.superList(),
    queryFn: handleGetSuperStream,
    staleTime: 5 * 60 * 1000,
  });
};
