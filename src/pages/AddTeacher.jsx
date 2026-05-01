import { useState, useEffect } from 'react';
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from '../hooks/useOptimizedApi';
import { PAGINATION_CONFIG } from '../utils/pagination';
import {
  UserPlus,
  Users,
  User,
  CreditCard,
  Percent,
  BookOpen,
  Star,
  FileText,
  Image as ImageIcon,
  X,
  Upload,
  Save,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { handleGetCourse } from '../api/allApi';

// Delete Modal Component
const DeleteModal = ({ isOpen, onClose, onConfirm, title, itemName, isLoading, confirmText, cancelText, size }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <Trash2 className="text-red-600 text-2xl" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete <span className="font-semibold">{itemName}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cancelText || 'Cancel'}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                confirmText || 'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddTeacher = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.TEACHERS.default);
  const [searchTerm, setSearchTerm] = useState('');

  // Use optimized hooks with pagination
  const { data: teachersData, isLoading: teachersLoading, refetch: refetchTeachers } = useTeachers(
    currentPage,
    pageSize,
    { search: searchTerm },
    { enabled: true }
  );

  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const deleteTeacherMutation = useDeleteTeacher();

  const teachers = teachersData?.data || [];
  const pagination = teachersData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalTeachers = teachersData?.total || 0;

  // Add Teacher Form State
  const [formData, setFormData] = useState({
    name: '',
    account_id: '',
    revenue_share: '',
    assigned_course_id: '',
    rating: '',
    teacherdetails: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Courses state - will hold ALL courses from all types
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Course types to fetch
  const courseTypes = [
    "regular_course",
    "ebook",
    "free_video_course",
    "free_pdf_course",
    "free_test_series"
  ];

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Refresh data after mutations
  const refreshData = () => {
    refetchTeachers();
  };

  // Fetch all courses from all types on component mount
  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    refetchTeachers();
  }, [currentPage, pageSize, searchTerm]);

  const fetchAllCourses = async () => {
    setLoadingCourses(true);
    try {
      let allCourses = [];

      // Fetch courses for each course type
      for (const type of courseTypes) {
        try {
          const response = await handleGetCourse(type);

          if (response?.data?.course && Array.isArray(response.data.course)) {
            allCourses.push(...response.data.course);
          } else if (response?.data && Array.isArray(response.data)) {
            allCourses.push(...response.data);
          } else if (Array.isArray(response)) {
            allCourses.push(...response);
          } else if (response?.course && Array.isArray(response.course)) {
            allCourses.push(...response.course);
          }
        } catch (err) {
        }
      }

      // Remove duplicates by ID if any
      const uniqueCourses = allCourses.filter((course, index, self) =>
        index === self.findIndex((c) => c.id === course.id)
      );

      setCourses(uniqueCourses);
    } catch (err) {
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const input = document.getElementById('teacher-image');
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('account_id', formData.account_id);
      formDataToSend.append('revenue_share', formData.revenue_share);
      formDataToSend.append('assigned_course_id', formData.assigned_course_id);
      formDataToSend.append('rating', formData.rating || '0');
      formDataToSend.append('teacherdetails', formData.teacherdetails || '');

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;

      if (editMode && editId) {
        response = await updateTeacherMutation.mutateAsync({ id: editId, data: formDataToSend });
      } else {
        response = await createTeacherMutation.mutateAsync(formDataToSend);
      }

      if (response && (response.success === true || response.status === 200 || response.data)) {
        setSuccess(editMode ? 'Teacher updated successfully!' : 'Teacher created successfully!');
        resetForm();
        refreshData();

        // Switch to view tab after successful creation/update
        setTimeout(() => {
          setActiveTab('view');
          setTimeout(() => setSuccess(null), 3000);
        }, 1500);
      } else {
        setError(response?.message || (editMode ? 'Failed to update teacher' : 'Failed to create teacher'));
      }

    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || (editMode ? 'Failed to update teacher' : 'Failed to create teacher');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      account_id: '',
      revenue_share: '',
      assigned_course_id: '',
      rating: '',
      teacherdetails: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setEditMode(false);
    setEditId(null);
    setError(null);
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  const handleEdit = (teacher) => {
    setFormData({
      name: teacher.name || '',
      account_id: teacher.account_id || '',
      revenue_share: teacher.revenue_share || '',
      assigned_course_id: teacher.assigned_course_id || '',
      rating: teacher.rating || '',
      teacherdetails: teacher.teacherdetails || ''
    });
    setImagePreview(teacher.image || null);
    setEditMode(true);
    setEditId(teacher.id);
    setActiveTab('add');
  };

  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;

    setDeleteLoading(true);
    try {
      await deleteTeacherMutation.mutateAsync(selectedTeacher.id);
      refreshData();
      setShowDeleteModal(false);
      setSelectedTeacher(null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete teacher');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter teachers based on search
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      (teacher.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (teacher.account_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (getCourseName(teacher.assigned_course_id)?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeachers.length / pageSize);

  // Stats
  const avgRating = teachers.length > 0
    ? (teachers.reduce((acc, t) => acc + (parseFloat(t.rating) || 0), 0) / teachers.length).toFixed(1)
    : 0;

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? (course.courseName || course.name || course.coursename) : 'Unknown Course';
  };

  // Get course type badge
  const getCourseTypeBadge = (course) => {
    if (!course) return null;

    const type = course.coursetype || course.type;
    switch (type) {
      case 'regular_course':
        return <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">Regular</span>;
      case 'ebook':
        return <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">E-Book</span>;
      case 'free_video_course':
        return <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">Video</span>;
      case 'free_pdf_course':
        return <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">PDF</span>;
      case 'free_test_series':
        return <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs">Test</span>;
      default:
        return null;
    }
  };

  // Success Message Component
  if (success) {
    setTimeout(() => setSuccess(null), 3000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Teacher Management
          </h1>
          <p className="text-gray-600">
            Add and manage teachers, assign courses, and track revenue sharing
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-800">Success!</h3>
              <p className="text-sm text-emerald-600">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="p-1 hover:bg-emerald-200 rounded-lg">
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Error!</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-200 rounded-lg">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex p-1">
            <button
              onClick={() => {
                setActiveTab('add');
                resetForm();
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'add'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <UserPlus className="w-4 h-4" />
              {editMode ? 'Edit Teacher' : 'Add Teacher'}
            </button>
            <button
              onClick={() => {
                setActiveTab('view');
                resetForm();
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'view'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Users className="w-4 h-4" />
              View Teachers
            </button>
          </div>
        </div>

        {/* Tab 1: Add/Edit Teacher */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                {editMode ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                {editMode ? 'Update teacher information' : 'Fill in the details to create a new teacher profile'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Teacher Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  Teacher Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  required
                />
              </div>

              {/* Account ID and Revenue Share */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Account ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="account_id"
                    value={formData.account_id}
                    onChange={handleChange}
                    placeholder="e.g., ACC001"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-indigo-600" />
                    Revenue Share (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="revenue_share"
                    value={formData.revenue_share}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Assigned Course and Rating */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Assigned Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assigned_course_id"
                    value={formData.assigned_course_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    required
                  >
                    <option value="">Select a course</option>
                    {loadingCourses ? (
                      <option value="" disabled>Loading courses...</option>
                    ) : (
                      courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.courseName || course.name || course.coursename}
                        </option>
                      ))
                    )}
                  </select>
                  {!loadingCourses && (
                    <p className="text-xs text-gray-500 mt-1">
                      Total {courses.length} courses available from all types
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Star className="w-4 h-4 text-indigo-600" />
                    Rating (out of 5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="e.g., 4.5"
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
              </div>

              {/* Teacher Details */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Teacher Details
                </label>
                <textarea
                  name="teacherdetails"
                  value={formData.teacherdetails}
                  onChange={handleChange}
                  placeholder="Enter teacher's qualifications, experience, etc."
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                />
              </div>

              {/* Teacher Image */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  Teacher Image
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-gray-700 font-medium mb-1">Click to upload teacher image</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      <input
                        id="teacher-image"
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4">
                {editMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editMode ? 'Update Teacher' : 'Create Teacher'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: View Teachers */}
        {activeTab === 'view' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Teachers List
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                View and manage all teachers
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-gray-100">
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Teachers</p>
                    <p className="text-2xl font-bold text-gray-800">{totalTeachers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-800">{avgRating} / 5</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Courses</p>
                    <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Refresh */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teachers by name, account ID or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                  />
                </div>
                <button
                  onClick={refreshData}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 justify-center"
                >
                  <RefreshCw className={`w-4 h-4 ${teachersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Teachers Table */}
            <div className="overflow-x-auto">
              {teachersLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : currentTeachers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No teachers found</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue Share
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTeachers.map((teacher) => {
                      const course = courses.find(c => c.id === teacher.assigned_course_id);
                      return (
                        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                              {teacher.image ? (
                                <img
                                  src={teacher.image}
                                  alt={teacher.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/40";
                                  }}
                                />
                              ) : (
                                <User className="w-5 h-5 text-indigo-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">{teacher.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{teacher.account_id}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {teacher.revenue_share}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center flex-wrap">
                              <span className="text-gray-600">
                                {getCourseName(teacher.assigned_course_id)}
                              </span>
                              {course && getCourseTypeBadge(course)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-gray-600">{teacher.rating || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(teacher)}
                                className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(teacher)}
                                className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(teacher)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTeachers.length)} of {filteredTeachers.length} teachers
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg transition-colors ${currentPage === pageNum
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-gray-100 text-gray-600"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Teacher Modal */}
        {showViewModal && selectedTeacher && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">Teacher Details</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Image */}
                  <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      {selectedTeacher.image ? (
                        <img
                          src={selectedTeacher.image}
                          alt={selectedTeacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-indigo-400" />
                      )}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl">
                      <p className="text-xs text-indigo-600 mb-1">Name</p>
                      <p className="font-semibold text-gray-800">{selectedTeacher.name}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <p className="text-xs text-purple-600 mb-1">Account ID</p>
                      <p className="font-semibold text-gray-800">{selectedTeacher.account_id}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-xs text-green-600 mb-1">Revenue Share</p>
                      <p className="font-semibold text-gray-800">{selectedTeacher.revenue_share}%</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <p className="text-xs text-orange-600 mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-gray-800">{selectedTeacher.rating || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Course */}
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-xs text-blue-600 mb-1">Assigned Course</p>
                    <p className="font-semibold text-gray-800">
                      {getCourseName(selectedTeacher.assigned_course_id)}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Teacher Details</p>
                    <p className="text-gray-800">{selectedTeacher.teacherdetails || 'No details provided'}</p>
                  </div>

                  {/* Created At */}
                  <div className="text-sm text-gray-500 text-right">
                    Created: {selectedTeacher.created_at ? new Date(selectedTeacher.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedTeacher && (
          <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Teacher"
            itemName={selectedTeacher.name}
            isLoading={deleteLoading}
            confirmText="Delete"
            cancelText="Cancel"
            size="md"
          />
        )}
      </div>
    </div>
  );
};

export default AddTeacher;