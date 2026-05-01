import React, { useState, useEffect } from 'react';
import { useAssignedCourses, useUsers, useCourses, useDeleteAssignedCourse } from '../hooks/useOptimizedApi';
import { PAGINATION_CONFIG } from '../utils/pagination';
import { AlertCircle, Award, BookOpen, Calendar, CheckCircle, ChevronDown, ChevronUp, Download, DollarSign, Mail, Package, Phone, RefreshCw, Search, Trash2, User, Users } from 'lucide-react';



const ViewAssignCourse = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.COURSES.default);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  // Use optimized hooks with pagination
  const { data: assignmentsData, isLoading: assignmentsLoading, refetch: refetchAssignments } = useAssignedCourses(
    currentPage,
    pageSize,
    { search: searchTerm, user: selectedUser, course: selectedCourse },
    { enabled: true }
  );

  const { data: usersData, isLoading: usersLoading } = useUsers(1, 100, {}, { enabled: true });
  const { data: coursesData, isLoading: coursesLoading } = useCourses('regular_course', 1, 100, {}, { enabled: true });

  const deleteAssignmentMutation = useDeleteAssignedCourse();

  const assignments = assignmentsData?.data || [];
  const pagination = assignmentsData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalAssignments = assignmentsData?.total || 0;

  const users = usersData?.data || [];
  const courses = coursesData?.data || [];

  const handleDeleteClick = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;

    try {
      await deleteAssignmentMutation.mutateAsync(assignmentToDelete.course_id, assignmentToDelete.user_id);
      refetchAssignments();
      setShowDeleteModal(false);
      setAssignmentToDelete(null);
    } catch (error) {
      console.error("Delete assignment error:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setAssignmentToDelete(null);
  };

  const toggleRow = (assignmentId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(assignmentId)) {
      newExpanded.delete(assignmentId);
    } else {
      newExpanded.add(assignmentId);
    }
    setExpandedRows(newExpanded);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId;
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : '';
  };

  const getUserPhone = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.phone_number : '';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.coursename || course.name : courseId;
  };

  const getCourseDetails = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course || null;
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['User Name', 'User Email', 'Course Name', 'Package Type', 'Amount', 'About', 'Assigned Date'];
    const data = assignments.map(assignment => {
      const user = users.find(u => u.id === assignment.userId);
      const course = courses.find(c => c.id === assignment.courseId);
      return [
        user?.name || 'N/A',
        user?.email || 'N/A',
        course?.coursename || 'N/A',
        assignment.packageType || 'N/A',
        assignment.packageAmount || 'N/A',
        assignment.about || 'N/A',
        formatDate(assignment.enrolled_at)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assignments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className=" bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Deletion</h3>

              {success.delete ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-700">{success.delete}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to delete this assignment?
                  </p>

                  {assignmentToDelete && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {getUserName(assignmentToDelete.userId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {getCourseName(assignmentToDelete.courseId)}
                        </span>
                      </div>
                    </div>
                  )}

                  {error.delete && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-600">{error.delete}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleDeleteCancel}
                      disabled={loading.delete}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={loading.delete}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading.delete ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Award className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
            View Assigned Courses
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            View and manage all course assignments
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>

            {/* User Filter */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white appearance-none"
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Course Filter */}
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white appearance-none"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.coursename || course.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={assignments.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr className="text-gray-600 text-sm">
                  <th className="p-4"></th>
                  <th className="p-4">User</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Package Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Assigned Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignmentsLoading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p>Loading assignments...</p>
                    </td>
                  </tr>
                ) : assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <React.Fragment key={`${assignment.userId}-${assignment.courseId}`}>
                      <tr className="border-b hover:bg-gray-50 transition">
                        <td className="p-4">
                          <button onClick={() => toggleRow(`${assignment.userId}-${assignment.courseId}`)}>
                            {expandedRows.has(`${assignment.userId}-${assignment.courseId}`) ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold text-xs">
                              {getUserName(assignment.userId)?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-800">
                                {getUserName(assignment.userId)}
                              </p>
                              <p className="text-xs text-gray-500">{getUserEmail(assignment.userId)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm text-gray-800">
                              {getCourseName(assignment.courseId)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            <Package className="w-3 h-3 mr-1" />
                            {assignment.packageType || 'Standard'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-800">
                            <DollarSign className="w-3 h-3 text-green-600" />
                            {formatCurrency(assignment.packageAmount)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {formatDate(assignment.enrolled_at)}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDeleteClick(assignment)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {expandedRows.has(`${assignment.user_id}-${assignment.course_id}`) && (
                        <tr className="bg-gray-50">
                          <td colSpan="8" className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* User Details */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                  <User className="w-3 h-3" /> User Details
                                </h4>
                                <div className="space-y-2">
                                  <p className="text-xs flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    {getUserEmail(assignment.userId)}
                                  </p>
                                  <p className="text-xs flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    {getUserPhone(assignment.userId) || 'N/A'}
                                  </p>
                                </div>
                              </div>

                              {/* Course Details */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" /> Course Details
                                </h4>
                                {(() => {
                                  const course = getCourseDetails(assignment.courseId);
                                  return course ? (
                                    <div className="space-y-2">
                                      <p className="text-xs">
                                        <span className="font-medium">Duration:</span> {course.courseduration || 'N/A'}
                                      </p>
                                      <p className="text-xs">
                                        <span className="font-medium">Price:</span> {formatCurrency(course.currentprice)}
                                      </p>
                                      {course.courseimage && (
                                        <img
                                          src={course.courseimage}
                                          alt={course.coursename}
                                          className="w-16 h-16 object-cover rounded-lg mt-2"
                                        />
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500">Course details not available</p>
                                  );
                                })()}
                              </div>

                              {/* Package Details */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                  <Package className="w-3 h-3" /> Package Details
                                </h4>
                                <div className="space-y-2">
                                  <p className="text-xs">
                                    <span className="font-medium">Type:</span> {assignment.packageType || 'Standard'}
                                  </p>
                                  <p className="text-xs">
                                    <span className="font-medium">Amount:</span> {formatCurrency(assignment.packageAmount)}
                                  </p>
                                  {assignment.about && (
                                    <div>
                                      <p className="text-xs font-medium mb-1">About:</p>
                                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                        {assignment.about}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">
                      <Award className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No assignments found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {assignments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalAssignments)} of {totalAssignments} assignments
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Items per page:</label>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          {assignments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-800">{totalAssignments}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Unique Users</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(assignments.map(a => a.userId)).size}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Total Courses Assigned</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(assignments.map(a => a.courseId)).size}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default ViewAssignCourse;