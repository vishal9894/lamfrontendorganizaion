import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleGetDashboardData } from '../api/allApi.js';

// Query keys for cache management
export const dashboardKeys = {
  all: ['dashboard'],
  stats: () => [...dashboardKeys.all, 'stats'],
  analytics: (filters) => [...dashboardKeys.all, 'analytics', { filters }],
};

// Get dashboard statistics with real-time updates
export const useDashboardStats = (options = {}) => {
  const { refetchInterval = 30 * 1000, enabled = true } = options; // Default 30 seconds refresh
  
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: handleGetDashboardData,
    staleTime: 1 * 60 * 1000, // 1 minute (dashboard data is time-sensitive)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled,
    refetchInterval,
    refetchOnWindowFocus: true, // Refresh when window gains focus
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // More aggressive retry for dashboard data
      if (error?.response?.status >= 500) {
        return failureCount < 3; // Retry 3 times for server errors
      }
      return failureCount < 1; // Only retry once for other errors
    },
  });
};

// Get dashboard analytics with custom filters
export const useDashboardAnalytics = (filters = {}) => {
  return useQuery({
    queryKey: dashboardKeys.analytics(filters),
    queryFn: () => handleGetDashboardData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes for analytics
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// Refresh dashboard data mutation
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Force refetch dashboard data
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      return queryClient.refetchQueries({ queryKey: dashboardKeys.stats() });
    },
  });
};

// Prefetch dashboard data for better UX
export const prefetchDashboardData = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: handleGetDashboardData,
    staleTime: 1 * 60 * 1000,
  });
};

// Invalidate all dashboard queries
export const invalidateDashboardQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
};
