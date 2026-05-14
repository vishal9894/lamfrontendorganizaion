import { useState } from 'react';
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
import { useCourses, usePublishCourse } from '../hooks/index.js';
import DeleteModal from '../components/DeleteModal.jsx';
import { handleDeleteCourse } from '../api/allApi.js';

const Ebook = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.COURSES.default);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [publishingId, setPublishingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState(null);

  const courseType = "ebook";

  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses
  } = useCourses(courseType, currentPage, pageSize, {
    search: searchTerm,
    status: filterStatus !== 'all' ? filterStatus : undefined
  });

  const publishCourseMutation = usePublishCourse();

  const ebooks = coursesData?.data || [];
  const pagination = coursesData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalEbooks = coursesData?.total || 0;



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

      await publishCourseMutation.mutateAsync({
        id: ebook.id,
        publish: newPublishStatus
      });


      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
    } finally {
      setPublishingId(null);
    }
  };

  const filteredEbooks = ebooks.filter((ebook) => {
    const matchesSearch =
      (ebook.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (ebook.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'published' && ebook.status === true) ||
      (filterStatus === 'draft' && ebook.status === false);

    return matchesSearch && matchesFilter;
  });

  const totalEbooksCount = ebooks.length;
  const publishedEbooks = ebooks.filter(e => e.status === true).length;
  const draftEbooks = ebooks.filter(e => e.status === false).length;

  const handleView = (ebook) => {
  }

  const handleEdit = (ebook) => {
  }

  const handleDelete = (ebook) => {
    setEbookToDelete(ebook);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!ebookToDelete) return;

    try {
      await handleDeleteCourse(ebookToDelete.id);
      setShowDeleteModal(false);
      setEbookToDelete(null);
      refetchCourses();
    } catch (error) {
      console.error('Failed to delete ebook:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEbookToDelete(null);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 h-full">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">E-Books Management</h1>
              <p className="text-gray-600 text-sm md:text-base">View and manage your e-book collection</p>
            </div>
          </div>
        </div>



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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <button
                onClick={() => {/* Placeholder for refresh */ }}
                disabled={coursesLoading}
                className="px-3 md:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${coursesLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

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
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
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
                      <tr key={ebook._id || index} className="hover:bg-gray-50 transition-colors">
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
                          {publishingId === ebook._id ? (
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

              {/* Mobile Card View */}
              <div className="md:hidden">
                {filteredEbooks.map((ebook, index) => (
                  <div key={ebook._id || index} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                        {ebook.courseImage ? (
                          <img
                            src={ebook.courseImage}
                            alt={ebook.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/48?text=No+Image";
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">
                          {ebook.title || "Unnamed E-Book"}
                        </h3>
                        {ebook.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {ebook.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="flex items-center gap-1">
                        {ebook.currentPrice ? (
                          <>
                            <span className="font-medium text-gray-800 text-sm">
                              ₹{ebook.currentPrice}
                            </span>
                            {ebook.strikeoutPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{ebook.strikeoutPrice}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="font-medium text-green-600 text-sm">Free</span>
                        )}
                      </div>
                      <span className="text-gray-600 text-xs">
                        {ebook.durationDescription || "N/A"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        {publishingId === ebook._id ? (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            Updating...
                          </span>
                        ) : ebook.status ? (
                          <button
                            onClick={() => handlePublishToggle(ebook)}
                            className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublishToggle(ebook)}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Draft
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(ebook)}
                          className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(ebook)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ebook)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Created: {ebook.createdAt ? new Date(ebook.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalEbooks)} of {totalEbooks} e-books
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {(() => {
                      const pages = [];
                      const totalPages = pagination.totalPages;
                      const currentPageNum = currentPage;

                      // Always show first page
                      pages.push(1);

                      // Show current page and adjacent pages
                      if (currentPageNum > 2) {
                        if (currentPageNum > 3) pages.push('...');
                        pages.push(currentPageNum - 1);
                      }
                      if (currentPageNum !== 1 && currentPageNum !== totalPages) {
                        pages.push(currentPageNum);
                      }
                      if (currentPageNum < totalPages - 1) {
                        pages.push(currentPageNum + 1);
                        if (currentPageNum < totalPages - 2) pages.push('...');
                      }

                      // Always show last page if more than 1 page
                      if (totalPages > 1) pages.push(totalPages);

                      return pages.filter((page, index, arr) => arr.indexOf(page) === index).map((pageNum, index) => (
                        pageNum === '...' ? (
                          <span key={`ellipsis-${index}`} className="p-2 text-gray-400">...</span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg transition-colors ${currentPageNum === pageNum
                              ? "bg-indigo-600 text-white"
                              : "hover:bg-gray-100 text-gray-600"
                              }`}
                          >
                            {pageNum}
                          </button>
                        )
                      ));
                    })()}

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

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete E-Book"
        message="Are you sure you want to delete this e-book? This action cannot be undone."
        itemName={ebookToDelete?.title || "this e-book"}
        confirmText="Delete"
        cancelText="Cancel"
        size="md"
      />

    </div>

  );
};

export default Ebook;