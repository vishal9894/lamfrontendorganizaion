import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleGetAllRoles, 
  handleGetRoleById, 
  handleCreateRole, 
  handleUpdateRole, 
  handleDeleteRoleById,
  handleUpdateRolePermissions 
} from '../api/allApi.js';

// Query keys for cache management
export const roleKeys = {
  all: ['roles'],
  lists: () => [...roleKeys.all, 'list'],
  list: (filters) => [...roleKeys.lists(), { filters }],
  details: () => [...roleKeys.all, 'detail'],
  detail: (id) => [...roleKeys.details(), id],
};

// Get all roles with pagination and caching
export const useRoles = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: roleKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetAllRoles(page, limit, additionalParams),
    staleTime: 10 * 60 * 1000, // 10 minutes (roles don't change frequently)
    gcTime: 20 * 60 * 1000, // 20 minutes
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Get role by ID
export const useRole = (id) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => handleGetRoleById(id),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id, // Only run query if ID exists
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

// Create role mutation with optimistic updates
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateRole,
    onSuccess: (data) => {
      // Invalidate roles list to refetch
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error) => {
      // Error handling is done in the API function
      console.error('Failed to create role:', error);
    },
  });
};

// Update role mutation with optimistic updates
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => handleUpdateRole(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: roleKeys.detail(id) });
      
      // Snapshot the previous value
      const previousRole = queryClient.getQueryData(roleKeys.detail(id));
      
      // Optimistically update to the new value
      queryClient.setQueryData(roleKeys.detail(id), (old) => ({
        ...old,
        ...data
      }));
      
      // Return a context object with the snapshotted value
      return { previousRole };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRole) {
        queryClient.setQueryData(roleKeys.detail(id), context.previousRole);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};

// Delete role mutation with optimistic updates
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteRoleById,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: roleKeys.lists() });
      
      // Snapshot the previous value
      const previousRoles = queryClient.getQueryData(roleKeys.list({}));
      
      // Optimistically remove the role from the list
      queryClient.setQueryData(roleKeys.list({}), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(role => role._id !== id && role.id !== id),
          total: old.total - 1
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousRoles };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRoles) {
        queryClient.setQueryData(roleKeys.list({}), context.previousRoles);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};

// Update role permissions mutation
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, permissions }) => handleUpdateRolePermissions(id, permissions),
    onSuccess: (data, { id }) => {
      // Invalidate specific role data
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update role permissions:', error);
    },
  });
};

// Prefetch roles for better UX
export const prefetchRoles = (queryClient, page = 1, limit = 10, additionalParams = {}) => {
  return queryClient.prefetchQuery({
    queryKey: roleKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetAllRoles(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
