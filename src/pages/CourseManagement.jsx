import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';



const CourseManagement = () => {
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    instructor: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    duration: '',
    price: 0,
    thumbnail: '',
    status: 'draft',
    instructorId: '',
    tags: [],
    objectives: [],
    requirements: []
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      let response;
    
      
    
      setCourses(response.courses || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const courseData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        objectives: formData.objectives.split('\n').filter(Boolean),
        requirements: formData.requirements.split('\n').filter(Boolean)
      };

      await organizationApiCalls.createOrganizationCourse(courseData);
      setShowCreateModal(false);
      resetForm();
      fetchCourses();
      toast.success('Course created successfully');
    } catch (error) {
      console.error('Failed to create course:', error);
      toast.error(error.message || 'Failed to create course');
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const courseData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        objectives: formData.objectives.split('\n').filter(Boolean),
        requirements: formData.requirements.split('\n').filter(Boolean)
      };

      await courseApiCalls.updateCourse(selectedCourse.id, courseData);
      setShowEditModal(false);
      resetForm();
      fetchCourses();
      toast.success('Course updated successfully');
    } catch (error) {
      console.error('Failed to update course:', error);
      toast.error(error.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await courseApiCalls.deleteCourse(courseId);
      fetchCourses();
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error(error.message || 'Failed to delete course');
    }
  };

  const handleDuplicateCourse = async (course) => {
    try {
      const duplicatedData = {
        ...course,
        title: `${course.title} (Copy)`,
        status: 'draft',
        id: undefined // Remove ID to create new course
      };
      
      await organizationApiCalls.createOrganizationCourse(duplicatedData);
      fetchCourses();
      toast.success('Course duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate course:', error);
      toast.error(error.message || 'Failed to duplicate course');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      duration: '',
      price: 0,
      thumbnail: '',
      status: 'draft',
      instructorId: '',
      tags: [],
      objectives: [],
      requirements: []
    });
    setSelectedCourse(null);
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      thumbnail: course.thumbnail,
      status: course.status,
      instructorId: course.instructorId,
      tags: course.tags ? course.tags.join(', ') : '',
      objectives: course.objectives ? course.objectives.join('\n') : '',
      requirements: course.requirements ? course.requirements.join('\n') : ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status) => {
    const variants = {
      published: 'success',
      draft: 'warning',
      archived: 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getLevelBadge = (level) => {
    const variants = {
      beginner: 'info',
      intermediate: 'warning',
      advanced: 'destructive'
    };
    return variants[level] || 'info';
  };

  if (!hasPermission('view_courses') && !hasPermission('manage_own_courses')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Access denied. Course viewing permissions required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">
            {userRole === 'instructor' ? 'Manage your courses' : 'Manage all courses in your organization'}
          </p>
        </div>
        {hasPermission('create_courses') && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">All courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.status === 'published').length}
            </div>
            <p className="text-xs text-muted-foreground">Live courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + (course.enrolledCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.length > 0 
                ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-muted-foreground">Course rating</p>
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
                  placeholder="Search courses..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="language">Language</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Level</label>
              <Select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg border hover:shadow-lg transition-shadow">
                  {/* Course Thumbnail */}
                  <div className="relative h-48 bg-gray-200 rounded-t-lg">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <Badge 
                      variant={getStatusBadge(course.status)}
                      className="absolute top-2 right-2"
                    >
                      {course.status}
                    </Badge>
                  </div>

                  {/* Course Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getLevelBadge(course.level)}>
                          {course.level}
                        </Badge>
                        <span className="text-sm text-gray-500">{course.category}</span>
                      </div>
                      {course.price > 0 && (
                        <span className="text-lg font-bold text-green-600">${course.price}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.enrolledCount || 0} students
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </div>
                      {course.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {course.rating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewModal(course)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {hasPermission('manage_own_courses') && canAccessResource('course', course.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(course)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}

                      {hasPermission('create_courses') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateCourse(course)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}

                      {hasPermission('delete_courses') && canAccessResource('course', course.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between mt-6">
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
        </CardContent>
      </Card>

      {/* Create Course Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New Course"
        size="xl"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Course Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter course title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <SelectItem value="">Select category</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="language">Language</SelectItem>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter course description"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Level</label>
              <Select
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
              >
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 8 hours"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., javascript, web development, frontend"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Learning Objectives (one per line)</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={formData.objectives}
              onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
              placeholder="What students will learn..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Requirements (one per line)</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={2}
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="Prerequisites for this course..."
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
            <Button onClick={handleCreateCourse}>
              Create Course
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Course Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedCourse(null);
        }}
        title="Course Details"
        size="xl"
      >
        {selectedCourse && (
          <div className="space-y-6">
            <div className="flex space-x-6">
              {selectedCourse.thumbnail ? (
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="w-48 h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{selectedCourse.title}</h3>
                <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={getStatusBadge(selectedCourse.status)}>
                    {selectedCourse.status}
                  </Badge>
                  <Badge variant={getLevelBadge(selectedCourse.level)}>
                    {selectedCourse.level}
                  </Badge>
                  <Badge>{selectedCourse.category}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">{selectedCourse.duration}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Students:</span>
                    <p className="font-medium">{selectedCourse.enrolledCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Rating:</span>
                    <p className="font-medium">
                      {selectedCourse.rating ? `${selectedCourse.rating.toFixed(1)} ⭐` : 'Not rated'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {selectedCourse.objectives && selectedCourse.objectives.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Learning Objectives</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedCourse.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedCourse.requirements && selectedCourse.requirements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedCourse.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseManagement;
