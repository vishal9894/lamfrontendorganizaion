import { useState, useEffect } from 'react';
import { PAGINATION_CONFIG } from '../utils/pagination';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit,
  Eye,
  Folder,
  Globe,
  RefreshCw,
  Search,
  Trash2,
  Lock
} from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import EditEventModal from '../components/EditEventModal';
import { handleDeleteEvent, handleGetAllEvent, handleUpdateEvent } from '../api/allApi';



const ViewEvents = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.EVENTS.default);
  const [searchTerm, setSearchTerm] = useState('');
  const [accessFilter, setAccessFilter] = useState('all');
  const [publishFilter, setPublishFilter] = useState('all');

  // Placeholder data since hooks don't exist
  const [eventsData, setEventsData] = useState({ data: [], pagination: { totalPages: 1, hasNextPage: false, hasPrevPage: false }, total: 0 });
  const [eventsLoading, setEventsLoading] = useState(false);
  const [deleteEventMutation, setDeleteEventMutation] = useState(null);
  const [updateEventMutation, setUpdateEventMutation] = useState(null);
  const [createEventMutation, setCreateEventMutation] = useState(null);

  // Fetch events data
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await handleGetAllEvent();
      if (response && response.data) {
        setEventsData({
          data: response.data,
          pagination: response.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false }
        });
      }
    } catch (err) {
      // Silent error handling
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const events = eventsData?.data || [];
  const pagination = eventsData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalEvents = eventsData?.total || 0;

  // Store courses and folders data
  const [courses, setCourses] = useState({});
  const [folders, setFolders] = useState({});
  const [error, setError] = useState(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  useEffect(() => {
    refreshData();
  }, [currentPage, pageSize, searchTerm, accessFilter, publishFilter]);



  // Handle Edit
  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      setActionLoading(true);
      await handleUpdateEvent(selectedEvent.id, updatedData)
      fetchEvents()
      setShowEditModal(false);
      setSelectedEvent(null);
    } catch (err) {
      setError(err.message || 'Failed to update event');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;

    setDeleteLoading(true);
    try {
      await handleDeleteEvent(selectedEvent.id);
      fetchEvents()
      setShowDeleteModal(false);
      setSelectedEvent(null);
    } catch (err) {
      setError(err.message || 'Failed to delete event');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle View
  const handleViewClick = (event) => {
    window.open(`/events/${event.id}`, '_blank');
  };

  // Handle Duplicate
  const handleDuplicateClick = async (event) => {
    try {
      setActionLoading(true);
      // Placeholder for duplicate functionality
    } catch (err) {
      setError(err.message || 'Failed to duplicate event');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' ||
      (event.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (event.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (event.url?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (courses[event.courseId]?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (folders[event.folderId]?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesAccess = accessFilter === 'all' || event.access === accessFilter;

    const matchesPublish = publishFilter === 'all' ||
      (publishFilter === 'published' && event.status === true) ||
      (publishFilter === 'draft' && event.status === false);

    return matchesSearch && matchesAccess && matchesPublish;
  });

  // Pagination
  const indexOfLastEvent = currentPage * pageSize;
  const indexOfFirstEvent = indexOfLastEvent - pageSize;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    return status
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  // Get access badge color
  const getAccessBadge = (access) => {
    return access === 'public'
      ? 'bg-blue-50 text-blue-700 border border-blue-200'
      : 'bg-purple-50 text-purple-700 border border-purple-200';
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshData();
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Event Name', 'Description', 'Stream Link', 'Access', 'Status', 'Created At', 'Course Name', 'Folder Name'];
    const csvData = filteredEvents.map(event => [
      event.name || '',
      event.description || '',
      event.url || '',
      event.access || '',
      event.status ? 'Published' : 'Draft',
      formatDate(event.createdAt),
      courses[event.courseId] || event.courseName || 'N/A',
      folders[event.folderId] || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                All Events
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                View and manage all events across courses
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleRefresh}
                disabled={eventsLoading}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${eventsLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              {filteredEvents.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {events.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Published</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {events.filter(e => e.status === true).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Drafts</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-600">
                    {events.filter(e => e.status === false).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Public</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {events.filter(e => e.access === 'public').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={accessFilter}
                onChange={(e) => {
                  setAccessFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white text-base"
              >
                <option value="all">All Access</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>

              <select
                value={publishFilter}
                onChange={(e) => {
                  setPublishFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white text-base"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {eventsLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">
                  No events found
                </p>
                <p className="text-sm text-gray-400">
                  Events will appear here once they are created
                </p>
              </div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4 p-4">
                {currentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-102"
                  >
                    <div className="flex gap-4">
                      {/* Event Icon */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight">
                          {event.name || 'Unnamed Event'}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {/* Status and Access Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getAccessBadge(event.access)}`}>
                            {event.access === 'public' ? (
                              <>
                                <Globe className="w-3 h-3 mr-1" />
                                Public
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 mr-1" />
                                Private
                              </>
                            )}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                            {event.status ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Draft
                              </>
                            )}
                          </span>
                        </div>

                        {/* Course/Folder Info */}
                        <div className="space-y-1 mb-3">
                          {event.courseId && (
                            <div className="flex items-center gap-2 text-xs">
                              <BookOpen className="w-3 h-3 text-indigo-400" />
                              <span className="text-gray-700 truncate">
                                {courses[event.courseId] || event.courseName || 'Course'}
                              </span>
                            </div>
                          )}
                          {event.folderId && (
                            <div className="flex items-center gap-2 text-xs">
                              <Folder className="w-3 h-3 text-amber-400" />
                              <span className="text-gray-700 truncate">
                                {folders[event.folderId] || 'Folder'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 mb-4">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(event.createdAt)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewClick(event)}
                            className="flex-1 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-medium flex items-center justify-center gap-2 border border-blue-200"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden xs:inline">View</span>
                          </button>
                          <button
                            onClick={() => handleEditClick(event)}
                            className="flex-1 px-3 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all font-medium flex items-center justify-center gap-2 border border-indigo-200"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden xs:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDuplicateClick(event)}
                            className="flex-1 px-3 py-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all font-medium flex items-center justify-center gap-2 border border-purple-200"
                            disabled={actionLoading}
                          >
                            <Copy className="w-4 h-4" />
                            <span className="hidden xs:inline">Copy</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(event)}
                            className="flex-1 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium flex items-center justify-center gap-2 border border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden xs:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Access
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course/Folder
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              <Calendar className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {event.name || 'Unnamed Event'}
                              </div>
                              {event.description && (
                                <div className="text-xs text-gray-500 line-clamp-1 max-w-xs mt-1">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${getAccessBadge(event.access)}`}>
                            {event.access === 'public' ? (
                              <>
                                <Globe className="w-3 h-3 mr-1" />
                                Public
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 mr-1" />
                                Private
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                            {event.status ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Draft
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {event.courseId && (
                              <div className="flex items-center gap-1 text-xs">
                                <BookOpen className="w-3 h-3 text-indigo-400" />
                                <span className="text-gray-700 truncate max-w-[150px]">
                                  {courses[event.courseId] || event.courseName || 'Course'}
                                </span>
                              </div>
                            )}
                            {event.folderId && (
                              <div className="flex items-center gap-1 text-xs">
                                <Folder className="w-3 h-3 text-amber-400" />
                                <span className="text-gray-700 truncate max-w-[150px]">
                                  {folders[event.folderId] || 'Folder'}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDate(event.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewClick(event)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(event)}
                              className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateClick(event)}
                              className="p-1.5 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
                              title="Duplicate"
                              disabled={actionLoading}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(event)}
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
              {totalPages > 1 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
                  {/* Page Info and Controls */}
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                    <div className="text-sm text-gray-600 font-medium">
                      Page <span className="font-bold text-gray-800">{currentPage}</span> of <span className="font-bold text-gray-800">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          handlePageSizeChange(Number(e.target.value));
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-600">per page</span>
                    </div>
                  </div>

                  {/* Pagination Navigation */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                      {/* First page */}
                      {currentPage > 3 && totalPages > 5 && (
                        <>
                          <button
                            onClick={() => setCurrentPage(1)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] flex-shrink-0 ${1 === currentPage
                              ? "bg-blue-600 text-white border-blue-600"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            1
                          </button>
                          {currentPage > 4 && <span className="px-2 text-gray-400 flex-shrink-0">...</span>}
                        </>
                      )}

                      {/* Page numbers around current page */}
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

                        // Skip if this page is already shown as first page
                        if (currentPage > 3 && totalPages > 5 && pageNum === 1) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] flex-shrink-0 ${pageNum === currentPage
                              ? "bg-blue-600 text-white border-blue-600"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Last page */}
                      {currentPage < totalPages - 2 && totalPages > 5 && (
                        <>
                          {currentPage < totalPages - 3 && <span className="px-2 text-gray-400 flex-shrink-0">...</span>}
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] flex-shrink-0 ${totalPages === currentPage
                              ? "bg-blue-600 text-white border-blue-600"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {/* Show total items info */}
              {filteredEvents.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-500 px-4">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredEvents.length)} of {filteredEvents.length} events
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">
                  No matching events
                </p>
                <p className="text-sm text-gray-400">
                  Try adjusting your filters
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setAccessFilter('all');
                    setPublishFilter('all');
                  }}
                  className="mt-4 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedEvent(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete "${selectedEvent?.name}"? This action cannot be undone.`}
        itemName={selectedEvent?.name}
        isLoading={deleteLoading}
        confirmText="Delete"
        cancelText="Cancel"
        size="md"
      />

      {/* Edit Modal */}
      {showEditModal && (
        <EditEventModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          onSubmit={handleEditSubmit}
          event={selectedEvent}
          courses={courses}
          folders={folders}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default ViewEvents;