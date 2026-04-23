import { useEffect, useState } from "react";
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
  TrendingDown
} from "lucide-react";
import { handleGetAllUsers, handleUpdateUser, handleDeleteUser } from "../api/allApi";


const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("all");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationHistory, setNotificationHistory] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  // Sample notification history
  const sampleNotifications = [
    {
      id: 1,
      title: "New Course Available",
      message: "Check out our new React course",
      type: "all",
      sentAt: "2024-03-15T10:30:00",
      status: "sent",
      recipients: 1250
    },
    {
      id: 2,
      title: "Weekend Sale",
      message: "50% off on all courses",
      type: "students",
      sentAt: "2024-03-14T15:45:00",
      status: "sent",
      recipients: 850
    },
    {
      id: 3,
      title: "Maintenance Alert",
      message: "Site will be down for maintenance",
      type: "teachers",
      sentAt: "2024-03-13T09:15:00",
      status: "pending",
      recipients: 45
    }
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ================= FETCH USERS WITH PAGINATION ================= */

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      const res = await handleGetAllUsers(params.toString());
      
      if (res.success) {
        setUsers(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalUsers(res.total || res.data?.length || 0);
        
        // Update analytics with real data
        setAnalytics(prev => ({
          ...prev,
          totalUsers: res.total || res.data?.length || 0,
          activeToday: Math.floor((res.data?.length || 0) * 0.3),
          newThisWeek: Math.floor((res.data?.length || 0) * 0.1)
        }));
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
      
      setNotificationHistory(sampleNotifications);
    } catch (error) {
      console.error("Fetch users error:", error);
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

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
      const res = await handleUpdateUser(selectedUser.id, selectedUser);
      
      if (res.success) {
        await fetchUsers(); // Refresh users list
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
      const res = await handleDeleteUser(userToDelete.id);
      
      if (res.success) {
        await fetchUsers(); // Refresh users list
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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
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

  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      return;
    }

    // Simulate sending notification
    const recipients = notificationType === "all" ? totalUsers : 
                      notificationType === "students" ? Math.floor(totalUsers * 0.7) :
                      Math.floor(totalUsers * 0.3);

    const newNotification = {
      id: Date.now(),
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
      sentAt: new Date().toISOString(),
      status: "sent",
      recipients
    };

    setNotificationHistory([newNotification, ...notificationHistory]);
    setNotificationTitle("");
    setNotificationMessage("");
    setNotificationType("all");
  };

  /* ================= TABS CONFIGURATION ================= */

  const tabs = [
    { id: "users", label: "User List", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "notification", label: "Send Notification", icon: Send },
    { id: "history", label: "History", icon: History }
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
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
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all mx-1 ${
                  activeTab === tab.id
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
            {/* Search Bar and Items Per Page */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, city, or phone..."
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
              
              {/* Search Info */}
              {debouncedSearchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                  Searching for: <span className="font-semibold text-indigo-600">"{debouncedSearchTerm}"</span>
                </div>
              )}
            </div>

            {/* Users Table */}
            {loading ? (
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
                          <tr
                            key={user.id}
                            className="border-b hover:bg-gray-50 transition"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold">
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-medium block">{user.name}</span>
                                  <span className="text-xs text-gray-500">ID: {user.id?.substring(0, 8)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>{user.email}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{user.phone_number || "-"}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{user.city || "-"}, {user.state || ""}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : "-"}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg transition flex items-center gap-1 text-sm"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition flex items-center gap-1 text-sm"
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
                            {debouncedSearchTerm ? (
                              <>
                                <Search className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                <p className="text-lg font-medium">No users found</p>
                                <p className="text-sm">Try adjusting your search term</p>
                              </>
                            ) : (
                              <>
                                <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                <p className="text-lg font-medium">No users available</p>
                              </>
                            )}
                            </td>
                           </tr>
                        )}
                    </tbody>
                   </table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && users.length > 0 && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {users.length} of {totalUsers} users
                      {debouncedSearchTerm && " (filtered)"}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* First Page */}
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="First Page"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      
                      {/* Previous Page */}
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {getPaginationRange().map((page, index) => (
                          page === "..." ? (
                            <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">...</span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`px-3 py-1 rounded-lg transition ${
                                currentPage === page
                                  ? "bg-indigo-600 text-white"
                                  : "hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      
                      {/* Next Page */}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next Page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      
                      {/* Last Page */}
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Last Page"
                      >
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
            {/* Stats Cards */}
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
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">+{analytics.newThisWeek} this week</span>
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
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600">Last 24 hours</span>
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
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600">-2% from yesterday</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Login Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Login Activity</h3>
                <div className="space-y-3">
                  {analytics.loginStats.map((stat) => (
                    <div key={stat.date} className="flex items-center gap-3">
                      <span className="w-10 text-sm font-medium text-gray-600">{stat.date}</span>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg"
                          style={{ width: `${(stat.count / Math.max(...analytics.loginStats.map(s => s.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Device Distribution</h3>
                <div className="space-y-4">
                  {analytics.deviceStats.map((stat) => (
                    <div key={stat.device}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{stat.device}</span>
                        <span className="font-medium text-gray-800">{stat.count}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                          style={{ width: `${stat.count}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEND NOTIFICATION */}
        {activeTab === "notification" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              Send Push Notification
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="e.g., New Course Available"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter your notification message..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="notificationType"
                      value="all"
                      checked={notificationType === "all"}
                      onChange={(e) => setNotificationType(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span>All Users ({totalUsers})</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="notificationType"
                      value="students"
                      checked={notificationType === "students"}
                      onChange={(e) => setNotificationType(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span>Students Only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="notificationType"
                      value="teachers"
                      checked={notificationType === "teachers"}
                      onChange={(e) => setNotificationType(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span>Teachers Only</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSendNotification}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 justify-center"
              >
                <Send className="w-4 h-4" />
                Send Notification
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATION HISTORY */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Notification History
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600 text-sm">
                    <th className="p-4">Title</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Recipients</th>
                    <th className="p-4">Sent At</th>
                    <th className="p-4">Status</th>
                   </tr>
                </thead>
                <tbody>
                  {notificationHistory.map((notif) => (
                    <tr key={notif.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{notif.title}</td>
                      <td className="p-4 max-w-xs truncate">{notif.message}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notif.type === "all" ? "bg-purple-100 text-purple-700" :
                          notif.type === "students" ? "bg-green-100 text-green-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {notif.type}
                        </span>
                      </td>
                      <td className="p-4">{notif.recipients}</td>
                      <td className="p-4">
                        {new Date(notif.sentAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notif.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {notif.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EDIT USER MODAL */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
                <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  name="name"
                  value={selectedUser.name || ""}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />

                <input
                  name="email"
                  value={selectedUser.email || ""}
                  onChange={handleChange}
                  placeholder="Email"
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />

                <input
                  name="phone_number"
                  value={selectedUser.phone_number || ""}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="city"
                    value={selectedUser.city || ""}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />

                  <input
                    name="state"
                    value={selectedUser.state || ""}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Confirm Delete
                </h2>
                <button onClick={closeDeleteModal} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-gray-700">
                  Are you sure you want to delete the user:
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="font-semibold text-gray-800">{userToDelete.name}</p>
                  <p className="text-sm text-gray-600">{userToDelete.email}</p>
                </div>
                <p className="text-sm text-red-600">
                  This action cannot be undone. All data associated with this user will be permanently deleted.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete User
                    </>
                  )}
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