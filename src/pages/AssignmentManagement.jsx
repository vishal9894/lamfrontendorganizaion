import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';



const AssignmentManagement = () => {


  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    courseId: '',
    type: '',
    status: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'assignment',
    dueDate: '',
    points: 100,
    instructions: '',
    attachments: [],
    allowLateSubmission: false,
    maxAttempts: 1
  });

  const [gradeFormData, setGradeFormData] = useState({
    submissionId: '',
    grade: 0,
    feedback: '',
    status: 'graded'
  });

  useEffect(() => {
    if (hasPermission('create_assignments') || hasPermission('manage_own_courses')) {
      fetchAssignments();
      fetchCourses();
    }
  }, [hasPermission, filters]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await organizationApiCalls.getOrganizationAssignments(filters);
      setAssignments(response.assignments || []);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
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

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await organizationApiCalls.getAssignmentSubmissions(assignmentId);
      setSubmissions(response.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      toast.error('Failed to load submissions');
    }
  };

  const handleCreateAssignment = async () => {
    try {
      await organizationApiCalls.createAssignment(formData);
      setShowCreateModal(false);
      resetForm();
      fetchAssignments();
      toast.success('Assignment created successfully');
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast.error(error.message || 'Failed to create assignment');
    }
  };

  const handleUpdateAssignment = async () => {
    try {
      await organizationApiCalls.updateAssignment(selectedAssignment.id, formData);
      setShowEditModal(false);
      resetForm();
      fetchAssignments();
      toast.success('Assignment updated successfully');
    } catch (error) {
      console.error('Failed to update assignment:', error);
      toast.error(error.message || 'Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await organizationApiCalls.deleteAssignment(assignmentId);
      fetchAssignments();
      toast.success('Assignment deleted successfully');
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      toast.error(error.message || 'Failed to delete assignment');
    }
  };

  const handleGradeSubmission = async () => {
    try {
      await organizationApiCalls.gradeSubmission(gradeFormData.submissionId, gradeFormData);
      setShowGradeModal(false);
      resetGradeForm();
      fetchSubmissions(selectedAssignment.id);
      toast.success('Submission graded successfully');
    } catch (error) {
      console.error('Failed to grade submission:', error);
      toast.error(error.message || 'Failed to grade submission');
    }
  };

  const openGradeModal = (submission) => {
    setGradeFormData({
      submissionId: submission.id,
      grade: submission.grade || 0,
      feedback: submission.feedback || '',
      status: submission.status || 'graded'
    });
    setShowGradeModal(true);
  };

  const openEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      type: assignment.type,
      dueDate: assignment.dueDate,
      points: assignment.points,
      instructions: assignment.instructions,
      attachments: assignment.attachments || [],
      allowLateSubmission: assignment.allowLateSubmission,
      maxAttempts: assignment.maxAttempts
    });
    setShowEditModal(true);
  };

  const viewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    await fetchSubmissions(assignment.id);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      courseId: '',
      type: 'assignment',
      dueDate: '',
      points: 100,
      instructions: '',
      attachments: [],
      allowLateSubmission: false,
      maxAttempts: 1
    });
    setSelectedAssignment(null);
  };

  const resetGradeForm = () => {
    setGradeFormData({
      submissionId: '',
      grade: 0,
      feedback: '',
      status: 'graded'
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      draft: 'warning',
      closed: 'secondary',
      graded: 'success',
      submitted: 'info',
      late: 'destructive'
    };
    return variants[status] || 'secondary';
  };

  const getTypeBadge = (type) => {
    const variants = {
      assignment: 'info',
      quiz: 'warning',
      project: 'destructive',
      exam: 'default'
    };
    return variants[type] || 'secondary';
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (!hasPermission('create_assignments') && !hasPermission('manage_own_courses')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Access denied. Assignment management permissions required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600">Create and manage assignments, quizzes, and projects</p>
        </div>
        {hasPermission('create_assignments') && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        )}
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
                  placeholder="Search assignments..."
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
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments ({assignments.length})</CardTitle>
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
                    <th className="px-6 py-3">Assignment</th>
                    <th className="px-6 py-3">Course</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Points</th>
                    <th className="px-6 py-3">Submissions</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{assignment.title}</div>
                          <div className="text-gray-500 text-sm truncate max-w-xs">
                            {assignment.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{assignment.courseTitle}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getTypeBadge(assignment.type)}>
                          {assignment.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          <span className={isOverdue(assignment.dueDate) ? 'text-red-600' : ''}>
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{assignment.points}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {assignment.submissionCount || 0}/{assignment.totalStudents || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadge(assignment.status)}>
                          {assignment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewSubmissions(assignment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission('create_assignments') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(assignment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('create_assignments') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions Panel */}
      {selectedAssignment && submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submissions for {selectedAssignment.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Submitted</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Grade</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-xs font-medium">
                              {submission.studentName?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{submission.studentName}</div>
                            <div className="text-gray-500">{submission.studentEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadge(submission.status)}>
                          {submission.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {submission.grade !== null ? (
                          <span className="font-medium">{submission.grade}/{selectedAssignment.points}</span>
                        ) : (
                          <span className="text-gray-400">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openGradeModal(submission)}
                          >
                            <GraduationCap className="h-4 w-4" />
                          </Button>
                          {submission.attachments?.map((attachment, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(attachment.url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Assignment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Assignment"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter assignment title"
              />
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

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the assignment"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Due Date *</label>
              <Input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Points</label>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 100 }))}
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Instructions</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Detailed instructions for students"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowLate"
                checked={formData.allowLateSubmission}
                onChange={(e) => setFormData(prev => ({ ...prev, allowLateSubmission: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="allowLate" className="text-sm">Allow late submissions</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Attempts</label>
              <Input
                type="number"
                value={formData.maxAttempts}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 1 }))}
                className="w-20"
              />
            </div>
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
            <Button onClick={handleCreateAssignment}>
              Create Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Grade Submission Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => {
          setShowGradeModal(false);
          resetGradeForm();
        }}
        title="Grade Submission"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Grade</label>
            <Input
              type="number"
              value={gradeFormData.grade}
              onChange={(e) => setGradeFormData(prev => ({ ...prev, grade: parseInt(e.target.value) || 0 }))}
              placeholder="0-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Feedback</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              value={gradeFormData.feedback}
              onChange={(e) => setGradeFormData(prev => ({ ...prev, feedback: e.target.value }))}
              placeholder="Provide feedback to the student"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowGradeModal(false);
                resetGradeForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleGradeSubmission}>
              Save Grade
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssignmentManagement;
