import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  handleCreateTopTeacher, 
  handleGetTopTeacher, 
  handleUpdateTopTeacher, 
  handleDeleteTopTeacher,
  handleCreateTopStudent,
  handleGetTopStudent,
  handleDeleteTopStudent,
  handleUpdateTopStudent,
  handleCreateBulkQuestion,
  handleGetBulkQuestion,
  handleDeleteBulkQuestion,
  handleDeleteAllBulkQuestions
} from '../api/allApi.js';

// Query keys for cache management
export const topContentKeys = {
  all: ['topContent'],
  teachers: () => [...topContentKeys.all, 'teachers'],
  teacherList: () => [...topContentKeys.teachers(), 'list'],
  teacherDetail: (id) => [...topContentKeys.teachers(), 'detail', id],
  students: () => [...topContentKeys.all, 'students'],
  studentList: () => [...topContentKeys.students(), 'list'],
  studentDetail: (id) => [...topContentKeys.students(), 'detail', id],
  bulkQuestions: () => [...topContentKeys.all, 'bulkQuestions'],
  bulkQuestionList: () => [...topContentKeys.bulkQuestions(), 'list'],
  bulkQuestionDetail: (id) => [...topContentKeys.bulkQuestions(), 'detail', id],
};

// Get top teachers with caching
export const useTopTeachers = () => {
  return useQuery({
    queryKey: topContentKeys.teacherList(),
    queryFn: handleGetTopTeacher,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
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

// Get top students with caching
export const useTopStudents = () => {
  return useQuery({
    queryKey: topContentKeys.studentList(),
    queryFn: handleGetTopStudent,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// Get bulk questions with caching
export const useBulkQuestions = () => {
  return useQuery({
    queryKey: topContentKeys.bulkQuestionList(),
    queryFn: handleGetBulkQuestion,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// Create top teacher mutation
export const useCreateTopTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateTopTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topContentKeys.teachers() });
    },
    onError: (error) => {
      console.error('Create top teacher error:', error);
    },
  });
};

// Update top teacher mutation with optimistic updates
export const useUpdateTopTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }) => handleUpdateTopTeacher(id, formData),
    onMutate: async ({ id, formData }) => {
      await queryClient.cancelQueries({ queryKey: topContentKeys.teachers() });
      
      const previousTeachers = queryClient.getQueryData(topContentKeys.teacherList());
      
      queryClient.setQueryData(topContentKeys.teacherList(), (old) => {
        if (!Array.isArray(old?.data)) return old;
        return {
          ...old,
          data: old.data.map(teacher => 
            teacher._id === id ? { ...teacher, ...formData } : teacher
          )
        };
      });
      
      return { previousTeachers };
    },
    onError: (err, variables, context) => {
      if (context?.previousTeachers) {
        queryClient.setQueryData(topContentKeys.teacherList(), context.previousTeachers);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: topContentKeys.teachers() });
      queryClient.invalidateQueries({ queryKey: topContentKeys.teacherDetail(variables.id) });
    },
  });
};

// Delete top teacher mutation with optimistic updates
export const useDeleteTopTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteTopTeacher,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: topContentKeys.teachers() });
      
      const previousTeachers = queryClient.getQueryData(topContentKeys.teacherList());
      
      queryClient.setQueryData(topContentKeys.teacherList(), (old) => {
        if (!Array.isArray(old?.data)) return old;
        return {
          ...old,
          data: old.data.filter(teacher => teacher._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousTeachers };
    },
    onError: (err, id, context) => {
      if (context?.previousTeachers) {
        queryClient.setQueryData(topContentKeys.teacherList(), context.previousTeachers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: topContentKeys.teachers() });
    },
  });
};

// Create top student mutation
export const useCreateTopStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateTopStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topContentKeys.students() });
    },
    onError: (error) => {
      console.error('Create top student error:', error);
    },
  });
};

// Update top student mutation with optimistic updates
export const useUpdateTopStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }) => handleUpdateTopStudent(id, formData),
    onMutate: async ({ id, formData }) => {
      await queryClient.cancelQueries({ queryKey: topContentKeys.students() });
      
      const previousStudents = queryClient.getQueryData(topContentKeys.studentList());
      
      queryClient.setQueryData(topContentKeys.studentList(), (old) => {
        if (!Array.isArray(old?.data)) return old;
        return {
          ...old,
          data: old.data.map(student => 
            student._id === id ? { ...student, ...formData } : student
          )
        };
      });
      
      return { previousStudents };
    },
    onError: (err, variables, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(topContentKeys.studentList(), context.previousStudents);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: topContentKeys.students() });
      queryClient.invalidateQueries({ queryKey: topContentKeys.studentDetail(variables.id) });
    },
  });
};

// Delete top student mutation with optimistic updates
export const useDeleteTopStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteTopStudent,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: topContentKeys.students() });
      
      const previousStudents = queryClient.getQueryData(topContentKeys.studentList());
      
      queryClient.setQueryData(topContentKeys.studentList(), (old) => {
        if (!Array.isArray(old?.data)) return old;
        return {
          ...old,
          data: old.data.filter(student => student._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousStudents };
    },
    onError: (err, id, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(topContentKeys.studentList(), context.previousStudents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: topContentKeys.students() });
    },
  });
};

// Create bulk question mutation
export const useCreateBulkQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleCreateBulkQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topContentKeys.bulkQuestions() });
    },
    onError: (error) => {
      console.error('Create bulk question error:', error);
    },
  });
};

// Delete bulk question mutation with optimistic updates
export const useDeleteBulkQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteBulkQuestion,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: topContentKeys.bulkQuestions() });
      
      const previousQuestions = queryClient.getQueryData(topContentKeys.bulkQuestionList());
      
      queryClient.setQueryData(topContentKeys.bulkQuestionList(), (old) => {
        if (!Array.isArray(old?.data)) return old;
        return {
          ...old,
          data: old.data.filter(question => question._id !== id),
          total: old.total - 1
        };
      });
      
      return { previousQuestions };
    },
    onError: (err, id, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(topContentKeys.bulkQuestionList(), context.previousQuestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: topContentKeys.bulkQuestions() });
    },
  });
};

// Delete all bulk questions mutation
export const useDeleteAllBulkQuestions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleDeleteAllBulkQuestions,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: topContentKeys.bulkQuestions() });
      
      const previousQuestions = queryClient.getQueryData(topContentKeys.bulkQuestionList());
      
      // Optimistically clear all questions
      queryClient.setQueryData(topContentKeys.bulkQuestionList(), (old) => {
        if (!Array.isArray(old?.data)) return old;
        return {
          ...old,
          data: [],
          total: 0
        };
      });
      
      return { previousQuestions };
    },
    onError: (err, variables, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(topContentKeys.bulkQuestionList(), context.previousQuestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: topContentKeys.bulkQuestions() });
    },
  });
};

// Prefetch top content for better UX
export const prefetchTopTeachers = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: topContentKeys.teacherList(),
    queryFn: handleGetTopTeacher,
    staleTime: 15 * 60 * 1000,
  });
};

export const prefetchTopStudents = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: topContentKeys.studentList(),
    queryFn: handleGetTopStudent,
    staleTime: 15 * 60 * 1000,
  });
};

export const prefetchBulkQuestions = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: topContentKeys.bulkQuestionList(),
    queryFn: handleGetBulkQuestion,
    staleTime: 10 * 60 * 1000,
  });
};
