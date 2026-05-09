import { useState, useEffect } from 'react';
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
import { handleCreateTeacher, handleGetShortCourseDetails, handleGetTeacher } from '../api/allApi';
import DeleteModal from '../components/DeleteModal';

// Delete Modal Component


const AddTeacher = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.TEACHERS.default);
  const [searchTerm, setSearchTerm] = useState('');

  // Teachers state
  const [teachersData, setTeachersData] = useState({
    data: [],
    pagination: { totalPages: 1, hasNextPage: false, hasPrevPage: false },
    total: 0
  });
  const [teachersLoading, setTeachersLoading] = useState(false);

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

  // Fetch teachers and courses on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await handleGetTeacher();
        if (response && response.data) {
          setTeachersData({
            data: Array.isArray(response.data) ? response.data : [],
            pagination: response.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false },
            total: response.total || response.data.length
          });
        }
      } catch (err) {
        console.error('Error fetching teachers:', err);
      }
    };

    fetchTeachers();
    handleGetShortCourseDetails();
  }, []);

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
    // Placeholder for data refresh
  };

  // Fetch all courses from all types on component mount
  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    // Placeholder for data fetch
  }, [currentPage, pageSize, searchTerm]);

  const fetchAllCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await handleGetShortCourseDetails();

      let allCourses = [];
      if (res?.data && Array.isArray(res.data)) {
        allCourses = res.data;
      } else if (Array.isArray(res)) {
        allCourses = res;
      }

      setCourses(allCourses);
    } catch (err) {
      // Silent error handling
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


      const result = await handleCreateTeacher(formDataToSend);

      if (result.success !== false) {
        setSuccess(editMode ? 'Teacher updated successfully!' : 'Teacher created successfully!');
        resetForm();

        // Switch to view tab after successful creation/update
        setTimeout(() => {
          setActiveTab('view');
          setTimeout(() => setSuccess(null), 3000);
        }, 1500);

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
      // Placeholder for delete functionality
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


  // Success Message Component
  if (success) {
    setTimeout(() => setSuccess(null), 3000);
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200">
              <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teacher Management</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-0.5">Add and manage teachers, assign courses, and track revenue sharing</p>
            </div>
          </div>
        </div>



        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex p-1">
            <button
              onClick={() => {
                setActiveTab('add');
                resetForm();
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'add'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200'
                : 'text-gray-600 hover:bg-gray-50'
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
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'view'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Users className="w-4 h-4" />
              View Teachers
            </button>
          </div>
        </div>

        {/* Tab 1: Add/Edit Teacher */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                {editMode ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              <p className="text-indigo-100 text-sm mt-0.5">
                {editMode ? 'Update teacher information' : 'Fill in the details to create a new teacher profile'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Teacher Name */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  Teacher Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                  required
                />
              </div>

              {/* Account ID and Revenue Share */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Account ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="account_id"
                    value={formData.account_id}
                    onChange={handleChange}
                    placeholder="e.g., ACC001"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* Assigned Course and Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Assigned Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assigned_course_id"
                    value={formData.assigned_course_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-sm"
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
                    <p className="text-xs text-gray-400 mt-1.5">
                      Total {courses.length} courses available
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              {/* Teacher Details */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Teacher Details
                </label>
                <textarea
                  name="teacherdetails"
                  value={formData.teacherdetails}
                  onChange={handleChange}
                  placeholder="Enter teacher's qualifications, experience, etc."
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all resize-none text-sm"
                />
              </div>

              {/* Teacher Image */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  Teacher Image
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-gray-700 font-semibold mb-1">Click to upload teacher image</p>
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
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                {editMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Teachers List
              </h2>
              <p className="text-indigo-100 text-sm mt-0.5">
                View and manage all teachers
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-6 border-b border-gray-200">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{totalTeachers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-100">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Rating</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{avgRating} / 5</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-100">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Courses</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{courses.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Refresh */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teachers by name, account ID or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                  />
                </div>
                <button
                  onClick={refreshData}
                  className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 justify-center shadow-sm font-semibold text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${teachersLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Teachers List */}
            <div>
              {teachersLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : currentTeachers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No teachers found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-3 p-4">
                    {currentTeachers.map((teacher) => {
                      const course = courses.find(c => c.id === teacher.assigned_course_id);
                      return (
                        <div key={teacher.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
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
                                <User className="w-8 h-8 text-indigo-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-base truncate">{teacher.name}</h3>
                                  <p className="text-xs text-gray-400 mt-0.5">{teacher.account_id}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => handleView(teacher)}
                                    className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-600 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(teacher)}
                                    className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(teacher)}
                                    className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">
                                    {teacher.revenue_share}%
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs text-gray-600">{teacher.rating || 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-600 truncate">{getCourseName(teacher.assigned_course_id)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Image
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Account ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Revenue Share
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentTeachers.map((teacher) => {
                          const course = courses.find(c => c.id === teacher.assigned_course_id);
                          return (
                            <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
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
                                    <User className="w-6 h-6 text-indigo-500" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900">{teacher.name}</div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{teacher.account_id}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">
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
                                    className="p-2 hover:bg-indigo-50 rounded-xl text-indigo-600 transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(teacher)}
                                    className="p-2 hover:bg-emerald-50 rounded-xl text-emerald-600 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(teacher)}
                                    className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
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
                  </div>
                </>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastItem, filteredTeachers.length)}</span> of <span className="font-semibold text-gray-900">{filteredTeachers.length}</span> teachers
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 border border-gray-300 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="flex gap-1">
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
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === pageNum
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                            : 'hover:bg-white hover:shadow-sm border border-gray-300 bg-white text-gray-600'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 border border-gray-300 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Teacher Modal */}
        {showViewModal && selectedTeacher && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-2xl">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Teacher Details</h3>
                      <p className="text-indigo-100 text-sm mt-0.5">View complete teacher information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Image */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {selectedTeacher.image ? (
                      <img
                        src={selectedTeacher.image}
                        alt={selectedTeacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-indigo-500" />
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">Name</p>
                    <p className="font-semibold text-gray-900">{selectedTeacher.name}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wide">Account ID</p>
                    <p className="font-semibold text-gray-900">{selectedTeacher.account_id}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wide">Revenue Share</p>
                    <p className="font-semibold text-gray-900">{selectedTeacher.revenue_share}%</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-amber-600 mb-1 uppercase tracking-wide">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-gray-900">{selectedTeacher.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Course */}
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Assigned Course</p>
                  <p className="font-semibold text-gray-900">
                    {getCourseName(selectedTeacher.assigned_course_id)}
                  </p>
                </div>

                {/* Details */}
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Teacher Details</p>
                  <p className="text-gray-800">{selectedTeacher.teacherdetails || 'No details provided'}</p>
                </div>

                {/* Created At */}
                <div className="text-sm text-gray-500 text-right">
                  Created: {selectedTeacher.created_at ? new Date(selectedTeacher.created_at).toLocaleDateString() : 'N/A'}
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