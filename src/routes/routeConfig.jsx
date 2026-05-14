// Route Configuration - Centralized route definitions
import { Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy loaded components for better performance
const Login = lazy(() => import("../auth/Login"));
const Homelayout = lazy(() => import("../layout/Homelayout"));
const DashBoard = lazy(() => import("../pages/DashBoard"));
const UserManagement = lazy(() => import("../pages/UserManagement"));
const UserPage = lazy(() => import("../pages/UserPage"));
const AdminUserPage = lazy(() => import("../pages/AdminUserPage"));
const CourseManagement = lazy(() => import("../pages/CourseManagement"));
const Course = lazy(() => import("../pages/Course"));
const AddCourse = lazy(() => import("../pages/AddCourse"));
const ViewCourse = lazy(() => import("../pages/ViewCourse"));

const AddQuiz = lazy(() => import("../pages/AddQuiz"));
const ViewQuiz = lazy(() => import("../pages/ViewQuiz"));
const EnrollmentManagement = lazy(() => import("../pages/EnrollmentManagement"));
const AssignCourse = lazy(() => import("../pages/AssignCourse"));
const ViewAssignCourse = lazy(() => import("../pages/ViewAssignCourse"));
const AddStream = lazy(() => import("../pages/AddStream"));
const ViewStream = lazy(() => import("../pages/ViewStream"));
const SuperStream = lazy(() => import("../pages/SuperStream"));
const ViewSuperStream = lazy(() => import("../pages/ViewSuperStream"));
const AddEvents = lazy(() => import("../pages/AddEvents"));
const ViewEvents = lazy(() => import("../pages/ViewEvents"));
const AddTeacher = lazy(() => import("../pages/AddTeacher"));
const AddTopTeacher = lazy(() => import("../pages/AddTopTeacher"));
const ViewTopTeacher = lazy(() => import("../pages/ViewTopTeacher"));
const AddTopStudent = lazy(() => import("../pages/AddTopStudent"));
const ViewTopStudent = lazy(() => import("../pages/ViewTopStudent"));
const Ebook = lazy(() => import("../pages/Ebook"));
const Role = lazy(() => import("../pages/Role"));
const Banner = lazy(() => import("../pages/Banner"));
const AddOmrSheet = lazy(() => import("../pages/AddOmrSheet"));
const ViewOmrSheet = lazy(() => import("../pages/ViewOmrSheet"));
const GeneralSetting = lazy(() => import("../pages/GeneralSettting"));
const Addcoins = lazy(() => import("../pages/Addcoins"));
const SocialMedia = lazy(() => import("../pages/SocialMedia"));
const ImportBulkTest = lazy(() => import("../pages/ImportBulkTest"));
const ViewQuizQuestion = lazy(() => import("../pages/ViewQuizQuestion"));
const ManageQuestions = lazy(() => import("../components/ManageQuestions"));
const ViewTestQuestions = lazy(() => import("../components/ViewTestQuestions"));

// Loading component for lazy-loaded routes
const RouteLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);


// Public routes (no authentication required)
export const publicRoutes = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<RouteLoading />}>
        <Login />
      </Suspense>
    ),
  },
];

// Helper function to wrap lazy components with Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<RouteLoading />}>
    <Component />
  </Suspense>
);

