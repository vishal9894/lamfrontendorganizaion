import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useWallet, useDashboardStats } from "../hooks/useApiQueries";
import { useApiError } from "../hooks/useApiError";
import {
  FaWallet,
  FaBookOpen,
  FaUsers,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaGraduationCap,
  FaCalendarAlt,
  FaBell,
  FaUserGraduate,
  FaBuilding,
  FaGlobe,
  FaChalkboardTeacher,
  FaTrophy,
  FaCheckCircle
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
  const { handleError } = useApiError();

  // Use optimized React Query hooks
  const walletRes = useWallet(user?.id);
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardStats();

  // Calculate derived data from React Query results
  const wallet = walletRes.data?.balance || 0;
  const loading = walletRes.isLoading || dashboardLoading;

  // Default dashboard data
  const dashboard = dashboardData || {
    organizationId: "",
    organizationName: "",
    subdomain: "",
    totalUsers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalTeachers: 0,
    status: "active",
    enrollmentTrends: []
  };

  // Memoized chart data states to prevent unnecessary re-renders
  const earningData = useMemo(() => [
    { month: "Jan", earnings: 45000, expenses: 12000 },
    { month: "Feb", earnings: 52000, expenses: 15000 },
    { month: "Mar", earnings: 48000, expenses: 13000 },
    { month: "Apr", earnings: 61000, expenses: 18000 },
    { month: "May", earnings: 55000, expenses: 16000 },
    { month: "Jun", earnings: 67000, expenses: 20000 },
  ], []);

  const enrollmentData = useMemo(() => 
    dashboard.enrollmentTrends && dashboard.enrollmentTrends.length > 0
      ? dashboard.enrollmentTrends.map(trend => ({
          name: new Date(trend.month).toLocaleString('default', { month: 'short' }),
          students: trend.count,
          fullMonth: trend.month
        }))
      : [
          { name: "Jan", students: 120 },
          { name: "Feb", students: 150 },
          { name: "Mar", students: 180 },
          { name: "Apr", students: 220 },
          { name: "May", students: 195 },
          { name: "Jun", students: 240 },
        ],
    [dashboard.enrollmentTrends]
  );

  const recentActivities = useMemo(() => [
    {
      id: 1,
      action: "New course enrolled",
      course: "React Development",
      status: "success",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      action: "Payment received",
      amount: "₹5,000",
      status: "completed",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      action: "New student registered",
      course: "John Doe",
      status: "success",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ], []);

  // Handle errors
  useEffect(() => {
    if (dashboardError) {
      handleError(dashboardError, "Failed to load dashboard data");
    }
  }, [dashboardError, handleError]);

  // Calculate statistics with useMemo
  const activeCourses = dashboard.activeCourses;
  const totalCourses = dashboard.totalCourses;
  const inactiveCourses = totalCourses - activeCourses;
  const completionRate = totalCourses > 0 ? Math.round((activeCourses / totalCourses) * 100) : 0;

  const statsCards = useMemo(() => [
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
      value: activeCourses,
      icon: <FaBookOpen className="text-2xl" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      change: "+8.2%",
      changeType: "up",
    },
    {
      title: "Total Students",
      value: dashboard.totalUsers.toLocaleString(),
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
  ], [wallet, activeCourses, dashboard.totalUsers, completionRate]);

  const performanceMetrics = useMemo(() => [
    { label: "Course Completion Rate", value: completionRate, icon: <FaCheckCircle />, color: "text-green-600" },
    { label: "Total Teachers", value: dashboard.totalTeachers, icon: <FaChalkboardTeacher />, color: "text-blue-600" },
    { label: "Active Status", value: dashboard.status === "active" ? 100 : 0, icon: <FaTrophy />, color: "text-yellow-600" },
  ], [completionRate, dashboard.totalTeachers, dashboard.status]);

  // Add smooth scroll behavior
  useEffect(() => {
    // Add smooth scrolling to the document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup function to restore default behavior when component unmounts
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Organization Header Card */}
        {!loading && dashboard.organizationName && (
          <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <FaBuilding className="text-3xl text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{dashboard.organizationName}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <FaGlobe className="text-white/70 text-sm" />
                      <span className="text-white/80 text-sm">{dashboard.subdomain}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${dashboard.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {dashboard.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white/80 text-sm">Organization ID</p>
                    <p className="text-white font-mono text-sm">{dashboard.organizationId?.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
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
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.changeType === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
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

        {/* Charts Section */}
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
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
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

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {!loading && performanceMetrics.map((metric, index) => (
            <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`text-3xl ${metric.color}`}>{metric.icon}</div>
                <div className="text-3xl font-bold text-gray-800">
                  {typeof metric.value === 'number' && metric.label !== "Active Status" ? metric.value :
                    metric.label === "Active Status" ? (metric.value === 100 ? "Active" : "Inactive") :
                      `${metric.value}%`}
                </div>
              </div>
              <h4 className="text-gray-600 font-medium">{metric.label}</h4>
              {typeof metric.value === 'number' && metric.label !== "Total Teachers" && metric.label !== "Active Status" && (
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${metric.color.replace('text', 'bg')}`}
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              )}
              {metric.label === "Total Teachers" && (
                <div className="mt-3 text-sm text-gray-500">Expert instructors</div>
              )}
            </div>
          ))}
        </div>

        {/* Course Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {!loading && (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
                <FaBookOpen className="text-4xl mb-4 opacity-80" />
                <h3 className="text-sm font-medium opacity-90">Total Courses</h3>
                <p className="text-3xl font-bold mt-2">{totalCourses}</p>
                <div className="mt-4 flex justify-between text-sm">
                  <span>Active: {activeCourses}</span>
                  <span>Inactive: {inactiveCourses}</span>
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
                <p className="text-3xl font-bold mt-2">{dashboard.totalUsers.toLocaleString()}</p>
                <p className="text-sm opacity-90 mt-4">Active community members</p>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <FaBell className="text-pink-600" />
            </div>
          </div>
          <div className="space-y-4">
            {loading ? (
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
                      <div className={`w-2 h-2 mt-2 rounded-full ${activity.status === "completed" ? "bg-green-500" :
                        activity.status === "success" ? "bg-blue-500" :
                          "bg-yellow-500"
                        }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {activity.course || activity.amount || "No additional info"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <FaCalendarAlt className="text-xs text-gray-400" />
                          <p className="text-xs text-gray-400">
                            {new Date(activity.date).toLocaleDateString()}
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
      </div>
    </div>
  );
};

export default DashBoard;