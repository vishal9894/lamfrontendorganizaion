import { useState, useEffect, useCallback } from "react";
import { PAGINATION_CONFIG } from "../utils/pagination";
import {
  Plus,
  Image,
  Newspaper,
  FileText,
  AlignLeft,
  Hash,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  X,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  handlePublishBanner,
  handleGetBanner,
  handleGetShortCourseDetails,
  handleCreateBanner,
  handleDeleteBanner,
} from "../api/allApi";
import DeleteModal from "../components/DeleteModal";

const Banner = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Banner Form State
  const [formData, setFormData] = useState({
    title: "",
    type: "banner",
    courseName: "",
    courseId: "",
    courseUrl: "",
    description: "",
    status: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.COURSES.default);

  // Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);

  const [publishingId, setPublishingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // State for banners
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [bannersPagination, setBannersPagination] = useState({
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [totalBanners, setTotalBanners] = useState(0);

  // Fetch banners function - wrapped in useCallback
  const fetchBanners = useCallback(
    async (page = currentPage, limit = pageSize) => {
      setBannersLoading(true);
      try {
        const response = await handleGetBanner(page, limit, { type: "banner" });
        let bannersData = [];
        let paginationData = {
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        };
        let total = 0;

        if (response && Array.isArray(response)) {
          bannersData = response.filter((item) => item.type === "banner");
          total = bannersData.length;
        } else if (response && response.data && Array.isArray(response.data)) {
          bannersData = response.data.filter((item) => item.type === "banner");
          paginationData = response.pagination || paginationData;
          total = response.total || bannersData.length;
        } else if (
          response &&
          response.success &&
          response.data &&
          Array.isArray(response.data)
        ) {
          bannersData = response.data.filter((item) => item.type === "banner");
          paginationData = response.pagination || paginationData;
          total = response.total || bannersData.length;
        }

        setBanners(bannersData);
        setBannersPagination(paginationData);
        setTotalBanners(total);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setBanners([]);
        setBannersPagination({
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
        setTotalBanners(0);
      } finally {
        setBannersLoading(false);
      }
    },
    [currentPage, pageSize],
  );

  // Pagination variables for banners
  const bannerTotalPages = bannersPagination.totalPages;
  const bannerIndexFirst = (currentPage - 1) * pageSize;
  const bannerIndexLast = bannerIndexFirst + banners.length;

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= bannersPagination.totalPages) {
      setCurrentPage(newPage);
      if (activeTab === "banners") {
        fetchBanners(newPage, pageSize);
      }
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const [courses, setCourses] = useState([]);
  const [news, setNews] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Fetch courses - runs only once
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        let allCourses = [];

        try {
          const response = await handleGetShortCourseDetails();
          if (response && Array.isArray(response)) {
            allCourses = [...allCourses, ...response];
          } else if (
            response &&
            response.data &&
            Array.isArray(response.data)
          ) {
            allCourses = [...allCourses, ...response.data];
          }
        } catch (err) {
          // Silent error handling
        }

        const uniqueCourses = allCourses.filter(
          (course, index, self) =>
            index === self.findIndex((c) => c.id === course.id),
        );
        setCourses(uniqueCourses);
      } catch (err) {
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch news function - wrapped in useCallback
  const fetchNews = useCallback(async () => {
    setLoadingNews(true);
    try {
      const response = await handleGetBanner(1, 50, { type: "news" });
      let newsData = [];
      if (response && Array.isArray(response)) {
        newsData = response.filter((item) => item.type === "news");
      } else if (response && response.data && Array.isArray(response.data)) {
        newsData = response.data.filter((item) => item.type === "news");
      } else if (
        response &&
        response.success &&
        response.data &&
        Array.isArray(response.data)
      ) {
        newsData = response.data.filter((item) => item.type === "news");
      }
      setNews(newsData);
    } catch (err) {
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  }, []);

  // Initial fetch on component mount - runs once
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Handle tab changes - separate effect for each tab
  useEffect(() => {
    if (activeTab === "news") {
      fetchNews();
    } else if (activeTab === "banners") {
      fetchBanners();
    }
  }, [activeTab, fetchBanners, fetchNews]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCourseSelect = (e) => {
    const courseId = e.target.value;
    const selectedCourse = courses.find((c) => c.id === courseId);

    setFormData({
      ...formData,
      courseId: courseId,
      courseName: selectedCourse
        ? selectedCourse.title ||
          selectedCourse.coursename ||
          selectedCourse.name
        : "",
      courseUrl: selectedCourse ? `/course/${selectedCourse.id}` : "",
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById("banner-image");
    if (fileInput) fileInput.value = "";
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "banner",
      courseName: "",
      courseId: "",
      courseUrl: "",
      description: "",
      status: false,
    });
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || formData.title.trim() === "") {
      setError("Title is required");
      return;
    }

    if (!imageFile && !formData.image) {
      setError("Image is required");
      return;
    }

    setError(null);
    setSubmitLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("type", formData.type);
      formDataToSend.append("status", formData.status);

      if (formData.courseName && formData.courseName.trim()) {
        formDataToSend.append("courseName", formData.courseName.trim());
      }

      if (formData.courseId && formData.courseId.trim()) {
        formDataToSend.append("courseId", formData.courseId.trim());
      }

      if (formData.courseUrl && formData.courseUrl.trim()) {
        formDataToSend.append("courseUrl", formData.courseUrl.trim());
      }

      if (formData.description && formData.description.trim()) {
        formDataToSend.append("description", formData.description.trim());
      }

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      await handleCreateBanner(formDataToSend);

      resetForm();
      if (formData.type === "news") {
        fetchNews();
      } else if (formData.type === "banner") {
        fetchBanners();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create item. Please check console for details.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title || "",
      type: item.type || "banner",
      courseName: item.courseName || "",
      courseId: item.courseId || "",
      courseUrl: item.courseUrl || "",
      description: item.description || "",
      status: item.status || false,
    });

    if (item.image && typeof item.image === "string") {
      setImagePreview(item.image);
      setImageFile(null);
    }

    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      await handleDeleteBanner(selectedItem.id);

      setShowDeleteModal(false);
      setSelectedItem(null);

      // Refresh the appropriate list
      if (selectedItem.type === "news") {
        fetchNews();
      } else if (selectedItem.type === "banner") {
        fetchBanners();
      }
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  };

  const handlePublishToggle = async (item) => {
    try {
      setPublishingId(item.id);
      const newStatus = !item.status;

      await handlePublishBanner(item.id, newStatus);

      if (item.type === "news") {
        fetchNews();
      } else if (item.type === "banner") {
        fetchBanners();
      }
    } catch (error) {
      setError(error.message || "Failed to update status");
    } finally {
      setPublishingId(null);
    }
  };

  // Filter banners for search (client-side for now, can be moved to server later)
  const filteredBanners = banners.filter((banner) => {
    const matchesSearch =
      (banner.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (banner.courseName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      );
    return matchesSearch;
  });

  // Filter news for search (client-side)
  const filteredNews = news.filter((item) => {
    const matchesSearch =
      (item.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.courseName?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination variables for news
  const newsPageSize = 10;
  const newsCurrentPage = 1;
  const newsTotalPages = Math.ceil(filteredNews.length / newsPageSize);
  const newsIndexFirst = (newsCurrentPage - 1) * newsPageSize;
  const newsIndexLast =
    newsIndexFirst + Math.min(newsPageSize, filteredNews.length);
  const currentNews = filteredNews.slice(newsIndexFirst, newsIndexLast);

  const getCourseDisplay = (courseId, courseName) => {
    if (courseName) return courseName;
    if (courseId) {
      const course = courses.find((c) => c.id === courseId);
      return course
        ? course.title || course.coursename || course.name
        : "Course not found";
    }
    return "All Courses";
  };

  return (
    <div className=" bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-3 sm:p-4 h-full lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            Banner & News Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create and manage banners and news items
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row p-1 gap-1">
            <button
              onClick={() => {
                setActiveTab("create");
                resetForm();
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "create"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Banner/News</span>
              <span className="sm:hidden">Create</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("banners");
                fetchBanners();
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "banners"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">
                Banners ({banners.length})
              </span>
              <span className="sm:hidden">Banners</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("news");
                fetchNews();
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "news"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span className="hidden sm:inline">News ({news.length})</span>
              <span className="sm:hidden">News</span>
            </button>
          </div>
        </div>

        {/* Create Form */}
        {activeTab === "create" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Banner or News
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm mt-1">
                Fill in the details to create a new banner or news item
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 space-y-4 sm:space-y-6"
            >
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="banner"
                      checked={formData.type === "banner"}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700 text-sm">Banner</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="news"
                      checked={formData.type === "news"}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700 text-sm">News</span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={
                    formData.type === "banner"
                      ? "e.g., Summer Sale Banner"
                      : "e.g., New Course Announcement"
                  }
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-indigo-600" />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter description..."
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-sm"
                  required
                />
              </div>

              {/* Course Selection */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-indigo-600" />
                  Associated Course
                </label>
                <select
                  value={formData.courseId}
                  onChange={handleCourseSelect}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                >
                  <option value="">Select a course (Optional)</option>
                  {loadingCourses ? (
                    <option disabled>Loading courses...</option>
                  ) : (
                    courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title || course.coursename || course.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Course URL */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600" />
                  Course URL
                </label>
                <input
                  type="text"
                  name="courseUrl"
                  value={formData.courseUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/course"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  {formData.type === "banner"
                    ? "Banner Image"
                    : "News Image"}{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-indigo-500 transition-colors">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-32 sm:max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                      </div>
                      <p className="text-gray-700 font-medium mb-1 text-sm">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG up to 5MB
                      </p>
                      <input
                        id="banner-image"
                        type="file"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        required={!imagePreview}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Status Checkbox */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Publish immediately
                </span>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      Create {formData.type === "banner" ? "Banner" : "News"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banner List Tab */}
        {activeTab === "banners" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <Image className="w-5 h-5" />
                Banners List
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm mt-1">
                Total banners: {banners.length}
              </p>
            </div>

            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search banners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm"
                  />
                </div>
                <button
                  onClick={() => fetchBanners()}
                  className="px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${bannersLoading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {bannersLoading ? (
              <div className="flex justify-center items-center h-48 sm:h-64">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Image className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">
                  No banners found
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="sm:hidden p-4 space-y-4">
                  {filteredBanners.map((banner) => (
                    <div
                      key={banner.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        {banner.image && (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 text-sm truncate">
                            {banner.title}
                          </h3>
                          {banner.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {banner.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              {getCourseDisplay(
                                banner.courseId,
                                banner.courseName,
                              )}
                            </span>
                            <div className="flex items-center gap-1">
                              {publishingId === banner.id ? (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  Updating...
                                </span>
                              ) : banner.status ? (
                                <button
                                  onClick={() => handlePublishToggle(banner)}
                                  className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Published
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePublishToggle(banner)}
                                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Draft
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {banner.createdAt
                                ? new Date(
                                    banner.createdAt,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(banner)}
                                className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(banner)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                      {filteredBanners.map((banner) => (
                        <tr
                          key={banner.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            {banner.image && (
                              <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">
                              {banner.title}
                            </div>
                            {banner.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {banner.description}
                              </div>
                            )}
                          </td>
                         
                          <td className="px-6 py-4">
                            {publishingId === banner.id ? (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Updating...
                              </span>
                            ) : banner.status ? (
                              <button
                                onClick={() => handlePublishToggle(banner)}
                                className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Published
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePublishToggle(banner)}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Draft
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {banner.createdAt
                              ? new Date(banner.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(banner)}
                                className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(banner)}
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
                {bannerTotalPages > 1 && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs sm:text-sm text-gray-600">
                        Showing {bannerIndexFirst + 1} to{" "}
                        {Math.min(bannerIndexLast, filteredBanners.length)} of{" "}
                        {filteredBanners.length} banners
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="p-1.5 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600">
                          Page {currentPage} of {bannerTotalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(bannerTotalPages, p + 1),
                            )
                          }
                          disabled={currentPage === bannerTotalPages}
                          className="p-1.5 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* News List Tab */}
        {activeTab === "news" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                News List
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm mt-1">
                Total news: {news.length}
              </p>
            </div>

            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm"
                  />
                </div>
                <button
                  onClick={fetchNews}
                  className="px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loadingNews ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {loadingNews ? (
              <div className="flex justify-center items-center h-48 sm:h-64">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : currentNews.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Newspaper className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">
                  No news found
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="sm:hidden p-4 space-y-4">
                  {currentNews.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 text-sm truncate">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                           
                            <div className="flex items-center gap-1">
                              {publishingId === item.id ? (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  Updating...
                                </span>
                              ) : item.status ? (
                                <button
                                  onClick={() => handlePublishToggle(item)}
                                  className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Published
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePublishToggle(item)}
                                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Draft
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString()
                                : "N/A"}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(item)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                       
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                      {currentNews.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">
                              {item.title}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-600 text-xs max-w-xs truncate">
                              {item.description || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {publishingId === item.id ? (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Updating...
                              </span>
                            ) : item.status ? (
                              <button
                                onClick={() => handlePublishToggle(item)}
                                className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Published
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePublishToggle(item)}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Draft
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(item)}
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
                {newsTotalPages > 1 && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs sm:text-sm text-gray-600">
                        Showing {newsIndexFirst + 1} to{" "}
                        {Math.min(newsIndexLast, filteredNews.length)} of{" "}
                        {filteredNews.length} news
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="p-1.5 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600">
                          Page {currentPage} of {newsTotalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(newsTotalPages, p + 1),
                            )
                          }
                          disabled={currentPage === newsTotalPages}
                          className="p-1.5 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Delete Modal */}
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title={`Delete ${selectedItem?.type === "banner" ? "Banner" : "News"}`}
          message={`Are you sure you want to delete "${selectedItem?.title}"? This action cannot be undone.`}
          itemName={selectedItem?.title}
          isLoading={false}
          confirmText="Delete"
          cancelText="Cancel"
          size="sm"
        />
      </div>
    </div>
  );
};

export default Banner;
