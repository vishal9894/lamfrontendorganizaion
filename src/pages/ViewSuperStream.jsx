import { useState } from "react";
import { useSuperStreams, useUpdateSuperStream, useDeleteSuperStream } from "../hooks/useOptimizedApi";
import { PAGINATION_CONFIG } from "../utils/pagination";
import { FiSearch, FiEye, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const ViewSuperStream = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.STREAMS.default);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [editName, setEditName] = useState("");

  // Use optimized hooks with pagination
  const { data: superStreamsData, isLoading: superStreamsLoading, refetch: refetchSuperStreams } = useSuperStreams(
    currentPage,
    pageSize,
    { search: searchTerm },
    { enabled: true }
  );

  const updateSuperStreamMutation = useUpdateSuperStream();
  const deleteSuperStreamMutation = useDeleteSuperStream();

  const superStreams = superStreamsData?.data || [];
  const pagination = superStreamsData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalSuperStreams = superStreamsData?.total || 0;

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

  /* ================= UPDATE ================= */
  const handleEditClick = (id, name) => {
    setEditModal({ isOpen: true, id, name });
    setEditName(name);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      await updateSuperStreamMutation.mutateAsync({ id: editModal.id, data: { name: editName } });
      refetchSuperStreams();
      toast.success("Super stream updated successfully!");
      setEditModal({ isOpen: false, id: null, name: "" });
      setEditName("");
    } catch (error) {
      console.error('Error updating super stream:', error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to update super stream");
    }
  };

  const cancelEdit = () => {
    setEditModal({ isOpen: false, id: null, name: "" });
    setEditName("");
  };

  /* ================= DELETE ================= */
  const handleDeleteClick = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await deleteSuperStreamMutation.mutateAsync(deleteModal.id);
      refetchSuperStreams();
      toast.success("Super stream deleted successfully!");
      setDeleteModal({ isOpen: false, id: null, name: "" });
    } catch (error) {
      console.error('Error deleting super stream:', error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete super stream");
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, id: null, name: "" });
  };

  /* ================= HELPER ================= */
  const getStreamName = (stream) => {
    if (!stream) return 'Unknown';
    if (typeof stream.name === 'string') return stream.name;
    if (stream.name?.name) return stream.name.name;
    if (stream.name?.value) return stream.name.value;
    if (stream.title) return stream.title;
    return 'Unnamed Stream';
  };

  /* ================= FILTER ================= */
  const filteredStreams = superStreams.filter((stream) => {
    const streamName = getStreamName(stream).toLowerCase();
    return streamName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Super Streams</h1>
        <p className="text-gray-500">Manage your super streams</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      {superStreamsLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredStreams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {searchTerm ? "No matching streams found" : "No super streams available"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
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
                {filteredStreams.map((stream) => (
                  <tr key={stream.id || stream._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{getStreamName(stream)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${stream.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {stream.status || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{stream.students || 0}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {stream.createdAt
                        ? new Date(stream.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                          title="View"
                          onClick={() => toast.info('View feature coming soon')}
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                          title="Edit"
                          onClick={() => handleEditClick(stream.id || stream._id, getStreamName(stream))}
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                          title="Delete"
                          onClick={() => handleDeleteClick(stream.id || stream._id, getStreamName(stream))}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalSuperStreams)} of {totalSuperStreams} streams
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Items per page:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Super Stream</h3>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stream Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter stream name"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateSuperStreamMutation.isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateSuperStreamMutation.isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <FiTrash2 className="text-red-600 text-2xl" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Super Stream
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteModal.name}</span>? This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteSuperStreamMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteSuperStreamMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSuperStream;