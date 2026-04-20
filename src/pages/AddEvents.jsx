import { useState, useEffect } from "react";
import {
  handleGetCourse,
  handleGetFolders,
  handleCreateEvent
} from "../api/allApi";
import { 
  FiBookOpen, 
  FiCalendar, 
  FiFolder, 
  FiImage, 
  FiLink, 
  FiSettings, 
  FiX,
  FiSave
} from "react-icons/fi";
import { MdSupervisedUserCircle, MdWarning, MdCategory, MdDescription, MdPublic, MdPrivateConnectivity } from "react-icons/md";

const AddEvents = () => {

  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(false);
  const [courses, setCourses] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedCourseName, setSelectedCourseName] = useState("");

  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerFile, setBannerFile] = useState(null);

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  const [formData, setFormData] = useState({
    access: "free",
    status: true,
    courseId: "",
    folderId: "",
    name: "",
    url: "",
    description: "",
    image: "",
    category_name: "",
    courseName: ""
  });

  const courseTypes = [
    "regular_course",
    "ebook",
    "free_video_course",
    "free_pdf_course",
    "free_test_series"
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  /* FETCH COURSES */
  const fetchCourses = async () => {
    try {
      setFetchingCourses(true);
      let allCourses = [];
      
      const promises = courseTypes.map(type => handleGetCourse(type));
      const results = await Promise.all(promises);

      results.forEach(res => {
        // Handle different response formats
        if (res?.data?.course) {
          if (Array.isArray(res.data.course)) {
            allCourses = [...allCourses, ...res.data.course];
          } else if (typeof res.data.course === 'object' && res.data.course !== null) {
            allCourses = [...allCourses, res.data.course];
          }
        } else if (res?.data && Array.isArray(res.data)) {
          allCourses = [...allCourses, ...res.data];
        } else if (Array.isArray(res)) {
          allCourses = [...allCourses, ...res];
        } else if (res?.course && Array.isArray(res.course)) {
          allCourses = [...allCourses, ...res.course];
        }
      });
      
      // Remove duplicates
      const uniqueCourses = allCourses.filter((course, index, self) => 
        index === self.findIndex((c) => c.id === course.id)
      );
      
      setCourses(uniqueCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      showNotification("error", "Failed to load courses");
    } finally {
      setFetchingCourses(false);
    }
  };

  /* FETCH FOLDERS WHEN COURSE SELECTED */
  const fetchFolders = async (courseId) => {
    try {
      if (!courseId) {
        setFolders([]);
        return;
      }

      setLoading(true);
      const res = await handleGetFolders(courseId);
      console.log("Folders response:", res);
      
      // Handle different response structures
      let folderData = [];
      if (res?.folder) {
        if (Array.isArray(res.folder)) {
          folderData = res.folder;
        } else if (typeof res.folder === 'object') {
          folderData = [res.folder];
        }
      } else if (res?.folders && Array.isArray(res.folders)) {
        folderData = res.folders;
      } else if (Array.isArray(res)) {
        folderData = res;
      } else if (res?.data && Array.isArray(res.data)) {
        folderData = res.data;
      }
      
      // Filter to show only folders (items without file extensions or with folder indicators)
      const onlyFolders = folderData.filter(item => {
        return (
          (item.type && item.type.toLowerCase() === 'folder') ||
          item.isFolder === true ||
          item.is_directory === true ||
          (item.name && !item.name.includes('.')) ||
          (item.children && Array.isArray(item.children)) ||
          (item.items && Array.isArray(item.items))
        );
      });
      
      console.log("All items from API:", folderData);
      console.log("Filtered folders only:", onlyFolders);
      
      setFolders(onlyFolders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      showNotification("error", "Failed to load folders");
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  /* INPUT CHANGE */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));

    if (name === "courseId") {
      const selectedCourse = courses.find(course => course.id === value);
      const courseName = selectedCourse ? (selectedCourse.courseName || selectedCourse.coursename || selectedCourse.title) : "";
      setSelectedCourseName(courseName);
      
      setFormData((prev) => ({
        ...prev,
        courseId: value,
        category_name: courseName,
        courseName: courseName,
        folderId: ""
      }));
      
      fetchFolders(value);
    }
  };

  /* BANNER CHANGE */
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "Image size should be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("error", "Please upload an image file");
      return;
    }

    setBannerFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /* REMOVE BANNER */
  const removeBanner = () => {
    setBannerPreview("");
    setBannerFile(null);
    setFormData((prev) => ({
      ...prev,
      image: ""
    }));
  };

  /* SUBMIT FORM */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.courseId) {
      showNotification("error", "Please select a course");
      return;
    }
    
    if (!formData.name.trim()) {
      showNotification("error", "Please enter an event name");
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Match the backend entity fields exactly
      formDataToSend.append("name", formData.name);
      formDataToSend.append("courseId", formData.courseId);
      formDataToSend.append("courseName", formData.courseName || formData.category_name);
      
      if (formData.folderId) {
        formDataToSend.append("folderId", formData.folderId);
      }
      
      if (formData.url) {
        formDataToSend.append("url", formData.url);
      }
      
      if (formData.description) {
        formDataToSend.append("description", formData.description);
      }
      
      formDataToSend.append("status", formData.status);
      formDataToSend.append("accessType", formData.access);
      
      if (bannerFile) {
        formDataToSend.append("image", bannerFile);
      }

      console.log("Submitting FormData:", {
        name: formData.name,
        courseId: formData.courseId,
        courseName: formData.courseName,
        folderId: formData.folderId,
        url: formData.url,
        description: formData.description,
        status: formData.status,
        accessType: formData.access,
        image: bannerFile ? bannerFile.name : "No file"
      });

      const res = await handleCreateEvent(formDataToSend);
      console.log("Response:", res);

      if (res?.success || res?.status === 200 || res?.data) {
        showNotification("success", "Event created successfully!");
        
        // Reset form
        setFormData({
          access: "free",
          status: true,
          courseId: "",
          folderId: "",
          name: "",
          url: "",
          description: "",
          image: "",
          category_name: "",
          courseName: ""
        });
        
        setSelectedCourseName("");
        setBannerPreview("");
        setBannerFile(null);
        setFolders([]);
      } else {
        showNotification("error", res?.message || "Event creation failed");
      }

    } catch (error) {
      console.error("Error creating event:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Event creation failed";
      showNotification("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* NOTIFICATION */
  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message
    });

    setTimeout(() => {
      setNotification({
        show: false,
        type: "",
        message: ""
      });
    }, 4000);
  };

  const closeNotification = () => {
    setNotification({
      show: false,
      type: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slideDown
          ${notification.type === "success" ? "bg-green-50 text-green-800 border-l-4 border-green-500" : 
            "bg-red-50 text-red-800 border-l-4 border-red-500"}`}
        >
          <span className="text-xl">
            {notification.type === "success" ? <MdSupervisedUserCircle /> : <MdWarning />}
          </span>
          
          <span className="flex-1">{notification.message}</span>

          <button 
            onClick={closeNotification}
            className="hover:opacity-70 transition-opacity"
          >
            <FiX />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FiCalendar className="text-3xl" /> Create New Event
          </h2>
          <p className="text-blue-100 mt-2">Fill in the details below to create a new event</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* COURSE SELECTION */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2 text-gray-700">
              <FiBookOpen className="text-blue-600" /> Course <span className="text-red-500">*</span>
            </label>

            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              disabled={fetchingCourses}
              required
            >
              <option value="">
                {fetchingCourses ? "Loading courses..." : "Select a course"}
              </option>

              {courses.length > 0 ? (
                courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseName || course.coursename || course.title} {course.coursetype ? `(${course.coursetype})` : ''}
                  </option>
                ))
              ) : (
                !fetchingCourses && <option value="" disabled>No courses available</option>
              )}
            </select>

            {fetchingCourses && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span className="animate-spin">⏳</span> Loading courses...
              </p>
            )}
          </div>

          {/* FOLDER SELECTION */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2 text-gray-700">
              <FiFolder className="text-blue-600" /> Folder (Optional)
            </label>

            <select
              name="folderId"
              value={formData.folderId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              disabled={!formData.courseId || loading}
            >
              <option value="">No folder (Root)</option>

              {folders.length > 0 ? (
                folders.map((folder) => (
                  <option key={folder.id || folder.folder_id} value={folder.id || folder.folder_id}>
                    📁 {folder.name || folder.folder_name || "Unnamed Folder"}
                  </option>
                ))
              ) : (
                formData.courseId && !loading && (
                  <option value="" disabled>No folders available</option>
                )
              )}
            </select>

            {loading && formData.courseId && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span className="animate-spin">⏳</span> Loading folders...
              </p>
            )}

            {!loading && folders.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {folders.length} folder{folders.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          {/* EVENT NAME */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2 text-gray-700">
              <FiCalendar className="text-blue-600" /> Event Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter event name"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>

          {/* STREAM LINK */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2 text-gray-700">
              <FiLink className="text-blue-600" /> Stream Link (Optional)
            </label>

            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://example.com/stream"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Display Category (Course Name) for user info */}
          {selectedCourseName && (
            <div className="space-y-2">
              <label className="font-semibold flex items-center gap-2 text-gray-700">
                <MdCategory className="text-blue-600" /> Category (Course)
              </label>
              <div className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                {selectedCourseName}
              </div>
              <p className="text-xs text-gray-500">Category is automatically set to the selected course name</p>
            </div>
          )}

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2 text-gray-700">
              <MdDescription className="text-blue-600" /> Description (Optional)
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter event description..."
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-y"
            />
          </div>

          {/* BANNER UPLOAD */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2 text-gray-700">
              <FiImage className="text-blue-600" /> Event Banner (Optional)
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG, GIF (Max size: 5MB)</p>
            </div>

            {bannerPreview && (
              <div className="mt-3 relative inline-block">
                <img
                  src={bannerPreview}
                  className="rounded-lg max-h-60 shadow-md"
                  alt="Banner preview"
                />

                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-md"
                  title="Remove banner"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>

          {/* ACCESS SETTINGS */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2 text-gray-700">
              <FiSettings className="text-blue-600" /> Access Settings
            </label>
            
            <div className="flex gap-6 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="access"
                  value="free"
                  checked={formData.access === "free"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <MdPublic className="text-lg" /> Free
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="access"
                  value="paid"
                  checked={formData.access === "paid"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <MdPrivateConnectivity className="text-lg" /> Paid
              </label>
            </div>
          </div>

          {/* STATUS OPTION */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium">Publish event immediately</span>
            </label>
          </div>

          {/* Form Summary */}
          {(selectedCourseName || formData.name) && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <FiCalendar className="text-blue-600" />
                Event Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedCourseName && (
                  <div className="bg-white p-2 rounded">
                    <span className="text-gray-500">Course/Category:</span>
                    <div className="font-medium text-blue-700">{selectedCourseName}</div>
                  </div>
                )}
                {formData.name && (
                  <div className="bg-white p-2 rounded">
                    <span className="text-gray-500">Event:</span>
                    <div className="font-medium">{formData.name}</div>
                  </div>
                )}
                {formData.access && (
                  <div className="bg-white p-2 rounded">
                    <span className="text-gray-500">Access:</span>
                    <div className="font-medium capitalize">{formData.access}</div>
                  </div>
                )}
                <div className="bg-white p-2 rounded">
                  <span className="text-gray-500">Status:</span>
                  <div className="font-medium">{formData.status ? 'Published' : 'Draft'}</div>
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || fetchingCourses}
              className={`w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg 
                font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 
                transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                ${loading ? 'cursor-wait' : ''}`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Creating Event...
                </>
              ) : (
                <>
                  <FiSave /> Create Event
                </>
              )}
            </button>
          </div>
        </form>
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

export default AddEvents;