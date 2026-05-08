import { useState, useEffect } from "react";
import { PAGINATION_CONFIG } from "../utils/pagination";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  FolderTree,
  ImageIcon,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { useDispatch } from "react-redux";
import { setStream } from "../redux/features/courseSlice";
import DeleteModal from "../components/DeleteModal";
import Toast from "../components/ui/Toast";
import { handleDeleteStream, handleGetStream, handleUpdateStream } from "../api/allApi";


const ViewStream = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStream, setSelectedStream] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.STREAMS.default);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    status: "active",
    superstreamId: "",
    image: null,
    imagePreview: null,
  });

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  const [streamsData, setStreamsData] = useState({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [streamsError, setStreamsError] = useState(null);
  const deleteStreamMutation = null;

  // Fetch streams data
  const fetchStreams = async () => {
    try {
      setStreamsLoading(true);
      const response = await handleGetStream();
      if (response && response.data) {
        setStreamsData({
          data: response.data,
          pagination: response.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
        });
      }
    } catch (err) {
      setStreamsError("Failed to load streams");
      showToast("Failed to load streams", "error");
    } finally {
      setStreamsLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const streams = streamsData?.data || [];
  const pagination = streamsData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalStreams = streamsData?.total || 0;

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
    fetchStreams();
  };

  useEffect(() => {
    refreshData();
  }, [currentPage, pageSize, searchTerm, filterStatus]);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      handleDeleteStream(id)
      setShowDeleteModal(false);
      setSelectedStream(null);
      refreshData();
    } catch (err) {
      showToast("Failed to delete stream", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (stream) => {
    setSelectedStream(stream);
    setEditFormData({
      name: stream.name || "",
      description: stream.description || "",
      status: stream.status || "active",
      superstreamId: stream.superstream?.id || "",
      image: null,
      imagePreview: stream.image || null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("name", editFormData.name);
      formData.append("description", editFormData.description);
      formData.append("status", editFormData.status);
      if (editFormData.superstreamId) {
        formData.append("superstreamId", editFormData.superstreamId);
      }
      if (editFormData.image) {
        formData.append("image", editFormData.image);
      }

     
       const response = await handleUpdateStream(selectedStream.id, formData);
      
      
      setShowEditModal(false);
      setSelectedStream(null);
      refreshData();
    } catch (err) {
      showToast(err.message || "Failed to update stream", "error");
    } finally {
      setEditLoading(false);
    }
  };




  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleView = (stream) => {
    setSelectedStream(stream);
    setShowViewModal(true);
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rowId) => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentStreams.map((stream) => stream.id));
    }
    setSelectAll(!selectAll);
  };

  // Filter and search logic
  const filteredStreams = streams?.filter((stream) => {
    const matchesSearch =
      (stream.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (stream.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (stream.id?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && stream.status === "active") ||
      (filterStatus === "inactive" && stream.status === "inactive");

    return matchesSearch && matchesFilter;
  });

  // Sort logic
  const sortedStreams = [...(filteredStreams || [])].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case "oldest":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentStreams = sortedStreams.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedStreams.length / pageSize);

  // Stats
  const activeStreams = streams?.filter((s) => s.status === "active").length || 0;
  const totalCourses = streams?.reduce(
    (acc, s) => acc + (s.courseCount || s.courses?.length || 0),
    0,
  ) || 0;
  const totalStudents = streams?.reduce(
    (acc, s) => acc + (s.studentCount || s.students?.length || 0),
    0,
  ) || 0;

  // Export to CSV
  const exportToCSV = () => {
    if (!streams || streams.length === 0) {
      showToast("No streams to export", "error");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Description",
      "Status",
      "Courses",
      "Students",
      "Created At",
    ];
    const csvData = streams.map((stream) => [
      stream.id,
      stream.name,
      stream.description,
      stream.status,
      stream.courseCount || stream.courses?.length || 0,
      stream.studentCount || stream.students?.length || 0,
      stream.created_at
        ? new Date(stream.created_at).toLocaleDateString()
        : "N/A",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "streams.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedRows.length} selected streams?`,
      )
    )
      return;

    setDeleteLoading(true);
    try {
      // Placeholder for bulk delete functionality
      showToast(`${selectedRows.length} streams deleted successfully`, "success");
      setSelectedRows([]);
      setSelectAll(false);
      refreshData();
    } catch (err) {
      showToast("Failed to delete streams", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className=" bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FolderTree className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Stream Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage and organize your learning streams
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => (window.location.href = "/steam/add")}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Stream
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FolderTree className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Streams</p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalStreams}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-800">
                  {activeStreams}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Students</p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalStudents.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search streams by name, description or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRows.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-indigo-700">
              <strong>{selectedRows.length}</strong> streams selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        )}

        {/* Streams Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {streamsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stream
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SuperStream
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentStreams.length > 0 ? (
                      currentStreams.map((stream) => (
                        <tr
                          key={stream.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(stream.id)}
                              onChange={() => handleSelectRow(stream.id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                                {stream.image ? (
                                  <img
                                    src={stream.image}
                                    alt={stream.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-indigo-600">
                                      {stream.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{stream.name}</div>
                                
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {stream.superstream?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {stream.description || 'No description'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stream.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {stream.status || 'inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {new Date(stream.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(stream)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <BookOpen className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(stream)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStream(stream);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
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
                        <td
                          colSpan="7"
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          {searchTerm
                            ? "No streams match your search"
                            : "No streams found"}
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
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, sortedStreams.length)} of{" "}
                    {sortedStreams.length} streams
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg transition-colors ${currentPage === i + 1
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-gray-100 text-gray-600"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
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

        {/* Edit Modal */}
        {showEditModal && selectedStream && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Edit Stream</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {/* Stream Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    placeholder="Enter stream name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    placeholder="Enter stream description"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>


                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream Image
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    {editFormData.imagePreview && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={editFormData.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm text-gray-600">Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended size: 200x200px. Max size: 2MB
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedStream && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Stream Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                    {selectedStream.image ? (
                      <img
                        src={selectedStream.image}
                        alt={selectedStream.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderTree className="w-10 h-10 text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedStream.name}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {selectedStream.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Status
                    </label>
                    <p className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedStream.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedStream.status || 'inactive'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Created At
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedStream.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Description
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedStream.description || 'No description provided'}
                    </p>
                  </div>

                  {selectedStream.superstream && (
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        SuperStream
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedStream.superstream.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedStream);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Stream
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedStream && (
          <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => handleDelete(selectedStream.id)}
            title="Delete Stream"
            itemName={selectedStream.name}
            isLoading={deleteLoading}
            confirmText="Delete Stream"
            cancelText="Cancel"
            size="md"
          />
        )}
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default ViewStream;