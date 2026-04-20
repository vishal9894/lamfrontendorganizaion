import { useState, useEffect } from 'react';
import { 
  handleGetAssignCourse,
  handleGetAllUsers,
  handleGetCourse, 
  handleDeleteAssignCourse
} from '../api/allApi';



const ViewAssignCourse = () => {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState({
    assignments: false,
    users: false,
    courses: false,
    delete: false
  });
  const [error, setError] = useState({
    assignments: null,
    users: null,
    courses: null,
    delete: null
  });
  const [success, setSuccess] = useState({
    delete: null
  });
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchAssignments(),
      fetchUsers(),
      fetchCourses()
    ]);
  };

  const fetchAssignments = async () => {
    setLoading(prev => ({ ...prev, assignments: true }));
    setError(prev => ({ ...prev, assignments: null }));
    try {
      const res = await handleGetAssignCourse();
      if (res.success) {
        setAssignments(res.data || []);
      } else {
        setError(prev => ({ ...prev, assignments: res.message || "Failed to fetch assignments" }));
      }
    } catch (error) {
      console.error("Fetch assignments error:", error);
      setError(prev => ({ ...prev, assignments: "Failed to fetch assignments" }));
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  };

  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await handleGetAllUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchCourses = async () => {
    setLoading(prev => ({ ...prev, courses: true }));
    try {
      const res = await handleGetCourse("regular_course");
      if (res.success) {
        setCourses(res.data || []);
      }
    } catch (error) {
      console.error("Fetch courses error:", error);
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

  const handleDeleteClick = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteModal(true);
    setError(prev => ({ ...prev, delete: null }));
    setSuccess(prev => ({ ...prev, delete: null }));
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;

    setLoading(prev => ({ ...prev, delete: true }));
    setError(prev => ({ ...prev, delete: null }));
    setSuccess(prev => ({ ...prev, delete: null }));

    try {
      const res = await handleDeleteAssignCourse(assignmentToDelete.course_id, assignmentToDelete.user_id);
      
      if (res.success) {
        setSuccess(prev => ({ ...prev, delete: "Assignment deleted successfully!" }));
        
        // Remove the deleted assignment from the list
        setAssignments(prev => prev.filter(a => 
          !(a.userId === assignmentToDelete.userId && a.courseId === assignmentToDelete.courseId)
        ));
       await fetchAllData()
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowDeleteModal(false);
          setAssignmentToDelete(null);
          setSuccess(prev => ({ ...prev, delete: null }));
        }, 2000);
      } else {
        setError(prev => ({ ...prev, delete: res.message || "Failed to delete assignment" }));
      }
    } catch (error) {
      console.error("Delete assignment error:", error);
      setError(prev => ({ ...prev, delete: "Failed to delete assignment" }));
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setAssignmentToDelete(null);
    setError(prev => ({ ...prev, delete: null }));
    setSuccess(prev => ({ ...prev, delete: null }));
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

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const user = users.find(u => u.id === assignment.userId);
    const course = courses.find(c => c.id === assignment.courseId);
    
    const matchesSearch = searchTerm === "" ||
      (user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course?.coursename?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (assignment.packageType?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesUser = selectedUser === 'all' || assignment.userId === selectedUser;
    const matchesCourse = selectedCourse === 'all' || assignment.courseId === selectedCourse;
    
    // Date filtering
    let matchesDate = true;
    if (dateRange.from) {
      matchesDate = matchesDate && new Date(assignment.enrolled_at) >= new Date(dateRange.from);
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(assignment.enrolled_at) <= toDate;
    }
    
    return matchesSearch && matchesUser && matchesCourse && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssignments = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

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
    const data = filteredAssignments.map(assignment => {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6">
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
              disabled={filteredAssignments.length === 0}
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
                {loading.assignments ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p>Loading assignments...</p>
                    </td>
                  </tr>
                ) : error.assignments ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-red-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p>{error.assignments}</p>
                      <button 
                        onClick={fetchAssignments}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Try again
                      </button>
                    </td>
                  </tr>
                ) : currentAssignments.length > 0 ? (
                  currentAssignments.map((assignment) => (
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
          </div>

          {/* Pagination */}
          {filteredAssignments.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssignments.length)} of {filteredAssignments.length} assignments
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 bg-white"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {filteredAssignments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-800">{filteredAssignments.length}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Unique Users</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(filteredAssignments.map(a => a.userId)).size}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Total Courses Assigned</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(filteredAssignments.map(a => a.courseId)).size}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAssignCourse;