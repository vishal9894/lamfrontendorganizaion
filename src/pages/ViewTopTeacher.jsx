import { useEffect, useState } from 'react';
import { PAGINATION_CONFIG } from '../utils/pagination';
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
import { handleDeleteTopTeacher, handleGetTopTeacher, handleUpdateTopTeacher } from '../api/allApi';
import DeleteModal from '../components/DeleteModal';

const ViewTopTeacher = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    bio: '',
    streamid: '',
    image: null
  });
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  const [teachersData, setTeachersData] = useState({
    data: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }
  });
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const teachers = teachersData?.data || [];
  const totalTeachers = teachers.length;

  // Fetch teachers data
  const fetchTeachers = async () => {
    try {
      setTeachersLoading(true);
      const response = await handleGetTopTeacher();
      if (response && response.data) {
        setTeachersData({
          data: response.data,
          pagination: response.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
        });
      }
    } catch (err) {
      // Silent error handling
    } finally {
      setTeachersLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;

    setDeleteLoading(true);
    try {
      await handleDeleteTopTeacher(selectedTeacher.id);
      setShowDeleteModal(false);
      setSelectedTeacher(null);
      setSuccessMessage('Teacher deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchTeachers(); // Refresh the list
    } catch (err) {
      setErrorMessage('Failed to delete teacher');
      setTimeout(() => setErrorMessage(null), 3000);
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
      bio: teacher.bio || '',
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

    // Ensure name is a string and not empty
    const name = String(editFormData.name || '').trim();

    if (!name) {
      setErrorMessage('Name is required');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setEditLoading(true);
    try {
      // Convert to FormData for multipart/form-data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', String(editFormData.bio || ''));
      formData.append('streamid', String(editFormData.streamid || ''));

      if (editFormData.image) {
        formData.append('image', editFormData.image);
      }

      // Debug: Log FormData contents
      console.log('Form Data being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value, typeof value);
      }

      const result = await handleUpdateTopTeacher(selectedTeacher.id, formData);

      if (result.success) {
        setShowEditModal(false);
        setSelectedTeacher(null);
        setEditFormData({ name: '', bio: '', streamid: '', image: null });
        setEditImagePreview('');
        setEditSelectedFile(null);
        setSuccessMessage('Teacher updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        await fetchTeachers(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to update teacher');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data?.message && Array.isArray(err.response.data.message)
          ? err.response.data.message.join(', ')
          : 'Failed to update teacher');
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(null), 5000);
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
  };

  const handleRefresh = () => {
    fetchTeachers();
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
      (teacher.bio?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (teacher.streamid?.toString() || teacher.stream_id?.toString() || '').includes(searchTerm) ||
      (teacher.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());

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
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-3 h-full sm:p-6">
      <div className="max-w-7xl mx-auto">


        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                Top Teachers & Students
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                View and manage all outstanding teachers and students
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleRefresh}
                disabled={teachersLoading}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${teachersLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => window.location.href = '/add-top-teacher'}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Teachers</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">{teachers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">With Avatar</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">
                    {teachers.filter(t => t.image || t.avatar).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">With Stream</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">
                    {teachers.filter(t => t.streamid || t.stream_id).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Active</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">{teachers.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers by name, bio, stream ID, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {teachersLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No teachers found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden">
                {filteredTeachers.map((teacher) => (
                  <div key={teacher.id} className="border-b border-gray-200 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                          <User className="w-6 h-6 text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{teacher.name}</h3>
                       
                      </div>
                    </div>

                    {teacher.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">{teacher.bio}</p>
                    )}

                    <div className="flex items-center justify-between">
                      

                      <div className="flex items-center gap-1">
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
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
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
                        Bio
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
                    {filteredTeachers.map((teacher) => (
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
                          
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-600 line-clamp-2 max-w-xs">{teacher.bio}</p>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>




        {/* Edit Modal */}
        {showEditModal && selectedTeacher && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleEditCancel} />
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                      <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      Edit Teacher
                    </h3>
                    <button
                      onClick={handleEditCancel}
                      className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 space-y-4">
                  {/* Avatar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Image
                    </label>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
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
                      <div className="flex-1 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={editFormData.bio}
                      onChange={handleEditInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 resize-none"
                    />
                  </div>



                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors flex items-center justify-center gap-2"
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