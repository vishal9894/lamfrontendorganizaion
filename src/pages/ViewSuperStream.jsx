import { useState, useEffect } from "react";
import { FiSearch, FiEye, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { handleGetSuperStream, handleUpdateSuperStream, handleDeleteSuperStream } from "../api/allApi";
import { toast } from "react-toastify";

const ViewSuperStream = () => {
  const [superStreams, setSuperStreams] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch super streams data
  const fetchSuperStreams = async () => {
    try {
      setLoading(true);
      const response = await handleGetSuperStream();
      
      // Handle different response formats
      let streamsData = [];
      if (Array.isArray(response)) {
        streamsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        streamsData = response.data;
      } else if (response?.streams && Array.isArray(response.streams)) {
        streamsData = response.streams;
      } else if (response?.superStreams && Array.isArray(response.superStreams)) {
        streamsData = response.superStreams;
      }
      
      setSuperStreams(streamsData);
    } catch (error) {
      console.error('Error fetching super streams:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to fetch super streams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperStreams();
  }, []);

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

    setIsUpdating(true);
    try {
      const response = await handleUpdateSuperStream(editModal.id, { name: editName });
      
      if (response?.success || response?.status === 200) {
        toast.success("Super stream updated successfully!");
        await fetchSuperStreams(); // Refresh the list
        setEditModal({ isOpen: false, id: null, name: "" });
        setEditName("");
      } else {
        toast.error(response?.message || "Failed to update super stream");
      }
    } catch (error) {
      console.error('Error updating super stream:', error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to update super stream");
    } finally {
      setIsUpdating(false);
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
    setIsDeleting(true);
    try {
      const response = await handleDeleteSuperStream(deleteModal.id);
      
      if (response?.success || response?.status === 200) {
        toast.success("Super stream deleted successfully!");
        await fetchSuperStreams(); // Refresh the list
        setDeleteModal({ isOpen: false, id: null, name: "" });
      } else {
        toast.error(response?.message || "Failed to delete super stream");
      }
    } catch (error) {
      console.error('Error deleting super stream:', error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete super stream");
    } finally {
      setIsDeleting(false);
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
      {loading ? (
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
                        className={`px-2 py-1 text-xs rounded-full ${
                          stream.status === "Active"
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
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Update"}
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
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
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