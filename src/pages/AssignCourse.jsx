import { useState, useEffect } from "react";
import {
  handleGetAllUsers,
  handleGetShortCourseDetails,
  handleAssignMultipleCourses,
} from "../api/allApi";
import {
  BookOpen,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Filter,
  Package,
  RefreshCw,
  Search,
  Square,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Award,
  UserPlus
} from "lucide-react";

const AssignMultipleCourses = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState({
    users: false,
    courses: false,
    assign: false,
  });
  const [error, setError] = useState({
    users: null,
    courses: null,
    assign: null,
  });
  const [success, setSuccess] = useState(false);

  // Search states
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [showUserResults, setShowUserResults] = useState(false);
  const [showCourseResults, setShowCourseResults] = useState(true);

  const [courseTypeFilter, setCourseTypeFilter] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    users: true,
    courses: true,
    details: true,
    summary: true,
  });

  // Pagination for courses
  const [coursePage, setCoursePage] = useState(1);
  const [coursesPerPage] = useState(5);

  const courseTypes = [
    {
      value: "regular_course",
      label: "📚 Regular Course",
      color: "blue",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    {
      value: "free_video_course",
      label: "🎥 Free Video",
      color: "purple",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    {
      value: "free_pdf_course",
      label: "📄 Free PDF",
      color: "green",
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    {
      value: "free_test_series",
      label: "📝 Test Series",
      color: "amber",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
  ];

  const packageTypes = [
    {
      value: "basic",
      label: "Basic Package",
      price: "99",
      description: "Access to basic course materials",
    },
    {
      value: "standard",
      label: "Standard Package",
      price: "199",
      description: "Full course access with assignments",
    },
    {
      value: "premium",
      label: "Premium Package",
      price: "299",
      description: "Complete access with 1-on-1 support",
    },
    {
      value: "custom",
      label: "Custom Package",
      price: "",
      description: "Custom package with manual pricing",
    },
  ];

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch courses when course type filter changes
  useEffect(() => {
    if (courseTypeFilter !== "") {
      fetchCoursesByType(courseTypeFilter);
    } else {
      setCourses([]);
    }
  }, [courseTypeFilter]);

  const fetchUsers = async () => {
    setLoading((prev) => ({ ...prev, users: true }));
    setError((prev) => ({ ...prev, users: null }));
    try {
      const res = await handleGetAllUsers();

      if (res && res.data) {
        setUsers(res.data || []);
      } else if (res && Array.isArray(res)) {
        setUsers(res);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      setError((prev) => ({ ...prev, users: "Failed to fetch users" }));
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  const fetchCoursesByType = async (type) => {
    if (!type || type === "") return;

    setLoading((prev) => ({ ...prev, courses: true }));
    setError((prev) => ({ ...prev, courses: null }));
    try {
      const res = await handleGetShortCourseDetails();

      // Handle different response structures
      let coursesData = [];
      if (res?.data && Array.isArray(res.data)) {
        coursesData = res.data;
        coursesData = res.data;
      } else if (res && Array.isArray(res)) {
        coursesData = res;
      } else {
        coursesData = [];
      }

      setCourses(coursesData || []);

      // Show course results immediately if there are courses
      if (coursesData && coursesData.length > 0) {
        setShowCourseResults(true);
      }
    } catch (error) {
      console.error("Fetch courses error:", error);
      setError((prev) => ({ ...prev, courses: "Failed to fetch courses" }));
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  };

  const handleAssign = async () => {
    if (!selectedUser) {
      setError((prev) => ({ ...prev, assign: "Please select a user" }));
      return;
    }

    if (selectedCourses.length === 0) {
      setError((prev) => ({
        ...prev,
        assign: "Please select at least one course",
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, assign: true }));
    setError((prev) => ({ ...prev, assign: null }));
    setSuccess(false);

    try {
      const assignments = {
        userId: selectedUser.id,
        courseIds: selectedCourses.map((course) => course.id),
        mode: "offline"
      };

      const res = await handleAssignMultipleCourses(assignments);

      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSelectedUser(null);
          setSelectedCourses([]);
          setUserSearchQuery("");
          setCourseSearchQuery("");
        }, 3000);
      } else {
        setError((prev) => ({
          ...prev,
          assign: res?.message || "Failed to assign courses",
        }));
      }
    } catch (error) {
      console.error("Assign courses error:", error);
      setError((prev) => ({ ...prev, assign: "Failed to assign courses" }));
    } finally {
      setLoading((prev) => ({ ...prev, assign: false }));
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCourseSelection = (course) => {
    setSelectedCourses((prev) => {
      const exists = prev.find((c) => c.id === course.id);
      if (exists) {
        return prev.filter((c) => c.id !== course.id);
      } else {
        return [
          ...prev,
          {
            ...course,
            packageType: "basic",
            packageAmount: course.currentprice || course.coursedescriptionamount || "",
            about: `${course.coursename || course.name || ''} - ${course.coursedescription || ""}`,
          },
        ];
      }
    });
  };

  const updateCoursePackage = (courseId, field, value) => {
    setSelectedCourses((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, [field]: value } : course,
      ),
    );
  };

  const removeSelectedCourse = (courseId) => {
    setSelectedCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  const selectAllCourses = () => {
    const newSelections = filteredCourses.map((course) => ({
      ...course,
      packageType: "basic",
      packageAmount: course.currentprice || course.coursedescriptionamount || "",
      about: `${course.coursename || course.name || ''} - ${course.coursedescription || ""}`,
    }));
    setSelectedCourses(newSelections);
  };

  const deselectAllCourses = () => {
    setSelectedCourses([]);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setUserSearchQuery("");
    setShowUserResults(false);
  };

  const getCourseTypeInfo = (type) => {
    return courseTypes.find((t) => t.value === type) || courseTypes[0];
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.phone_number?.includes(userSearchQuery),
  );

  // Filter courses based on search
  const filteredCourses = courses.filter((course) => {
    const courseName = course.coursename || course.name || '';
    const courseDesc = course.coursedescription || '';

    const matchesSearch =
      courseSearchQuery === "" ||
      courseName.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
      courseDesc.toLowerCase().includes(courseSearchQuery.toLowerCase());

    return matchesSearch;
  });

  // Paginate courses
  const indexOfLastCourse = coursePage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse,
  );
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  return (
    <div className=" bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
            Assign Multiple Courses
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Search and select users, choose courses, and configure package
            details for each course
          </p>
        </div>

        {/* Error and Success Messages */}
        {error.assign && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error.assign}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Courses assigned successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left Column - User & Course Selection */}
          <div className="space-y-4 md:space-y-6">
            {/* User Search Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div
                className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("users")}
              >
                <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                  Search & Select User
                  {selectedUser && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Selected
                    </span>
                  )}
                </h2>
                {expandedSections.users ? (
                  <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                )}
              </div>

              {expandedSections.users && (
                <div className="p-3 md:p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or phone..."
                      value={userSearchQuery}
                      onChange={(e) => {
                        setUserSearchQuery(e.target.value);
                        setShowUserResults(true);
                      }}
                      onFocus={() => setShowUserResults(true)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                  </div>

                  {selectedUser && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold text-xs">
                          {selectedUser.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">
                            {selectedUser.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {showUserResults && userSearchQuery && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                      {loading.users ? (
                        <div className="p-4 text-center text-gray-500">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                          <p className="text-xs">Loading users...</p>
                        </div>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => selectUser(user)}
                            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold text-xs">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-800">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.email}
                                </p>
                                {user.phone_number && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {user.phone_number}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                          <p className="text-xs">No users found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Course Search Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div
                className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("courses")}
              >
                <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                  Search & Select Courses
                  {selectedCourses.length > 0 && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {selectedCourses.length} selected
                    </span>
                  )}
                </h2>
                {expandedSections.courses ? (
                  <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                )}
              </div>

              {expandedSections.courses && (
                <div className="p-3 md:p-4">
                  {/* Search Input */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses by name or description..."
                      value={courseSearchQuery}
                      onChange={(e) => {
                        setCourseSearchQuery(e.target.value);
                        setShowCourseResults(true);
                        setCoursePage(1);
                      }}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                  </div>

                  {/* Filters and Actions */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={courseTypeFilter}
                      onChange={(e) => {
                        setCourseTypeFilter(e.target.value);
                        setCoursePage(1);
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Select Course Type --</option>
                      {courseTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={selectAllCourses}
                      disabled={filteredCourses.length === 0}
                      className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 flex items-center gap-1 disabled:opacity-50"
                    >
                      <CheckSquare className="w-3 h-3" />
                      Select All
                    </button>

                    <button
                      onClick={deselectAllCourses}
                      disabled={selectedCourses.length === 0}
                      className="px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Square className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>

                  {/* Course Results */}
                  <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    {loading.courses ? (
                      <div className="p-4 text-center text-gray-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                        <p className="text-xs">Loading courses...</p>
                      </div>
                    ) : courseTypeFilter === "" ? (
                      <div className="p-4 text-center text-gray-500">
                        <Filter className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-xs">Please select a course type to view courses</p>
                      </div>
                    ) : courses.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <BookOpen className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-xs">No courses available for this type</p>
                      </div>
                    ) : currentCourses.length > 0 ? (
                      <>
                        {currentCourses.map((course) => {
                          const typeInfo = getCourseTypeInfo(course.coursetype);
                          const isSelected = selectedCourses.some(
                            (c) => c.id === course.id,
                          );


                          return (
                            <div
                              key={course.id}
                              onClick={() => toggleCourseSelection(course)}
                              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition last:border-b-0 ${isSelected ? "bg-indigo-50" : ""
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {isSelected ? (
                                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                                  ) : (
                                    <Square className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                  {course.courseImage ? (
                                    <img
                                      src={course.courseImage}
                                      alt={course.courseName || course.title}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <BookOpen className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-gray-800">
                                    {course.courseName || course.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.text} border ${typeInfo.border}`}
                                    >
                                      {typeInfo.label}
                                    </span>
                                    {course.status && (
                                      <span className="text-xs text-green-600 flex items-center gap-0.5">
                                        <CheckCircle className="w-3 h-3" /> Published
                                      </span>
                                    )}
                                    {!course.status && (
                                      <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                        <Clock className="w-3 h-3" /> Draft
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      ₹{course.currentPrice || course.amount || "0"}
                                    </span>
                                    {course.durationDescription && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {course.durationDescription}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Course Pagination */}
                        {totalPages > 1 && (
                          <div className="p-3 border-t border-gray-200 flex items-center justify-between">
                            <button
                              onClick={() => setCoursePage((prev) => Math.max(prev - 1, 1))}
                              disabled={coursePage === 1}
                              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-600">
                              Page {coursePage} of {totalPages}
                            </span>
                            <button
                              onClick={() => setCoursePage((prev) => Math.min(prev + 1, totalPages))}
                              disabled={coursePage === totalPages}
                              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <BookOpen className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-xs">No matching courses found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Selected Courses with Package Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                Configure Packages for Selected Courses
                {selectedCourses.length > 0 && (
                  <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {selectedCourses.length} courses
                  </span>
                )}
              </h2>
            </div>

            <div className="p-3 md:p-4 max-h-[600px] overflow-y-auto">
              {selectedCourses.length > 0 ? (
                <div className="space-y-4">
                  {selectedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium text-sm text-gray-800">
                            {course.coursename || course.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeSelectedCourse(course.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Package Type Selection */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Package Type
                        </label>
                        <select
                          value={course.packageType}
                          onChange={(e) =>
                            updateCoursePackage(
                              course.id,
                              "packageType",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
                        >
                          {packageTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label} {type.price && `- $${type.price}`}
                            </option>
                          ))}
                          <option value={`course_${course.id}`}>
                            📚 Course Default - $
                            {course.currentprice ||
                              course.coursedescriptionamount ||
                              "N/A"}
                          </option>
                        </select>
                      </div>

                      {/* Package Amount */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Package Amount
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                          <input
                            type="number"
                            value={course.packageAmount || ""}
                            onChange={(e) =>
                              updateCoursePackage(
                                course.id,
                                "packageAmount",
                                e.target.value,
                              )
                            }
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                            className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* About */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          About / Description
                        </label>
                        <textarea
                          value={course.about || ""}
                          onChange={(e) =>
                            updateCoursePackage(
                              course.id,
                              "about",
                              e.target.value,
                            )
                          }
                          placeholder="Enter description..."
                          rows="2"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No courses selected</p>
                  <p className="text-xs mt-1">
                    Select courses from the left panel
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {(selectedUser || selectedCourses.length > 0) && (
          <div className="mt-4 md:mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("summary")}
            >
              <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                Assignment Summary
              </h2>
              {expandedSections.summary ? (
                <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              )}
            </div>

            {expandedSections.summary && (
              <div className="p-3 md:p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {selectedUser && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h3 className="text-xs font-medium text-gray-500 mb-2">
                        Selected User
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold text-xs">
                          {selectedUser.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">
                            {selectedUser.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-xs font-medium text-gray-500 mb-2">
                      Total Courses
                    </h3>
                    <p className="text-2xl font-bold text-indigo-600">
                      {selectedCourses.length}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-xs font-medium text-gray-500 mb-2">
                      Total Package Amount
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      ${selectedCourses
                        .reduce(
                          (sum, course) =>
                            sum + (parseFloat(course.packageAmount) || 0),
                          0,
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                </div>

                {selectedCourses.length > 0 && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                    <h3 className="text-xs font-medium text-gray-500 mb-2">
                      Selected Courses ({selectedCourses.length})
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedCourses.map((course) => {
                        const typeInfo = getCourseTypeInfo(course.coursetype);
                        return (
                          <div
                            key={course.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="truncate max-w-[200px]">
                                {course.coursename || course.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.text}`}
                              >
                                {course.packageType}
                              </span>
                              <span className="font-medium text-gray-800">
                                ${parseFloat(course.packageAmount || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAssign}
                    disabled={
                      !selectedUser ||
                      selectedCourses.length === 0 ||
                      loading.assign
                    }
                    className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center text-sm md:text-base"
                  >
                    {loading.assign ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Assign {selectedCourses.length} Course
                        {selectedCourses.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignMultipleCourses;