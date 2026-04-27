import { useEffect, useState } from "react";
import {
  BookOpen,
  DollarSign,
  FileText,
  Video,
  Image,
  Calendar,
  Award,
  Layers,
  RefreshCw,
  Globe,
  ChevronDown,
  ChevronRight,
  Folder,
  CheckCircle,
  Plus,
  Tag,
  LinkIcon,
  Clock,
  Upload,
  X,
  Save,
} from "lucide-react";
import { handleCreateCourse, handleGetStream, handleGetTeacher } from "../api/allApi";

const AddCourse = () => {
  // Initial empty form state - FIXED with all required fields
  const initialFormState = {
  // Backend expected fields
  title: "",
  type: "",
  description: "",
  streamId: "",
  courseName: "",
  teacherId: "",
  status: false,
  strikeoutPrice: "",
  currentPrice: "",
  productId: "",
  courseGroupUrl: "",
  durationDescription: "",
  amount: "",
  upgradeDuration: "",
  upgradePrice: "",
  videoId: "",
  
  // Additional fields for internal use
  coursefeatures: "[]",
  syllabus: "[]",
  coursedescriptionamount: "",
  whatsappurl: "",
  publish: false,
};

  const [formData, setFormData] = useState(initialFormState);
  
  const [files, setFiles] = useState({
    courseimage: null,
    timetable: null,
    batchinfo: null,
  });

  const [filePreview, setFilePreview] = useState({
    courseimage: null,
    timetable: null,
    batchinfo: null,
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [streams, setStreams] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Track validation errors
  const [validationErrors, setValidationErrors] = useState({});
  
  // State for Units and Chapters
  const [units, setUnits] = useState([]);
  const [currentUnit, setCurrentUnit] = useState("");
  const [currentChapter, setCurrentChapter] = useState("");
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(null);
  const [expandedUnits, setExpandedUnits] = useState([]);

  // Track if component is mounted
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    fetchStreams();
    fetchTeachers();
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  const fetchStreams = async () => {
    if (!isMounted) return;
    setLoadingStreams(true);
    try {
      const response = await handleGetStream();
      console.log("Streams response:", response);
      
      if (response && response.success && response.data) {
        setStreams(Array.isArray(response.data) ? response.data : []);
      } else if (response && response.data) {
        setStreams(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setStreams(response);
      } else {
        setStreams([]);
      }
    } catch (error) {
      console.error("Failed to fetch streams:", error);
      setStreams([]);
    } finally {
      if (isMounted) setLoadingStreams(false);
    }
  };

  const fetchTeachers = async () => {
    if (!isMounted) return;
    setLoadingTeachers(true);
    try {
      const response = await handleGetTeacher();
      console.log("Teachers response:", response);
      
      // Handle different response structures
      if (response && response.success && response.data) {
        // If response has data property
        setTeachers(Array.isArray(response.data) ? response.data : []);
      } else if (response && response.teachers) {
        // If response has teachers property
        setTeachers(Array.isArray(response.teachers) ? response.teachers : []);
      } else if (Array.isArray(response)) {
        // If response is directly an array
        setTeachers(response);
      } else {
        console.warn("Unexpected teachers response format:", response);
        setTeachers([]);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setTeachers([]);
    } finally {
      if (isMounted) setLoadingTeachers(false);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    if (submitSuccess) setSubmitSuccess(false);
    if (submitError) setSubmitError(null);
  };

  const handleStreamChange = (e) => {
    e.preventDefault();
    const selectedStreamId = e.target.value;
    
    const streamsArray = Array.isArray(streams) ? streams : [];
    const selectedStream = streamsArray.find(s => s.id === selectedStreamId || s._id === selectedStreamId);
    
    setFormData(prev => ({
      ...prev,
      streamname: selectedStream?.name || selectedStream?.streamname || "",
    }));
    
    // Clear validation error for streamname
    if (validationErrors.streamname) {
      setValidationErrors(prev => ({
        ...prev,
        streamname: null
      }));
    }
  };

  const handleTeacherChange = (e) => {
    e.preventDefault();
    const selectedTeacherId = e.target.value;
    
    if (!selectedTeacherId) {
      setFormData(prev => ({
        ...prev,
        teacher: "",
        teacherId: ""
      }));
      return;
    }
    
    const teachersArray = Array.isArray(teachers) ? teachers : [];
    
    // Find the selected teacher by ID (handle both id and _id)
    const selectedTeacher = teachersArray.find(t => 
      t.id === selectedTeacherId || t._id === selectedTeacherId
    );
    
    console.log("Selected teacher:", selectedTeacher);
    
    if (selectedTeacher) {
      // Store both teacher name and ID based on what your API expects
      // Option 1: Store teacher name (if API expects name)
      setFormData(prev => ({
        ...prev,
        teacher: selectedTeacher.name || selectedTeacher.teachername || "",
        teacherId: selectedTeacher.id || selectedTeacher._id || ""
      }));
      
      // Option 2: Store teacher ID (if API expects ID)
      // Uncomment the line below if your API expects teacher ID instead of name
      // setFormData(prev => ({ ...prev, teacher: selectedTeacher.id || selectedTeacher._id || "" }));
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.target.files[0];
    const fileName = e.target.name;
    
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        e.target.value = '';
        return;
      }

      // Validate file type
      if (fileName === "courseimage" && !file.type.startsWith("image/")) {
        alert("Please upload an image file");
        e.target.value = '';
        return;
      }

      if ((fileName === "timetable" || fileName === "batchinfo") && file.type !== "application/pdf") {
        alert("Please upload a PDF file");
        e.target.value = '';
        return;
      }

      setFiles(prev => ({
        ...prev,
        [fileName]: file,
      }));

      // Clear validation error for courseimage
      if (fileName === "courseimage" && validationErrors.courseimage) {
        setValidationErrors(prev => ({
          ...prev,
          courseimage: null
        }));
      }

      // Create preview URL for images
      if (fileName === "courseimage") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(prev => ({
            ...prev,
            [fileName]: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeFile = (fileName) => {
    setFiles(prev => ({
      ...prev,
      [fileName]: null,
    }));
    setFilePreview(prev => ({
      ...prev,
      [fileName]: null,
    }));
    
    // Set validation error for courseimage if it's being removed
    if (fileName === "courseimage") {
      setValidationErrors(prev => ({
        ...prev,
        courseimage: "Course image is required"
      }));
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormState);
    setFiles({
      courseimage: null,
      timetable: null,
      batchinfo: null,
    });
    setFilePreview({
      courseimage: null,
      timetable: null,
      batchinfo: null,
    });
    setUnits([]);
    setCurrentUnit("");
    setCurrentChapter("");
    setSelectedUnitIndex(null);
    setExpandedUnits([]);
    setActiveTab("basic");
    setSubmitSuccess(false);
    setSubmitError(null);
    setValidationErrors({});
  };

  // Safe JSON parse helper
  const safeJSONParse = (value, defaultValue = []) => {
    if (!value) return defaultValue;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formData.coursetype) {
      errors.coursetype = "Please select a course type";
    }
    
    if (!formData.streamname) {
      errors.streamname = "Please select a stream";
    }
    
    if (!formData.coursename) {
      errors.coursename = "Please enter a course name";
    }
    
    // Check if course image is uploaded (REQUIRED)
    if (!files.courseimage) {
      errors.courseimage = "Course image is required";
    }
    
    // Optional: Validate teacher if needed
    // if (!formData.teacher) {
    //   errors.teacher = "Please select a teacher";
    // }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Unit Management Functions
  const addUnit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentUnit.trim()) {
      setUnits(prev => [...prev, { 
        name: currentUnit.trim(), 
        chapters: [],
        id: Date.now().toString() 
      }]);
      setCurrentUnit("");
    }
  };

  const removeUnit = (index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setUnits(prev => prev.filter((_, i) => i !== index));
    if (selectedUnitIndex === index) {
      setSelectedUnitIndex(null);
      setCurrentChapter("");
    }
  };

  const selectUnit = (index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedUnitIndex(index);
    setCurrentChapter("");
  };

  // Chapter Management Functions
  const addChapter = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentChapter.trim() && selectedUnitIndex !== null) {
      setUnits(prev => {
        const updatedUnits = [...prev];
        updatedUnits[selectedUnitIndex].chapters.push({
          name: currentChapter.trim(),
          id: Date.now().toString() + Math.random()
        });
        return updatedUnits;
      });
      setCurrentChapter("");
    }
  };

  const removeChapter = (unitIndex, chapterIndex, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setUnits(prev => {
      const updatedUnits = [...prev];
      updatedUnits[unitIndex].chapters = updatedUnits[unitIndex].chapters.filter(
        (_, i) => i !== chapterIndex
      );
      return updatedUnits;
    });
  };

  const toggleUnitExpand = (unitIndex, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedUnits(prev => 
      prev.includes(unitIndex) 
        ? prev.filter(i => i !== unitIndex)
        : [...prev, unitIndex]
    );
  };

  // Handle Enter key press in inputs
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  // Validate form before submission
  if (!validateForm()) {
    // If validation fails, switch to the tab with errors
    if (validationErrors.courseimage) {
      setActiveTab("media");
    } else if (validationErrors.coursetype || validationErrors.streamname || validationErrors.coursename) {
      setActiveTab("basic");
    }
    return;
  }
  
  setSubmitting(true);
  setSubmitError(null);
  setSubmitSuccess(false);

  try {
    const data = new FormData();

    // Safely parse course features and syllabus
    const featuresArray = safeJSONParse(formData.coursefeatures);
    const syllabusData = units.length > 0 ? units : safeJSONParse(formData.syllabus);
    
    // Find stream ID from selected stream name
    const streamsArray = Array.isArray(streams) ? streams : [];
    const selectedStream = streamsArray.find(s => s.name === formData.streamname);
    const streamId = selectedStream?.id || selectedStream?._id || "";
    
    // Prepare data matching backend DTO exactly
    const courseData = {
      title: formData.coursename,
      type: formData.coursetype,
      description: formData.coursedescription,
      streamId: streamId,
      courseName: formData.coursename,
      teacherId: formData.teacherId,
      status: formData.publish || false,
      strikeoutPrice: formData.strikeoutprice ? Number(formData.strikeoutprice) : undefined,
      currentPrice: formData.currentprice ? Number(formData.currentprice) : undefined,
      productId: formData.productid,
      courseGroupUrl: formData.whatsappurl,
      durationDescription: formData.courseduration,
      amount: formData.coursedescriptionamount,
      upgradeDuration: formData.upgradeduration,
      upgradePrice: formData.upgradeprice ? Number(formData.upgradeprice) : undefined,
      videoId: formData.introvideoid,
      coursefeatures: JSON.stringify(featuresArray),
      syllabus: JSON.stringify(syllabusData),
    };

    // Append all course data to FormData
    Object.keys(courseData).forEach(key => {
      if (courseData[key] !== undefined && courseData[key] !== "" && courseData[key] !== null) {
        data.append(key, courseData[key]);
      }
    });

    // Append files
    if (files.courseimage) {
      data.append("courseimage", files.courseimage);
    }
    if (files.timetable) {
      data.append("timetable", files.timetable);
    }
    if (files.batchinfo) {
      data.append("batchinfo", files.batchinfo);
    }

    // Log FormData contents for debugging
    console.log("Submitting course data:");
    for (let pair of data.entries()) {
      console.log(pair[0] + ':', pair[1] instanceof File ? pair[1].name : pair[1]);
    }
    
    const response = await handleCreateCourse(data);
    console.log("Course created successfully:", response);
    
    setSubmitSuccess(true);
    
    // Reset form after successful submission
    setTimeout(() => {
      resetForm();
    }, 2000);
    
  } catch (error) {
    console.error("Failed to create course:", error);
    setSubmitError(error.message || "Failed to create course. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  // Handle tab change without submitting
  const handleTabChange = (tabId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveTab(tabId);
  };

  const courseTypes = [
    { value: "regular_course", label: "📚 Regular Course", icon: BookOpen },
    { value: "ebook", label: "📖 E-Book", icon: FileText },
    { value: "free_video_course", label: "🎥 Free Video Course", icon: Video },
    { value: "free_pdf_course", label: "📄 Free PDF Course", icon: FileText },
    { value: "free_test_series", label: "📝 Free Test Series", icon: Award },
  ];

  const features = [
    { id: "live", label: "Live Classes", icon: "🎥" },
    { id: "video", label: "Recorded Videos", icon: "📹" },
    { id: "notes", label: "Study Notes", icon: "📝" },
    { id: "pdf", label: "PDF Materials", icon: "📄" },
    { id: "tests", label: "Mock Tests", icon: "📊" },
    { id: "topper", label: "Topper Notes", icon: "🏆" },
  ];

  // Get current features array safely
  const currentFeatures = safeJSONParse(formData.coursefeatures);

  // Helper function to get teacher display name
  const getTeacherDisplayName = (teacher) => {
    return teacher.name || teacher.teachername || teacher.fullName || "Unknown Teacher";
  };

  // Helper function to get teacher ID
  const getTeacherId = (teacher) => {
    return teacher.id || teacher._id || teacher.teacherId || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Reset Button */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Create New Course
            </h1>
            <p className="text-gray-600">
              Fill in the details to create a new course
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Reset form"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Course created successfully! The form has been reset.
          </div>
        )}
        
        {submitError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {submitError}
          </div>
        )}

        {/* Validation Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <p className="font-semibold">Please fix the following errors:</p>
            <ul className="list-disc list-inside mt-2">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
            {[
              { id: "basic", label: "Basic Info", icon: BookOpen },
              { id: "content", label: "Content", icon: FileText },
              { id: "syllabus", label: "Syllabus", icon: Layers },
              { id: "pricing", label: "Pricing", icon: DollarSign },
              { id: "media", label: "Media", icon: Image },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => handleTabChange(tab.id, e)}
                className={`flex-1 px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
            ))}
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="p-4 sm:p-6 lg:p-8"
            onKeyDown={handleKeyPress}
          >
            {/* Tab 1: Basic Info */}
            {activeTab === "basic" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Course Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Course Type <span className="text-red-500">*</span>
                  </label>
                  {validationErrors.coursetype && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.coursetype}</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    {courseTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormData({ ...formData, coursetype: type.value });
                            // Clear validation error
                            if (validationErrors.coursetype) {
                              setValidationErrors(prev => ({ ...prev, coursetype: null }));
                            }
                          }}
                          className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                            formData.coursetype === type.value
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                            <span className="text-xs font-medium">
                              {type.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stream Selection */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      Select Stream <span className="text-red-500">*</span>
                    </label>
                    {validationErrors.streamname && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.streamname}</p>
                    )}
                    <select
                      value={(() => {
                        const streamsArray = Array.isArray(streams) ? streams : [];
                        const found = streamsArray.find(s => s.name === formData.streamname);
                        return found?.id || found?._id || "";
                      })()}
                      onChange={handleStreamChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-all bg-white ${
                        validationErrors.streamname 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                          : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      }`}
                      required
                    >
                      <option value="">-- Choose a stream --</option>
                      {loadingStreams ? (
                        <option value="" disabled>Loading streams...</option>
                      ) : Array.isArray(streams) && streams.length > 0 ? (
                        streams.map((stream) => (
                          <option key={stream.id || stream._id} value={stream.id || stream._id}>
                            {stream.name || stream.streamname}  ({stream.superstream?.name || ''}) 
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No streams available</option>
                      )}
                    </select>
                    {formData.streamname && (
                      <p className="text-xs text-indigo-600 mt-1">
                        Selected: {formData.streamname}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      Course Name <span className="text-red-500">*</span>
                    </label>
                    {validationErrors.coursename && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.coursename}</p>
                    )}
                    <input
                      type="text"
                      name="coursename"
                      value={formData.coursename}
                      onChange={handleChange}
                      onKeyDown={handleKeyPress}
                      placeholder="e.g., Full Stack Web Development"
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        validationErrors.coursename 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                          : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Course Description
                  </label>
                  <textarea
                    name="coursedescription"
                    value={formData.coursedescription}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Describe your course..."
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                  />
                </div>

                {/* Teacher Selection - FIXED */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Select Teacher
                  </label>
                  {validationErrors.teacher && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.teacher}</p>
                  )}
                  <select
                    value={formData.teacherId || formData.teacher}
                    onChange={handleTeacherChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white"
                  >
                    <option value="">-- Choose a teacher --</option>
                    {loadingTeachers ? (
                      <option value="" disabled>Loading teachers...</option>
                    ) : Array.isArray(teachers) && teachers.length > 0 ? (
                      teachers.map((teacher) => {
                        const teacherId = getTeacherId(teacher);
                        const teacherName = getTeacherDisplayName(teacher);
                        return (
                          <option key={teacherId} value={teacherId}>
                            {teacherName}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>No teachers available</option>
                    )}
                  </select>
                  {formData.teacher && (
                    <p className="text-xs text-indigo-600 mt-1">
                      Selected Teacher: {formData.teacher}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Content */}
            {activeTab === "content" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Course Features */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                    Course Features
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {features.map((feature) => {
                      const isSelected = currentFeatures.includes(feature.id);

                      return (
                        <button
                          key={feature.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newFeatures = isSelected
                              ? currentFeatures.filter((f) => f !== feature.id)
                              : [...currentFeatures, feature.id];
                            setFormData({
                              ...formData,
                              coursefeatures: JSON.stringify(newFeatures),
                            });
                          }}
                          className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-xl sm:text-2xl mb-1 sm:mb-2">
                              {feature.icon}
                            </span>
                            <span className="text-xs font-medium">
                              {feature.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Intro Video */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Video className="w-4 h-4 text-indigo-600" />
                    Intro Video ID
                  </label>
                  <input
                    type="text"
                    name="introvideoid"
                    value={formData.introvideoid}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    placeholder="e.g., dQw4w9WgXcQ"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                  <p className="text-xs text-gray-500">
                    Enter YouTube video ID (e.g., dQw4w9WgXcQ)
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Syllabus - Units and Chapters */}
            {activeTab === "syllabus" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Unit Management */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Folder className="w-5 h-5 text-indigo-600" />
                      Units
                    </h3>
                    
                    {/* Add Unit */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentUnit}
                        onChange={(e) => setCurrentUnit(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Enter unit name"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      />
                      <button
                        type="button"
                        onClick={addUnit}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!currentUnit.trim()}
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>

                    {/* Units List */}
                    <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto pr-2">
                      {units.map((unit, index) => (
                        <div
                          key={unit.id}
                          className={`border rounded-xl overflow-hidden ${
                            selectedUnitIndex === index
                              ? "border-indigo-500 ring-2 ring-indigo-200"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between p-3 bg-gray-50">
                            <div className="flex items-center gap-2 flex-1">
                              <button
                                type="button"
                                onClick={(e) => toggleUnitExpand(index, e)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {expandedUnits.includes(index) ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                )}
                              </button>
                              <Folder className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-700 truncate">
                                {unit.name}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({unit.chapters.length} chapters)
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => selectUnit(index, e)}
                                className="p-1.5 hover:bg-indigo-100 rounded-lg text-indigo-600"
                                title="Add chapter to this unit"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => removeUnit(index, e)}
                                className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                                title="Delete unit"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Chapters List */}
                          {expandedUnits.includes(index) && (
                            <div className="p-3 bg-white border-t border-gray-100">
                              {unit.chapters.length > 0 ? (
                                <div className="space-y-2">
                                  {unit.chapters.map((chapter, chapterIndex) => (
                                    <div
                                      key={chapter.id}
                                      className="flex items-center justify-between pl-6 pr-2 py-2 bg-gray-50 rounded-lg"
                                    >
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="w-3 h-3 text-purple-600" />
                                        <span className="text-sm text-gray-600">
                                          {chapter.name}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => removeChapter(index, chapterIndex, e)}
                                        className="p-1 hover:bg-red-100 rounded text-red-600"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 text-center py-2">
                                  No chapters yet
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {units.length === 0 && (
                        <p className="text-sm text-gray-500 italic text-center py-8">
                          No units added yet. Add your first unit above.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Chapter Management */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      Chapters
                      {selectedUnitIndex !== null && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          (Adding to: {units[selectedUnitIndex]?.name})
                        </span>
                      )}
                    </h3>

                    {selectedUnitIndex !== null ? (
                      <>
                        {/* Add Chapter */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentChapter}
                            onChange={(e) => setCurrentChapter(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Enter chapter name"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                          />
                          <button
                            type="button"
                            onClick={addChapter}
                            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!currentChapter.trim()}
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        </div>

                        {/* Current Unit's Chapters */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Chapters in {units[selectedUnitIndex]?.name}
                          </h4>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {units[selectedUnitIndex].chapters.map((chapter, idx) => (
                              <div
                                key={chapter.id}
                                className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100"
                              >
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm text-gray-700">
                                    {chapter.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => removeChapter(selectedUnitIndex, idx, e)}
                                  className="p-1 hover:bg-red-100 rounded-lg text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {units[selectedUnitIndex].chapters.length === 0 && (
                              <p className="text-sm text-gray-500 italic text-center py-4">
                                No chapters added to this unit yet
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <Layers className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-500 text-center">
                          Select a unit from the left to add chapters
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview of Complete Syllabus */}
                {units.length > 0 && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Syllabus Preview
                    </h4>
                    <div className="space-y-3">
                      {units.map((unit, idx) => (
                        <div key={unit.id} className="text-sm">
                          <p className="font-medium text-gray-700">
                            {idx + 1}. {unit.name}
                          </p>
                          {unit.chapters.length > 0 && (
                            <ul className="ml-6 mt-1 space-y-1">
                              {unit.chapters.map((chapter, cidx) => (
                                <li key={chapter.id} className="text-gray-600 flex items-start gap-2">
                                  <span className="text-indigo-400">•</span>
                                  <span>{chapter.name}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Pricing */}
            {activeTab === "pricing" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Prices */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-indigo-600" />
                      Strikeout Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="strikeoutprice"
                        value={formData.strikeoutprice}
                        onChange={handleChange}
                        onKeyDown={handleKeyPress}
                        placeholder="19999"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-indigo-600" />
                      Current Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="currentprice"
                        value={formData.currentprice}
                        onChange={handleChange}
                        onKeyDown={handleKeyPress}
                        placeholder="9999"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Product ID */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-600" />
                    Product ID
                  </label>
                  <input
                    type="text"
                    name="productid"
                    value={formData.productid}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    placeholder="PROD12345"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>

                {/* WhatsApp URL */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-indigo-600" />
                    WhatsApp Group URL
                  </label>
                  <input
                    type="url"
                    name="whatsappurl"
                    value={formData.whatsappurl}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>

                {/* Duration */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Course Duration
                    </label>
                    <input
                      type="text"
                      name="courseduration"
                      value={formData.courseduration}
                      onChange={handleChange}
                      onKeyDown={handleKeyPress}
                      placeholder="3 Months"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-indigo-600" />
                      Description Amount
                    </label>
                    <input
                      type="text"
                      name="coursedescriptionamount"
                      value={formData.coursedescriptionamount}
                      onChange={handleChange}
                      onKeyDown={handleKeyPress}
                      placeholder="Amount"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>
                </div>

                {/* Upgrade Options */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Upgrade Duration
                    </label>
                    <input
                      type="text"
                      name="upgradeduration"
                      value={formData.upgradeduration}
                      onChange={handleChange}
                      onKeyDown={handleKeyPress}
                      placeholder="6 Months"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-indigo-600" />
                      Upgrade Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="upgradeprice"
                        value={formData.upgradeprice}
                        onChange={handleChange}
                        onKeyDown={handleKeyPress}
                        placeholder="5000"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Media */}
            {activeTab === "media" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Course Image - REQUIRED */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Image className="w-4 h-4 text-indigo-600" />
                    Course Image <span className="text-red-500">*</span>
                  </label>
                  {validationErrors.courseimage && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.courseimage}</p>
                  )}
                  <div className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-colors ${
                    validationErrors.courseimage 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-indigo-500"
                  }`}>
                    {filePreview.courseimage ? (
                      <div className="relative">
                        <img
                          src={filePreview.courseimage}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile("courseimage")}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm sm:text-base text-gray-600 mb-1">
                          Click to upload course image
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG up to 5MB (Required)
                        </p>
                        <input
                          type="file"
                          name="courseimage"
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* PDF Uploads */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    {
                      name: "timetable",
                      label: "Timetable PDF",
                      icon: Calendar,
                    },
                    {
                      name: "batchinfo",
                      label: "Batch Info PDF",
                      icon: FileText,
                    },
                  ].map((item) => (
                    <div key={item.name} className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-indigo-600" />
                        {item.label}
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors">
                        {files[item.name] ? (
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-600 truncate">
                                {files[item.name].name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(item.name)}
                              className="p-1 hover:bg-red-100 rounded-lg text-red-500 flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Upload PDF</p>
                            <input
                              type="file"
                              name={item.name}
                              onChange={handleFileChange}
                              accept=".pdf"
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publish Checkbox */}
            <div className="flex items-center gap-3 mt-8 p-4 bg-gray-50 rounded-xl">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="publish"
                  checked={formData.publish}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">
                Publish course immediately
              </span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const tabs = ["basic", "content", "syllabus", "pricing", "media"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
                disabled={activeTab === "basic"}
                className={`w-full sm:flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium order-2 sm:order-1 ${
                  activeTab === "basic" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Previous
              </button>

              {activeTab !== "media" ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const tabs = ["basic", "content", "syllabus", "pricing", "media"];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                  className="w-full sm:flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  Next
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Course
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @media (max-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
};

export default AddCourse;