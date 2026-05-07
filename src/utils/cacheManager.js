import { useQueryClient } from '@tanstack/react-query';
import { 
  userKeys, 
  courseKeys, 
  quizKeys, 
  dashboardKeys, 
  folderKeys, 
  streamKeys, 
  teacherKeys, 
  eventKeys, 
  bannerKeys, 
  omrKeys, 
  socialMediaKeys, 
  topContentKeys 
} from '../hooks/index.js';

// Cache management utilities for React Query
export class CacheManager {
  constructor(queryClient) {
    this.queryClient = queryClient;
  }

  // Invalidate all user-related queries
  invalidateUsers() {
    this.queryClient.invalidateQueries({ queryKey: userKeys.all });
  }

  // Invalidate specific user data
  invalidateUser(userId) {
    this.queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
    this.queryClient.invalidateQueries({ queryKey: userKeys.wallet(userId) });
  }

  // Invalidate all course-related queries
  invalidateCourses() {
    this.queryClient.invalidateQueries({ queryKey: courseKeys.all });
  }

  // Invalidate specific course data
  invalidateCourse(courseId) {
    this.queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    // Also invalidate assigned courses as they might be affected
    this.queryClient.invalidateQueries({ queryKey: courseKeys.assigned() });
  }

  // Invalidate all quiz-related queries
  invalidateQuizzes() {
    this.queryClient.invalidateQueries({ queryKey: quizKeys.all });
  }

  // Invalidate specific quiz and its questions
  invalidateQuiz(quizId) {
    this.queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
    this.queryClient.invalidateQueries({ queryKey: quizKeys.quizQuestions(quizId) });
  }

  // Invalidate dashboard data (for real-time updates)
  invalidateDashboard() {
    this.queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  }

  // Refetch dashboard data immediately
  refetchDashboard() {
    return this.queryClient.refetchQueries({ queryKey: dashboardKeys.stats() });
  }

  // Invalidate folder and file data
  invalidateFolders(courseId) {
    if (courseId) {
      this.queryClient.invalidateQueries({ queryKey: folderKeys.list(courseId) });
    } else {
      this.queryClient.invalidateQueries({ queryKey: folderKeys.all });
    }
  }

  // Invalidate stream data
  invalidateStreams() {
    this.queryClient.invalidateQueries({ queryKey: streamKeys.all });
  }

  // Invalidate teacher data
  invalidateTeachers() {
    this.queryClient.invalidateQueries({ queryKey: teacherKeys.all });
  }

  // Invalidate event data
  invalidateEvents() {
    this.queryClient.invalidateQueries({ queryKey: eventKeys.all });
  }

  // Invalidate banner data
  invalidateBanners() {
    this.queryClient.invalidateQueries({ queryKey: bannerKeys.all });
  }

  // Invalidate OMR sheet data
  invalidateOmrSheets() {
    this.queryClient.invalidateQueries({ queryKey: omrKeys.all });
  }

  // Invalidate social media data
  invalidateSocialMedia() {
    this.queryClient.invalidateQueries({ queryKey: socialMediaKeys.all });
  }

  // Invalidate top content data
  invalidateTopContent() {
    this.queryClient.invalidateQueries({ queryKey: topContentKeys.all });
  }

