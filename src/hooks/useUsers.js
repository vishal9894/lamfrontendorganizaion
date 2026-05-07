import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleGetAllUsers, handleUpdateUser, handleDeleteUser, handleLgout, handleAddBallance, handleGetWallet } from '../api/allApi.js';

// Query keys for cache management
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
  wallet: (id) => [...userKeys.all, 'wallet', id],
};

// Get all users with pagination and caching
export const useUsers = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: userKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetAllUsers(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// Get single user details
export const useUser = (id) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => handleGetAllUsers(1, 1, { userId: id }),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get user wallet
export const useUserWallet = (id) => {
  return useQuery({
    queryKey: userKeys.wallet(id),
    queryFn: () => handleGetWallet(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (financial data is more time-sensitive)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

// Update user mutation with optimistic updates
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => handleUpdateUser(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.all });
      
      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(userKeys.lists());
      
      // Optimistically update to the new value
      queryClient.setQueryData(userKeys.lists(), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(user => 
            user._id === id ? { ...user, ...data } : user
          )
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousUsers) {
        queryClient.setQueryData(userKeys.lists(), context.previousUsers);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
};

// Delete user mutation with optimistic updates
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteUser,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.all });
      
      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(userKeys.lists());
      
      // Optimistically remove the user from the cache
      queryClient.setQueryData(userKeys.lists(), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(user => user._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousUsers };
    },
    onError: (err, id, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousUsers) {
        queryClient.setQueryData(userKeys.lists(), context.previousUsers);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleLgout,
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
};

// Add balance mutation with optimistic updates
export const useAddBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleAddBallance,
    onMutate: async (data) => {
      // Cancel wallet queries
      await queryClient.cancelQueries({ queryKey: userKeys.wallet(data.userId) });
      
      // Snapshot the previous value
      const previousWallet = queryClient.getQueryData(userKeys.wallet(data.userId));
      
      // Optimistically update the wallet balance
      if (previousWallet) {
        queryClient.setQueryData(userKeys.wallet(data.userId), (old) => ({
          ...old,
          balance: (old.balance || 0) + data.amount
        }));
      }
      
      return { previousWallet };
    },
    onError: (err, variables, context) => {
      // Roll back on error
      if (context?.previousWallet) {
        queryClient.setQueryData(userKeys.wallet(variables.userId), context.previousWallet);
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch wallet data
      queryClient.invalidateQueries({ queryKey: userKeys.wallet(variables.userId) });
    },
  });
};

// Prefetch users for better UX
export const prefetchUsers = (queryClient, page = 1, limit = 10, additionalParams = {}) => {
  return queryClient.prefetchQuery({
    queryKey: userKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetAllUsers(page, limit, additionalParams),
    staleTime: 5 * 60 * 1000,
  });
};
