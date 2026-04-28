import { useEffect, useState } from "react";
import { handleGetActiveCourse, handleGetWallet, handleUserCount } from "../api/allApi";
import { useSelector } from "react-redux";
import { 
  FaWallet, 
  FaBookOpen, 
  FaUsers, 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown,
  FaShoppingCart,
  FaGraduationCap,
  FaTrophy,
  FaCalendarAlt,
  FaBell,
  FaStar,
  FaUserGraduate
} from "react-icons/fa";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Skeleton Loader Components
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-32"></div>
    <div className="mt-4 h-1 bg-gray-200 rounded"></div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-64 bg-gray-100 rounded-lg"></div>
  </div>
);

const SkeletonGradientCard = () => (
  <div className="bg-gray-200 rounded-2xl shadow-lg p-6 animate-pulse">
    <div className="w-12 h-12 bg-gray-300 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
    <div className="h-8 bg-gray-300 rounded w-32 mb-4"></div>
    <div className="flex justify-between">
      <div className="h-4 bg-gray-300 rounded w-20"></div>
      <div className="h-4 bg-gray-300 rounded w-20"></div>
    </div>
  </div>
);

const SkeletonActivity = () => (
  <div className="flex items-start gap-3 p-3 animate-pulse">
    <div className="w-2 h-2 mt-2 bg-gray-200 rounded-full"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-48 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const DashBoard = () => {
  const { user } = useSelector((state) => state.user);
  const [wallet, setWallet] = useState(0);
  const [courseData, setCourseData] = useState({ active: 0, inactive: 0, total: 0 });
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);
  
  // Chart data states
  const [earningData, setEarningData] = useState([
    { month: "Jan", earnings: 0, expenses: 0 },
    { month: "Feb", earnings: 0, expenses: 0 },
    { month: "Mar", earnings: 0, expenses: 0 },
    { month: "Apr", earnings: 0, expenses: 0 },
    { month: "May", earnings: 0, expenses: 0 },
    { month: "Jun", earnings: 0, expenses: 0 },
  ]);

  const [enrollmentData, setEnrollmentData] = useState([
    { name: "Jan", students: 0 },
    { name: "Feb", students: 0 },
    { name: "Mar", students: 0 },
    { name: "Apr", students: 0 },
    { name: "May", students: 0 },
    { name: "Jun", students: 0 },
  ]);

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Add minimum loading time for better UX (optional)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Fetch wallet balance
        const walletRes = await handleGetWallet(user?.id);
        console.log("Wallet response:", walletRes);
        setWallet(walletRes?.balance || walletRes?.data?.balance || 0);

        // Fetch course data
        const courseRes = await handleGetActiveCourse();
        console.log("Course response:", courseRes);
        
        let activeCount = 0;
        let inactiveCount = 0;
        let totalCount = 0;
        
        if (courseRes?.success && courseRes?.data) {
          activeCount = courseRes.data.active || 0;
          inactiveCount = courseRes.data.inactive || 0;
          totalCount = courseRes.data.total || (activeCount + inactiveCount) || 0;
        } else if (courseRes?.data) {
          activeCount = courseRes.data.active || 0;
          inactiveCount = courseRes.data.inactive || 0;
          totalCount = courseRes.data.total || (activeCount + inactiveCount) || 0;
        }
        
        setCourseData({
          active: activeCount,
          inactive: inactiveCount,
          total: totalCount
        });

        // Fetch total users
        const usersRes = await handleUserCount();
        console.log("Users response:", usersRes);
        
        let userCount = 0;
        if (usersRes?.data?.total) {
          userCount = usersRes.data.total;
        } else if (usersRes?.total) {
          userCount = usersRes.total;
        } else if (typeof usersRes === 'number') {
          userCount = usersRes;
        } else if (usersRes?.data && typeof usersRes.data === 'number') {
          userCount = usersRes.data;
        }
        
        setTotalUsers(userCount);
        console.log("Set total users to:", userCount);

        // Calculate completion rate
        const calculatedCompletionRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 78;
        setCompletionRate(calculatedCompletionRate);

        // Fetch earning data
        const earningsHistory = await fetchEarningsHistory(user?.id);
        if (earningsHistory && earningsHistory.length > 0) {
          setEarningData(earningsHistory);
        }

        // Fetch enrollment data
        const enrollmentHistory = await fetchEnrollmentHistory(user?.id);
        if (enrollmentHistory && enrollmentHistory.length > 0) {
          setEnrollmentData(enrollmentHistory);
        }

        // Fetch recent activities
        const activities = await fetchRecentActivities(user?.id);
        setRecentActivities(activities);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchData();
  }, [user]);

  // Mock API functions
  const fetchEarningsHistory = async (userId) => {
    try {
      const baseEarning = wallet / 6;
      return [
        { month: "Jan", earnings: Math.round(baseEarning * 0.6), expenses: Math.round(baseEarning * 0.3) },
        { month: "Feb", earnings: Math.round(baseEarning * 0.7), expenses: Math.round(baseEarning * 0.35) },
        { month: "Mar", earnings: Math.round(baseEarning * 0.8), expenses: Math.round(baseEarning * 0.4) },
        { month: "Apr", earnings: Math.round(baseEarning * 0.9), expenses: Math.round(baseEarning * 0.45) },
        { month: "May", earnings: Math.round(baseEarning * 1.0), expenses: Math.round(baseEarning * 0.5) },
        { month: "Jun", earnings: Math.round(baseEarning * 1.1), expenses: Math.round(baseEarning * 0.55) },
      ];
    } catch (error) {
      console.error("Error fetching earnings:", error);
      return earningData;
    }
  };

  const fetchEnrollmentHistory = async (userId) => {
    try {
      const baseEnrollment = totalUsers / 6;
      return [
        { name: "Jan", students: Math.round(baseEnrollment * 0.3) },
        { name: "Feb", students: Math.round(baseEnrollment * 0.4) },
        { name: "Mar", students: Math.round(baseEnrollment * 0.5) },
        { name: "Apr", students: Math.round(baseEnrollment * 0.6) },
        { name: "May", students: Math.round(baseEnrollment * 0.7) },
        { name: "Jun", students: Math.round(baseEnrollment * 0.8) },
      ];
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      return enrollmentData;
    }
  };

  const fetchRecentActivities = async (userId) => {
    try {
      return [
        { id: 1, action: "Wallet Updated", amount: `₹${wallet}`, date: new Date().toISOString(), status: "success" },
        { id: 2, action: "Course Enrolled", course: `${courseData.active} Active Courses`, date: new Date().toISOString(), status: "completed" },
        { id: 3, action: "Total Users", amount: `${totalUsers} Users`, date: new Date().toISOString(), status: "info" },
      ];
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  };

  const statsCards = [
    {
      title: "Wallet Balance",
      value: `₹${wallet.toLocaleString()}`,
      icon: <FaWallet className="text-2xl" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      change: "+12.5%",
      changeType: "up",
    },
    {
      title: "Active Courses",
      value: courseData.active,
      icon: <FaBookOpen className="text-2xl" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      change: "+8.2%",
      changeType: "up",
    },
    {
      title: "Total Students",
      value: totalUsers.toLocaleString(),
      icon: <FaUsers className="text-2xl" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      change: "+15.3%",
      changeType: "up",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: <FaGraduationCap className="text-2xl" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      change: "+5.7%",
      changeType: "up",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </span>
            <span className="text-sm font-normal text-gray-500">
              Welcome back, {user?.name || "User"}!
            </span>
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your account today.</p>
        </div>

        {/* Stats Cards Grid with Skeleton Loader */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Show skeleton cards while loading
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            // Show actual cards when loaded
            statsCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.textColor} group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.changeType === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {stat.changeType === "up" ? <FaArrowUp className="inline mr-1 text-xs" /> : <FaArrowDown className="inline mr-1 text-xs" />}
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </div>
            ))
          )}
        </div>

        {/* Charts Section with Skeleton Loader */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {loading ? (
            <>
              <SkeletonChart />
              <SkeletonChart />
            </>
          ) : (
            <>
              {/* Earnings Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Earnings Overview</h3>
                    <p className="text-sm text-gray-500 mt-1">Monthly earnings vs expenses</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaChartLine className="text-purple-600" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={earningData}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="earnings" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorEarnings)" />
                    <Area type="monotone" dataKey="expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Enrollment Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Enrollment Trends</h3>
                    <p className="text-sm text-gray-500 mt-1">New student enrollments</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaUserGraduate className="text-green-600" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="students" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Course Statistics Section with Skeleton Loader */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <>
              <SkeletonGradientCard />
              <SkeletonGradientCard />
              <SkeletonGradientCard />
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
                <FaBookOpen className="text-4xl mb-4 opacity-80" />
                <h3 className="text-sm font-medium opacity-90">Total Courses</h3>
                <p className="text-3xl font-bold mt-2">{courseData.total}</p>
                <div className="mt-4 flex justify-between text-sm">
                  <span>Active: {courseData.active}</span>
                  <span>Inactive: {courseData.inactive}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
                <FaWallet className="text-4xl mb-4 opacity-80" />
                <h3 className="text-sm font-medium opacity-90">Wallet Balance</h3>
                <p className="text-3xl font-bold mt-2">₹{wallet.toLocaleString()}</p>
                <p className="text-sm opacity-90 mt-4">Available for purchases</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
                <FaUsers className="text-4xl mb-4 opacity-80" />
                <h3 className="text-sm font-medium opacity-90">Total Users</h3>
                <p className="text-3xl font-bold mt-2">{totalUsers.toLocaleString()}</p>
                <p className="text-sm opacity-90 mt-4">Active community members</p>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity Section with Skeleton Loader */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <FaBell className="text-pink-600" />
            </div>
          </div>
          <div className="space-y-4">
            {loading ? (
              // Show skeleton activities while loading
              <>
                <SkeletonActivity />
                <SkeletonActivity />
                <SkeletonActivity />
              </>
            ) : (
              <>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        activity.status === "completed" ? "bg-green-500" :
                        activity.status === "success" ? "bg-blue-500" :
                        activity.status === "achieved" ? "bg-purple-500" :
                        "bg-yellow-500"
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {activity.course || activity.amount || activity.from || "No additional info"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <FaCalendarAlt className="text-xs text-gray-400" />
                          <p className="text-xs text-gray-400">
                            {activity.date ? new Date(activity.date).toLocaleDateString() : new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaBell className="text-4xl mx-auto mb-3 opacity-50" />
                    <p>No recent activities</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Skeleton Loader with Shimmer Effect (Optional) */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }
          
          .animate-pulse {
            animation: shimmer 2s infinite linear;
            background: linear-gradient(to right, #f3f4f6 4%, #e5e7eb 25%, #f3f4f6 36%);
            background-size: 1000px 100%;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DashBoard;