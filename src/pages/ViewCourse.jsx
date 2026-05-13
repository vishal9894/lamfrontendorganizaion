import { useState, useEffect } from "react";
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
  Image as ImageIcon,
} from "lucide-react";
import { handleGetCourse, handlePublishCourse } from "../api/allApi";
import DeleteModal from "../components/DeleteModal";
import { useNavigate } from "react-router-dom";

const ViewCourse = () => {
  const [activeTab, setActiveTab] = useState("regular_course");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.COURSES.default);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [coursesData, setCoursesData] = useState({
    data: [],
    pagination: { totalPages: 1, hasNextPage: false, hasPrevPage: false },
    total: 0,
  });
  const [coursesLoading, setCoursesLoading] = useState(false);
  const navigation = useNavigate();

  const courses = coursesData?.data || [];
  const pagination = coursesData?.pagination || {
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  const totalCourses = coursesData?.total || 0;

  // Course type tabs
  const tabs = [
    { id: "regular_course", label: "📚 Regular Course", icon: BookOpen },
    { id: "ebook", label: "📖 E-Book", icon: FileText },
    { id: "free_video_course", label: "🎥 Free Video Course", icon: Video },
    { id: "free_pdf_course", label: "📄 Free PDF Course", icon: FileText },
    { id: "free_test_series", label: "📝 Free Test Series", icon: Award },
  ];

  // Fetch courses based on active tab
  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await handleGetCourse(
        activeTab,
        currentPage,
        pageSize,
        searchTerm,
      );
      setCoursesData(
        response || { data: [], pagination: { totalPages: 1 }, total: 0 },
      );
    } catch (error) {
      setCoursesData({ data: [], pagination: { totalPages: 1 }, total: 0 });
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [activeTab, currentPage, pageSize, searchTerm]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePublishToggle = async (course) => {
    const newPublishStatus = !course.status;
    await handlePublishCourse(course.id, newPublishStatus);
    fetchCourses();
  };

  const handleEdit = (course) => {
    navigation(`/courses/edit/${course.id}`);
  };

  const handleDeleteClick = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;

    setDeleteLoading(true);
    try {
      // Implement delete functionality
      setShowDeleteModal(false);
      setSelectedCourse(null);
      await fetchCourses(); // Refresh the list
    } catch (err) {
      // Error handling without console.error
    } finally {
      setDeleteLoading(false);
    }
  };

  // Stats
  const publishedCourses = courses.filter((c) => c.status === true).length;
  const draftCourses = courses.filter((c) => c.status === false).length;

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Course Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            View and manage all your courses across different types
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                  Total
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {totalCourses}
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
                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                  Published
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {publishedCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                  Drafts
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {draftCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                  Active
                </p>
                <p className="text-lg sm:text-xl font-bold text-gray-800">
                  {tabs.find((t) => t.id === activeTab)?.label.split(" ")[1] ||
                    "Courses"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="flex p-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                  setSearchTerm("");
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all mx-0.5 sm:mx-1 min-w-fit flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">
                  {tab.label.split(" ")[0]}
                </span>
                <span className="font-semibold">{tab.label.split(" ")[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${tabs.find((t) => t.id === activeTab)?.label}...`}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all text-base"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={fetchCourses}
                disabled={coursesLoading}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-5 h-5 ${coursesLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden xs:inline">Refresh</span>
              </button>
              <button
                onClick={() => navigation("/courses/add")}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 justify-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden xs:inline">Add New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {coursesLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 px-4">
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">
                {searchTerm
                  ? "No courses match your search"
                  : `No ${tabs.find((t) => t.id === activeTab)?.label} found`}
              </p>
              <p className="text-gray-400 text-sm">
                Try adjusting your search or create a new course
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4 p-4">
                {courses.map((course, index) => (
                  <div
                    key={course.id || index}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-102"
                  >
                    <div className="flex gap-4">
                      {/* Course Image */}
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {course.courseImage ? (
                          <img
                            src={course.courseImage}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/80?text=No+Image";
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-indigo-400" />
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight">
                          {course.title || "Unnamed Course"}
                        </h3>
                        {course.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                        )}

                        {/* Price and Duration */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-lg">
                              ₹{course.currentPrice || "0"}
                            </span>
                            {course.strikeoutPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹{course.strikeoutPrice}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                            {course.durationDescription || "N/A"}
                          </span>
                        </div>

                        {/* Status and Date */}
                        <div className="flex items-center justify-between mb-4">
                          {publishingId === course.id ? (
                            <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </span>
                          ) : course.status ? (
                            <button
                              onClick={() => handlePublishToggle(course)}
                              disabled={publishingId === course.id}
                              className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Published
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePublishToggle(course)}
                              disabled={publishingId === course.id}
                              className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Draft
                            </button>
                          )}
                          <span className="text-xs text-gray-500">
                            {course.createdAt
                              ? new Date(course.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(course)}
                            className="flex-1 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all font-medium flex items-center justify-center gap-2 border border-green-200"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(course)}
                            className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium flex items-center justify-center gap-2 border border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
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
                    {courses.map((course, index) => (
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
                                  e.target.src =
                                    "https://via.placeholder.com/40?text=No+Image";
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
              {pagination.totalPages > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
                  {/* Page Info and Controls */}
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show:</span>
                      <select
                        value={pageSize}
                        onChange={(e) =>
                          handlePageSizeChange(Number(e.target.value))
                        }
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-600">per page</span>
                    </div>
                    {/* Pagination Navigation */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                      {/* First page */}
                      {currentPage > 3 && pagination.totalPages > 5 && (
                        <>
                          <button
                            onClick={() => handlePageChange(1)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] flex-shrink-0 ${
                              1 === currentPage
                                ? "bg-blue-600 text-white border-blue-600"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <span className="px-2 text-gray-400 flex-shrink-0">
                              ...
                            </span>
                          )}
                        </>
                      )}

                      {/* Page numbers around current page */}
                      {Array.from(
                        { length: Math.min(pagination.totalPages, 5) },
                        (_, i) => {
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

                          // Skip if this page is already shown as first page
                          if (
                            currentPage > 3 &&
                            pagination.totalPages > 5 &&
                            pageNum === 1
                          )
                            return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] flex-shrink-0 ${
                                pageNum === currentPage
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}

                      {/* Last page */}
                      {currentPage < pagination.totalPages - 2 &&
                        pagination.totalPages > 5 && (
                          <>
                            {currentPage < pagination.totalPages - 3 && (
                              <span className="px-2 text-gray-400 flex-shrink-0">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() =>
                                handlePageChange(pagination.totalPages)
                              }
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] flex-shrink-0 ${
                                pagination.totalPages === currentPage
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pagination.totalPages}
                            </button>
                          </>
                        )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
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
        />
      </div>
    </div>
  );
};

export default ViewCourse;
