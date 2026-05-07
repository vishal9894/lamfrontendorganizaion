# React Query Hooks - Usage Guide

This directory contains comprehensive React Query hooks for all API endpoints in your LMS application. Each hook includes optimized caching, optimistic updates, and error handling.

## 📁 File Structure

```
src/hooks/
├── index.js              # Central export point
├── useUsers.js           # User management hooks
├── useCourses.js         # Course management hooks  
├── useQuizzes.js         # Quiz & question hooks
├── useDashboard.js       # Dashboard analytics hooks
├── useFolders.js         # Folder & file management hooks
├── useStreams.js         # Stream management hooks
├── useTeachers.js        # Teacher management hooks
├── useEvents.js          # Event management hooks
├── useBanners.js         # Banner management hooks
├── useOmrSheets.js       # OMR sheet hooks
├── useSocialMedia.js     # Social media hooks
├── useTopContent.js      # Top content hooks
└── README.md             # This guide
```

## 🚀 Quick Start

### Import Hooks

```javascript
// Import individual hooks
import { useUsers, useCourses, useDashboardStats } from '../hooks/index.js';

// Or import specific hook
import { useUsers } from '../hooks/useUsers.js';
```

### Basic Usage

```javascript
import { useUsers, useCreateUser } from '../hooks/index.js';

function UserManagement() {
  // Fetch users with pagination and caching
  const { 
    data: usersData, 
    isLoading, 
    error, 
    refetch 
  } = useUsers(1, 10, { search: 'john' });

  // Create user mutation with optimistic updates
  const createUserMutation = useCreateUser();

  const handleCreateUser = async (userData) => {
    try {
      await createUserMutation.mutateAsync(userData);
      // Success toast is handled automatically
    } catch (error) {
      // Error toast is handled automatically
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {/* Render users */}
      {usersData?.data?.map(user => (
        <UserCard key={user._id} user={user} />
      ))}
    </div>
  );
}
```

## 📋 Available Hooks

### User Management (`useUsers.js`)

```javascript
// Queries
const { data, isLoading, error } = useUsers(page, limit, filters);
const { data: userData } = useUser(userId);
const { data: walletData } = useUserWallet(userId);

// Mutations
const createUserMutation = useCreateUser();
const updateUserMutation = useUpdateUser();
const deleteUserMutation = useDeleteUser();
const logoutMutation = useLogout();
const addBalanceMutation = useAddBalance();

// Prefetch
prefetchUsers(queryClient, page, limit, filters);
```

### Course Management (`useCourses.js`)

```javascript
// Queries
const { data: coursesData } = useCourses(courseType, page, limit, filters);
const { data: shortCourses } = useShortCourseDetails();
const { data: courseData } = useCourse(courseId);
const { data: assignedCourses } = useAssignedCourses(page, limit, filters);

// Mutations
const createCourseMutation = useCreateCourse();
const updateCourseMutation = useUpdateCourse();
const deleteCourseMutation = useDeleteCourse();
const publishCourseMutation = usePublishCourse();
const assignCoursesMutation = useAssignCourses();
const deleteAssignedCourseMutation = useDeleteAssignedCourse();
```

### Dashboard (`useDashboard.js`)

```javascript
// Real-time dashboard stats (refreshes every 30 seconds)
const { data: dashboardStats } = useDashboardStats({ 
  refetchInterval: 30 * 1000 
});

// Analytics with custom filters
const { data: analytics } = useDashboardAnalytics(filters);

// Manual refresh
const refreshMutation = useRefreshDashboard();
```

### Other Hooks

Similar patterns apply to:
- `useQuizzes` - Quiz and question management
- `useFolders` - Folder and file management
- `useStreams` - Live streaming management
- `useTeachers` - Teacher management
- `useEvents` - Event management
- `useBanners` - Banner management
- `useOmrSheets` - OMR sheet management
- `useSocialMedia` - Social media links
- `useTopContent` - Top teachers/students/bulk questions

## 🔄 Caching Strategies

### Stale Time & Cache Time

Each hook is optimized with appropriate caching:

