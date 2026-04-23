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
} from "react-icons/fi";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
      id: "supersteam",
      label: "Super Steam",
      icon: FiZap,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "add-super-steam",
          label: "Add Super Steam",
          icon: FiPlus,
          path: "/super-steam/add",
        },
        {
          id: "view-super-steam",
          label: "View Super Steam",
          icon: FiEye,
          path: "/super-steam/view",
        },
      ],
    },
    {
      id: "steam",
      label: "Steam",
      icon: FiCloud,
      hasDropdown: true,
      dropdownItems: [
        {
          id: "add-steam",
          label: "Add Steam",
          icon: FiPlus,
          path: "/steam/add",
        },
        {
          id: "view-steam",
          label: "View Steam",
          icon: FiEye,
          path: "/steam/view",
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
      icon: FiClipboard,
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
          icon: FiBook,
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
          icon: FiBook,
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
      icon: FiFileText,
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

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <FiX size={24} className="text-gray-700" />
        ) : (
          <FiMenu size={24} className="text-gray-700" />
        )}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 transform ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-50 h-screen`}
      >
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">
              {user?.role || "Admin"}
            </span>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold uppercase">
              {user?.image ? (
                <img src={user.image} alt="user" className="rounded-full" />
              ) : (
                <div className="avatar-fallback">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.hasDropdown) {
                const isOpen = openDropdown === item.id;

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors ${isOpen
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          size={18}
                          className={isOpen ? "text-blue-600" : "text-gray-500"}
                        />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      {isOpen ? (
                        <FiChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <FiChevronRight size={16} className="text-gray-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.dropdownItems.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <NavLink
                              key={sub.id}
                              to={sub.path}
                              className={({ isActive }) =>
                                `flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                                }`
                              }
                            >
                              <SubIcon size={16} />
                              <span>{sub.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon size={18} className="text-gray-500" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 w-full rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiLogOut size={18} className="text-gray-500" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
