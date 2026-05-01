import { useState, useEffect } from "react";
import { useCourses, useDeleteCourse, usePublishCourse } from "../hooks/useApiQueries";
import { useApiError } from "../hooks/useApiError";
import { PAGINATION_CONFIG } from "../utils/pagination";
import {
  BookOpen,
  FileText,
  Video,
  Award,
  CheckCircle,
  XCircle,
  Users,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";
import {
  handleGetCourse,
} from "../api/allApi";

// Delete Modal Component
const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, itemName, isLoading, confirmText, cancelText, size }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{title || "Delete Item"}</h3>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-6">
              {message || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {cancelText || 'Cancel'}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  confirmText || 'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewCourse = () => {
  const [activeTab, setActiveTab] = useState("regular_course");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.COURSES.default);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  const { handleError, handleSuccess } = useApiError();

  // Use optimized hooks with pagination
  const { data: coursesData, isLoading: coursesLoading, refetch: refetchCourses } = useCourses(
    activeTab,
    currentPage,
    pageSize,
    { search: searchTerm }
  );

  const deleteCourseMutation = useDeleteCourse();
  const publishCourseMutation = usePublishCourse();

  const courses = coursesData?.data || [];
  const pagination = coursesData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalCourses = coursesData?.total || 0;

  // Course type tabs
  const tabs = [
    { id: "regular_course", label: "📚 Regular Course", icon: BookOpen },
    { id: "ebook", label: "📖 E-Book", icon: FileText },
    { id: "free_video_course", label: "🎥 Free Video Course", icon: Video },
    { id: "free_pdf_course", label: "📄 Free PDF Course", icon: FileText },
    { id: "free_test_series", label: "📝 Free Test Series", icon: Award },
  ];

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
    refetchCourses();
  };

  // Fetch courses based on active tab
  useEffect(() => {
    refreshData();
  }, [activeTab, currentPage, pageSize, searchTerm]);

  const handlePublishToggle = async (course) => {
    try {
      setPublishingId(course.id);

      const newPublishStatus = !course.status;

      await publishCourseMutation.mutateAsync({
        id: course.id,
        status: newPublishStatus
      });

      handleSuccess(`Course ${newPublishStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (err) {
      handleError(err, "Failed to update publish status");
    } finally {
      setPublishingId(null);
    }
  };

  const handleEdit = (course) => {
    window.location.href = `/course/edit/${course.id}`;
  };

  const handleDeleteClick = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;

    setDeleteLoading(true);
    try {
      await deleteCourseMutation.mutateAsync(selectedCourse.id);
      handleSuccess("Course deleted successfully!");
      setShowDeleteModal(false);
      setSelectedCourse(null);
    } catch (err) {
      handleError(err, "Failed to delete course");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter courses based on search
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (course.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (course.streamId?.toString().toLowerCase() || "").includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / pageSize);

  // Stats
  const publishedCourses = courses.filter((c) => c.status === true).length;
  const draftCourses = courses.filter((c) => c.status === false).length;

  return (
    <div className=" bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Course Management
          </h1>
          <p className="text-gray-600">
            View and manage all your courses across different types
          </p>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-2xl font-bold text-gray-800">
                  {publishedCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Drafts</p>
                <p className="text-2xl font-bold text-gray-800">
                  {draftCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Tab</p>
                <p className="text-2xl font-bold text-gray-800">
                  {tabs.find((t) => t.id === activeTab)?.label.split(" ")[1] ||
                    "Courses"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-x-auto">
          <div className="flex p-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                  setSearchTerm("");
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all mx-1 ${activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${tabs.find((t) => t.id === activeTab)?.label}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={refreshData}
                disabled={coursesLoading}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 justify-center w-full sm:w-auto disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${coursesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => (window.location.href = "/course/add")}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 justify-center w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {coursesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : currentCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No courses match your search"
                  : `No ${tabs.find((t) => t.id === activeTab)?.label} found`}
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
                        Course Name
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
                    {currentCourses.map((course, index) => (
                      <tr
                        key={course.id || index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                            {course.courseImage ? (
                              <img
                                src={course.courseImage}
                                alt={course.title}
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
                              {course.title || "Unnamed Course"}
                            </p>
                            {course.description && (
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {course.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              ₹{course.currentPrice || "0"}
                            </span>
                            {course.strikeoutPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{course.strikeoutPrice}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-600">
                            {course.durationDescription || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {publishingId === course.id ? (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Updating...
                            </span>
                          ) : course.status ? (
                            <button
                              onClick={() => handlePublishToggle(course)}
                              disabled={publishingId === course.id}
                              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Click to unpublish"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Published
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePublishToggle(course)}
                              disabled={publishingId === course.id}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Click to publish"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Draft
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {course.createdAt
                            ? new Date(course.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(course)}
                              className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                              title="Edit Course"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(course)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                              title="Delete Course"
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
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredCourses.length)} of{" "}
                    {filteredCourses.length} courses
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
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

        {/* Delete Modal */}
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Course"
          message={`Are you sure you want to delete "${selectedCourse?.title}"? This action cannot be undone.`}
          itemName={selectedCourse?.title}
          isLoading={deleteLoading}
          confirmText="Delete"
          cancelText="Cancel"
          size="md"
        />
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
    </div>
  );
};

export default ViewCourse;