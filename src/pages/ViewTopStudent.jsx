import { useState, useEffect } from 'react';
import { PAGINATION_CONFIG } from '../utils/pagination';
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Film,
  GraduationCap,
  Hash,
  Loader,
  Play,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  X,
  Save,
  Info,
  BookOpen
} from 'lucide-react';
import { handleGetTopStudent, handleUpdateTopStudent, handleDeleteTopStudent } from '../api/allApi';
import DeleteModal from '../components/DeleteModal';

const ViewTopStudent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.USERS.default);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [studentsData, setStudentsData] = useState({
    data: [],
    pagination: { totalPages: 1, hasNextPage: false, hasPrevPage: false },
    total: 0
  });
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    videoUrl: '',
    streamId: '',
    image: null
  });
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState(null);

  const students = studentsData?.data || [];
  const pagination = studentsData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalStudents = studentsData?.total || 0;

  // Fetch students data
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await handleGetTopStudent();
      if (response && response.data) {
        setStudentsData({
          data: response.data,
          pagination: response.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false },
          total: response.total || response.data.length
        });
      }
    } catch (err) {
      // Silent error handling
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;

    try {
      const result = await handleDeleteTopStudent(selectedStudent.id);

      if (result.success !== false) {
        setSuccessMessage('Student deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowDeleteModal(false);
        setSelectedStudent(null);
        await fetchStudents(); // Refresh the list
      } else {
        throw new Error(result.message || 'Failed to delete student');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete student');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedStudent(null);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleViewVideo = (student) => {
    setSelectedStudent(student);
    setShowVideoModal(true);
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setEditFormData({
      name: student.name || '',
      videoUrl: student.video_url || '',
      streamId: student.streamid || '',
      image: null
    });
    setEditImagePreview(student.image || '');
    setEditSelectedFile(null);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      return;
    }

    setEditSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.name.trim()) {
      return;
    }

    try {
      const result = await handleUpdateTopStudent(selectedStudent.id, editFormData);

      if (result.success) {
        setShowEditModal(false);
        setSelectedStudent(null);
        setEditFormData({ name: '', videoUrl: '', streamId: '', image: null });
        setEditImagePreview('');
        setEditSelectedFile(null);
        setSuccessMessage('Student updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        await fetchStudents(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to update student');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update student');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
    setEditFormData({ name: '', videoUrl: '', streamId: '', image: null });
    setEditImagePreview('');
    setEditSelectedFile(null);
  };

  const handleRefresh = () => {
    fetchStudents();
  };

  // Check if stream_id is a valid UUID
  const isValidUUID = (str) => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Check if stream_id is a number
  const isValidNumber = (str) => {
    return /^\d+$/.test(str);
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' ||
      (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.streamId?.toString() || '').includes(searchTerm) ||
      (student.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Paginate filtered students
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalFilteredPages = Math.ceil(filteredStudents.length / pageSize);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Get stream badge color based on type
  const getStreamBadge = (streamId) => {
    if (!streamId) return 'bg-gray-100 text-gray-700';

    if (isValidNumber(streamId)) {
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    } else if (isValidUUID(streamId)) {
      return 'bg-purple-100 text-purple-700 border border-purple-200';
    } else {
      return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // Get stream type icon
  const getStreamIcon = (streamId) => {
    if (!streamId) return null;
    if (isValidNumber(streamId)) return <Hash className="w-3 h-3 mr-1" />;
    if (isValidUUID(streamId)) return <Info className="w-3 h-3 mr-1" />;
    return <BookOpen className="w-3 h-3 mr-1" />;
  };

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  return (
    <div className=" bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Top Students</h1>
                <p className="text-sm sm:text-base text-gray-500 mt-0.5">View and manage outstanding students</p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                disabled={studentsLoading}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${studentsLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => window.location.href = '/add-top-student'}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-100">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avatar</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                    {students.filter(s => s.image).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-100">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Video</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                    {students.filter(s => s.video_url).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-100">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stream</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                    {students.filter(s => s.streamId).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, stream ID, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-sm"
            />
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {studentsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No students found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3 p-4">
                {paginatedStudents.map((student, index) => (
                  <div key={student.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
                        {student.image ? (
                          <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base truncate">{student.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">#{((currentPage - 1) * pageSize) + index + 1}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(student)}
                              className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(student)}
                              className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          {student.streamid && (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStreamBadge(student.streamid)}`}>
                                {getStreamIcon(student.streamid)}
                                {student.streamid.length > 15 ? `${student.streamid.substring(0, 15)}...` : student.streamid}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {student.video_url && (
                              <button
                                onClick={() => handleViewVideo(student)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                              >
                                <Play className="w-3 h-3" />
                                <span>Video</span>
                              </button>
                            )}
                            <span className="text-gray-400">•</span>
                            <span>{formatDate(student.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.No</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Avatar</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stream ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Video</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedStudents.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{((currentPage - 1) * pageSize) + index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                            {student.image ? (
                              <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-indigo-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{student.id?.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4">
                          {student.streamid ? (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${getStreamBadge(student.streamid)}`}>
                              {getStreamIcon(student.streamid)}
                              {student.streamid.length > 12 ? `${student.streamid.substring(0, 12)}...` : student.streamid}
                            </span>
                          ) : <span className="text-gray-400 text-sm">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          {student.video_url ? (
                            <button
                              onClick={() => handleViewVideo(student)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-semibold transition-colors"
                            >
                              <Play className="w-3 h-3 mr-1.5" /> Play
                            </button>
                          ) : <span className="text-gray-400 text-sm">No video</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(student.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="p-2 hover:bg-indigo-50 rounded-xl text-indigo-600 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(student)}
                              className="p-2 hover:bg-emerald-50 rounded-xl text-emerald-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(student)}
                              className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalFilteredPages > 1 && (
                <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * pageSize) + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * pageSize, filteredStudents.length)}</span> of <span className="font-semibold text-gray-900">{filteredStudents.length}</span> students
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2.5 border border-gray-300 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
                        let pageNum;
                        if (totalFilteredPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalFilteredPages - 2) {
                          pageNum = totalFilteredPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'hover:bg-white hover:shadow-sm border border-gray-300 bg-white text-gray-600'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalFilteredPages}
                      className="p-2.5 border border-gray-300 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Items/page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>




        {/* Edit Modal */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleEditCancel} />
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-2xl transform transition-all overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-2xl">
                        <Edit className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Edit Student</h3>
                        <p className="text-emerald-100 text-sm mt-0.5">Update student information</p>
                      </div>
                    </div>
                    <button onClick={handleEditCancel} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Image</label>
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                          {editImagePreview ? (
                            <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-indigo-500" />
                          )}
                        </div>
                        {editImagePreview && (
                          <button
                            type="button"
                            onClick={() => { setEditImagePreview(''); setEditSelectedFile(null); }}
                            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                        <p className="text-xs text-gray-400 mt-2">Max 2MB. Leave empty to keep current image</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                      placeholder="Enter student name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL</label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={editFormData.videoUrl}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                      placeholder="https://youtube.com/..."
                    />
                    <p className="text-xs text-gray-400 mt-1.5">YouTube URL or direct video link</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stream ID</label>
                    <input
                      type="text"
                      name="streamId"
                      value={editFormData.streamId}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                      placeholder="Enter stream ID (optional)"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-5 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 font-semibold text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Student"
          itemName={selectedStudent?.name}
          isLoading={false}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ViewTopStudent;