// Protected routes (authentication required)
export const protectedRoutes = [
  // Dashboard
  {
    path: "/dashboard",
    element: withSuspense(DashBoard),
  },

  // User Management
  {
    path: "/organization/users",
    element: withSuspense(UserManagement),
  },
  {
    path: "/organization/users/create",
    element: withSuspense(UserManagement),
  },
  {
    path: "/organization/roles",
    element: withSuspense(UserManagement),
  },
  {
    path: "/organization/quiz/:id",
    element: withSuspense(ViewQuizQuestion),
  },
  {
    path: "/manage-questions/:testId/:testName",
    element: withSuspense(ManageQuestions),
  },
  {
    path: "/manage-view-questions/:testId/:testName",
    element: withSuspense(ViewTestQuestions),
  },

  // Course Management
  {
    path: "/courses",
    element: withSuspense(CourseManagement),
  },
  {
    path: "/courses/create",
    element: withSuspense(CourseManagement),
  },
  {
    path: "/courses/categories",
    element: withSuspense(CourseManagement),
  },
  {
    path: "/instructor/courses",
    element: withSuspense(CourseManagement),
  },
  {
    path: "/instructor/courses/create",
    element: withSuspense(CourseManagement),
  },

  // Instructor Routes
  {
    path: "/instructor/students",
    element: withSuspense(UserManagement),
  },
  {
    path: "/instructor/progress",
    element: withSuspense(EnrollmentManagement),
  },
  {
    path: "/instructor/assignments",
    element: withSuspense(AddQuiz),
  },
  {
    path: "/instructor/assignments/create",
    element: withSuspense(AddQuiz),
  },
  {
    path: "/instructor/assignments/grade",
    element: withSuspense(ViewQuiz),
  },
  {
    path: "/instructor/sessions/create",
    element: withSuspense(AddStream),
  },
  {
    path: "/instructor/sessions",
    element: withSuspense(ViewStream),
  },

  
  // Enrollment Management
  {
    path: "/enrollments",
    element: withSuspense(EnrollmentManagement),
  },
  {
    path: "/enrollments/bulk",
    element: withSuspense(EnrollmentManagement),
  },

 

  

  // Content
  {
    path: "/content/courses",
    element: withSuspense(Course),
  },
  {
    path: "/content/ebook",
    element: withSuspense(Ebook),
  },

  // Admin
  {
    path: "/admin/role",
    element: withSuspense(Role),
  },
  {
    path: "/admin/users",
    element: withSuspense(AdminUserPage),
  },

  // Users
  {
    path: "/users",
    element: withSuspense(UserPage),
  },

  // Banners
  {
    path: "/banners",
    element: withSuspense(Banner),
  },

  // Super Stream
  {
    path: "/super-stream/add",
    element: withSuspense(SuperStream),
  },
  {
    path: "/super-stream/view",
    element: withSuspense(ViewSuperStream),
  },

  // Stream
  {
    path: "/stream/add",
    element: withSuspense(AddStream),
  },
  {
    path: "/stream/view",
    element: withSuspense(ViewStream),
  },

  // Courses
  {
    path: "/courses/add",
    element: withSuspense(AddCourse),
  },
  {
    path: "/courses/view",
    element: withSuspense(ViewCourse),
  },
  {
    path: "/courses/edit/:id",
    element: withSuspense(AddCourse),
  },

  // Assign Courses
  {
    path: "/assign-course/new",
    element: withSuspense(AssignCourse),
  },
  {
    path: "/assign-course/view",
    element: withSuspense(ViewAssignCourse),
  },
  {
    path: "/assign-course/enrolled",
    element: withSuspense(Course),
  },
  {
    path: "/assign-course/payment",
    element: withSuspense(DashBoard),
  },

  // Live Events
  {
    path: "/live-event/add",
    element: withSuspense(AddEvents),
  },
  {
    path: "/live-event/view",
    element: withSuspense(ViewEvents),
  },
  {
    path: "/live-event/chat",
    element: withSuspense(ViewEvents),
  },

  // Permissions
  {
    path: "/permission/add-teacher",
    element: withSuspense(AddTopTeacher),
  },
  {
    path: "/permission/view-teacher",
    element: withSuspense(ViewTopTeacher),
  },
  {
    path: "/permission/add-student",
    element: withSuspense(AddTopStudent),
  },
  {
    path: "/permission/view-student",
    element: withSuspense(ViewTopStudent),
  },

  // Teacher
  {
    path: "/teacher",
    element: withSuspense(AddTeacher),
  },

  // OMR Sheets
  {
    path: "/omr/add",
    element: withSuspense(AddOmrSheet),
  },
  {
    path: "/omr/view",
    element: withSuspense(ViewOmrSheet),
  },

  // Quiz
  {
    path: "/quiz/add",
    element: withSuspense(AddQuiz),
  },
  {
    path: "/quiz/view",
    element: withSuspense(ViewQuiz),
  },
  {
    path: "/edit-quiz/:id",
    element: withSuspense(AddQuiz),
  },

  // Settings
  {
    path: "/settings/general",
    element: withSuspense(GeneralSetting),
  },
  {
    path: "/settings/coin",
    element: withSuspense(Addcoins),
  },
  {
    path: "/settings/social",
    element: withSuspense(SocialMedia),
  },

  // Other
  {
    path: "/other",
    element: withSuspense(ImportBulkTest),
  },
];

// Default redirect
export const defaultRoute = {
  path: "/",
  element: <Navigate to="/dashboard" replace />,
};

// Catch-all route
export const catchAllRoute = {
  path: "*",
  element: <Navigate to="/dashboard" replace />,
};
