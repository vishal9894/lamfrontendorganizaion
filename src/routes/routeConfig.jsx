// Route Configuration - Centralized route definitions
import { Navigate } from "react-router-dom";

// Auth components
import Login from "../auth/Login";
import Signup from "../auth/Signup";

// Layout components
import Homelayout from "../layout/Homelayout";

// Dashboard
import DashBoard from "../pages/DashBoard";

// User Management
import UserManagement from "../pages/UserManagement";
import UserPage from "../pages/UserPage";
import AdminUserPage from "../pages/AdminUserPage";

// Course Management
import CourseManagement from "../pages/CourseManagement";
import Course from "../pages/Course";
import AddCourse from "../pages/AddCourse";
import ViewCourse from "../pages/ViewCourse";

// Assignment Management
import AssignmentManagement from "../pages/AssignmentManagement";
import AddQuiz from "../pages/AddQuiz";
import ViewQuiz from "../pages/ViewQuiz";

// Enrollment Management
import EnrollmentManagement from "../pages/EnrollmentManagement";
import AssignCourse from "../pages/AssignCourse";
import ViewAssignCourse from "../pages/ViewAssignCourse";

// Stream/Live session management
import AddStream from "../pages/AddStream";
import ViewStream from "../pages/ViewStream";
import SuperStream from "../pages/SuperStream";
import ViewSuperStream from "../pages/ViewSuperStream";

// Events
import AddEvents from "../pages/AddEvents";
import ViewEvents from "../pages/ViewEvents";

// Teacher management
import AddTeacher from "../pages/AddTeacher";
import AddTopTeacher from "../pages/AddTopTeacher";
import ViewTopTeacher from "../pages/ViewTopTeacher";
import AddTopStudent from "../pages/AddTopStudent";
import ViewTopStudent from "../pages/ViewTopStudent";

// Content management
import Ebook from "../pages/Ebook";

// Admin components
import Role from "../pages/Role";

// Banner management
import Banner from "../pages/Banner";

// OMR management
import AddOmrSheet from "../pages/AddOmrSheet";
import ViewOmrSheet from "../pages/ViewOmrSheet";

// Settings
import GeneralSettting from "../pages/GeneralSettting";
import Addcoins from "../pages/Addcoins";
import SocialMedia from "../pages/SocialMedia";

// Other components
import ImportBulkTest from "../pages/ImportBulkTest";
import ViewQuizQuestion from "../pages/ViewQuizQuestion";
import ManageQuestions from "../components/ManageQuestions";
import ViewTestQuestions from "../components/ViewTestQuestions";

// Public routes (no authentication required)
export const publicRoutes = [
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
];