```javascript
// Dashboard data (time-sensitive)
staleTime: 1 * 60 * 1000,     // 1 minute
gcTime: 5 * 60 * 1000,        // 5 minutes
refetchInterval: 30 * 1000,   // 30 seconds

// Course data (moderately stable)
staleTime: 10 * 60 * 1000,    // 10 minutes
gcTime: 20 * 60 * 1000,       // 20 minutes

// Static data (rarely changes)
staleTime: 30 * 60 * 1000,    // 30 minutes
gcTime: 60 * 60 * 1000,       // 1 hour
```

### Background Refetching

```javascript
// Refetch on window focus
refetchOnWindowFocus: true,

// Refetch on reconnect
refetchOnReconnect: true,

// Custom refetch interval
refetchInterval: 30 * 1000,
```

## 🎯 Optimistic Updates

All mutation hooks include optimistic updates for better UX:

```javascript
// Example: Delete user with optimistic update
const deleteUserMutation = useDeleteUser();

// The hook automatically:
// 1. Removes user from cache immediately
// 2. Shows success toast
// 3. Rolls back on error
// 4. Refetches to ensure consistency
```

## 🗂️ Cache Management

Use the `CacheManager` utility for advanced cache operations:

```javascript
import { useCacheManager } from '../utils/cacheManager.js';

function MyComponent() {
  const cacheManager = useCacheManager();

  // Invalidate related data after action
  const handleUserAction = () => {
    cacheManager.invalidateOnAction('user_created', userData);
  };

  // Prefetch page data for better UX
  useEffect(() => {
    cacheManager.prefetchPageData('dashboard');
  }, []);

  // Get cache statistics
  const stats = cacheManager.getCacheStats();
}
```

## 🔧 Advanced Usage

### Custom Query Options

```javascript
// Override default caching for specific use case
const { data } = useUsers(1, 10, {}, {
  staleTime: 0,        // Always fresh data
  refetchOnMount: true,
  enabled: condition,  // Conditional fetching
});
```

### Query Keys

Each hook exports its query keys for advanced cache management:

```javascript
import { userKeys, courseKeys } from '../hooks/index.js';

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
```

### Prefetching

```javascript
// Prefetch data for better UX
const prefetchUsers = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: userKeys.list({ page: 1, limit: 10 }),
    queryFn: () => handleGetAllUsers(1, 10),
    staleTime: 5 * 60 * 1000,
  });
};
```

## 🛡️ Error Handling

All hooks include comprehensive error handling:

- Automatic retry logic with exponential backoff
- Different retry strategies for 4xx vs 5xx errors
- Toast notifications for user feedback
- Graceful fallbacks for missing data

```javascript
// Retry configuration
retry: (failureCount, error) => {
  // Don't retry on 4xx errors
  if (error?.response?.status >= 400 && error?.response?.status < 500) {
    return false;
  }
  return failureCount < 2; // Retry twice for other errors
},
```

## 📊 Performance Benefits

1. **Reduced API Calls**: Intelligent caching prevents unnecessary requests
2. **Better UX**: Optimistic updates provide instant feedback
3. **Real-time Data**: Background refetching keeps data fresh
4. **Offline Support**: Cached data works during network issues
5. **Memory Efficiency**: Automatic garbage collection of old data

## 🔄 Migration Guide

### From Manual API Calls

**Before:**
```javascript
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await handleGetAllUsers(1, 10);
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  fetchUsers();
}, []);
```

**After:**
```javascript
const { data: usersData, isLoading, error } = useUsers(1, 10);

// No manual loading states, error handling, or useEffect needed!
// Data is automatically cached and refetched.
```

## 🎯 Best Practices

1. **Use Specific Hooks**: Import only the hooks you need
2. **Leverage Caching**: Don't manually cache data, let React Query handle it
3. **Optimistic Updates**: Use provided mutations for better UX
4. **Error Boundaries**: Handle errors at component level
5. **Prefetch Data**: Use prefetching for improved perceived performance
6. **Cache Invalidation**: Use smart invalidation strategies

## 🔍 Debugging

React Query DevTools are included in development:

```javascript
// Already configured in main.jsx
<QueryDevTools />
```

Use the DevTools to:
- View cached queries
- Inspect query states
- Manually invalidate/refetch queries
- Monitor performance

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/devtools)
- [Caching Strategies](https://tanstack.com/query/latest/guides/caching)
- [Optimistic Updates](https://tanstack.com/query/latest/guides/optimistic-updates)
