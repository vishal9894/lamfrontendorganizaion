import { useState } from 'react';
import { useCourses, useUpdateCourse } from '../hooks/useOptimizedApi';
import { PAGINATION_CONFIG } from '../utils/pagination';
import {
  BookOpen,
  CheckCircle,
  FileText,
  Search,
  RefreshCw,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { handlePublishCourse } from '../api/allApi';
import Toast from '../components/ui/Toast';

const Ebook = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.COURSES.default);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [publishingId, setPublishingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  const courseType = "ebook";

  // Use optimized hooks with pagination
  const { data: coursesData, isLoading: coursesLoading, refetch: refetchCourses } = useCourses(
    courseType,
    currentPage,
    pageSize,
    { search: searchTerm },
    { enabled: true }
  );

  const updateCourseMutation = useUpdateCourse();

  const ebooks = coursesData?.data || [];
  const pagination = coursesData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalEbooks = coursesData?.total || 0;

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

  const handlePublishToggle = async (ebook) => {
    try {
      setPublishingId(ebook.id);

      const newPublishStatus = !ebook.status;
      const statusToSend = newPublishStatus ? "published" : "draft";

      const response = await handlePublishCourse(ebook.id, statusToSend);

      if (response && (response.success === true || response.status === 200)) {
        await updateCourseMutation.mutateAsync({
          id: ebook.id,
          data: { status: statusToSend }
        });
        refetchCourses();
        setSuccessMessage(`E-book ${newPublishStatus ? 'published' : 'unpublished'} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to publish/unpublish ebook:", err);
    } finally {
      setPublishingId(null);
    }
  };

  // Filter ebooks based on search and status
  const filteredEbooks = ebooks.filter((ebook) => {
    const matchesSearch =
      (ebook.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (ebook.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (ebook.streamId?.toString().toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'published' && ebook.status === true) ||
      (filterStatus === 'draft' && ebook.status === false);

    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalEbooksCount = ebooks.length;
  const publishedEbooks = ebooks.filter(e => e.status === true).length;
  const draftEbooks = ebooks.filter(e => e.status === false).length;

  const handleView = (ebook) => {
    // Add your view logic here
    showToast(`Viewing: ${ebook.title}`);
  }

  const handleEdit = (ebook) => {
    // Add your edit logic here
    showToast(`Edit: ${ebook.title}`);
  }

  const handleDelete = (ebook) => {
    // Add your delete logic here
    showToast(`Delete: ${ebook.title}`);
  }

  return (
    <div className=" bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">E-Books Management</h1>
              <p className="text-gray-600">View and manage your e-book collection</p>
            </div>
          </div>
        </div>

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
              <XCircle className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total E-Books</p>
                <p className="text-2xl font-bold text-gray-800">{totalEbooks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-2xl font-bold text-gray-800">{publishedEbooks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Drafts</p>
                <p className="text-2xl font-bold text-gray-800">{draftEbooks}</p>
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
                placeholder="Search e-books by name, description or stream..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <button
                onClick={() => refetchCourses()}
                disabled={coursesLoading}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${coursesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* E-books Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {coursesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredEbooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? "No e-books match your filters"
                  : "No e-books found"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-Book Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stream
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
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
                    {filteredEbooks.map((ebook, index) => (
                      <tr key={ebook.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                            {ebook.courseImage ? (
                              <img
                                src={ebook.courseImage}
                                alt={ebook.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/40?text=No+Image";
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-indigo-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-800">
                              {ebook.title || "Unnamed E-Book"}
                            </p>
                            {ebook.description && (
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {ebook.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-600">
                            {ebook.streamId || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            {ebook.currentPrice ? (
                              <>
                                <span className="font-medium text-gray-800">
                                  ₹{ebook.currentPrice}
                                </span>
                                {ebook.strikeoutPrice && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{ebook.strikeoutPrice}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="font-medium text-green-600">Free</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-600">
                            {ebook.durationDescription || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {publishingId === ebook.id ? (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Updating...
                            </span>
                          ) : ebook.status ? (
                            <button
                              onClick={() => handlePublishToggle(ebook)}
                              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
                              title="Click to unpublish"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Published
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePublishToggle(ebook)}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                              title="Click to publish"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Draft
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {ebook.createdAt
                            ? new Date(ebook.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleView(ebook)}
                              className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(ebook)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(ebook)}
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
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalEbooks)} of {totalEbooks} e-books
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          className={`w-8 h-8 rounded-lg transition-colors ${currentPage === pageNum
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-gray-100 text-gray-600"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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

export default Ebook;