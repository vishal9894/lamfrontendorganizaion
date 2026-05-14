import { useState, useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiImage,
  FiSettings,
  FiZap,
  FiCloud,
  FiBook,
  FiClipboard,
  FiShield,
  FiAward,
  FiHelpCircle,
  FiLayers,
  FiPlus,
  FiEye,
  FiUser,
  FiKey,
  FiDollarSign,
  FiGlobe,
  FiMoreHorizontal,
  FiMenu,
  FiChevronRight,
  FiChevronDown,
  FiLogOut,
  FiX,
  FiTrendingUp,
  FiCalendar,
  FiMessageSquare,
  FiGrid,
} from "react-icons/fi";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.hasDropdown) {
        const hasActiveChild = item.dropdownItems.some(
          (subItem) =>
            location.pathname === subItem.path ||
            location.pathname.startsWith(subItem.path + "/"),
        );
        if (hasActiveChild) {
          setOpenDropdown(item.id);
        }
      }
    });
  }, [location.pathname]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FiHome,
      path: "/dashboard",
    },
    {
      id: "content",
      label: "Content Management",
      icon: FiFileText,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "courses",
          label: "Courses",
          icon: FiBook,
          path: "/content/courses",
        },
        {
          id: "ebook",
          label: "Ebook",
          icon: FiLayers,
          path: "/content/ebook",
        },
      ],
    },
    {
      id: "admin",
      label: "Administration",
      icon: FiShield,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "role",
          label: "Role Management",
          icon: FiKey,
          path: "/admin/role",
        },
        {
          id: "admin-users",
          label: "Admin Users",
          icon: FiUser,
          path: "/admin/users",
        },
      ],
    },
    {
      id: "users",
      label: "User Management",
      icon: FiUsers,
      path: "/users",
    },
    {
      id: "banners",
      label: "Banner Management",
      icon: FiImage,
      path: "/banners",
    },
    {
      id: "superstream",
      label: "Super Stream",
      icon: FiZap,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "add-super-stream",
          label: "Add Super Stream",
          icon: FiPlus,
          path: "/super-stream/add",
        },
        {
          id: "view-super-stream",
          label: "View Super Stream",
          icon: FiEye,
          path: "/super-stream/view",
        },
      ],
    },
    {
      id: "stream",
      label: "Stream",
      icon: FiCloud,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "add-stream",
          label: "Add Stream",
          icon: FiPlus,
          path: "/stream/add",
        },
        {
          id: "view-stream",
          label: "View Stream",
          icon: FiEye,
          path: "/stream/view",
        },
      ],
    },
    {
      id: "courses-main",
      label: "Course Management",
      icon: FiBook,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "add-course",
          label: "Add Course",
          icon: FiPlus,
          path: "/courses/add",
        },
        {
          id: "view-courses",
          label: "View Courses",
          icon: FiEye,
          path: "/courses/view",
        },
      ],
    },
    {
      id: "liveEvent",
      label: "Live Event",
      icon: FiCalendar,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "add-live-event",
          label: "Add Live Event",
          icon: FiPlus,
          path: "/live-event/add",
        },
        {
          id: "view-live-event",
          label: "View Live Event",
          icon: FiEye,
          path: "/live-event/view",
        },
        {
          id: "live-chat",
          label: "Live Chat",
          icon: FiMessageSquare,
          path: "/live-event/chat",
        },
      ],
    },
    {
      id: "assign-course",
      label: "Course Assignment",
      icon: FiClipboard,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "assign-new",
          label: "Assign Course",
          icon: FiPlus,
          path: "/assign-course/new",
        },
        {
          id: "view-assigned",
          label: "View Assigned",
          icon: FiEye,
          path: "/assign-course/view",
        },
        {
          id: "enrolled-courses",
          label: "Enrolled Courses",
          icon: FiTrendingUp,
          path: "/assign-course/enrolled",
        },
        {
          id: "online-payment",
          label: "Online Payment",
          icon: FiDollarSign,
          path: "/assign-course/payment",
        },
      ],
    },
    {
      id: "permission",
      label: "Permissions",
      icon: FiKey,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "add-top-teacher",
          label: "Add Top Teacher",
          icon: FiPlus,
          path: "/permission/add-teacher",
        },
        {
          id: "view-top-teacher",
          label: "View Top Teacher",
          icon: FiEye,
          path: "/permission/view-teacher",
        },
        {
          id: "add-top-student",
          label: "Add Top Student",
          icon: FiPlus,
          path: "/permission/add-student",
        },
        {
          id: "view-top-student",
          label: "View Top Student",
          icon: FiEye,
          path: "/permission/view-student",
        },
      ],
    },
    {
      id: "teacher",
      label: "Teacher Management",
      icon: FiAward,
      path: "/teacher",
    },
    {
      id: "omrsheet",
      label: "OMR Sheet",
      icon: FiGrid,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "add-omr",
          label: "Add OMR Sheet",
          icon: FiPlus,
          path: "/omr/add",
        },
        {
          id: "view-omr",
          label: "View OMR Sheet",
          icon: FiEye,
          path: "/omr/view",
        },
      ],
    },
    {
      id: "quiz",
      label: "Quiz Management",
      icon: FiHelpCircle,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "add-quiz",
          label: "Add Quiz",
          icon: FiPlus,
          path: "/quiz/add",
        },
        {
          id: "view-quiz",
          label: "View Quiz",
          icon: FiEye,
          path: "/quiz/view",
        },
      ],
    },
    {
      id: "setting",
      label: "Settings",
      icon: FiSettings,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "general",
          label: "General Settings",
          icon: FiSettings,
          path: "/settings/general",
        },
        {
          id: "add-coin",
          label: "Coin Settings",
          icon: FiDollarSign,
          path: "/settings/coin",
        },
        {
          id: "social-media",
          label: "Social Media",
          icon: FiGlobe,
          path: "/settings/social",
        },
      ],
    },
    {
      id: "other",
      label: "Other",
      icon: FiMoreHorizontal,
      path: "/other",
    },
  ];

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Get user initials
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-200"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 transform ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${
          isCollapsed ? "w-20" : "w-72"
        } bg-[#162E93]  shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-50 h-screen`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg">
                    Admin Panel
                  </span>
                  <span className="text-white/50 text-xs">
                    {user?.roleName || "Administrator"}
                  </span>
                </div>
              )}
            </div>
            {/* Collapse button (desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block text-white/50 hover:text-white transition-colors"
            >
              <FiChevronRight
                size={18}
                className={`transform transition-transform duration-300 ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 mx-3 mt-3 mb-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user?.name}
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-blue-500/50"
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {getUserInitials()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "Guest User"}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.hasDropdown) {
                const isOpen = openDropdown === item.id;

                if (isCollapsed) {
                  // Collapsed view with tooltip on hover
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        className="w-full flex items-center justify-center px-2 py-3 rounded-xl transition-all duration-200 hover:bg-white/10 text-white/70 hover:text-white group"
                        title={item.label}
                      >
                        <Icon size={20} />
                      </button>
                      {/* Tooltip */}
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isOpen
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      <FiChevronDown
                        size={16}
                        className={`transform transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/10 pl-3">
                        {item.dropdownItems.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <NavLink
                              key={sub.id}
                              to={sub.path}
                              className={({ isActive }) =>
                                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                  isActive
                                    ? "bg-blue-600/20 text-blue-100 font-medium"
                                    : "text-white/60 hover:bg-white/10 hover:text-white"
                                }`
                              }
                            >
                              <SubIcon size={14} />
                              <span>{sub.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (isCollapsed) {
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `relative group flex items-center justify-center px-2 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`
                    }
                    title={item.label}
                  >
                    <Icon size={20} />
                    {/* Tooltip */}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-white/10">
          {isCollapsed ? (
            <button
              onClick={handleLogout}
              className="relative group flex items-center justify-center w-full py-3 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
              title="Logout"
            >
              <FiLogOut size={20} />
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Logout
              </div>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
            >
              <FiLogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
};

export default Sidebar;