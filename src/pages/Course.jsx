import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import {
  handleCreateFolder,
  handleGetCourse,
  handleGetFolders,
  handleUpdateFolder,
  handleDeleteFolder,
  handleCreateFile,
  handleDeleteFilecontents,
} from "../api/allApi";
import { useApi } from "../context/AppState";
import CourseTable from "../components/CourseTable";
import FolderManagement from "../components/FolderManagement";
import Toast from "../components/ui/Toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

  const { setTestData } = useApi();

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  const fetchCourses = async (page, limit) => {
    try {
      setLoading(true);
      console.log("Fetching courses with page:", page, "limit:", limit);

      const response = await handleGetCourse("regular_course", page, limit);
      console.log("API Response:", response);

      let coursesData = [];
      let totalCount = 0;
      let currentPage = page;
      let totalPages = 1;

      // Handle different response structures
      if (response?.data && Array.isArray(response.data)) {
        coursesData = response.data;
        if (response.pagination) {
          totalCount = response.pagination.total;
          currentPage = response.pagination.page;
          totalPages = response.pagination.totalPages;
        } else {
          // If no pagination info, we need to make another call to get total count
          // For now, assume there might be more pages if we got the full limit
          totalCount = response.data.length === limit ? (page * limit) + 1 : response.data.length;
          totalPages = Math.ceil(totalCount / limit);
        }
      }
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        coursesData = response.data.data;
        if (response.data.pagination) {
          totalCount = response.data.pagination.total;
          currentPage = response.data.pagination.page;
          totalPages = response.data.pagination.totalPages;
        } else {
          totalCount = response.data.data.length === limit ? (page * limit) + 1 : response.data.data.length;
          totalPages = Math.ceil(totalCount / limit);
        }
      }
      else if (response?.pagination) {
        coursesData = response.data || [];
        totalCount = response.pagination.total;
        currentPage = response.pagination.page;
        totalPages = response.pagination.totalPages;
      }
      else if (Array.isArray(response)) {
        coursesData = response;
        totalCount = response.length === limit ? (page * limit) + 1 : response.length;
        totalPages = Math.ceil(totalCount / limit);
      }

      console.log("Setting courses:", coursesData);
      console.log("Total count:", totalCount);
      console.log("Total pages:", totalPages);
      console.log("Current page from API:", currentPage);

      setCourses(coursesData);
      setPagination({
        page: currentPage,
        limit: limit,
        total: totalCount,
        totalPages: totalPages
      });
    } catch (error) {
      console.error("Failed to load courses:", error);
      showToast("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCourses(pagination.page, pagination.limit);
  }, []); // Only run once on mount


  const handlePageChange = (newPage) => {
    console.log("Attempting to change to page:", newPage);
    console.log("Current pagination:", pagination);

    if (newPage >= 1 && newPage <= pagination.totalPages) {
      console.log("Changing to page:", newPage);
      // Update pagination state first
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
      // Then fetch data for the new page
      fetchCourses(newPage, pagination.limit);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      console.log("Invalid page:", newPage);
    }
  };

  const handleLimitChange = (newLimit) => {
    console.log("Changing limit to:", newLimit);
    setPagination(prev => ({
      ...prev,
      page: 1,
      limit: newLimit,
      totalPages: Math.ceil(prev.total / newLimit)
    }));
    // Fetch data with new limit and reset to page 1
    fetchCourses(1, newLimit);
  };

  const fetchFolders = async (parentId) => {
    setContentLoading(true);
    try {
      const res = await handleGetFolders(parentId);

      let foldersArray = [];
      let eventsArray = [];
      let filesArray = [];

      if (res?.folder) {
        if (Array.isArray(res.folder)) {
          foldersArray = res.folder.filter(
            (folder) => folder && folder.id && folder.name,
          );
        } else if (
          res.folder &&
          typeof res.folder === "object" &&
          res.folder.id &&
          res.folder.name
        ) {
          foldersArray = [res.folder];
          if (res.folder.events && Array.isArray(res.folder.events)) {
            eventsArray = res.folder.events;
          }
          if (res.folder.files && Array.isArray(res.folder.files)) {
            filesArray = res.folder.files;
          }
        } else if (res.folder && typeof res.folder === "object") {
          if (res.folder.events && Array.isArray(res.folder.events)) {
            eventsArray = res.folder.events;
          }
          if (res.folder.files && Array.isArray(res.folder.files)) {
            filesArray = res.folder.files;
          }
        }
      }

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
      console.error("Failed to fetch folders:", err);
      setFolders([]);
      setEvents([]);
      setFiles([]);
      setContents([]);
      return [];
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCourse) return;
    const parentId = currentFolder ? currentFolder.id : selectedCourse.id;
    fetchFolders(parentId);
  }, [selectedCourse, currentFolder]);

  const handleCreateFolder = async (formData, parentFolder) => {
    try {
      const form = new FormData();
      form.append("name", formData.name);

      let parentId;
      if (parentFolder) {
        parentId = parentFolder.id;
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
      showToast("Folder created successfully!", "success");
    } catch (error) {
      console.error("Failed to create folder:", error);
      showToast("Failed to create folder", "error");
    }
  };

  const handleEditFolder = async (folder, formData) => {
    try {
      const form = new FormData();
      form.append("name", formData.name);

      if (formData.image) {
        form.append("image", formData.image);
      }

      const res = await handleUpdateFolder(folder.id, form);
      const updatedFolder = res?.data?.data || res?.folder || res;

      setFolders((prev) =>
        prev.map((f) =>
          f.id === folder.id ? { ...f, ...updatedFolder } : f,
        ),
      );
      showToast("Folder updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update folder:", error);
      showToast("Failed to update folder", "error");
    }
  };

  const handleDeleteFolder = async (folder) => {
    try {
      await handleDeleteFolder(folder.id);
      setFolders((prev) => prev.filter((f) => f.id !== folder.id));
      showToast("Folder deleted successfully!", "success");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      showToast("Failed to delete folder", "error");
    }
  };

  const handleCreateContent = async (formData) => {
    try {
      const parentId = currentFolder ? currentFolder.id : selectedCourse.id;
      formData.append("parentId", parentId);

      const response = await handleCreateFile(formData);

      if (response && response.success) {
        await fetchFolders(parentId);
        showToast("Content added successfully!", "success");
      } else {
        showToast(response?.message || "Failed to add content", "error");
      }
    } catch (error) {
      console.error("Failed to add content:", error);
      showToast("Failed to add content", "error");
    }
  };

  const handleDeleteContent = async (item) => {
    try {
      await handleDeleteFilecontents(item.id);
      await fetchFolders(
        currentFolder ? currentFolder.id : selectedCourse.id,
      );
      showToast("Content deleted successfully!", "success");
    } catch (error) {
      console.error("Failed to delete content:", error);
      showToast("Failed to delete content", "error");
    }
  };

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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100  p-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

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

          <CourseTable
            courses={courses}
            onCourseSelect={setSelectedCourse}
            loading={loading}
          />

          {/* Custom Pagination UI */}
          {pagination.totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Page {pagination.page} of {pagination.totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    console.log("Previous button clicked");
                    handlePageChange(pagination.page - 1);
                  }}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                {/* Page number buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pageNum === pagination.page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    console.log("Next button clicked");
                    handlePageChange(pagination.page + 1);
                  }}
                  disabled={pagination.page === pagination.totalPages}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCourse && (
        <FolderManagement
          selectedCourse={selectedCourse}
          currentFolder={currentFolder}
          folderStack={folderStack}
          onBack={handleBack}
          onBreadcrumbClick={handleBreadcrumbClick}
          onOpenFolder={handleOpenFolder}
          onCreateFolder={handleCreateFolder}
          onCreateContent={handleCreateContent}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleDeleteFolder}
          onDeleteContent={handleDeleteContent}
          folders={folders}
          events={events}
          files={files}
          contentLoading={contentLoading}
          setTestData={setTestData}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default Course;