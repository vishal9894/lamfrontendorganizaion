import { Routes, Route, Navigate } from "react-router-dom";


// Auth components
import ProtectRoutes from "./auth/ProtectRoutes";
import Login from "./auth/Login";
import Signup from "./auth/Signup";


// Layout components
import Homelayout from "./layout/Homelayout";


// Dashboard components
import DashBoard from "./pages/DashBoard";



// User management
import UserManagement from "./pages/UserManagement";
import UserPage from "./pages/UserPage";
import AdminUserPage from "./pages/AdminUserPage";

// Course management
import CourseManagement from "./pages/CourseManagement";
import Course from "./pages/Course";
import AddCourse from "./pages/AddCourse";
import ViewCourse from "./pages/ViewCourse";

// Assignment management
import AssignmentManagement from "./pages/AssignmentManagement";
import AddQuiz from "./pages/AddQuiz";
import ViewQuiz from "./pages/ViewQuiz";

// Enrollment management
import EnrollmentManagement from "./pages/EnrollmentManagement";
import AssignCourse from "./pages/AssignCourse";
import ViewAssignCourse from "./pages/ViewAssignCourse";

// Stream/Live session management
import AddStream from "./pages/AddStream";
import ViewStream from "./pages/ViewStream";
import SuperStream from "./pages/SuperStream";
import ViewSuperStream from "./pages/ViewSuperStream";

// Events
import AddEvents from "./pages/AddEvents";
import ViewEvents from "./pages/ViewEvents";

// Teacher management
import AddTeacher from "./pages/AddTeacher";
import AddTopTeacher from "./pages/AddTopTeacher";
import ViewTopTeacher from "./pages/ViewTopTeacher";
import AddTopStudent from "./pages/AddTopStudent";
import ViewTopStudent from "./pages/ViewTopStudent";

// Content management
import Ebook from "./pages/Ebook";

// Admin components
import Role from "./pages/Role";

// Banner management
import Banner from "./pages/Banner";

// OMR management
import AddOmrSheet from "./pages/AddOmrSheet";
import ViewOmrSheet from "./pages/ViewOmrSheet";

// Settings
import GeneralSettting from "./pages/GeneralSettting";
import Addcoins from "./pages/Addcoins";
import SocialMedia from "./pages/SocialMedia";

// Other components
import ImportBulkTest from "./pages/ImportBulkTest";
import ViewQuizQuestion from "./pages/ViewQuizQuestion";


// Sub-organization management



