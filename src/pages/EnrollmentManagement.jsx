import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';



const EnrollmentManagement = () => {


  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkEnrollModal, setShowBulkEnrollModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    courseId: '',
    status: '',
    dateRange: ''
  });

  const [formData, setFormData] = useState({
    userId: '',
    courseId: '',
    enrollmentType: 'individual',
    paymentStatus: 'paid',
    notes: ''
  });

  const [bulkEnrollData, setBulkEnrollData] = useState({
    courseId: '',
    userIds: '',
    enrollmentType: 'bulk',
    paymentStatus: 'paid',
    notes: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };

   
      setEnrollments(response.enrollments || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await organizationApiCalls.getOrganizationCourses({ status: 'published' });
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await organizationApiCalls.getOrganizationUsers({ status: 'active' });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreateEnrollment = async () => {
    try {
      await organizationApiCalls.createEnrollment(formData);
      setShowCreateModal(false);
      resetForm();
      fetchEnrollments();
      toast.success('Enrollment created successfully');
    } catch (error) {
      console.error('Failed to create enrollment:', error);
      toast.error(error.message || 'Failed to create enrollment');
    }
  };

  const handleBulkEnrollment = async () => {
    try {
      const userIds = bulkEnrollData.userIds
        .split('\n')
        .map(id => id.trim())
        .filter(Boolean);

      const enrollmentPromises = userIds.map(userId =>
        organizationApiCalls.createEnrollment({
          ...bulkEnrollData,
          userId,
          userIds: undefined // Remove this field
        })
      );

      await Promise.all(enrollmentPromises);
      setShowBulkEnrollModal(false);
      resetBulkForm();
      fetchEnrollments();
      toast.success(`Successfully enrolled ${userIds.length} users`);
    } catch (error) {
      console.error('Failed to create bulk enrollment:', error);
      toast.error(error.message || 'Failed to create bulk enrollment');
    }
  };

  const handleViewProgress = async (enrollment) => {
    try {
      const progress = await userApiCalls.getUserProgress(enrollment.userId, enrollment.courseId);
      setSelectedEnrollment({ ...enrollment, progress });
      setShowProgressModal(true);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      toast.error('Failed to load progress data');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      courseId: '',
      enrollmentType: 'individual',
      paymentStatus: 'paid',
      notes: ''
    });
  };

  const resetBulkForm = () => {
    setBulkEnrollData({
      courseId: '',
      userIds: '',
      enrollmentType: 'bulk',
      paymentStatus: 'paid',
      notes: ''
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      completed: 'info',
      suspended: 'warning',
      cancelled: 'destructive'
    };
    return variants[status] || 'secondary';
  };

  const getPaymentBadge = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      failed: 'destructive',
      refunded: 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const exportEnrollments = () => {
    const csvContent = [
      ['Student Name', 'Email', 'Course', 'Status', 'Enrollment Date', 'Progress', 'Payment Status'],
      ...enrollments.map(enrollment => [
        enrollment.userName,
        enrollment.userEmail,
        enrollment.courseTitle,
        enrollment.status,
        new Date(enrollment.enrolledAt).toLocaleDateString(),
        `${enrollment.progress || 0}%`,
        enrollment.paymentStatus
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!hasPermission('manage_enrollments') && !hasPermission('view_enrolled_courses')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Access denied. Enrollment management permissions required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
          <p className="text-gray-600">Manage student enrollments and track progress</p>
        </div>
        <div className="flex space-x-2">
          {hasPermission('manage_enrollments') && (
            <Button onClick={() => setShowBulkEnrollModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Bulk Enroll
            </Button>
          )}
          {hasPermission('manage_enrollments') && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Single Enroll
            </Button>
          )}
          <Button variant="outline" onClick={exportEnrollments}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground">All enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter(e => e.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter(e => e.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Finished courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.length > 0
                ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Average completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student or course..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Course</label>
              <Select
                value={filters.courseId}
                onChange={(e) => handleFilterChange('courseId', e.target.value)}
              >
                <SelectItem value="">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <Select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <SelectItem value="">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Course</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Progress</th>
                    <th className="px-6 py-3">Enrolled</th>
                    <th className="px-6 py-3">Payment</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-xs font-medium">
                              {enrollment.userName?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{enrollment.userName}</div>
                            <div className="text-gray-500">{enrollment.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{enrollment.courseTitle}</div>
                          <div className="text-gray-500">{enrollment.courseCategory}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadge(enrollment.status)}>
                          {enrollment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${enrollment.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{enrollment.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getPaymentBadge(enrollment.paymentStatus)}>
                          {enrollment.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProgress(enrollment)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          {hasPermission('manage_enrollments') && (
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page * pagination.limit >= pagination.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Enrollment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Enroll Student"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Student *</label>
              <Select
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
              >
                <SelectItem value="">Select student</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Course *</label>
              <Select
                value={formData.courseId}
                onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
              >
                <SelectItem value="">Select course</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Enrollment Type</label>
              <Select
                value={formData.enrollmentType}
                onChange={(e) => setFormData(prev => ({ ...prev, enrollmentType: e.target.value }))}
              >
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Status</label>
              <Select
                value={formData.paymentStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
              >
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEnrollment}>
              Enroll Student
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Enrollment Modal */}
      <Modal
        isOpen={showBulkEnrollModal}
        onClose={() => {
          setShowBulkEnrollModal(false);
          resetBulkForm();
        }}
        title="Bulk Enrollment"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Course *</label>
            <Select
              value={bulkEnrollData.courseId}
              onChange={(e) => setBulkEnrollData(prev => ({ ...prev, courseId: e.target.value }))}
            >
              <SelectItem value="">Select course</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">User IDs (one per line) *</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={6}
              value={bulkEnrollData.userIds}
              onChange={(e) => setBulkEnrollData(prev => ({ ...prev, userIds: e.target.value }))}
              placeholder="Enter user IDs, one per line..."
            />
            <p className="text-xs text-gray-500 mt-1">
              You can also enter email addresses - the system will try to match them
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Enrollment Type</label>
              <Select
                value={bulkEnrollData.enrollmentType}
                onChange={(e) => setBulkEnrollData(prev => ({ ...prev, enrollmentType: e.target.value }))}
              >
                <SelectItem value="bulk">Bulk</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Status</label>
              <Select
                value={bulkEnrollData.paymentStatus}
                onChange={(e) => setBulkEnrollData(prev => ({ ...prev, paymentStatus: e.target.value }))}
              >
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={bulkEnrollData.notes}
              onChange={(e) => setBulkEnrollData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes for all enrollments..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkEnrollModal(false);
                resetBulkForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkEnrollment}>
              Bulk Enroll Users
            </Button>
          </div>
        </div>
      </Modal>

      {/* Progress Modal */}
      <Modal
        isOpen={showProgressModal}
        onClose={() => {
          setShowProgressModal(false);
          setSelectedEnrollment(null);
        }}
        title="Student Progress"
        size="lg"
      >
        {selectedEnrollment && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Student Information</h4>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedEnrollment.userName}</p>
                  <p><strong>Email:</strong> {selectedEnrollment.userEmail}</p>
                  <p><strong>Enrolled:</strong> {new Date(selectedEnrollment.enrolledAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Course Information</h4>
                <div className="space-y-2">
                  <p><strong>Course:</strong> {selectedEnrollment.courseTitle}</p>
                  <p><strong>Status:</strong>
                    <Badge variant={getStatusBadge(selectedEnrollment.status)} className="ml-2">
                      {selectedEnrollment.status}
                    </Badge>
                  </p>
                  <p><strong>Progress:</strong> {selectedEnrollment.progress || 0}%</p>
                </div>
              </div>
            </div>

            {selectedEnrollment.progress && (
              <div>
                <h4 className="font-semibold mb-2">Overall Progress</h4>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${selectedEnrollment.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{selectedEnrollment.progress}% Complete</p>
              </div>
            )}

            {selectedEnrollment.progress?.modules && (
              <div>
                <h4 className="font-semibold mb-2">Module Progress</h4>
                <div className="space-y-3">
                  {selectedEnrollment.progress.modules.map((module, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{module.title}</h5>
                        <span className="text-sm text-gray-600">{module.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setShowProgressModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EnrollmentManagement;
