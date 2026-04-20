import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import { handleGetProfile, handleLgout } from "../api/allApi";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setLocalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Fetch profile when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await handleGetProfile();

        // Extract the actual user data from the response
        let userData = res?.data?.admin || res;

        // Fix: If name is an object, extract the name string
        if (userData && userData.name && typeof userData.name === 'object') {
          userData = {
            ...userData,
            name: userData.name.name || userData.name.value || JSON.stringify(userData.name)
          };
        }

        // Fix: If email is an object, extract the email string
        if (userData && userData.email && typeof userData.email === 'object') {
          userData = {
            ...userData,
            email: userData.email.email || userData.email.value || ''
          };
        }

        setLocalUser(userData);
        dispatch(setUser(userData));
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch]);

  const handleLogout = () => {
    handleLgout();
    localStorage.removeItem("authToken");
    window.location.reload();
  };

  useEffect(() => {
    if (user && user.status === false) {
      handleLogout();
    }
  }, [user]);

  // Show loading placeholder until user is fetched
  if (loading) {
    return (
      <header className="w-full h-16 bg-gray-200 shadow-md flex items-center justify-end px-6 border-b border-gray-300">
        <div className="text-gray-500 font-medium">Loading...</div>
      </header>
    );
  }

  return (
    <header className="w-full h-16 bg-gray-200 shadow-md flex items-center justify-end px-6 relative border-b border-gray-300">
     

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-3 bg-white hover:bg-gray-100 transition-all duration-200 rounded-full pl-3 pr-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {/* Avatar */}
          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold uppercase">
            {user?.image ? (
              <img src={user.image} alt="user" className="rounded-full" />
            ) : (
              <div className="avatar-fallback ">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Username */}
          <span className="text-gray-700 font-medium hidden sm:block">
            {user?.name}
          </span>

          {/* Dropdown Arrow */}
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "transform rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />

            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden z-20">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="text-sm font-semibold text-gray-700 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150">
                  Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150">
                  Settings
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 py-2">
                <button
                  onClick={() => handleLogout()}
                  className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;