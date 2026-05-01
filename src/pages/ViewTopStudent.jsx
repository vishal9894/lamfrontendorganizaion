import { useState } from 'react';
import { useTopStudents, useDeleteTopStudent, useUpdateTopStudent } from '../hooks/useOptimizedApi';
import { PAGINATION_CONFIG } from '../utils/pagination';
import {
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

// Delete Modal Component
const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, itemName, isLoading, confirmText, cancelText, size }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-6">
              {message || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {cancelText || 'Cancel'}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isLoading ? 'Deleting...' : (confirmText || 'Delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewTopStudent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.USERS.default);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Use optimized hooks with pagination
  const { data: studentsData, isLoading: studentsLoading, refetch: refetchStudents } = useTopStudents(
    currentPage,
    pageSize,
    { search: searchTerm },
    { enabled: true }
  );

  const deleteStudentMutation = useDeleteTopStudent();
  const updateStudentMutation = useUpdateTopStudent();

  const students = studentsData?.data || [];
  const pagination = studentsData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalStudents = studentsData?.total || 0;

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

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    videoUrl: '',
    streamId: '',
    image: null
  });
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState(null);

  // Helper function to safely decrypt data
  const safeDecrypt = (data) => {
    if (!data) return '';
    try {
      // If you have decryption logic, add it here
      return data;
    } catch (error) {
      console.error('Decryption error:', error);
      return data;
    }
  };

  // Helper function to safely encrypt data
  const safeEncrypt = (data) => {
    if (!data) return '';
    try {
      // If you have encryption logic, add it here
      return data;
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;

    try {
      await deleteStudentMutation.mutateAsync(selectedStudent.id);
      setSuccessMessage('Student deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      refetchStudents();
      setShowDeleteModal(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error('Failed to delete student:', err);
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
      videoUrl: student.videoUrl || '',
      streamId: student.streamId || '',
      image: null
    });
    setEditImagePreview(student.avatar || '');
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
      setError('Image size should be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
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
      const submitData = new FormData();
      submitData.append('name', safeEncrypt(editFormData.name.trim()) || editFormData.name.trim());

      if (editFormData.videoUrl.trim()) {
        submitData.append('video_url', editFormData.videoUrl.trim());
      }

      if (editFormData.streamId.trim()) {
        submitData.append('streamid', editFormData.streamId.trim());
      }

      if (editSelectedFile) {
        submitData.append('image', editSelectedFile);
      }

      await updateStudentMutation.mutateAsync({ id: selectedStudent.id, data: submitData });
      refetchStudents();
      setShowEditModal(false);
      setSelectedStudent(null);
      setEditFormData({ name: '', videoUrl: '', streamId: '', image: null });
      setEditImagePreview('');
      setEditSelectedFile(null);
      setSuccessMessage('Student updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update student:', err);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
    setEditFormData({ name: '', videoUrl: '', streamId: '', image: null });
    setEditImagePreview('');
    setEditSelectedFile(null);
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
    <div className=" bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-slideDown">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-800">Success!</h3>
              <p className="text-sm text-emerald-600">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="p-1 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
                Top Students
              </h1>
              <p className="text-gray-600">View and manage all outstanding students</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => refetchStudents()}
                disabled={studentsLoading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${studentsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => window.location.href = '/add-top-student'}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Add New
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">With Avatar</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {students.filter(s => s.avatar).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Film className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">With Video</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {students.filter(s => s.videoUrl).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">With Stream</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {students.filter(s => s.streamId).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, stream ID, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {studentsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">S.No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Avatar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Stream ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Video</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Created At</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">{((currentPage - 1) * pageSize) + index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                            {student.avatar ? (
                              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-indigo-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{student.name}</div>
                          <div className="text-xs text-gray-400">{student.id?.substring(0, 8)}...</div>
                        </td>
                        <td className="px-4 py-3">
                          {student.streamId ? (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStreamBadge(student.streamId)}`}>
                              {getStreamIcon(student.streamId)}
                              {student.streamId.substring(0, 12)}...
                            </span>
                          ) : <span className="text-gray-400 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {student.videoUrl ? (
                            <button
                              onClick={() => handleViewVideo(student)}
                              className="inline-flex items-center px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-medium transition-colors"
                            >
                              <Play className="w-3 h-3 mr-1" /> Play
                            </button>
                          ) : <span className="text-gray-400 text-xs">No video</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(student.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(student)}
                              className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(student)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
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
              {pagination.totalPages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalStudents)} of {totalStudents}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg transition-colors ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Student Details</h3>
                    </div>
                    <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow">
                      {selectedStudent.avatar ? (
                        <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-indigo-400" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl">
                      <p className="text-xs text-indigo-600 mb-1">Name</p>
                      <p className="font-semibold text-gray-800">{selectedStudent.name}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <p className="text-xs text-purple-600 mb-1">ID</p>
                      <p className="font-semibold text-gray-800 text-sm">{selectedStudent.id}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-xs text-blue-600 mb-1">Stream ID</p>
                      <p className="font-semibold text-gray-800">{selectedStudent.streamId || 'Not assigned'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-xs text-green-600 mb-1">Created At</p>
                      <p className="font-semibold text-gray-800">{formatDate(selectedStudent.createdAt)}</p>
                    </div>
                  </div>

                  {selectedStudent.videoUrl && (
                    <div className="bg-red-50 p-4 rounded-xl">
                      <p className="text-xs text-red-600 mb-1">Video URL</p>
                      <a href={selectedStudent.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-red-600 hover:underline break-all">
                        {selectedStudent.videoUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Modal */}
        {showVideoModal && selectedStudent?.videoUrl && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm" onClick={() => setShowVideoModal(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all">
                <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Student Video</h3>
                    </div>
                    <button onClick={() => setShowVideoModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedStudent.videoUrl)}
                      title="Student Video"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">{selectedStudent.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={handleEditCancel} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-5 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <Edit className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Edit Student</h3>
                    </div>
                    <button onClick={handleEditCancel} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <p className="text-green-100 text-sm mt-2 ml-12">Update student information</p>
                </div>

                <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow">
                          {editImagePreview ? (
                            <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-indigo-400" />
                          )}
                        </div>
                        {editImagePreview && (
                          <button
                            type="button"
                            onClick={() => { setEditImagePreview(''); setEditSelectedFile(null); }}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <p className="text-xs text-gray-400 mt-1">Max 2MB. Leave empty to keep current image</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      placeholder="Enter student name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Video URL</label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={editFormData.videoUrl}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      placeholder="https://youtube.com/..."
                    />
                    <p className="text-xs text-gray-400 mt-1">YouTube URL or direct video link</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stream ID</label>
                    <input
                      type="text"
                      name="streamId"
                      value={editFormData.streamId}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      placeholder="Enter stream ID (optional)"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateStudentMutation.isPending}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updateStudentMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {updateStudentMutation.isPending ? 'Saving...' : 'Save Changes'}
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
          isLoading={deleteStudentMutation.isPending}
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