// Protected routes (authentication required)
export const protectedRoutes = [
  // Dashboard
  {
    path: "/dashboard",
    element: <DashBoard />,
  },

  // User Management
  {
    path: "/organization/users",
    element: <UserManagement />,
  },
  {
    path: "/organization/users/create",
    element: <UserManagement />,
  },
  {
    path: "/organization/roles",
    element: <UserManagement />,
  },
  {
    path: "/organization/quiz/:id",
    element: <ViewQuizQuestion />,
  },
  {
    path: "/manage-questions/:testId/:testName",
    element: <ManageQuestions />,
  },
  {
    path: "/manage-view-questions/:testId/:testName",
    element: <ViewTestQuestions />,
  },

  // Course Management
  {
    path: "/courses",
    element: <CourseManagement />,
  },
  {
    path: "/courses/create",
    element: <CourseManagement />,
  },
  {
    path: "/courses/categories",
    element: <CourseManagement />,
  },
  {
    path: "/instructor/courses",
    element: <CourseManagement />,
  },
  {
    path: "/instructor/courses/create",
    element: <CourseManagement />,
  },

  // Instructor Routes
  {
    path: "/instructor/students",
    element: <UserManagement />,
  },
  {
    path: "/instructor/progress",
    element: <EnrollmentManagement />,
  },
  {
    path: "/instructor/assignments",
    element: <AddQuiz />,
  },
  {
    path: "/instructor/assignments/create",
    element: <AddQuiz />,
  },
  {
    path: "/instructor/assignments/grade",
    element: <ViewQuiz />,
  },
  {
    path: "/instructor/sessions/create",
    element: <AddStream />,
  },
  {
    path: "/instructor/sessions",
    element: <ViewStream />,
  },

  // Learner Routes
  {
    path: "/learner/courses",
    element: <Course />,
  },
  {
    path: "/learner/catalog",
    element: <Course />,
  },
  {
    path: "/learner/assignments/pending",
    element: <AddQuiz />,
  },
  {
    path: "/learner/assignments/submitted",
    element: <ViewQuiz />,
  },
  {
    path: "/learner/progress",
    element: <EnrollmentManagement />,
  },
  {
    path: "/learner/certificates",
    element: <DashBoard />,
  },
  {
    path: "/learner/schedule",
    element: <ViewEvents />,
  },
  {
    path: "/learner/messages",
    element: <DashBoard />,
  },

  // Enrollment Management
  {
    path: "/enrollments",
    element: <EnrollmentManagement />,
  },
  {
    path: "/enrollments/bulk",
    element: <EnrollmentManagement />,
  },

  // Assignment Management
  {
    path: "/assignments",
    element: <AssignmentManagement />,
  },
  {
    path: "/assignments/create",
    element: <AssignmentManagement />,
  },
  {
    path: "/assignments/submitted",
    element: <AssignmentManagement />,
  },

  // Analytics
  {
    path: "/analytics",
    element: <DashBoard />,
  },
  {
    path: "/analytics/courses",
    element: <DashBoard />,
  },
  {
    path: "/analytics/users",
    element: <DashBoard />,
  },

  // Reports
  {
    path: "/reports/courses",
    element: <DashBoard />,
  },
  {
    path: "/reports/users",
    element: <UserManagement />,
  },
  {
    path: "/reports/financial",
    element: <DashBoard />,
  },

  // Content
  {
    path: "/content/courses",
    element: <Course />,
  },
  {
    path: "/content/ebook",
    element: <Ebook />,
  },

  // Admin
  {
    path: "/admin/role",
    element: <Role />,
  },
  {
    path: "/admin/users",
    element: <AdminUserPage />,
  },

  // Users
  {
    path: "/users",
    element: <UserPage />,
  },

  // Banners
  {
    path: "/banners",
    element: <Banner />,
  },

  // Super Stream
  {
    path: "/super-steam/add",
    element: <SuperStream />,
  },
  {
    path: "/super-steam/view",
    element: <ViewSuperStream />,
  },

  // Stream
  {
    path: "/steam/add",
    element: <AddStream />,
  },
  {
    path: "/steam/view",
    element: <ViewStream />,
  },

  // Courses
  {
    path: "/courses/add",
    element: <AddCourse />,
  },
  {
    path: "/courses/view",
    element: <ViewCourse />,
  },

  // Assign Courses
  {
    path: "/assign-course/new",
    element: <AssignCourse />,
  },
  {
    path: "/assign-course/view",
    element: <ViewAssignCourse />,
  },
  {
    path: "/assign-course/enrolled",
    element: <Course />,
  },
  {
    path: "/assign-course/payment",
    element: <DashBoard />,
  },

  // Live Events
  {
    path: "/live-event/add",
    element: <AddEvents />,
  },
  {
    path: "/live-event/view",
    element: <ViewEvents />,
  },
  {
    path: "/live-event/chat",
    element: <ViewEvents />,
  },

  // Permissions
  {
    path: "/permission/add-teacher",
    element: <AddTopTeacher />,
  },
  {
    path: "/permission/view-teacher",
    element: <ViewTopTeacher />,
  },
  {
    path: "/permission/add-student",
    element: <AddTopStudent />,
  },
  {
    path: "/permission/view-student",
    element: <ViewTopStudent />,
  },

  // Teacher
  {
    path: "/teacher",
    element: <AddTeacher />,
  },

  // OMR Sheets
  {
    path: "/omr/add",
    element: <AddOmrSheet />,
  },
  {
    path: "/omr/view",
    element: <ViewOmrSheet />,
  },

  // Quiz
  {
    path: "/quiz/add",
    element: <AddQuiz />,
  },
  {
    path: "/quiz/view",
    element: <ViewQuiz />,
  },

  // Settings
  {
    path: "/settings/general",
    element: <GeneralSettting />,
  },
  {
    path: "/settings/coin",
    element: <Addcoins />,
  },
  {
    path: "/settings/social",
    element: <SocialMedia />,
  },

  // Other
  {
    path: "/other",
    element: <ImportBulkTest />,
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
