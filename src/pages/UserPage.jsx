import { useEffect, useRef, useState } from "react";
import { useUsers, useUpdateUser, useDeleteUser } from "../hooks/useOptimizedApi";
import { PAGINATION_CONFIG } from "../utils/pagination";
import {
  Users,
  Send,
  History,
  TrendingUp,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  LogIn,
  Clock,
  TrendingDown,
  Image as ImageIcon,
  Target,
  Globe,
  AlertCircle,
  X,
  Save,
  Upload,
  Bell,
  Smartphone,
  Eye,
  ChevronDown,
  Check,
  XCircle
} from "lucide-react";
import {
  handleSendPushNotification,
  handleSendInAppNotification,
  handleGetNotificationHistory,
  handleGetStream,
  handleDeleteNotifications,
  handleGetCourse
} from "../api/allApi";

const UserPage = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.USERS.default);
  const [searchTerm, setSearchTerm] = useState('');

  // Use optimized hooks with pagination
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useUsers(
    currentPage,
    pageSize,
    { search: searchTerm },
    { enabled: true }
  );

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = usersData?.data || [];
  const pagination = usersData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalUsers = usersData?.total || 0;

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(PAGINATION_CONFIG.USERS.default);
  const [pageSizeOptions] = useState([5, 10, 25, 50, 100]);

  // Analytics states
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    loginStats: [
      { date: "Mon", count: 45 },
      { date: "Tue", count: 52 },
      { date: "Wed", count: 48 },
      { date: "Thu", count: 61 },
      { date: "Fri", count: 55 },
      { date: "Sat", count: 38 },
      { date: "Sun", count: 29 }
    ],
    deviceStats: [
      { device: "Mobile", count: 65 },
      { device: "Desktop", count: 25 },
      { device: "Tablet", count: 10 }
    ]
  });

  // Push Notification states
  const [pushNotification, setPushNotification] = useState({
    title: "",
    message: "",
    image: null,
    imagePreview: "",
    url: "",
    type: "all",
    expireAt: "",
    streams: []
  });

  // In-App Notification states
  const [inAppNotification, setInAppNotification] = useState({
    title: "",
    message: "",
    image: null,
    imagePreview: "",
    clickBehavior: "redirect",
    redirectUrl: "",
    dismissOnClick: false,
    expiresAt: "",
    targetAudience: "global",
    streams: [],
    appVersionTargeting: "all",
    includeVersions: [],
    excludeVersions: [],
    courseTargeting: "all",
    includeCourses: [],
    excludeCourses: []
  });

  // Course Notification states
  const [courseNotification, setCourseNotification] = useState({
    title: "",
    message: "",
    image: null,
    imagePreview: "",
    url: "",
    type: "all",
    courses: [],
    streams: [],
    expireAt: ""
  });

  // Data from API
  const [availableStreams, setAvailableStreams] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableAppVersions, setAvailableAppVersions] = useState([
    "1.0.0", "1.1.0", "1.2.0", "2.0.0", "2.1.0"
  ]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Dropdown states
  const [openStreamDropdown, setOpenStreamDropdown] = useState(false);
  const [openCourseIncludeDropdown, setOpenCourseIncludeDropdown] = useState(false);
  const [openCourseExcludeDropdown, setOpenCourseExcludeDropdown] = useState(false);
  const [openVersionIncludeDropdown, setOpenVersionIncludeDropdown] = useState(false);
  const [openVersionExcludeDropdown, setOpenVersionExcludeDropdown] = useState(false);

  // Fetch streams from API
  const fetchStreams = async () => {
    setStreamsLoading(true);
    try {
      const response = await handleGetStream();
      if (response.success && response.data) {
        setAvailableStreams(response.data);
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setStreamsLoading(false);
    }
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await handleGetCourse();
      if (response.success && response.data) {
        setAvailableCourses(response.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Refresh data after mutations
  const refreshData = () => {
    refetchUsers();
  };

  // Fetch initial data
  useEffect(() => {
    refetchUsers();
    fetchStreams();
    fetchCourses();
  }, [currentPage, pageSize, searchTerm]);

  /* ================= FETCH NOTIFICATION HISTORY ================= */
  const fetchNotificationHistory = async () => {
    setLoadingHistory(true);
    try {
      const params = {};
      if (notificationFilter !== "all") {
        params.type = notificationFilter;
      }
      const response = await handleGetNotificationHistory(params);

      setNotificationHistory(response.data);

    } catch (error) {
      console.error("Error fetching notification history:", error);
      setNotificationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchNotificationHistory();
    }
  }, [activeTab, notificationFilter]);

  /* ================= NOTIFICATION MANAGEMENT ================= */
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showNotificationDeleteModal, setShowNotificationDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  const openNotificationEditModal = (notification) => {
    setSelectedNotification({ ...notification });
    setShowNotificationModal(true);
  };

  const openNotificationDeleteModal = (notification) => {
    setNotificationToDelete(notification);
    setShowNotificationDeleteModal(true);
  };

  const handleNotificationChange = (e) => {
    const { name, value } = e.target;
    setSelectedNotification((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveNotification = async () => {
    // Implementation for saving notification
    setShowNotificationModal(false);
    setSelectedNotification(null);
    await fetchNotificationHistory();
  };

  const handleDeleteNotification = async (id) => {
    try {
      const response = await handleDeleteNotifications(id);

      setShowNotificationDeleteModal(false);
      setNotificationToDelete(null);
      await fetchNotificationHistory();
      return response.data;

    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Error deleting notification");
    }
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setSelectedNotification(null);
  };

  const closeNotificationDeleteModal = () => {
    setShowNotificationDeleteModal(false);
    setNotificationToDelete(null);
  };

  /* ================= USER MANAGEMENT ================= */
  const openEditModal = (user) => {
    setSelectedUser({ ...user });
    setShowModal(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      Object.keys(selectedUser).forEach((key) => {
        formData.append(key, selectedUser[key]);
      });
      const res = await updateUserMutation.mutateAsync({ id: selectedUser.id, data: formData });
      refreshData();

      if (res.success) {
        setShowModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      const res = await deleteUserMutation.mutateAsync(userToDelete.id);
      refreshData();

      if (res.success) {
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  /* ================= PAGINATION HANDLERS ================= */
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= pagination.totalPages; i++) {
      if (i === 1 || i === pagination.totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  /* ================= NOTIFICATION FUNCTIONS ================= */
  const handleImageUpload = (type, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'push') {
          setPushNotification(prev => ({
            ...prev,
            image: file,
            imagePreview: reader.result
          }));
        } else if (type === 'course') {
          setCourseNotification(prev => ({
            ...prev,
            image: file,
            imagePreview: reader.result
          }));
        } else {
          setInAppNotification(prev => ({
            ...prev,
            image: file,
            imagePreview: reader.result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePushNotification = () => {
    if (!pushNotification.title.trim()) {
      alert("Please enter notification title");
      return false;
    }
    if (!pushNotification.message.trim()) {
      alert("Please enter notification message");
      return false;
    }
    if (pushNotification.type === "stream_specific" && pushNotification.streams.length === 0) {
      alert("Please select at least one stream for stream-specific notification");
      return false;
    }
    return true;
  };

  const handleSendPushNotificationLocal = async () => {
    if (!validatePushNotification()) return;

    try {
      const formData = new FormData();
      formData.append('title', pushNotification.title);
      formData.append('description', pushNotification.message);
      formData.append('type', pushNotification.type);

      if (pushNotification.image) {
        formData.append('image', pushNotification.image);
      }
      if (pushNotification.url) {
        formData.append('url', pushNotification.url);
      }
      if (pushNotification.expireAt) {
        formData.append('expireAt', pushNotification.expireAt);
      }
      if (pushNotification.type === 'stream_specific') {
        formData.append('streams', JSON.stringify(pushNotification.streams));
      }

      const response = await handleSendPushNotification(formData);

      if (response.success) {
        setPushNotification({
          title: "",
          message: "",
          image: null,
          imagePreview: "",
          url: "",
          type: "all",
          expireAt: "",
          streams: []
        });
        alert("Push notification sent successfully!");
        await fetchNotificationHistory();
      } else {
        alert("Failed to send push notification: " + response.message);
      }
    } catch (error) {
      console.error("Error sending push notification:", error);
      alert("Error sending push notification");
    }
  };

  const validateInAppNotification = () => {
    if (!inAppNotification.title.trim()) {
      alert("Please enter notification title");
      return false;
    }
    if (!inAppNotification.message.trim()) {
      alert("Please enter notification message");
      return false;
    }
    if (inAppNotification.clickBehavior === 'redirect' && !inAppNotification.redirectUrl.trim()) {
      alert("Please enter redirect URL for click behavior");
      return false;
    }
    if (inAppNotification.targetAudience === 'stream_specific' && inAppNotification.streams.length === 0) {
      alert("Please select at least one stream");
      return false;
    }
    if (inAppNotification.appVersionTargeting !== 'all') {
      if (inAppNotification.appVersionTargeting === 'include_specific' && inAppNotification.includeVersions.length === 0) {
        alert("Please select at least one version to include");
        return false;
      }
      if (inAppNotification.appVersionTargeting === 'exclude_specific' && inAppNotification.excludeVersions.length === 0) {
        alert("Please select at least one version to exclude");
        return false;
      }
    }
    if (inAppNotification.courseTargeting !== 'all') {
      if (inAppNotification.courseTargeting === 'include_specific' && inAppNotification.includeCourses.length === 0) {
        alert("Please select at least one course to include");
        return false;
      }
      if (inAppNotification.courseTargeting === 'exclude_specific' && inAppNotification.excludeCourses.length === 0) {
        alert("Please select at least one course to exclude");
        return false;
      }
    }
    return true;
  };

  const handleSendInAppNotification = async () => {
    if (!validateInAppNotification()) return;

    try {
      const formData = new FormData();
      formData.append('title', inAppNotification.title);
      formData.append('description', inAppNotification.message);
      formData.append('clickBehavior', inAppNotification.clickBehavior);
      formData.append('targetAudience', inAppNotification.targetAudience);
      formData.append('appVersionTargeting', inAppNotification.appVersionTargeting);
      formData.append('courseTargeting', inAppNotification.courseTargeting);

      if (inAppNotification.image) {
        formData.append('image', inAppNotification.image);
      }
      if (inAppNotification.clickBehavior === 'redirect') {
        formData.append('redirectUrl', inAppNotification.redirectUrl);
      }
      formData.append('dismissOnClick', inAppNotification.dismissOnClick);

      if (inAppNotification.expiresAt) {
        formData.append('expiresAt', inAppNotification.expiresAt);
      }

      if (inAppNotification.targetAudience === 'stream_specific') {
        formData.append('streams', JSON.stringify(inAppNotification.streams));
      }

      if (inAppNotification.appVersionTargeting === 'include_specific') {
        formData.append('includeVersions', JSON.stringify(inAppNotification.includeVersions));
      } else if (inAppNotification.appVersionTargeting === 'exclude_specific') {
        formData.append('excludeVersions', JSON.stringify(inAppNotification.excludeVersions));
      }

      if (inAppNotification.courseTargeting === 'include_specific') {
        formData.append('includeCourses', JSON.stringify(inAppNotification.includeCourses));
      } else if (inAppNotification.courseTargeting === 'exclude_specific') {
        formData.append('excludeCourses', JSON.stringify(inAppNotification.excludeCourses));
      }

      const response = await handleSendInAppNotification(formData);

      if (response.success) {
        alert("In-app notification sent successfully!");
        setInAppNotification({
          title: "",
          message: "",
          image: null,
          imagePreview: "",
          clickBehavior: "redirect",
          redirectUrl: "",
          dismissOnClick: false,
          expiresAt: "",
          targetAudience: "global",
          streams: [],
          appVersionTargeting: "all",
          includeVersions: [],
          excludeVersions: [],
          courseTargeting: "all",
          includeCourses: [],
          excludeCourses: []
        });
        await fetchNotificationHistory();
      } else {
        alert("Failed to send in-app notification: " + response.message);
      }
    } catch (error) {
      console.error("Error sending in-app notification:", error);
      alert("Error sending notification");
    }
  };

  const validateCourseNotification = () => {
    if (!courseNotification.title.trim()) {
      alert("Please enter notification title");
      return false;
    }
    if (!courseNotification.message.trim()) {
      alert("Please enter notification message");
      return false;
    }
    if (courseNotification.type === 'course_specific' && courseNotification.courses.length === 0) {
      alert("Please select at least one course for course-specific notification");
      return false;
    }
    if (courseNotification.type === 'stream_specific' && courseNotification.streams.length === 0) {
      alert("Please select at least one stream for stream-specific notification");
      return false;
    }
    return true;
  };

  const handleSendCourseNotification = async () => {
    if (!validateCourseNotification()) return;

    try {
      const formData = new FormData();
      formData.append('title', courseNotification.title);
      formData.append('description', courseNotification.message);
      formData.append('type', courseNotification.type);

      if (courseNotification.image) {
        formData.append('image', courseNotification.image);
      }
      if (courseNotification.url) {
        formData.append('url', courseNotification.url);
      }
      if (courseNotification.expireAt) {
        formData.append('expireAt', courseNotification.expireAt);
      }
      if (courseNotification.type === 'course_specific') {
        formData.append('courses', JSON.stringify(courseNotification.courses));
      }
      if (courseNotification.type === 'stream_specific') {
        formData.append('streams', JSON.stringify(courseNotification.streams));
      }

      const response = await handleSendPushNotification(formData);

      if (response.success) {
        setCourseNotification({
          title: "",
          message: "",
          image: null,
          imagePreview: "",
          url: "",
          type: "all",
          courses: [],
          streams: [],
          expireAt: ""
        });
        alert("Course notification sent successfully!");
        await fetchNotificationHistory();
      } else {
        alert("Failed to send course notification: " + response.message);
      }
    } catch (error) {
      console.error("Error sending course notification:", error);
      alert("Error sending course notification");
    }
  };

  // Custom Multi-Select Dropdown Component
  const CustomMultiSelect = ({ options, selected, onChange, placeholder, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value) => {
      if (selected.includes(value)) {
        onChange(selected.filter(v => v !== value));
      } else {
        onChange([...selected, value]);
      }
    };

    const selectedLabels = selected.map(id => {
      const option = options.find(opt => opt.id === id);
      return option?.name || option?.superstream?.name || id;
    }).join(', ');

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 cursor-pointer bg-white flex justify-between items-center"
        >
          <span className={selected.length === 0 ? "text-gray-400" : "text-gray-700"}>
            {selected.length === 0 ? placeholder : `${selected.length} selected: ${selectedLabels.substring(0, 50)}${selectedLabels.length > 50 ? '...' : ''}`}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : options.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No options available</div>
            ) : (
              options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                >
                  <span>{option.name || option.superstream?.name}</span>
                  {selected.includes(option.id) && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  /* ================= TABS CONFIGURATION ================= */
  const tabs = [
    { id: "users", label: "User List", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "push-notification", label: "Send Notification", icon: Bell },
    { id: "inapp-notification", label: "In-App Notification", icon: Smartphone },
    { id: "course-notification", label: "Course Notification", icon: Target },
    { id: "history", label: "History", icon: History }
  ];

  return (
    <div className=" p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-600" />
            User Management
          </h1>
          <p className="text-gray-600">
            Manage users, send notifications, and view analytics
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex p-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* TAB 1: USER LIST */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
                  >
                    {pageSizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {usersLoading ? (
              <div className="p-10 text-center text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Loading users...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-gray-600 text-sm">
                        <th className="p-4">User</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Joined</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold">
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4">{user.phone_number || "-"}</td>
                            <td className="p-4">{user.city || "-"}</td>
                            <td className="p-4">{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : "-"}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                            <p>No users found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {pagination.totalPages > 0 && users.length > 0 && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {users.length} of {totalUsers} users
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1">
                        {getPaginationRange().map((page, index) => (
                          page === "..." ? (
                            <span key={index} className="px-3 py-2">...</span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`px-3 py-1 rounded-lg ${currentPage === page ? "bg-indigo-600 text-white" : "hover:bg-gray-100"}`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === pagination.totalPages} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button onClick={() => goToPage(pagination.totalPages)} disabled={currentPage === pagination.totalPages} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-3xl font-bold text-gray-800">{totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Today</p>
                    <p className="text-3xl font-bold text-gray-800">{analytics.activeToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <LogIn className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Engagement Rate</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {totalUsers ? Math.round((analytics.activeToday / totalUsers) * 100) : 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PUSH NOTIFICATION */}
        {activeTab === "push-notification" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              Send Push Notification
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={pushNotification.title}
                  onChange={(e) => setPushNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={pushNotification.url}
                  onChange={(e) => setPushNotification(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Choose Image
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload('push', e.target.files[0])} className="hidden" />
                  </label>
                  {pushNotification.imagePreview && (
                    <img src={pushNotification.imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description/Message *</label>
                <textarea
                  value={pushNotification.message}
                  onChange={(e) => setPushNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 resize-none"
                />
              </div>

              {pushNotification.type === "stream_specific" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Streams</label>
                  <CustomMultiSelect
                    options={availableStreams}
                    selected={pushNotification.streams}
                    onChange={(values) => setPushNotification(prev => ({ ...prev, streams: values }))}
                    placeholder="Select streams..."
                    loading={streamsLoading}
                  />
                </div>
              )}
              <button onClick={handleSendPushNotificationLocal} className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 justify-center">
                <Send className="w-4 h-4" />
                Send Notification
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: IN-APP NOTIFICATION */}
        {activeTab === "inapp-notification" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              Send In-App Notification
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={inAppNotification.title}
                  onChange={(e) => setInAppNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description/Message *</label>
                <textarea
                  value={inAppNotification.message}
                  onChange={(e) => setInAppNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Detailed notification message"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Choose Image
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload('inapp', e.target.files[0])} className="hidden" />
                  </label>
                  {inAppNotification.imagePreview && (
                    <img src={inAppNotification.imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Click Behavior</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="clickBehavior" value="redirect" checked={inAppNotification.clickBehavior === "redirect"} onChange={(e) => setInAppNotification(prev => ({ ...prev, clickBehavior: e.target.value }))} className="w-4 h-4 text-indigo-600" />
                    <span>Redirect on click</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="clickBehavior" value="dismiss" checked={inAppNotification.clickBehavior === "dismiss"} onChange={(e) => setInAppNotification(prev => ({ ...prev, clickBehavior: e.target.value }))} className="w-4 h-4 text-indigo-600" />
                    <span>Dismiss on click</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="clickBehavior" value="permanent" checked={inAppNotification.clickBehavior === "permanent"} onChange={(e) => setInAppNotification(prev => ({ ...prev, clickBehavior: e.target.value }))} className="w-4 h-4 text-indigo-600" />
                    <span>Permanent (cannot cancel)</span>
                  </label>
                </div>
              </div>
              {inAppNotification.clickBehavior === "redirect" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URL *</label>
                  <input
                    type="url"
                    value={inAppNotification.redirectUrl}
                    onChange={(e) => setInAppNotification(prev => ({ ...prev, redirectUrl: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expire At (Optional)</label>
                <input
                  type="datetime-local"
                  value={inAppNotification.expiresAt}
                  onChange={(e) => setInAppNotification(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="inappTarget" value="global" checked={inAppNotification.targetAudience === "global"} onChange={() => setInAppNotification(prev => ({ ...prev, targetAudience: "global", streams: [] }))} className="w-4 h-4 text-indigo-600" />
                    <span>Global (All users)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="inappTarget" value="stream_specific" checked={inAppNotification.targetAudience === "stream_specific"} onChange={() => setInAppNotification(prev => ({ ...prev, targetAudience: "stream_specific" }))} className="w-4 h-4 text-indigo-600" />
                    <span>Stream Specific</span>
                  </label>
                </div>
              </div>
              {inAppNotification.targetAudience === "stream_specific" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Streams</label>
                  <CustomMultiSelect
                    options={availableStreams}
                    selected={inAppNotification.streams}
                    onChange={(values) => setInAppNotification(prev => ({ ...prev, streams: values }))}
                    placeholder="Select streams..."
                    loading={streamsLoading}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">App Version Targeting</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="appVersion" value="all" checked={inAppNotification.appVersionTargeting === "all"} onChange={() => setInAppNotification(prev => ({ ...prev, appVersionTargeting: "all", includeVersions: [], excludeVersions: [] }))} className="w-4 h-4 text-indigo-600" />
                    <span>All versions</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="appVersion" value="include_specific" checked={inAppNotification.appVersionTargeting === "include_specific"} onChange={() => setInAppNotification(prev => ({ ...prev, appVersionTargeting: "include_specific", excludeVersions: [] }))} className="w-4 h-4 text-indigo-600" />
                    <span>Include specific versions</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="appVersion" value="exclude_specific" checked={inAppNotification.appVersionTargeting === "exclude_specific"} onChange={() => setInAppNotification(prev => ({ ...prev, appVersionTargeting: "exclude_specific", includeVersions: [] }))} className="w-4 h-4 text-indigo-600" />
                    <span>Exclude specific versions</span>
                  </label>
                </div>
              </div>
              {inAppNotification.appVersionTargeting === "include_specific" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Include Versions</label>
                  <CustomMultiSelect
                    options={availableAppVersions.map(v => ({ id: v, name: v }))}
                    selected={inAppNotification.includeVersions}
                    onChange={(values) => setInAppNotification(prev => ({ ...prev, includeVersions: values }))}
                    placeholder="Select versions to include..."
                    loading={false}
                  />
                </div>
              )}
              {inAppNotification.appVersionTargeting === "exclude_specific" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exclude Versions</label>
                  <CustomMultiSelect
                    options={availableAppVersions.map(v => ({ id: v, name: v }))}
                    selected={inAppNotification.excludeVersions}
                    onChange={(values) => setInAppNotification(prev => ({ ...prev, excludeVersions: values }))}
                    placeholder="Select versions to exclude..."
                    loading={false}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Notification Focus</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="courseTarget" value="all" checked={inAppNotification.courseTargeting === "all"} onChange={() => setInAppNotification(prev => ({ ...prev, courseTargeting: "all", includeCourses: [], excludeCourses: [] }))} className="w-4 h-4 text-indigo-600" />
                    <span>All courses</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="courseTarget" value="include_specific" checked={inAppNotification.courseTargeting === "include_specific"} onChange={() => setInAppNotification(prev => ({ ...prev, courseTargeting: "include_specific", excludeCourses: [] }))} className="w-4 h-4 text-indigo-600" />
                    <span>Include selected courses</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="courseTarget" value="exclude_specific" checked={inAppNotification.courseTargeting === "exclude_specific"} onChange={() => setInAppNotification(prev => ({ ...prev, courseTargeting: "exclude_specific", includeCourses: [] }))} className="w-4 h-4 text-indigo-600" />
                    <span>Exclude selected courses</span>
                  </label>
                </div>
              </div>
              {inAppNotification.courseTargeting === "include_specific" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Include Courses</label>
                  <CustomMultiSelect
                    options={availableCourses}
                    selected={inAppNotification.includeCourses}
                    onChange={(values) => setInAppNotification(prev => ({ ...prev, includeCourses: values }))}
                    placeholder="Select courses to include..."
                    loading={coursesLoading}
                  />
                </div>
              )}
              {inAppNotification.courseTargeting === "exclude_specific" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exclude Courses</label>
                  <CustomMultiSelect
                    options={availableCourses}
                    selected={inAppNotification.excludeCourses}
                    onChange={(values) => setInAppNotification(prev => ({ ...prev, excludeCourses: values }))}
                    placeholder="Select courses to exclude..."
                    loading={coursesLoading}
                  />
                </div>
              )}
              <button onClick={handleSendInAppNotification} className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 justify-center">
                <Send className="w-4 h-4" />
                Send In-App Notification
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: COURSE NOTIFICATION */}
        {activeTab === "course-notification" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Send Course Notification
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={courseNotification.title}
                  onChange={(e) => setCourseNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Course notification title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={courseNotification.url}
                  onChange={(e) => setCourseNotification(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com/course"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Choose Image
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload('course', e.target.files[0])} className="hidden" />
                  </label>
                  {courseNotification.imagePreview && (
                    <img src={courseNotification.imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description/Message *</label>
                <textarea
                  value={courseNotification.message}
                  onChange={(e) => setCourseNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Course notification message"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="courseType" value="all" checked={courseNotification.type === "all"} onChange={() => setCourseNotification(prev => ({ ...prev, type: "all", courses: [], streams: [] }))} className="w-4 h-4 text-indigo-600" />
                    <span>All users</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="courseType" value="course_specific" checked={courseNotification.type === "course_specific"} onChange={() => setCourseNotification(prev => ({ ...prev, type: "course_specific", streams: [] }))} className="w-4 h-4 text-indigo-600" />
                    <span>Course specific</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="courseType" value="stream_specific" checked={courseNotification.type === "stream_specific"} onChange={() => setCourseNotification(prev => ({ ...prev, type: "stream_specific", courses: [] }))} className="w-4 h-4 text-indigo-600" />
                    <span>Stream specific</span>
                  </label>
                </div>
              </div>
              {courseNotification.type === "course_specific" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Courses</label>
                  <CustomMultiSelect
                    options={availableCourses}
                    selected={courseNotification.courses}
                    onChange={(values) => setCourseNotification(prev => ({ ...prev, courses: values }))}
                    placeholder="Select courses..."
                    loading={coursesLoading}
                  />
                </div>
              )}
              {courseNotification.type === "stream_specific" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Streams</label>
                  <CustomMultiSelect
                    options={availableStreams}
                    selected={courseNotification.streams}
                    onChange={(values) => setCourseNotification(prev => ({ ...prev, streams: values }))}
                    placeholder="Select streams..."
                    loading={streamsLoading}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expire At (Optional)</label>
                <input
                  type="datetime-local"
                  value={courseNotification.expireAt}
                  onChange={(e) => setCourseNotification(prev => ({ ...prev, expireAt: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>
              <button onClick={handleSendCourseNotification} className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 justify-center">
                <Send className="w-4 h-4" />
                Send Course Notification
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: HISTORY */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  Notification History
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Filter:</span>
                  <select
                    value={notificationFilter}
                    onChange={(e) => setNotificationFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
                  >
                    <option value="all">All Notifications</option>
                    <option value="global">Global Notifications</option>
                    <option value="inapp">In-App Notifications</option>
                    <option value="course">Course Notifications</option>
                  </select>
                </div>
              </div>
            </div>
            {loadingHistory ? (
              <div className="p-10 text-center text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Loading history...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-600 text-sm">
                      <th className="p-4">Title</th>
                      <th className="p-4">Message</th>
                      <th className="p-4">Created At</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notificationHistory.length > 0 ? (
                      notificationHistory.map((notif) => (
                        <tr key={notif.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{notif.title}</td>
                          <td className="p-4 max-w-xs truncate">{notif.description || 'No message'}</td>
                          <td className="p-4">{new Date(notif.createdAt).toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openNotificationEditModal(notif)}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => openNotificationDeleteModal(notif)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                          <p>No notifications sent yet</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODALS */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Edit User</h2>
                <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <input name="name" value={selectedUser.name || ""} onChange={handleChange} placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg" />
                <input name="email" value={selectedUser.email || ""} onChange={handleChange} placeholder="Email" type="email" className="w-full px-4 py-2 border rounded-lg" />
                <input name="phone_number" value={selectedUser.phone_number || ""} onChange={handleChange} placeholder="Phone" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Confirm Delete
                </h2>
                <button onClick={closeDeleteModal} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p>Are you sure you want to delete <strong>{userToDelete.name}</strong>?</p>
              <div className="flex justify-end gap-3">
                <button onClick={closeDeleteModal} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2">
                  {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATION EDIT MODAL */}
        {showNotificationModal && selectedNotification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Edit Notification</h2>
                <button onClick={closeNotificationModal} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  name="title"
                  value={selectedNotification.title || ""}
                  onChange={handleNotificationChange}
                  placeholder="Notification Title"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <textarea
                  name="description"
                  value={selectedNotification.description || ""}
                  onChange={handleNotificationChange}
                  placeholder="Notification Message"
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg resize-none"
                />
                <input
                  name="url"
                  value={selectedNotification.url || ""}
                  onChange={handleNotificationChange}
                  placeholder="URL (optional)"
                  type="url"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={closeNotificationModal} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={handleSaveNotification} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATION DELETE MODAL */}
        {showNotificationDeleteModal && notificationToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Confirm Delete Notification
                </h2>
                <button onClick={closeNotificationDeleteModal} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p>Are you sure you want to delete notification <strong>{notificationToDelete.title}</strong>?</p>
              <div className="flex justify-end gap-3">
                <button onClick={closeNotificationDeleteModal} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={() => {
                  console.log("Delete button clicked!");
                  handleDeleteNotification(notificationToDelete.id);
                }} className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;