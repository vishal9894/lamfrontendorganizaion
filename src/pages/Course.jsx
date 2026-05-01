import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  handleCreateFolder,
  handleGetCourse,
  handleGetFolders,
  handleUpdateFolder,
  handleDeleteFolder,
  handleCreateFile,
  handleDeleteFilecontents,
} from "../api/allApi";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import React from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import AddContentCourse from "../components/AddContentCourse";
import { useApi } from "../context/AppState";

// Add a simple toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slideDown
      ${type === "success"
          ? "bg-green-50 text-green-800 border-l-4 border-green-500"
          : type === "error"
            ? "bg-red-50 text-red-800 border-l-4 border-red-500"
            : "bg-blue-50 text-blue-800 border-l-4 border-blue-500"
        }`}
    >
      <span className="text-xl">
        {type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}
      </span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        ✕
      </button>
    </div>
  );
};

const Course = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [folders, setFolders] = useState([]);
  const [events, setEvents] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderStack, setFolderStack] = useState([]);
  const [contents, setContents] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [modalParentFolder, setModalParentFolder] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);

  // Material-UI dropdown states
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openFileModal, setOpenFileModal] = useState(false);

  const { setTestData } = useApi();

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  // Styled MenuItem for better visual
  const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    padding: "10px 16px",
    fontSize: "0.875rem",
    gap: "12px",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
    "&.Mui-focusVisible": {
      backgroundColor: "#e5e7eb",
    },
  }));

  // ✅ LOAD COURSES
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await handleGetCourse("regular_course");

        let coursesData = [];
        if (response?.data?.course && Array.isArray(response.data.course)) {
          coursesData = response.data.course;
        } else if (response?.data && Array.isArray(response.data)) {
          coursesData = response.data;
        } else if (Array.isArray(response)) {
          coursesData = response;
        }

        setCourses(coursesData);
      } catch (error) {
        console.error(error);
        showToast("Failed to load courses", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Alternative cleaner solution
  const fetchFolders = async (parentId) => {
    setContentLoading(true);
    try {
      const res = await handleGetFolders(parentId);


      let foldersArray = [];
      let eventsArray = [];
      let filesArray = [];

      // Check if folder exists and is a valid folder (has an id and name)
      if (res?.folder) {
        // Case 1: Folder is an array
        if (Array.isArray(res.folder)) {
          // Filter out any invalid folder entries
          foldersArray = res.folder.filter(
            (folder) => folder && folder.id && folder.name,
          );
        }
        // Case 2: Folder is an object and has required properties (valid folder)
        else if (
          res.folder &&
          typeof res.folder === "object" &&
          res.folder.id &&
          res.folder.name
        ) {
          foldersArray = [res.folder];
          // Get nested content
          if (res.folder.events && Array.isArray(res.folder.events)) {
            eventsArray = res.folder.events;
          }
          if (res.folder.files && Array.isArray(res.folder.files)) {
            filesArray = res.folder.files;
          }
        }
        // Case 3: Folder object without id/name - just extract events and files
        else if (res.folder && typeof res.folder === "object") {
          // This is your case - extract events and files only
          if (res.folder.events && Array.isArray(res.folder.events)) {
            eventsArray = res.folder.events;
          }
          if (res.folder.files && Array.isArray(res.folder.files)) {
            filesArray = res.folder.files;
          }
        }
      }

      // Also check for separate arrays in response
      if (res?.events && Array.isArray(res.events)) {
        eventsArray = [...eventsArray, ...res.events];
      }

      if (res?.files && Array.isArray(res.files)) {
        filesArray = [...filesArray, ...res.files];
      }

      if (res?.data?.fileContents && Array.isArray(res.data.fileContents)) {
        setContents(res.data.fileContents);
      }

      setFolders(foldersArray);
      setEvents(eventsArray);
      setFiles(filesArray);

      return foldersArray;
    } catch (err) {
      console.error("Error fetching folders:", err);
      setFolders([]);
      setEvents([]);
      setFiles([]);
      setContents([]);
      return [];
    } finally {
      setContentLoading(false);
    }
  };

  // Load folders when course or current folder changes
  useEffect(() => {
    if (!selectedCourse) return;
    const parentId = currentFolder ? currentFolder.id : selectedCourse.id;
    fetchFolders(parentId);
  }, [selectedCourse, currentFolder]);

  // ✅ CREATE FOLDER
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast("Please enter a folder name", "error");
      return;
    }

    try {
      const form = new FormData();
      form.append("name", formData.name);

      let parentId;
      if (modalParentFolder) {
        parentId = modalParentFolder.id;
      } else if (currentFolder) {
        parentId = currentFolder.id;
      } else {
        parentId = selectedCourse.id;
      }

      form.append("parentId", parentId);

      if (formData.image) {
        form.append("image", formData.image);
      }

      const res = await handleCreateFolder(form);

      const newFolder = res?.data?.data || res?.folder || res;

      setFolders((prev) => [...prev, newFolder]);
      setOpenModal(false);
      setModalParentFolder(null);
      setFormData({ name: "", image: null });
      showToast("Folder created successfully!", "success");
    } catch (error) {
      console.error("Error creating folder:", error);
      showToast("Failed to create folder", "error");
    }
  };

  // ✅ UPDATE FOLDER
  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      showToast("Please enter a folder name", "error");
      return;
    }

    try {
      const form = new FormData();
      form.append("name", formData.name);

      if (formData.image) {
        form.append("image", formData.image);
      }

      const res = await handleUpdateFolder(editingFolder.id, form);

      const updatedFolder = res?.data?.data || res?.folder || res;

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === editingFolder.id
            ? { ...folder, ...updatedFolder }
            : folder,
        ),
      );

      setOpenModal(false);
      setEditingFolder(null);
      setModalParentFolder(null);
      setFormData({ name: "", image: null });

    } catch (error) {
      console.error("Error updating folder:", error);
      showToast("Failed to update folder", "error");
    }
  };

  // ✅ DELETE FOLDER
  const handleDelete = async (folder) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${folder.name}"? This will also delete all subfolders and files inside it.`,
      )
    ) {
      try {
        await handleDeleteFolder(folder.id);
        setFolders((prev) => prev.filter((f) => f.id !== folder.id));
        handleDropdownClose();
        showToast("Folder deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting folder:", error);
        showToast("Failed to delete folder", "error");
      }
    }
  };

  // ✅ OPEN EDIT MODAL
  const handleEditClick = (folder) => {
    setEditingFolder(folder);
    setFormData({ name: folder.name, image: null });
    setOpenModal(true);
    handleDropdownClose();
  };

  // ✅ HANDLE CREATE CONTENT (File/Event)
  const handleCreateFileSubmit = async (formData) => {
    try {
      const parentId = currentFolder ? currentFolder.id : selectedCourse.id;
      formData.append("parentId", parentId);

      const response = await handleCreateFile(formData);

      if (response && response.success) {
        setOpenFileModal(false);
        await fetchFolders(parentId);
        showToast("Content added successfully!", "success");
      } else {
        showToast(response?.message || "Failed to add content", "error");
      }
    } catch (error) {
      console.error("Error creating file:", error);
      showToast("Failed to add content", "error");
    }
  };

  // ✅ DELETE CONTENT (File/Event)
  const handleDeleteContent = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await handleDeleteFilecontents(item.id);
        await fetchFolders(
          currentFolder ? currentFolder.id : selectedCourse.id,
        );
        handleDropdownClose();
        showToast("Content deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting content:", error);
        showToast("Failed to delete content", "error");
      }
    }
  };

  // 🔥 DROPDOWN HANDLERS
  const handleDropdownOpen = (event, itemId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setOpenDropdownId(openDropdownId === itemId ? null : itemId);
  };

  const handleDropdownClose = () => {
    setOpenDropdownId(null);
    setAnchorEl(null);
  };

  // 🔥 NAVIGATION
  const handleOpenFolder = async (folder) => {
    setFolderStack((prev) => [...prev, currentFolder]);
    setCurrentFolder(folder);
    await fetchFolders(folder.id);
  };

  const handleBack = () => {
    if (folderStack.length > 0) {
      const newStack = [...folderStack];
      const previousFolder = newStack.pop();
      setCurrentFolder(previousFolder || null);
      setFolderStack(newStack);

      if (previousFolder) {
        fetchFolders(previousFolder.id);
      } else {
        fetchFolders(selectedCourse.id);
      }
    } else {
      setCurrentFolder(null);
      setSelectedCourse(null);
      setFolderStack([]);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setCurrentFolder(null);
      setFolderStack([]);
      fetchFolders(selectedCourse.id);
    } else {
      const newStack = folderStack.slice(0, index);
      const targetFolder = newStack[newStack.length - 1] || null;
      setFolderStack(newStack);
      setCurrentFolder(targetFolder);

      if (targetFolder) {
        fetchFolders(targetFolder.id);
      } else {
        fetchFolders(selectedCourse.id);
      }
    }
  };

  const handleOpenCreateModal = (parentFolder = null) => {
    setEditingFolder(null);
    setModalParentFolder(parentFolder);
    setFormData({ name: "", image: null });
    setOpenModal(true);
  };

  const getCurrentPath = () => {
    if (!selectedCourse) return "";
    let path = selectedCourse.title;
    if (folderStack.length > 0) {
      path += " / " + folderStack.map((f) => f?.name).join(" / ");
    }
    if (currentFolder) {
      path += " / " + currentFolder.name;
    }
    return path;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get icon and color based on content type
  const getContentTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "video":
        return {
          icon: "🎥",
          color: "from-red-400 to-red-600",
          bg: "bg-red-100",
        };
      case "test":
      case "quiz":
        return {
          icon: "📝",
          color: "from-green-400 to-green-600",
          bg: "bg-green-100",
        };
      case "pdf":
      case "document":
        return {
          icon: "📄",
          color: "from-blue-400 to-blue-600",
          bg: "bg-blue-100",
        };
      case "audio":
        return {
          icon: "🎵",
          color: "from-purple-400 to-purple-600",
          bg: "bg-purple-100",
        };
      default:
        return {
          icon: "📎",
          color: "from-gray-400 to-gray-600",
          bg: "bg-gray-100",
        };
    }
  };

  // Render content item row (for both events and files)
  const renderContentItem = (item, type) => {
    const { icon, color, bg } = getContentTypeIcon(
      item.type || item.contentType,
    );

    return (
      <tr
        key={`${type}-${item.id}`}
        className="hover:bg-blue-50/50 transition-all duration-200 group"
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center justify-center">
            {item.image || item.thumbnail ? (
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border group-hover:scale-110 transition-transform duration-200">
                <img
                  src={item.image || item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-lg shadow-md group-hover:scale-110 transition-transform duration-200`}
              >
                {icon}
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-900">{item.name}</div>
          {item.description && (
            <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
              📝 {item.description}
            </div>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="space-y-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} text-gray-700`}
            >
              {(item.type || item.contentType)?.toUpperCase() || "CONTENT"}
            </span>
            {item.accessType && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${item.accessType === "free"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
                  }`}
              >
                {item.accessType}
              </span>
            )}
          </div>
          {item.videoLink && (
            <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
              🔗 {item.videoLink}
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-600">
            {formatDate(item.createdAt)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <button
              onClick={(e) => handleDropdownOpen(e, item.id)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <HiOutlineDotsVertical className="w-5 h-5" />
            </button>

            <Popper
              open={openDropdownId === item.id}
              anchorEl={anchorEl}
              placement="bottom-start"
              transition
              disablePortal={false}
              modifiers={[
                {
                  name: "flip",
                  enabled: true,
                  options: {
                    altBoundary: true,
                    rootBoundary: "viewport",
                    padding: 8,
                  },
                },
                {
                  name: "preventOverflow",
                  enabled: true,
                  options: {
                    altAxis: true,
                    boundary: "viewport",
                    padding: 8,
                  },
                },
              ]}
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom-start" ? "left top" : "left bottom",
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      minWidth: 180,
                      borderRadius: "8px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    }}
                  >
                    <ClickAwayListener onClickAway={handleDropdownClose}>
                      <MenuList autoFocusItem={openDropdownId === item.id}>
                        {item.type === "test" && (
                          <>
                            <StyledMenuItem
                              onClick={() => {
                                window.open(
                                  `/manage-view-questions/${item.id}/${encodeURIComponent(item.name)}`,
                                  "_blank",
                                );

                                handleDropdownClose();
                              }}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                              </svg>
                              View Questions
                            </StyledMenuItem>
                            <StyledMenuItem
                              onClick={() => {
                                navigate(
                                  `/manage-questions/${item.id}/${encodeURIComponent(item.name)}`,
                                  "_blank",
                                );
                                handleDropdownClose();
                                setTestData(item);
                              }}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Add Questions
                            </StyledMenuItem>
                          </>
                        )}
                        <StyledMenuItem
                          onClick={() => {
                            handleDropdownClose();
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit Content
                        </StyledMenuItem>
                        <StyledMenuItem
                          onClick={() => handleDeleteContent(item)}
                          sx={{ color: "#dc2626" }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete Content
                        </StyledMenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </div>
        </td>
      </tr>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 ">
     

      
      {!selectedCourse && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Courses
            </h1>
            <p className="text-gray-500 mt-2">
              Select a course to view its folders and content
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className="hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {course.courseImage ? (
                              <img
                                src={course.courseImage}
                                alt={course.title}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div>{course.title?.charAt(0) || "C"}</div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition">
                              {course.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {course.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{course.currentPrice?.toLocaleString() || "0"}
                        </div>
                        {course.originalPrice && (
                          <div className="text-xs text-gray-400 line-through">
                            ₹{course.originalPrice?.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm transition ${course.status
                            ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                            : "bg-red-100 text-red-700 ring-1 ring-red-300"
                            }`}
                        >
                          {course.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition">
                          View Content →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= NESTED FOLDERS & CONTENT VIEW ================= */}
      {selectedCourse && (
        <div>
          {/* HEADER */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
            >
              ← {folderStack.length > 0 ? "Back" : "Back to Courses"}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm overflow-x-auto pb-1">
                <button
                  onClick={() => handleBreadcrumbClick(-1)}
                  className="text-gray-500 hover:text-blue-600 transition font-medium whitespace-nowrap"
                >
                  {selectedCourse.title}
                </button>
                {folderStack.map((folder, idx) => (
                  <React.Fragment key={folder?.id}>
                    <span className="text-gray-400">›</span>
                    <button
                      onClick={() => handleBreadcrumbClick(idx + 1)}
                      className="text-gray-500 hover:text-blue-600 transition font-medium whitespace-nowrap"
                    >
                      {folder?.name}
                    </button>
                  </React.Fragment>
                ))}
                {currentFolder && (
                  <>
                    <span className="text-gray-400">›</span>
                    <span className="text-blue-600 font-semibold whitespace-nowrap">
                      {currentFolder.name}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">
                  📍 {getCurrentPath()}
                </span>
                {folderStack.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Level {folderStack.length + 1}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleOpenCreateModal(currentFolder)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg transition shadow-md flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                {currentFolder ? "Create Subfolder" : "Add Folder"}
              </button>
              <button
                onClick={() => setOpenFileModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg transition shadow-md flex items-center gap-2"
              >
                <span className="text-xl">+</span> Add Content
              </button>
            </div>
          </div>

          {/* Content Table with Folders, Events, and Files */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {contentLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading content...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Folders Section */}
                    {folders.map((folder) => (
                      <tr
                        key={`folder-${folder.id}`}
                        className="hover:bg-yellow-50/50 transition-all duration-200 group cursor-pointer"
                        onClick={() => handleOpenFolder(folder)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {folder.image ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border group-hover:scale-110 transition-transform duration-200">
                                <img
                                  src={folder.image}
                                  alt={folder.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-lg shadow-md group-hover:scale-110 transition-transform duration-200">
                                📁
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {folder.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {folder.id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Folder
                          </span>
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {getCurrentPath()} / {folder.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(folder.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleDropdownOpen(e, folder.id)}
                              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                              <HiOutlineDotsVertical className="w-5 h-5" />
                            </button>

                            <Popper
                              open={openDropdownId === folder.id}
                              anchorEl={anchorEl}
                              placement="bottom-start"
                              transition
                              disablePortal={false}
                              modifiers={[
                                {
                                  name: "flip",
                                  enabled: true,
                                  options: {
                                    altBoundary: true,
                                    rootBoundary: "viewport",
                                    padding: 8,
                                  },
                                },
                                {
                                  name: "preventOverflow",
                                  enabled: true,
                                  options: {
                                    altAxis: true,
                                    boundary: "viewport",
                                    padding: 8,
                                  },
                                },
                              ]}
                            >
                              {({ TransitionProps, placement }) => (
                                <Grow
                                  {...TransitionProps}
                                  style={{
                                    transformOrigin:
                                      placement === "bottom-start"
                                        ? "left top"
                                        : "left bottom",
                                  }}
                                >
                                  <Paper
                                    elevation={3}
                                    sx={{
                                      minWidth: 180,
                                      borderRadius: "8px",
                                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                    }}
                                  >
                                    <ClickAwayListener
                                      onClickAway={handleDropdownClose}
                                    >
                                      <MenuList
                                        autoFocusItem={
                                          openDropdownId === folder.id
                                        }
                                      >
                                        <StyledMenuItem
                                          onClick={() =>
                                            handleEditClick(folder)
                                          }
                                        >
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                          </svg>
                                          Edit Folder
                                        </StyledMenuItem>
                                        <StyledMenuItem
                                          onClick={() => handleDelete(folder)}
                                          sx={{ color: "#dc2626" }}
                                        >
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                          </svg>
                                          Delete Folder
                                        </StyledMenuItem>
                                      </MenuList>
                                    </ClickAwayListener>
                                  </Paper>
                                </Grow>
                              )}
                            </Popper>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Events Section */}
                    {events.map((event) => renderContentItem(event, "event"))}

                    {/* Files Section */}
                    {files.map((file) => renderContentItem(file, "file"))}
                  </tbody>
                </table>
              </div>
            )}

            {!contentLoading &&
              folders.length === 0 &&
              events.length === 0 &&
              files.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-gray-300 text-6xl mb-4">
                    {currentFolder ? "📂" : "📁"}
                  </div>
                  <p className="text-gray-500 mb-2">
                    {currentFolder
                      ? `No content in "${currentFolder.name}"`
                      : `No content in "${selectedCourse.title}"`}
                  </p>
                  <div className="flex gap-4 justify-center mt-4">
                    <button
                      onClick={() => handleOpenCreateModal(currentFolder)}
                      className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                    >
                      <span>+</span> Create your first{" "}
                      {currentFolder ? "subfolder" : "folder"} →
                    </button>
                    <button
                      onClick={() => setOpenFileModal(true)}
                      className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-2"
                    >
                      <span>+</span> Add your first content →
                    </button>
                  </div>
                </div>
              )}
          </div>

          {(folders.length > 0 || events.length > 0 || files.length > 0) && (
            <div className="mt-4 text-center text-xs text-gray-400">
              💡 Tip: Click on folders to navigate inside. Use the ⋮ menu to
              edit or delete items.
            </div>
          )}
        </div>
      )}

      {/* Add Content Modal */}
      {openFileModal && (
        <AddContentCourse
          onClose={() => setOpenFileModal(false)}
          onSubmit={handleCreateFileSubmit}
          parentId={currentFolder ? currentFolder.id : selectedCourse?.id}
        />
      )}

      {/* ================= CREATE/EDIT MODAL ================= */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">
                {editingFolder
                  ? "Edit Folder"
                  : modalParentFolder
                    ? "Create Subfolder"
                    : "Create New Folder"}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Location:{" "}
                {editingFolder
                  ? getCurrentPath()
                  : modalParentFolder
                    ? `${getCurrentPath()} / ${modalParentFolder.name}`
                    : getCurrentPath()}
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter folder name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingFolder
                    ? "Change Icon (Optional)"
                    : "Folder Icon (Optional)"}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition cursor-pointer">
                  {editingFolder && editingFolder.image && !formData.image && (
                    <div className="mb-2 flex items-center gap-2">
                      <img
                        src={editingFolder.image}
                        alt="Current"
                        className="w-8 h-8 rounded"
                      />
                      <span className="text-xs text-gray-500">
                        Current icon
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.files[0] })
                    }
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Recommended: 64x64px PNG or JPG
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setOpenModal(false);
                    setModalParentFolder(null);
                    setEditingFolder(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={editingFolder ? handleUpdate : handleSubmit}
                  disabled={!formData.name.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingFolder
                    ? "Update Folder"
                    : modalParentFolder
                      ? "Create Subfolder"
                      : "Create Folder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;
