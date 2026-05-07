import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleCreateMcq, 
  handleCreateQuestions, 
  handleGetMcq, 
  handleDeleteQuiz, 
  handleGetQuizQuestions, 
  handleDeleteQuestion, 
  handleUpdateQuestion 
} from '../api/allApi.js';

// Query keys for cache management
export const quizKeys = {
  all: ['quizzes'],
  lists: () => [...quizKeys.all, 'list'],
  list: (filters) => [...quizKeys.lists(), { filters }],
  details: () => [...quizKeys.all, 'detail'],
  detail: (id) => [...quizKeys.details(), id],
  questions: () => [...quizKeys.all, 'questions'],
  quizQuestions: (quizId) => [...quizKeys.questions(), quizId],
};

// Get quizzes with pagination and caching
export const useQuizzes = (page = 1, limit = 10, additionalParams = {}) => {
  return useQuery({
    queryKey: quizKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetMcq(page, limit, additionalParams),
    staleTime: 8 * 60 * 1000, // 8 minutes
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

// Get single quiz details
export const useQuiz = (id) => {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => handleGetMcq(1, 1, { quizId: id }),
    enabled: !!id,
    staleTime: 12 * 60 * 1000, // 12 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Get quiz questions with caching
export const useQuizQuestions = (quizId) => {
  return useQuery({
    queryKey: quizKeys.quizQuestions(quizId),
    queryFn: () => handleGetQuizQuestions(quizId),
    enabled: !!quizId,
    staleTime: 15 * 60 * 1000, // 15 minutes (questions change rarely)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// Create quiz mutation
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateMcq,
    onSuccess: (data) => {
      // Invalidate quiz lists to refresh
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
    onError: (error) => {
      console.error('Create quiz error:', error);
    },
  });
};

// Create questions mutation
export const useCreateQuestions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateQuestions,
    onSuccess: (data, variables) => {
      // Invalidate quiz questions list
      const quizId = variables.quizId || (Array.isArray(variables) ? variables[0]?.quizId : null);
      if (quizId) {
        queryClient.invalidateQueries({ queryKey: quizKeys.quizQuestions(quizId) });
      }
      // Also invalidate quiz lists as question count might change
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
    onError: (error) => {
      console.error('Create questions error:', error);
    },
  });
};

// Delete quiz mutation with optimistic updates
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteQuiz,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: quizKeys.all });
      
      // Snapshot previous value
      const previousQuizzes = queryClient.getQueryData(quizKeys.lists());
      
      // Optimistically remove the quiz
      queryClient.setQueriesData({ queryKey: quizKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(quiz => quiz._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousQuizzes };
    },
    onError: (err, id, context) => {
      // Roll back on error
      if (context?.previousQuizzes) {
        queryClient.setQueriesData({ queryKey: quizKeys.lists() }, context.previousQuizzes);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
};

// Delete question mutation with optimistic updates
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteQuestion,
    onMutate: async (id) => {
      // We don't know which quiz this question belongs to from the ID alone
      // So we'll just invalidate all quiz questions queries
      await queryClient.cancelQueries({ queryKey: quizKeys.questions() });
      
      return;
    },
    onSuccess: () => {
      // Invalidate all quiz questions and quiz lists
      queryClient.invalidateQueries({ queryKey: quizKeys.questions() });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
};

// Update question mutation with optimistic updates
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleUpdateQuestion,
    onSuccess: (data, variables) => {
      // Invalidate quiz questions for the specific quiz
      if (variables?.quizId) {
        queryClient.invalidateQueries({ queryKey: quizKeys.quizQuestions(variables.quizId) });
      }
      // Invalidate all quiz questions as fallback
      queryClient.invalidateQueries({ queryKey: quizKeys.questions() });
    },
  });
};

// Prefetch quizzes for better UX
export const prefetchQuizzes = (queryClient, page = 1, limit = 10, additionalParams = {}) => {
  return queryClient.prefetchQuery({
    queryKey: quizKeys.list({ page, limit, ...additionalParams }),
    queryFn: () => handleGetMcq(page, limit, additionalParams),
    staleTime: 8 * 60 * 1000,
  });
};

// Prefetch quiz questions
export const prefetchQuizQuestions = (queryClient, quizId) => {
  return queryClient.prefetchQuery({
    queryKey: quizKeys.quizQuestions(quizId),
    queryFn: () => handleGetQuizQuestions(quizId),
    staleTime: 15 * 60 * 1000,
  });
};
