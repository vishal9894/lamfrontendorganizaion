import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleCreateEvent, 
  handleGetEvent, 
  handleGetAllEvent, 
  handleDeleteEvent, 
  handleUpdateEvent,
  handleCreateAttachment,
  handleGetAttachment,
  handleUpdateAttachment,
  handleDeleteAttachment
} from '../api/allApi.js';

// Query keys for cache management
export const eventKeys = {
  all: ['events'],
  lists: () => [...eventKeys.all, 'list'],
  list: (filters) => [...eventKeys.lists(), { filters }],
  details: () => [...eventKeys.all, 'detail'],
  detail: (id) => [...eventKeys.details(), id],
  attachments: () => [...eventKeys.all, 'attachments'],
  eventAttachments: (eventId) => [...eventKeys.attachments(), eventId],
};

// Get events with pagination and caching
export const useEvents = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: eventKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetAllEvent(page, limit, additionalParams),
    staleTime: 6 * 60 * 1000, // 6 minutes
    gcTime: 12 * 60 * 1000, // 12 minutes
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

// Get single event details
export const useEvent = (id) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => handleGetEvent(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Get event attachments
export const useEventAttachments = (eventId) => {
  return useQuery({
    queryKey: eventKeys.eventAttachments(eventId),
    queryFn: () => handleGetAttachment(eventId),
    enabled: !!eventId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// Create event mutation
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: (error) => {
      console.error('Create event error:', error);
    },
  });
};

// Update event mutation with optimistic updates
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }) => handleUpdateEvent(id, formData),
    onMutate: async ({ id, formData }) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.all });
      
      const previousEvents = queryClient.getQueryData(eventKeys.lists());
      
      queryClient.setQueriesData({ queryKey: eventKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(event => 
            event._id === id ? { ...event, ...formData } : event
          )
        };
      });
      
      return { previousEvents };
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueriesData({ queryKey: eventKeys.lists() }, context.previousEvents);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
    },
  });
};

// Delete event mutation with optimistic updates
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteEvent,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.all });
      
      const previousEvents = queryClient.getQueryData(eventKeys.lists());
      
      queryClient.setQueriesData({ queryKey: eventKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(event => event._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousEvents };
    },
    onError: (err, id, context) => {
      if (context?.previousEvents) {
        queryClient.setQueriesData({ queryKey: eventKeys.lists() }, context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
};

// Create attachment mutation
export const useCreateAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateAttachment,
    onSuccess: (data, variables) => {
      // Invalidate attachments for the specific event
      const eventId = variables.get('eventId') || variables.eventId;
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: eventKeys.eventAttachments(eventId) });
      }
    },
  });
};

// Update attachment mutation
export const useUpdateAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }) => handleUpdateAttachment(id, formData),
    onSuccess: (data, variables) => {
      // Invalidate attachments for the event
      queryClient.invalidateQueries({ queryKey: eventKeys.attachments() });
    },
  });
};

// Delete attachment mutation
export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.attachments() });
    },
  });
};

// Prefetch events for better UX
export const prefetchEvents = (queryClient, page = 1, limit = 10, additionalParams = {}) => {
  return queryClient.prefetchQuery({
    queryKey: eventKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetAllEvent(page, limit, additionalParams),
    staleTime: 6 * 60 * 1000,
  });
};
