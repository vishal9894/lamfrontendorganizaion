import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  Calendar,
  Award,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Timer,
  Key,
  Monitor,
  Eye,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Filter,
  Search,
  BookOpen,
  CheckSquare,
  Radio,
  Users,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Activity,
  MoreVertical,
} from "lucide-react";
import { handleGetOmrSheet, handleDeleteOmrSheet } from "../api/allApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Toast from "../components/ui/Toast";

const ViewOmrSheet = () => {
  const [omrSheets, setOmrSheets] = useState([]);
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  // Fetch OMR Sheets
  useEffect(() => {
    fetchOmrSheets();
  }, []);

  const fetchOmrSheets = async () => {
    try {
      setLoading(true);
      const response = await handleGetOmrSheet();

      // Filter out null/empty entries and get only valid sheets
      const validSheets = response?.data?.filter(
        sheet => sheet.examKey && sheet.title && sheet.questions
      ) || [];

      setOmrSheets(validSheets);
      setFilteredSheets(validSheets);
      setError(null);
    } catch (err) {
      console.error("Error fetching OMR sheets:", err);
      setError("Failed to load OMR sheets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete OMR Sheet
  const handleDelete = async (id) => {
    try {
      await handleDeleteOmrSheet(id);
      // Remove from state
      const updatedSheets = omrSheets.filter(sheet => sheet.id !== id);
      setOmrSheets(updatedSheets);
      setFilteredSheets(updatedSheets);
      setShowDeleteModal(false);
      setSheetToDelete(null);

      showToast("OMR Sheet deleted successfully!");
    } catch (err) {
      console.error("Error deleting OMR sheet:", err);
      showToast("Failed to delete OMR sheet. Please try again.", "error");
    }
  };

  // Search and Filter
  useEffect(() => {
    let filtered = omrSheets;

    // Search by exam key or title
    if (searchTerm) {
      filtered = filtered.filter(
        sheet =>
          sheet.examKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sheet.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(sheet =>
        filterStatus === "active" ? sheet.status : !sheet.status
      );
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredSheets(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, omrSheets, sortConfig]);

  // Sort handler
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // View Sheet Details
  const handleViewDetails = (sheet) => {
    setSelectedSheet(sheet);
    setShowModal(true);
  };

  // Open Delete Confirmation
  const handleDeleteClick = (sheet) => {
    setSheetToDelete(sheet);
    setShowDeleteModal(true);
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format Time
  const formatTime = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get Status Badge
  const getStatusBadge = (status) => {
    if (status) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
          <X className="h-3 w-3" />
          Inactive
        </span>
      );
    }
  };

  // Get Question Type Badge
  const getQuestionTypeBadge = (type) => {
    if (type === "single_correct") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          <Radio className="h-3 w-3" />
          Single
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
          <CheckSquare className="h-3 w-3" />
          Multiple
        </span>
      );
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSheets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSheets.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading OMR Sheets...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">OMR Sheets</h1>
                <p className="text-gray-500 mt-1">
                  Manage and view all your OMR sheets
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchOmrSheets}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Exam Key or Title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Total Sheets</p>
                  <p className="text-2xl font-bold text-blue-700">{omrSheets.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-semibold">Active Sheets</p>
                  <p className="text-2xl font-bold text-green-700">
                    {omrSheets.filter(s => s.status).length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-semibold">Total Questions</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {omrSheets.reduce((sum, sheet) => sum + (sheet.totalQuestions || 0), 0)}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-semibold">Inactive Sheets</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {omrSheets.filter(s => !s.status).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredSheets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No OMR Sheets Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first OMR sheet to get started"}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('examKey')}>
                        <div className="flex items-center gap-2">
                          Exam Key
                          {sortConfig.key === 'examKey' && (
                            <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('title')}>
                        <div className="flex items-center gap-2">
                          Title
                          {sortConfig.key === 'title' && (
                            <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Questions</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Marks</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Exam Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((sheet, index) => (
                      <tr key={sheet.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{sheet.examKey}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{sheet.title}</div>
                          {sheet.description && (
                            <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                              {sheet.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-700">{sheet.totalQuestions || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getQuestionTypeBadge(sheet.questionType)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-700">
                              +{sheet.correctMarks} / -{sheet.wrongMarks}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-gray-700">{sheet.duration} min</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-700">{formatDate(sheet.examDateTime)}</div>
                            <div className="text-xs text-gray-500">{formatTime(sheet.examDateTime)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(sheet.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(sheet)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(sheet)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
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
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSheets.length)} of {filteredSheets.length} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3 py-1 rounded-lg transition-colors ${currentPage === number
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                          {number}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedSheet.title}</h2>
                  <p className="text-blue-100 mt-1">Exam Key: {selectedSheet.examKey}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-blue-700 rounded-lg p-1 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Description */}
              {selectedSheet.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedSheet.description}</p>
                </div>
              )}

              {/* Exam Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-700">Exam Date & Time</h4>
                  </div>
                  <p className="text-gray-600">{formatDate(selectedSheet.examDateTime)} at {formatTime(selectedSheet.examDateTime)}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-700">Duration & Buffer</h4>
                  </div>
                  <p className="text-gray-600">
                    {selectedSheet.duration} minutes + {selectedSheet.bufferTime} minutes buffer
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-700">Marks Scheme</h4>
                  </div>
                  <p className="text-gray-600">
                    +{selectedSheet.correctMarks} for correct / -{selectedSheet.wrongMarks} for wrong
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-700">Exam Mode</h4>
                  </div>
                  <p className="text-gray-600 capitalize">{selectedSheet.examMode}</p>
                </div>
              </div>

              {/* Questions List */}
              {selectedSheet.questions && selectedSheet.questions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Questions & Answers
                  </h3>
                  <div className="space-y-3">
                    {selectedSheet.questions.map((q, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">
                              Question {q.questionNumber}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-gray-600">Correct Answer:</span>
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm font-semibold">
                                {Array.isArray(q.correctAnswer)
                                  ? q.correctAnswer.join(", ")
                                  : q.correctAnswer}
                              </span>
                            </div>
                          </div>
                          {getQuestionTypeBadge(selectedSheet.questionType)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && sheetToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Delete OMR Sheet</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<span className="font-semibold">{sheetToDelete.title}</span>"?
                This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(sheetToDelete.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default ViewOmrSheet;