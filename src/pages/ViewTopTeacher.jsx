import { useState, useEffect } from 'react';
import { 
  Award, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  BookOpen, 
  XCircle, 
  Search, 
  User, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Save
} from 'lucide-react';
import { handleGetTopTeacher, handleDeleteTopTeacher, handleUpdateTopTeacher } from '../api/allApi';

// Delete Modal Component
const DeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName, 
  isLoading, 
  confirmText, 
  cancelText, 
  size = 'md' 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]}`}>
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-2">{message}</p>
            {itemName && (
              <p className="text-sm text-gray-500 mt-2">
                Item: <span className="font-medium text-gray-700">{itemName}</span>
              </p>
            )}
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {confirmText}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewTopTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    about: '',
    streamid: '',
    image: null
  });
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await handleGetTopTeacher();
      console.log('Teachers response:', response);
      
      let teachersData = [];
      if (response?.success && response?.data) {
        teachersData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        teachersData = response;
      } else if (response?.data) {
        teachersData = Array.isArray(response.data) ? response.data : [response.data];
      }
      
      setTeachers(teachersData);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setError(err.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;
    
    setDeleteLoading(true);
    try {
      const response = await handleDeleteTopTeacher(selectedTeacher.id);
      await fetchTeachers();
      setShowDeleteModal(false);
      setSelectedTeacher(null);
      setSuccessMessage('Teacher deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete teacher:', err);
      setError(err.message || 'Failed to delete teacher');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedTeacher(null);
  };

  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsModal(true);
  };

  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher);
    setEditFormData({
      name: teacher.name || '',
      about: teacher.about || '',
      streamid: teacher.streamid || teacher.stream_id || '',
      image: null
    });
    setEditImagePreview(teacher.image || teacher.avatar || '');
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
      setError('Name is required');
      return;
    }

    setEditLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('name', editFormData.name.trim());
      submitData.append('about', editFormData.about.trim());
      
      if (editFormData.streamid && editFormData.streamid.trim()) {
        submitData.append('streamid', editFormData.streamid.trim());
      }
      
      if (editSelectedFile) {
        submitData.append('image', editSelectedFile);
      }

      const response = await handleUpdateTopTeacher(selectedTeacher.id, submitData);
      
      if (response?.success) {
        await fetchTeachers();
        setShowEditModal(false);
        setSelectedTeacher(null);
        setEditFormData({ name: '', about: '', streamid: '', image: null });
        setEditImagePreview('');
        setEditSelectedFile(null);
        setSuccessMessage('Teacher updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response?.message || 'Failed to update teacher');
      }
    } catch (err) {
      console.error('Failed to update teacher:', err);
      setError(err.message || 'Failed to update teacher');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setSelectedTeacher(null);
    setEditFormData({ name: '', about: '', streamid: '', image: null });
    setEditImagePreview('');
    setEditSelectedFile(null);
    setError(null);
  };

  // Check if stream_id is a valid UUID
  const isValidUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Check if stream_id is a number
  const isValidNumber = (str) => {
    return /^\d+$/.test(str);
  };

  // Filter teachers based on search
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = searchTerm === '' || 
      (teacher.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (teacher.about?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (teacher.streamid?.toString() || teacher.stream_id?.toString() || '').includes(searchTerm) ||
      (teacher.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  // Format date - FIXED
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
    if (!streamId) return null;
    
    if (isValidNumber(streamId)) {
      return 'bg-blue-100 text-blue-700';
    } else if (isValidUUID(streamId)) {
      return 'bg-purple-100 text-purple-700';
    } else {
      return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Award className="w-8 h-8 text-indigo-600" />
                Top Teachers & Students
              </h1>
              <p className="text-gray-600">
                View and manage all outstanding teachers and students
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={fetchTeachers}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => window.location.href = '/add-top-teacher'}
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
                  <p className="text-sm text-gray-500">Total Teachers</p>
                  <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
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
                    {teachers.filter(t => t.image || t.avatar).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">With Stream</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {teachers.filter(t => t.streamid || t.stream_id).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto p-1 hover:bg-green-200 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4 text-green-600" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers by name, about, stream ID, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avatar
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        About
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stream ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTeachers.length > 0 ? (
                      currentTeachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                              {(teacher.image || teacher.avatar) ? (
                                <img
                                  src={teacher.image || teacher.avatar}
                                  alt={teacher.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <User className="w-5 h-5 text-indigo-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{teacher.name}</div>
                            <div className="text-xs text-gray-400">ID: {teacher.id?.substring(0, 8)}...</div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-600 line-clamp-2 max-w-xs">{teacher.about}</p>
                          </td>
                          <td className="px-4 py-3">
                            {(teacher.streamid || teacher.stream_id) ? (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStreamBadge(teacher.streamid || teacher.stream_id)}`}>
                                <BookOpen className="w-3 h-3 mr-1" />
                                {(teacher.streamid || teacher.stream_id).length > 10 
                                  ? `${(teacher.streamid || teacher.stream_id).substring(0, 10)}...` 
                                  : (teacher.streamid || teacher.stream_id)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">No stream</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                              {formatDate(teacher.createdAt || teacher.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(teacher)}
                                className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditClick(teacher)}
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          {searchTerm ? 'No teachers match your search' : 'No teachers found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTeachers.length)} of {filteredTeachers.length} teachers
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                          className={`w-8 h-8 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
        {showDetailsModal && selectedTeacher && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDetailsModal(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Teacher Details
                    </h3>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                      {(selectedTeacher.image || selectedTeacher.avatar) ? (
                        <img
                          src={selectedTeacher.image || selectedTeacher.avatar}
                          alt={selectedTeacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{selectedTeacher.name}</h2>
                      <p className="text-sm text-gray-500">ID: {selectedTeacher.id}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">About</label>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedTeacher.about}</p>
                    </div>
                    
                    {(selectedTeacher.streamid || selectedTeacher.stream_id) && (
                      <div>
                        <label className="text-xs font-medium text-gray-500">Stream ID</label>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStreamBadge(selectedTeacher.streamid || selectedTeacher.stream_id)}`}>
                            <BookOpen className="w-3 h-3 mr-1" />
                            {selectedTeacher.streamid || selectedTeacher.stream_id}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-xs font-medium text-gray-500">Created At</label>
                      <p className="text-sm text-gray-700">{formatDate(selectedTeacher.createdAt || selectedTeacher.created_at)}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleEditClick(selectedTeacher);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedTeacher && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleEditCancel} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      Edit Teacher
                    </h3>
                    <button
                      onClick={handleEditCancel}
                      className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                  {/* Avatar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Image
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                        {editImagePreview ? (
                          <img
                            src={editImagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <p className="text-xs text-gray-400 mt-1">Max 2MB. Leave empty to keep current image</p>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* About */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      About
                    </label>
                    <textarea
                      name="about"
                      value={editFormData.about}
                      onChange={handleEditInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Stream ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stream ID <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="streamid"
                      value={editFormData.streamid}
                      onChange={handleEditInputChange}
                      placeholder="Enter stream ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {editLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
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
          title="Delete Teacher"
          message={`Are you sure you want to delete "${selectedTeacher?.name}"? This action cannot be undone.`}
          itemName={selectedTeacher?.name}
          isLoading={deleteLoading}
          confirmText="Delete"
          cancelText="Cancel"
          size="md"
        />
      </div>
    </div>
  );
};

export default ViewTopTeacher;