function App() {


  return (
    <Routes>
      {/* Main routes */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />


      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Super Admin Routes */}
      <Route element={<ProtectRoutes />}>
        <Route element={<Homelayout />}>




        </Route>
      </Route>

      {/* Organization Routes */}
      <Route element={<ProtectRoutes />}>
        <Route element={<Homelayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashBoard />} />



          {/* User Management */}
          <Route path="/organization/users" element={

            <UserManagement />

          } />

          <Route path="/organization/quiz/:id" element={
            <ViewQuizQuestion />
          } />


          <Route path="/organization/users/create" element={

            <UserManagement />

          } />
          <Route path="/organization/roles" element={

            <UserManagement />

          } />



          {/* Course Management */}
          <Route path="/courses" element={

            <CourseManagement />

          } />
          <Route path="/courses/create" element={

            <CourseManagement />

          } />
          <Route path="/courses/categories" element={

            <CourseManagement />

          } />


          <Route path="/instructor/courses" element={

            <CourseManagement />

          } />
          <Route path="/instructor/courses/create" element={

            <CourseManagement />

          } />
          <Route path="/instructor/students" element={

            <UserManagement />

          } />
          <Route path="/instructor/progress" element={

            <UserManagement />

          } />
          <Route path="/instructor/progress" element={

            <EnrollmentManagement />


          } />
          <Route path="/instructor/assignments" element={
            <AddQuiz />

          } />
          <Route path="/instructor/assignments/create" element={
            <AddQuiz />

          } />
          <Route path="/instructor/assignments/grade" element={

            <ViewQuiz />

          } />
          <Route path="/instructor/sessions/create" element={

            <AddStream />


          } />
          <Route path="/instructor/sessions" element={

            <ViewStream />

          } />

          {/* Learner Routes */}

          <Route path="/learner/courses" element={

            <Course />

          } />
          <Route path="/learner/catalog" element={

            <Course />

          } />
          <Route path="/learner/assignments/pending" element={

            <AddQuiz />

          } />
          <Route path="/learner/assignments/submitted" element={

            <ViewQuiz />

          } />
          <Route path="/learner/progress" element={

            <EnrollmentManagement />

          } />
          <Route path="/learner/certificates" element={

            <DashBoard />

          } />
          <Route path="/learner/schedule" element={

            <ViewEvents />

          } />
          <Route path="/learner/messages" element={

            <DashBoard />

          } />

          {/* Enrollment Management */}
          <Route path="/enrollments" element={


            <EnrollmentManagement />

          } />
          <Route path="/enrollments/bulk" element={

            <EnrollmentManagement />

          } />

          {/* Assignment Management */}
          <Route path="/assignments" element={

            <AssignmentManagement />

          } />
          <Route path="/assignments/create" element={

            <AssignmentManagement />

          } />
          <Route path="/assignments/submitted" element={

            <AssignmentManagement />

          } />

          {/* Analytics */}
          <Route path="/analytics" element={

            <DashBoard />

          } />
          <Route path="/analytics/courses" element={
            <DashBoard />
          } />
          <Route path="/analytics/users" element={
            <DashBoard />
          } />

          {/* Reports */}
          <Route path="/reports/courses" element={
            <DashBoard />
          } />
          <Route path="/reports/users" element={
            <UserManagement />
          } />
          <Route path="/reports/financial" element={
            <DashBoard />
          } />

          {/* Original Routes (for backward compatibility) */}
          {/* Content */}
          <Route path="/content/courses" element={<Course />} />
          <Route path="/content/ebook" element={<Ebook />} />

          {/* Admin */}
          <Route path="/admin/role" element={<Role />} />
          <Route path="/admin/users" element={<AdminUserPage />} />

          {/* Users */}
          <Route path="/users" element={<UserPage />} />

          {/* Banners */}
          <Route path="/banners" element={<Banner />} />

          {/* Super Steam */}
          <Route path="/super-steam/add" element={<SuperStream />} />
          <Route path="/super-steam/view" element={<ViewSuperStream />} />

          {/* Steam */}
          <Route path="/steam/add" element={<AddStream />} />
          <Route path="/steam/view" element={<ViewStream />} />

          {/* Courses */}
          <Route path="/courses/add" element={<AddCourse />} />
          <Route path="/courses/view" element={<ViewCourse />} />

          {/* Assign Courses */}
          <Route path="/assign-course/new" element={<AssignCourse />} />
          <Route path="/assign-course/view" element={<ViewAssignCourse />} />
          <Route path="/assign-course/enrolled" element={<Course />} />
          <Route path="/assign-course/payment" element={<DashBoard />} />

          {/* Live Events */}
          <Route path="/live-event/add" element={<AddEvents />} />
          <Route path="/live-event/view" element={<ViewEvents />} />
          <Route path="/live-event/chat" element={<ViewEvents />} />

          {/* Permissions */}
          <Route path="/permission/add-teacher" element={<AddTopTeacher />} />
          <Route path="/permission/view-teacher" element={<ViewTopTeacher />} />
          <Route path="/permission/add-student" element={<AddTopStudent />} />
          <Route path="/permission/view-student" element={<ViewTopStudent />} />

          {/* Teacher */}
          <Route path="/teacher" element={<AddTeacher />} />

          {/* OMR Sheets */}
          <Route path="/omr/add" element={<AddOmrSheet />} />
          <Route path="/omr/view" element={<ViewOmrSheet />} />

          {/* Quiz */}
          <Route path="/quiz/add" element={<AddQuiz />} />
          <Route path="/quiz/view" element={<ViewQuiz />} />

          {/* Settings */}
          <Route path="/settings/general" element={<GeneralSettting />} />
          <Route path="/settings/coin" element={<Addcoins />} />
          <Route path="/settings/social" element={<SocialMedia />} />

          {/* Other */}
          <Route path="/other" element={<ImportBulkTest />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
