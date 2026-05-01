import { useState, useEffect } from "react";
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useCourses } from "../hooks/useOptimizedApi";
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
  Search
} from "lucide-react";
import { handlePublishBanner, handleGetCourse } from "../api/allApi";

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
  // Fetch banners function
  const fetchBanners = () => {
    refetchBanners();
  };

  // Use optimized hooks with pagination
  const { data: bannersData, isLoading: bannersLoading, refetch: refetchBanners } = useBanners(
    currentPage,
    pageSize,
    { search: searchTerm },
    { enabled: true }
  );

  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();
  const deleteBannerMutation = useDeleteBanner();

  const banners = bannersData?.data || [];
  const pagination = bannersData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalBanners = bannersData?.total || 0;

  // Pagination variables for banners
  const bannerTotalPages = pagination.totalPages;
  const bannerIndexFirst = (currentPage - 1) * pageSize;
  const bannerIndexLast = bannerIndexFirst + banners.length;

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

  const courseTypes = [
    "regular_course",
    "ebook",
    "free_video_course",
    "free_pdf_course",
    "free_test_series",
  ];

  const [courses, setCourses] = useState([]);
  const [news, setNews] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        let allCourses = [];
        for (const type of courseTypes) {
          try {
            const response = await handleGetCourse(type);
            if (response && Array.isArray(response)) {
              allCourses = [...allCourses, ...response];
            } else if (response && response.data && Array.isArray(response.data)) {
              allCourses = [...allCourses, ...response.data];
            }
          } catch (err) {
            console.error(`Failed to fetch ${type}:`, err);
          }
        }
        const uniqueCourses = allCourses.filter(
          (course, index, self) =>
            index === self.findIndex((c) => c.id === course.id),
        );
        setCourses(uniqueCourses);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (activeTab === "news") {
      const fetchNews = async () => {
        setLoadingNews(true);
        try {
          const response = await handleGetBanner(1, 50, { type: "news" });
          let newsData = [];
          if (response && Array.isArray(response)) {
            newsData = response.filter((item) => item.type === "news");
          } else if (response && response.data && Array.isArray(response.data)) {
            newsData = response.data.filter((item) => item.type === "news");
          } else if (response && response.success && response.data && Array.isArray(response.data)) {
            newsData = response.data.filter((item) => item.type === "news");
          }
          setNews(newsData);
        } catch (err) {
          console.error("Failed to fetch news:", err);
          setNews([]);
        } finally {
          setLoadingNews(false);
        }
      };
      fetchNews();
    }
  }, [activeTab]);

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
    setSuccess(null);

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

      await createBannerMutation.mutateAsync(formDataToSend);
      setSuccess(`${formData.type === "banner" ? "Banner" : "News"} created successfully!`);
      resetForm();
      if (formData.type === "banner") {
        refetchBanners();
      } else {
        fetchNews();
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to create:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create item. Please check console for details.",
      );
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
      await deleteBannerMutation.mutateAsync(selectedItem.id);
      refetchBanners();
      fetchNews();
      setSuccess("Item deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Failed to delete:", err);
      setError(err.message || "Failed to delete");
    }
  };

  const handlePublishToggle = async (item) => {
    try {
      setPublishingId(item.id);
      const newStatus = !item.status;
      const statusToSend = newStatus ? "published" : "draft";

      const response = await handlePublishBanner(item.id, statusToSend);

      if (response && (response.success === true || response.status === 200)) {
        await updateBannerMutation.mutateAsync({ id: item.id, publish: statusToSend });
        if (item.type === "banner") {
          refetchBanners();
        } else {
          fetchNews();
        }
        setSuccess(`${item.type === "banner" ? "Banner" : "News"} ${newStatus ? 'published' : 'unpublished'} successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error("Publish update failed:", error);
      setError(error.message || "Failed to update status");
    } finally {
      setPublishingId(null);
    }
  };

  // Filter banners for search (client-side for now, can be moved to server later)
  const filteredBanners = banners.filter((banner) => {
    const matchesSearch =
      (banner.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (banner.courseName?.toLowerCase() || "").includes(searchTerm.toLowerCase());
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
  const newsIndexLast = newsIndexFirst + Math.min(newsPageSize, filteredNews.length);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Banner & News Management
          </h1>
          <p className="text-gray-600">
            Create and manage banners and news items
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-slideDown">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-800">Success!</h3>
              <p className="text-sm text-emerald-600">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="p-1 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-slideDown">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex p-1">
            <button
              onClick={() => {
                setActiveTab("create");
                resetForm();
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === "create"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Plus className="w-4 h-4" />
              Create Banner/News
            </button>
            <button
              onClick={() => {
                setActiveTab("banners");
                fetchBanners();
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === "banners"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Image className="w-4 h-4" />
              Banner List ({banners.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("news");
                fetchNews();
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === "news"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Newspaper className="w-4 h-4" />
              News List ({news.length})
            </button>
          </div>
        </div>

        {/* Create Form */}
        {activeTab === "create" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Banner or News
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Fill in the details to create a new banner or news item
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="banner"
                      checked={formData.type === "banner"}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700">Banner</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="news"
                      checked={formData.type === "news"}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700">News</span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-indigo-600" />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter description..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                  required
                />
              </div>

              {/* Course Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-indigo-600" />
                  Associated Course
                </label>
                <select
                  value={formData.courseId}
                  onChange={handleCourseSelect}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
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
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600" />
                  Course URL
                </label>
                <input
                  type="text"
                  name="courseUrl"
                  value={formData.courseUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/course"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  {formData.type === "banner" ? "Banner Image" : "News Image"} <span className="text-red-500">*</span>
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
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
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-gray-700 font-medium mb-1">
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
                <span className="text-sm font-medium text-gray-700">
                  Publish immediately
                </span>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={createBannerMutation.isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createBannerMutation.isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
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
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Image className="w-5 h-5" />
                Banners List
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Total banners: {banners.length}
              </p>
            </div>

            <div className="p-6 border-b border-gray-100">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search banners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={() => refetchBanners()}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${bannersLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {bannersLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No banners found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBanners.map((banner) => (
                        <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
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
                            <div className="font-medium text-gray-800">{banner.title}</div>
                            {banner.description && (
                              <div className="text-xs text-gray-500 mt-1">{banner.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {getCourseDisplay(banner.courseId, banner.courseName)}
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
                            {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : "N/A"}
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
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {bannerIndexFirst + 1} to {Math.min(bannerIndexLast, filteredBanners.length)} of {filteredBanners.length} banners
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-600">
                        Page {currentPage} of {bannerTotalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(bannerTotalPages, p + 1))}
                        disabled={currentPage === bannerTotalPages}
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
        )}

        {/* News List Tab */}
        {activeTab === "news" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                News List
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Total news: {news.length}
              </p>
            </div>

            <div className="p-6 border-b border-gray-100">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={fetchNews}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingNews ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {loadingNews ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : currentNews.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No news found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentNews.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
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
                            <div className="font-medium text-gray-800">{item.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-600 text-xs max-w-xs truncate">
                              {item.description || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {getCourseDisplay(item.courseId, item.courseName)}
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
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
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
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {newsIndexFirst + 1} to {Math.min(newsIndexLast, filteredNews.length)} of {filteredNews.length} news
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-600">
                        Page {currentPage} of {newsTotalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(newsTotalPages, p + 1))}
                        disabled={currentPage === newsTotalPages}
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
        )}

        {/* Delete Modal */}
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title={`Delete ${selectedItem?.type === "banner" ? "Banner" : "News"}`}
          message={`Are you sure you want to delete "${selectedItem?.title}"? This action cannot be undone.`}
          itemName={selectedItem?.title}
          isLoading={deleteBannerMutation.isLoading}
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

export default Banner;