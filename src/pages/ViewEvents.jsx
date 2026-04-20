import { useState, useEffect } from 'react';
import { 
  handleGetAllEvent, 
  
  handleDeleteEvent, 
  handleUpdateEvent, 
  handleCreateEvent 
} from '../api/allApi';
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



const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Store courses and folders data
  const [courses, setCourses] = useState({});
  const [folders, setFolders] = useState({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [accessFilter, setAccessFilter] = useState('all');
  const [publishFilter, setPublishFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch events
      const eventsRes = await handleGetAllEvent();
     
      
      // Handle different response structures for events
      let eventsData = [];
      
      if (eventsRes.events) {
        // If response has data property
        if (eventsRes.events) {
          eventsData = Array.isArray(eventsRes.events) ? eventsRes.events : [eventsRes.events];
        } 
        // If response is directly an array
        else if (Array.isArray(eventsRes)) {
          eventsData = eventsRes;
        } 
        // If response is a single object
        else if (typeof eventsRes === 'object') {
          eventsData = [eventsRes];
        }
      }
      
      // Transform events to have consistent field names
      const transformedEvents = eventsData.map(event => ({
        ...event,
        id: event.id || event._id,
        name: event.name || event.event_name,
        description: event.description || event.event_description,
        url: event.url || event.stream_link,
        access: event.access || 'public',
        status: event.status || event.publish || false,
        courseId: event.courseId || event.course_id,
        courseName: event.courseName || event.category_name,
        folderId: event.folderId || event.folder_id,
        createdAt: event.createdAt || event.created_at
      }));
      
      setEvents(transformedEvents);
      
      // Fetch all courses and folders for names
     
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

 

  // Handle Edit
  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      setActionLoading(true);
      
      // Prepare data for API
      const updatePayload = {
        name: updatedData.name,
        description: updatedData.description,
        url: updatedData.url,
        access: updatedData.access,
        status: updatedData.status,
        courseId: updatedData.courseId,
        folderId: updatedData.folderId
      };
      
      const res = await handleUpdateEvent(selectedEvent.id, updatePayload);
      console.log('Update response:', res);
      
      if (res && (res.success || res.id || res.data)) {
        await fetchAllData();
        setShowEditModal(false);
        setSelectedEvent(null);
      } else {
        console.error('Update failed:', res);
      }
    } catch (err) {
      console.error('Error updating event:', err);
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
      const res = await handleDeleteEvent(selectedEvent.id);
      console.log('Delete response:', res);
      
      await fetchAllData();
      setShowDeleteModal(false);
      setSelectedEvent(null);
      
    } catch (err) {
      console.error('Error deleting event:', err);
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
      
      const duplicateData = {
        name: `${event.name} (Copy)`,
        description: event.description,
        url: event.url,
        access: event.access,
        status: false,
        courseId: event.courseId,
        folderId: event.folderId
      };
      
      const res = await handleCreateEvent(duplicateData);
      console.log('Duplicate response:', res);
      
      if (res && (res.success || res.data || res.id)) {
        await fetchAllData();
      }
    } catch (err) {
      console.error('Error duplicating event:', err);
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
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

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
    fetchAllData();
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-8 h-8 text-indigo-600" />
                All Events
              </h1>
              <p className="text-gray-600">
                View and manage all events across courses
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {filteredEvents.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="text-sm text-gray-500">Total Events</div>
              <div className="text-2xl font-bold text-gray-900">{events.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="text-sm text-gray-500">Published</div>
              <div className="text-2xl font-bold text-green-600">
                {events.filter(e => e.status === true).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="text-sm text-gray-500">Drafts</div>
              <div className="text-2xl font-bold text-gray-600">
                {events.filter(e => e.status === false).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="text-sm text-gray-500">Public</div>
              <div className="text-2xl font-bold text-blue-600">
                {events.filter(e => e.access === 'public').length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={accessFilter}
                onChange={(e) => {
                  setAccessFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
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
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg font-medium">
                  No events found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Events will appear here once they are created
                </p>
              </div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <>
              <div className="overflow-x-auto">
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
                          <div className="flex items-center gap-1 ">
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
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium">
                        {currentPage}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg font-medium">
                  No matching events
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setAccessFilter('all');
                    setPublishFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
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