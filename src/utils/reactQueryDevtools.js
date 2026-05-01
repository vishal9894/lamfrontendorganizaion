import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

// Development tools for React Query - Only shown in development, hidden in production
export const QueryDevTools = () => {
  // Only show in strict development mode
  const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return React.createElement(ReactQueryDevtools, {
      initialIsOpen: false,
      position: 'bottom-right',
      buttonPosition: 'bottom-right'
    });
  }

  // Return null in production - no icon, no overhead
  return null;
};

// Query debugging utilities
export const debugQuery = (queryClient) => {
  if (process.env.NODE_ENV === 'development') {
  }
};

// Utility to clear all queries
export const clearAllQueries = (queryClient) => {
  queryClient.clear();
};

// Utility to invalidate specific queries
export const invalidateQueries = (queryClient, queryKey) => {
  queryClient.invalidateQueries({ queryKey });
};

// Utility to prefetch data
export const prefetchData = (queryClient, queryKey, queryFn) => {
  return queryClient.prefetchQuery({ queryKey, queryFn });
};