  // Smart invalidation based on action type
  invalidateOnAction(action, data) {
    switch (action) {
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
        this.invalidateUsers();
        this.invalidateDashboard(); // Update user counts
        break;

      case 'course_created':
      case 'course_updated':
      case 'course_deleted':
      case 'course_published':
        this.invalidateCourses();
        this.invalidateDashboard(); // Update course counts
        break;

      case 'quiz_created':
      case 'quiz_updated':
      case 'quiz_deleted':
      case 'question_created':
      case 'question_deleted':
        this.invalidateQuizzes();
        if (data?.quizId) {
          this.invalidateQuiz(data.quizId);
        }
        break;

      case 'folder_created':
      case 'folder_updated':
      case 'folder_deleted':
      case 'file_uploaded':
      case 'file_deleted':
        this.invalidateFolders(data?.courseId);
        break;

      case 'stream_created':
      case 'stream_updated':
      case 'stream_deleted':
        this.invalidateStreams();
        break;

      case 'teacher_created':
      case 'teacher_updated':
      case 'teacher_deleted':
        this.invalidateTeachers();
        this.invalidateDashboard(); // Update teacher counts
        break;

      case 'event_created':
      case 'event_updated':
      case 'event_deleted':
        this.invalidateEvents();
        break;

      case 'banner_created':
      case 'banner_updated':
      case 'banner_deleted':
      case 'banner_published':
        this.invalidateBanners();
        break;

      case 'omr_created':
      case 'omr_deleted':
        this.invalidateOmrSheets();
        break;

      case 'social_media_created':
      case 'social_media_updated':
      case 'social_media_deleted':
        this.invalidateSocialMedia();
        break;

      case 'top_teacher_created':
      case 'top_teacher_updated':
      case 'top_teacher_deleted':
      case 'top_student_created':
      case 'top_student_updated':
      case 'top_student_deleted':
      case 'bulk_question_created':
      case 'bulk_question_deleted':
        this.invalidateTopContent();
        break;

      default:
        // If no specific action, invalidate all data
        this.invalidateAll();
    }
  }

  // Invalidate all queries
  invalidateAll() {
    this.queryClient.invalidateQueries();
  }

  // Clear all queries (remove from cache)
  clearAll() {
    this.queryClient.clear();
  }

  // Prefetch common data for better UX
  async prefetchCommonData() {
    const promises = [
      // Prefetch dashboard stats
      this.queryClient.prefetchQuery({
        queryKey: dashboardKeys.stats(),
        staleTime: 1 * 60 * 1000, // 1 minute
      }),
      // Prefetch short course details
      this.queryClient.prefetchQuery({
        queryKey: courseKeys.shortDetails(),
        staleTime: 30 * 60 * 1000, // 30 minutes
      }),
      // Prefetch social media links
      this.queryClient.prefetchQuery({
        queryKey: socialMediaKeys.list(),
        staleTime: 20 * 60 * 1000, // 20 minutes
      }),
    ];

    await Promise.allSettled(promises);
  }

  // Get cache statistics (useful for debugging)
  getCacheStats() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      staleQueries: queries.filter(q => q.isStale()).length,
      inactiveQueries: queries.filter(q => q.state.fetchStatus === 'idle').length,
      totalDataSize: JSON.stringify(queries.map(q => q.state.data)).length,
    };
  }

  // Remove stale data from cache (cleanup)
  removeStaleData() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    queries.forEach(query => {
      if (query.isStale() && query.state.fetchStatus === 'idle') {
        cache.remove(query);
      }
    });
  }

  // Prefetch data for a specific page/route
  prefetchPageData(page) {
    switch (page) {
      case 'dashboard':
        this.queryClient.prefetchQuery({ queryKey: dashboardKeys.stats() });
        break;
      case 'courses':
        this.queryClient.prefetchQuery({ queryKey: courseKeys.list({ page: 1, limit: 10 }) });
        this.queryClient.prefetchQuery({ queryKey: courseKeys.shortDetails() });
        break;
      case 'users':
        this.queryClient.prefetchQuery({ queryKey: userKeys.list({ page: 1, limit: 10 }) });
        break;
      case 'quizzes':
        this.queryClient.prefetchQuery({ queryKey: quizKeys.list({ page: 1, limit: 10 }) });
        break;
      case 'teachers':
        this.queryClient.prefetchQuery({ queryKey: teacherKeys.list({ page: 1, limit: 10 }) });
        break;
      default:
        break;
    }
  }
}

// Hook to use cache manager in components
export const useCacheManager = () => {
  const queryClient = useQueryClient();
  return new CacheManager(queryClient);
};

// Export singleton instance for global usage
let cacheManagerInstance = null;

export const getCacheManager = (queryClient) => {
  if (!cacheManagerInstance && queryClient) {
    cacheManagerInstance = new CacheManager(queryClient);
  }
  return cacheManagerInstance;
};
