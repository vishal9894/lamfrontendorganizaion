import { useState, useEffect } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import AddContentCourse from "./AddContentCourse";
import Toast from "./ui/Toast";
import { calculatePagination, generatePageNumbers, PAGINATION_CONFIG } from "../utils/pagination";

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

const FolderManagement = ({
  selectedCourse,
  currentFolder,
  folderStack,
  onBack,
  onBreadcrumbClick,
  onOpenFolder,
  onCreateFolder,
  onCreateContent,
  onEditFolder,
  onDeleteFolder,
  onDeleteContent,
  folders,
  events,
  files,
  contentLoading,
  setTestData,
  navigate,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [modalParentFolder, setModalParentFolder] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({ name: "", image: null });

  // Pagination for combined content
  const [contentPagination, setContentPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Combine all items into a single array with type indicator
  const allItems = [
    ...folders.map(item => ({ ...item, itemType: 'folder' })),
    ...events.map(item => ({ ...item, itemType: 'event' })),
    ...files.map(item => ({ ...item, itemType: 'file' }))
  ];

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  const handleDropdownOpen = (event, itemId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setOpenDropdownId(openDropdownId === itemId ? null : itemId);
  };

  const handleDropdownClose = () => {
    setOpenDropdownId(null);
    setAnchorEl(null);
  };

  // Update pagination when items change
  useEffect(() => {
    const total = allItems.length;
    const totalPages = Math.ceil(total / contentPagination.limit) || 1;

    setContentPagination(prev => ({
      ...prev,
      total: total,
      totalPages: totalPages,
      // Reset to page 1 if current page is beyond total pages
      page: prev.page > totalPages ? 1 : prev.page
    }));
  }, [allItems.length, contentPagination.limit]);

  // Combined content pagination handlers
  const { startIndex, endIndex } = calculatePagination(
    contentPagination.total,
    contentPagination.page,
    contentPagination.limit
  );
  const { pages, showFirst, showLast, showStartEllipsis, showEndEllipsis } =
    generatePageNumbers(contentPagination.page, contentPagination.totalPages, 5);

  const paginatedItems = allItems.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setContentPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit) => {
    setContentPagination((prev) => ({
      ...prev,
      page: 1,
      limit: newLimit,
      totalPages: Math.ceil(prev.total / newLimit)
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenCreateModal = (parentFolder = null) => {
    setEditingFolder(null);
    setModalParentFolder(parentFolder);
    setFormData({ name: "", image: null });
    setOpenModal(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast("Please enter a folder name", "error");
      return;
    }
    await onCreateFolder(formData, modalParentFolder);
    setOpenModal(false);
    setModalParentFolder(null);
    setFormData({ name: "", image: null });
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      showToast("Please enter a folder name", "error");
      return;
    }
    await onEditFolder(editingFolder, formData);
    setOpenModal(false);
    setEditingFolder(null);
    setModalParentFolder(null);
    setFormData({ name: "", image: null });
  };

  const handleEditClick = (folder) => {
    setEditingFolder(folder);
    setFormData({ name: folder.name, image: null });
    setOpenModal(true);
    handleDropdownClose();
  };

  const handleDelete = async (folder) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${folder.name}"? This will also delete all subfolders and files inside it.`
      )
    ) {
      await onDeleteFolder(folder);
      handleDropdownClose();
    }
  };

  const handleDeleteContent = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      await onDeleteContent(item);
      handleDropdownClose();
    }
  };

  const handleCreateFileSubmit = async (formData) => {
    await onCreateContent(formData);
    setOpenFileModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getContentTypeIcon = (type, itemType) => {
    if (itemType === 'folder') {
      return {
        icon: "📁",
        color: "from-blue-400 to-purple-600",
        bg: "bg-blue-100",
      };
    }

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

  const renderCombinedItem = (item) => {
    const { icon, color, bg } = getContentTypeIcon(
      item.type || item.contentType,
      item.itemType
    );

    const handleItemClick = () => {
      if (item.itemType === 'folder') {
        onOpenFolder(item);
      }
    };

    return (
      <tr
        key={`${item.itemType}-${item.id}`}
        onClick={handleItemClick}
        className={`hover:bg-blue-50 transition-all duration-200 group ${item.itemType === 'folder' ? 'cursor-pointer' : ''
          }`}
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
          {item.itemType === 'folder' && (
            <div className="text-xs text-gray-500 mt-1">
              {item.events?.length || 0} events, {item.files?.length || 0} files
            </div>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="space-y-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} text-gray-700`}
            >
              {item.itemType === 'folder' ? 'FOLDER' : (item.type || item.contentType)?.toUpperCase() || 'CONTENT'}
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
          <div className="text-sm text-gray-600">{formatDate(item.createdAt)}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div onClick={(e) => e.stopPropagation()}>
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
                    <ClickAwayListener onClickAway={handleDropdownClose}>
                      <MenuList autoFocusItem={openDropdownId === item.id}>
                        {item.itemType === 'folder' ? (
                          <>
                            <StyledMenuItem onClick={() => handleEditClick(item)}>
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
                              onClick={() => handleDelete(item)}
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
                          </>
                        ) : (
                          <>
                            {item.type === "test" && (
                              <>
                                <StyledMenuItem
                                  onClick={() => {
                                    window.open(
                                      `/manage-view-questions/${item.id}/${encodeURIComponent(
                                        item.name
                                      )}`,
                                      "_blank"
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
                                      `/manage-questions/${item.id}/${encodeURIComponent(
                                        item.name
                                      )}`,
                                      "_blank"
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
                          </>
                        )}
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

  return (
    <div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
        >
          ← {folderStack.length > 0 ? "Back" : "Back to Courses"}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm overflow-x-auto pb-1">
            <button
              onClick={() => onBreadcrumbClick(-1)}
              className="text-gray-500 hover:text-blue-600 transition font-medium whitespace-nowrap"
            >
              {selectedCourse.title}
            </button>
            {folderStack.map((folder, idx) => (
              <div key={folder?.id}>
                <span className="text-gray-400">›</span>
                <button
                  onClick={() => onBreadcrumbClick(idx + 1)}
                  className="text-gray-500 hover:text-blue-600 transition font-medium whitespace-nowrap"
                >
                  {folder?.name}
                </button>
              </div>
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
            <span className="text-xs text-gray-400">📍 {getCurrentPath()}</span>
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
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-lg transition shadow-md flex items-center gap-2"
          >
            <span className="text-xl">📄</span>
            Add Content
          </button>
        </div>
      </div>

      {/* Combined Content Table */}
      {allItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
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
                {paginatedItems.map((item) => renderCombinedItem(item))}
              </tbody>
            </table>
          </div>

          {/* Custom Pagination UI */}
          {contentPagination.totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Page {contentPagination.page} of {contentPagination.totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(contentPagination.page - 1)}
                  disabled={contentPagination.page === 1}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {/* Page number buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: contentPagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pageNum === contentPagination.page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(contentPagination.page + 1)}
                  disabled={contentPagination.page === contentPagination.totalPages}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!contentLoading && allItems.length === 0 && (
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

      {contentLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Create/Edit Folder Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingFolder ? "Edit Folder" : "Create New Folder"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter folder name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files[0] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setOpenModal(false);
                  setEditingFolder(null);
                  setFormData({ name: "", image: null });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={editingFolder ? handleUpdate : handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingFolder ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {openFileModal && (
        <AddContentCourse
          onClose={() => setOpenFileModal(false)}
          onSubmit={handleCreateFileSubmit}
        />
      )}
    </div>
  );
};

export default FolderManagement;
