// Pagination constants for LMS application
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 5,

  // Page sizes for different data types
  USERS: { default: 10, max: 50 },
  COURSES: { default: 10, max: 48 },
  QUIZZES: { default: 15, max: 60 },
  TEACHERS: { default: 8, max: 32 },
  STUDENTS: { default: 20, max: 100 },
  ASSIGNMENTS: { default: 10, max: 40 },
  NOTIFICATIONS: { default: 15, max: 50 },
  FOLDERS: { default: 12, max: 48 },
  CONTENT: { default: 20, max: 80 },
  EVENTS: { default: 10, max: 40 },
  STREAMS: { default: 8, max: 32 },
  QUESTIONS: { default: 15, max: 60 },
  ADMINS: { default: 10, max: 40 },
  ROLES: { default: 15, max: 60 },
  PERMISSIONS: { default: 20, max: 100 },
};

// Build pagination query string
export const buildPaginationParams = (page = 1, limit = 10, additionalParams = {}) => {
  const params = new URLSearchParams();

  params.append('page', page.toString());
  params.append('limit', limit.toString());

  Object.entries(additionalParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  return params.toString();
};

// Parse API response to standard pagination format
export const parsePaginatedResponse = (response, defaultLimit = 10) => {
  if (!response) {
    return {
      success: false,
      data: [],
      total: 0,
      page: 1,
      limit: defaultLimit,
      totalPages: 1
    };
  }

  const data = response.data || response.users || response.courses || response.quizzes ||
    response.teachers || response.students || response.assignments ||
    response.notifications || response.folders || response.content ||
    response.events || response.streams || response.questions ||
    response.admins || response.roles || response.permissions ||
    (Array.isArray(response) ? response : []);

  const total = response.total || response.totalCount || response.totalItems ||
    (Array.isArray(data) ? data.length : 0);

  const page = response.page || response.currentPage || 1;
  const limit = response.limit || response.pageSize || defaultLimit;
  const totalPages = response.totalPages || Math.ceil(total / limit) || 1;

  return {
    success: true,
    data: Array.isArray(data) ? data : [],
    total,
    page,
    limit,
    totalPages
  };
};

// Calculate pagination metadata
export const calculatePagination = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  return {
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    currentPage: page
  };
};

// Generate page numbers for pagination UI
export const generatePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const pages = [];
  const halfVisible = Math.floor(maxVisible / 2);

  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return {
    pages,
    showFirst: startPage > 1,
    showLast: endPage < totalPages,
    showStartEllipsis: startPage > 2,
    showEndEllipsis: endPage < totalPages - 1
  };
};

// Optimistic pagination for instant UI updates
export const getOptimisticData = (currentData, newData, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  if (newData) {
    return newData.slice(startIndex, endIndex);
  }

  return currentData.slice(startIndex, endIndex);
};

// Cache key generator for paginated queries
export const getPaginatedQueryKey = (baseKey, page, limit, additionalParams = {}) => {
  const paramsKey = Object.entries(additionalParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('&');

  return [...baseKey, page, limit, paramsKey];
};

// Prefetch adjacent pages for smooth navigation
export const getAdjacentPagesToPrefetch = (currentPage, totalPages, prefetchCount = 1) => {
  const pagesToPrefetch = [];

  for (let i = 1; i <= prefetchCount; i++) {
    if (currentPage + i <= totalPages) {
      pagesToPrefetch.push(currentPage + i);
    }
    if (currentPage - i >= 1) {
      pagesToPrefetch.push(currentPage - i);
    }
  }

  return pagesToPrefetch;
};

// Infinite scroll pagination utilities
export const infiniteScrollConfig = {
  initialPageParam: 1,
  getNextPageParam: (lastPage) => {
    if (lastPage.page < lastPage.totalPages) {
      return lastPage.page + 1;
    }
    return undefined;
  },
  getPreviousPageParam: (firstPage) => {
    if (firstPage.page > 1) {
      return firstPage.page - 1;
    }
    return undefined;
  }
};

// Merge infinite scroll pages
export const mergePages = (oldPages, newPages) => {
  return [...oldPages, ...newPages];
};

export default {
  PAGINATION_CONFIG,
  buildPaginationParams,
  parsePaginatedResponse,
  calculatePagination,
  generatePageNumbers,
  getOptimisticData,
  getPaginatedQueryKey,
  getAdjacentPagesToPrefetch,
  infiniteScrollConfig,
  mergePages
};
