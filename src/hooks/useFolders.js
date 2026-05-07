import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleGetFolders, 
  handleCreateFolder, 
  handleUpdateFolder, 
  handleDeleteFolder,
  handleCreateFile,
  handleDeleteFilecontents
} from '../api/allApi.js';

// Query keys for cache management
export const folderKeys = {
  all: ['folders'],
  lists: () => [...folderKeys.all, 'list'],
  list: (courseId) => [...folderKeys.lists(), courseId],
  details: () => [...folderKeys.all, 'detail'],
  detail: (id) => [...folderKeys.details(), id],
  files: () => [...folderKeys.all, 'files'],
  filesInFolder: (folderId) => [...folderKeys.files(), folderId],
};

// Get folders for a course with caching
export const useFolders = (courseId) => {
  return useQuery({
    queryKey: folderKeys.list(courseId),
    queryFn: () => handleGetFolders(courseId),
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
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

// Get single folder details
export const useFolder = (id) => {
  return useQuery({
    queryKey: folderKeys.detail(id),
    queryFn: () => handleGetFolders(null),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Create folder mutation with optimistic updates
export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateFolder,
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: folderKeys.lists() });
      
      // Snapshot previous value
      const previousFolders = queryClient.getQueryData(folderKeys.list(data.courseId));
      
      // Create optimistic folder
      const optimisticFolder = {
        _id: `temp-${Date.now()}`,
        name: data.name,
        courseId: data.courseId,
        createdAt: new Date().toISOString(),
        ...data
      };
      
      // Optimistically add to cache
      queryClient.setQueryData(folderKeys.list(data.courseId), (old) => {
        const currentData = Array.isArray(old) ? old : (old?.data || []);
        return Array.isArray(old) 
          ? [...currentData, optimisticFolder]
          : { ...old, data: [...currentData, optimisticFolder] };
      });
      
      return { previousFolders, optimisticFolder };
    },
    onError: (err, variables, context) => {
      // Roll back on error
      if (context?.previousFolders) {
        queryClient.setQueryData(folderKeys.list(variables.courseId), context.previousFolders);
      }
    },
    onSuccess: (data, variables) => {
      // Update the optimistic folder with real data
      queryClient.setQueryData(folderKeys.list(variables.courseId), (old) => {
        const currentData = Array.isArray(old) ? old : (old?.data || []);
        return Array.isArray(old)
          ? currentData.map(folder => 
              folder._id === context?.optimisticFolder?._id ? data : folder
            )
          : { ...old, data: currentData.map(folder => 
              folder._id === context?.optimisticFolder?._id ? data : folder
            )};
      });
    },
    onSettled: (data, error, variables) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: folderKeys.list(variables.courseId) });
    },
  });
};

// Update folder mutation with optimistic updates
export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => handleUpdateFolder(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: folderKeys.all });
      
      // Snapshot previous value
      const previousFolders = queryClient.getQueriesData({ queryKey: folderKeys.lists() });
      
      // Optimistically update
      queryClient.setQueriesData({ queryKey: folderKeys.lists() }, (old) => {
        const currentData = Array.isArray(old) ? old : (old?.data || []);
        return Array.isArray(old)
          ? currentData.map(folder => 
              folder._id === id ? { ...folder, ...data } : folder
            )
          : { ...old, data: currentData.map(folder => 
              folder._id === id ? { ...folder, ...data } : folder
            )};
      });
      
      return { previousFolders };
    },
    onError: (err, variables, context) => {
      // Roll back on error
      if (context?.previousFolders) {
        context.previousFolders.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: folderKeys.detail(variables.id) });
    },
  });
};

// Delete folder mutation with optimistic updates
export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteFolder,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: folderKeys.all });
      
      // Snapshot previous value
      const previousFolders = queryClient.getQueriesData({ queryKey: folderKeys.lists() });
      
      // Optimistically remove folder
      queryClient.setQueriesData({ queryKey: folderKeys.lists() }, (old) => {
        const currentData = Array.isArray(old) ? old : (old?.data || []);
        return Array.isArray(old)
          ? currentData.filter(folder => folder._id !== id)
          : { ...old, data: currentData.filter(folder => folder._id !== id) };
      });
      
      return { previousFolders };
    },
    onError: (err, id, context) => {
      // Roll back on error
      if (context?.previousFolders) {
        context.previousFolders.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
};

// Create file mutation with optimistic updates
export const useCreateFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateFile,
    onSuccess: (data, variables) => {
      // Invalidate folder queries to refresh file lists
      const folderId = variables.get('folderId');
      if (folderId) {
        queryClient.invalidateQueries({ queryKey: folderKeys.filesInFolder(folderId) });
      }
      // Also invalidate parent folder
      const courseId = variables.get('courseId');
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: folderKeys.list(courseId) });
      }
    },
  });
};

// Delete file mutation
export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteFilecontents,
    onSuccess: (data, variables) => {
      // Invalidate file and folder queries
      queryClient.invalidateQueries({ queryKey: folderKeys.files() });
      // If we know the folder/course, invalidate those too
      if (variables?.folderId) {
        queryClient.invalidateQueries({ queryKey: folderKeys.filesInFolder(variables.folderId) });
      }
      if (variables?.courseId) {
        queryClient.invalidateQueries({ queryKey: folderKeys.list(variables.courseId) });
      }
    },
  });
};

// Prefetch folders for better UX
export const prefetchFolders = (queryClient, courseId) => {
  return queryClient.prefetchQuery({
    queryKey: folderKeys.list(courseId),
    queryFn: () => handleGetFolders(courseId),
    staleTime: 10 * 60 * 1000,
  });
};
