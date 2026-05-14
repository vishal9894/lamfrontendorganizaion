import React, { useState, useEffect } from 'react';
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

  // Placeholder data since hooks don't exist
  const assignmentsData = { data: [], pagination: { totalPages: 1, hasNextPage: false, hasPrevPage: false }, total: 0 };
  const assignmentsLoading = false;
  const usersData = { data: [] };
  const usersLoading = false;
  const coursesData = { data: [] };
  const coursesLoading = false;
  const deleteAssignmentMutation = null;

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
      // Placeholder for delete functionality
      setShowDeleteModal(false);
      setAssignmentToDelete(null);
    } catch (error) {
      // Silent error handling
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
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            View Assigned Courses
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            View and manage all course assignments
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* User Filter */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white appearance-none"
                >
                  <option value="all">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Course Filter */}
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white appearance-none"
                >
                  <option value="all">All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.coursename || course.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                disabled={assignments.length === 0}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base font-medium shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {assignmentsLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading assignments...</p>
            </div>
          ) : assignments.length > 0 ? (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4 p-4">
                {assignments.map((assignment) => (
                  <div
                    key={`${assignment.userId}-${assignment.courseId}`}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-102"
                  >
                    <div className="flex gap-4">
                      {/* User Avatar */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {getUserName(assignment.userId)?.charAt(0).toUpperCase()}
                      </div>

                      {/* Assignment Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight">
                          {getUserName(assignment.userId)}
                        </h3>

                        {/* Course Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {getCourseName(assignment.courseId)}
                          </span>
                        </div>

                        {/* Package and Amount */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            <Package className="w-3 h-3 mr-1" />
                            {assignment.packageType || 'Standard'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-lg font-bold text-gray-800">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            {formatCurrency(assignment.packageAmount)}
                          </span>
                        </div>

                        {/* Date and Status */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(assignment.enrolled_at)}
                          </div>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        </div>

                        {/* Email */}
                        {getUserEmail(assignment.userId) && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{getUserEmail(assignment.userId)}</span>
                          </div>
                        )}

                        {/* Phone */}
                        {getUserPhone(assignment.userId) && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <Phone className="w-3 h-3" />
                            <span>{getUserPhone(assignment.userId) || 'N/A'}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleRow(`${assignment.userId}-${assignment.courseId}`)}
                            className="flex-1 px-3 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all font-medium flex items-center justify-center gap-2 border border-gray-200"
                          >
                            {expandedRows.has(`${assignment.userId}-${assignment.courseId}`) ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Show Details
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(assignment)}
                            className="flex-1 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium flex items-center justify-center gap-2 border border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedRows.has(`${assignment.userId}-${assignment.courseId}`) && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="grid grid-cols-1 gap-4">
                          {/* User Details */}
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <User className="w-4 h-4" /> User Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>{getUserEmail(assignment.userId)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{getUserPhone(assignment.userId) || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Course Details */}
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" /> Course Details
                            </h4>
                            {(() => {
                              const course = getCourseDetails(assignment.courseId);
                              return course ? (
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    <span className="font-medium">Duration:</span> {course.courseduration || 'N/A'}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Price:</span> {formatCurrency(course.currentprice)}
                                  </p>
                                  {course.courseimage && (
                                    <img
                                      src={course.courseimage}
                                      alt={course.coursename}
                                      className="w-20 h-20 object-cover rounded-xl mt-2"
                                    />
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Course details not available</p>
                              );
                            })()}
                          </div>

                          {/* Package Details */}
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <Package className="w-4 h-4" /> Package Details
                            </h4>
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="font-medium">Type:</span> {assignment.packageType || 'Standard'}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Amount:</span> {formatCurrency(assignment.packageAmount)}
                              </p>
                              {assignment.about && (
                                <div>
                                  <p className="text-sm font-medium mb-2">About:</p>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{assignment.about}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
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
                    {assignments.map((assignment) => (
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
                        {expandedRows.has(`${assignment.userId}-${assignment.courseId}`) && (
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
                                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{assignment.about}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {assignments.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
                  {/* Page Info and Controls */}
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                    <div className="text-sm text-gray-600 font-medium">
                      Page <span className="font-bold text-gray-800">{currentPage}</span> of <span className="font-bold text-gray-800">{pagination.totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                      <span className="text-sm text-gray-600">per page</span>
                    </div>
                  </div>

                  {/* Pagination Navigation */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                      {/* First page */}
                      {currentPage > 3 && pagination.totalPages > 5 && (
                        <>
                          <button
                            onClick={() => handlePageChange(1)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] flex-shrink-0 ${1 === currentPage
                              ? "bg-blue-600 text-white border-blue-600"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            1
                          </button>
                          {currentPage > 4 && <span className="px-2 text-gray-400 flex-shrink-0">...</span>}
                        </>
                      )}

                      {/* Page numbers around current page */}
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        // Skip if this page is already shown as first page
                        if (currentPage > 3 && pagination.totalPages > 5 && pageNum === 1) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] flex-shrink-0 ${pageNum === currentPage
                              ? "bg-blue-600 text-white border-blue-600"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Last page */}
                      {currentPage < pagination.totalPages - 2 && pagination.totalPages > 5 && (
                        <>
                          {currentPage < pagination.totalPages - 3 && <span className="px-2 text-gray-400 flex-shrink-0">...</span>}
                          <button
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] flex-shrink-0 ${pagination.totalPages === currentPage
                              ? "bg-blue-600 text-white border-blue-600"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            {pagination.totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Show total items info */}
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalAssignments)} of {totalAssignments} assignments
                  </div>
                </div>
              )}


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
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No assignments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAssignCourse;