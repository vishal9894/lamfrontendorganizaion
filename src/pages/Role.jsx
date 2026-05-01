import { useState, useEffect } from "react";
import { useRoles, useCreateRole, useUpdateRolePermissions, useDeleteRole } from "../hooks/useOptimizedApi";
import { handleGetRoleById } from "../api/allApi";
import { PAGINATION_CONFIG } from "../utils/pagination";
import {
  FiEdit2,
  FiPlus,
  FiSave,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import PermissionsUI from "../components/PermissionsUI";

const Role = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.ROLES.default);
  const [searchTerm, setSearchTerm] = useState('');

  // Use optimized hooks with pagination
  const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles } = useRoles(
    currentPage,
    pageSize,
    { search: searchTerm },
    { enabled: true }
  );

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRolePermissions();
  const deleteRoleMutation = useDeleteRole();

  const roles = rolesData?.data || [];
  const pagination = rolesData?.pagination || { totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const totalRoles = rolesData?.total || 0;
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);

  // Create role form states
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [creating, setCreating] = useState(false);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loadingRolePermissions, setLoadingRolePermissions] = useState(false);

  useEffect(() => {
    refetchRoles();
  }, [currentPage, pageSize, searchTerm]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Refresh data after mutations
  const refreshData = () => {
    refetchRoles();
  };

  const fetchRolePermissions = async (id) => {
    try {
      setLoadingRolePermissions(true);
      const response = await handleGetRoleById(id);

      let permissionIds = [];

      if (response.permissions && Array.isArray(response.permissions)) {
        permissionIds = response.permissions.map((permission) => permission.id);
      } else if (
        response.data &&
        response.data.permissions &&
        Array.isArray(response.data.permissions)
      ) {
        permissionIds = response.data.permissions.map(
          (permission) => permission.id,
        );
      } else if (Array.isArray(response)) {
        permissionIds = response.map((permission) => permission.id);
      }

      setRolePermissions(permissionIds);
      setSelectedPermissions(permissionIds);
    } catch (error) {
      setRolePermissions([]);
      setSelectedPermissions([]);
    } finally {
      setLoadingRolePermissions(false);
    }
  };

  const handleEditRole = async (role) => {
    setSelectedRole(role);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description || "");

    // Reset permissions before fetching
    setRolePermissions([]);
    setSelectedPermissions([]);

    // Fetch role permissions before opening modal
    await fetchRolePermissions(role.id);

    setShowCreateRoleModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateRoleModal(false);
    setSelectedRole(null);
    setNewRoleName("");
    setNewRoleDescription("");
    setSelectedPermissions([]);
    setRolePermissions([]);
  };

  const handleSaveRole = async () => {
    // Validate role name
    if (!newRoleName.trim()) {
      alert("Please enter a role name");
      return;
    }

    // Validate that at least one permission is selected
    if (!selectedPermissions || selectedPermissions.length === 0) {
      alert("Please select at least one permission for the role");
      return;
    }

    setCreating(true);
    try {
      let response;

      if (selectedRole) {
        response = await updateRoleMutation.mutateAsync({
          id: selectedRole.id,
          name: newRoleName,
          description: newRoleDescription,
          permissions: selectedPermissions,
        });
      } else {
        response = await createRoleMutation.mutateAsync({
          name: newRoleName,
          description: newRoleDescription,
          permissions: selectedPermissions,
        });
      }

      if (
        response &&
        (response.success ||
          response.message === "Role created successfully" ||
          response.message === "Role updated successfully")
      ) {
        handleCloseCreateModal();
        refreshData();
        alert(
          selectedRole
            ? "Role updated successfully"
            : "Role created successfully",
        );
      } else {
        const errorMsg = response?.message || "Failed to save role";
        alert(Array.isArray(errorMsg) ? errorMsg.join("\n") : errorMsg);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      alert(
        Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage,
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRoleMutation.mutateAsync(roleId);
        refreshData();
      } catch (error) {
        alert("Failed to delete role");
      }
    }
  };

  const getRoleColor = (roleName) => {
    const colors = {
      superAdmin: "bg-purple-100 text-purple-800",
      admin: "bg-blue-100 text-blue-800",
      teacher: "bg-green-100 text-green-800",
      contentManager: "bg-orange-100 text-orange-800",
      contentResearchAnalyst: "bg-cyan-100 text-cyan-800",
      questionUploader: "bg-pink-100 text-pink-800",
    };
    return colors[roleName] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Role Management
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <FiShield className="w-4 h-4" />
                  Create and manage roles with permissions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateRoleModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2 text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Create New Role
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Roles Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Roles
            </h2>
          </div>

          {rolesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-20">
              <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FiShield className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No roles found
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Click "Create New Role" to add your first role
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {roles.map((role) => (
                    <tr
                      key={role.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role.name)} mr-3`}
                          >
                            {role.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {role.description || "No description"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                          {role.permissionCount || 0} permissions
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <FiUsers className="w-4 h-4" />
                          {role.user_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Role"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          {!role.is_default && (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Role"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <div>Total Roles: {roles.length}</div>
          <div className="flex items-center gap-2">
            <FiShield className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseCreateModal}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedRole ? "Edit Role" : "Create New Role"}
                </h3>
                <button
                  onClick={handleCloseCreateModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Basic Info */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 mb-6 border border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FiShield className="w-4 h-4 text-indigo-600" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Content Manager"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Brief description of the role"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FiShield className="w-4 h-4 text-indigo-600" />
                    Select Permissions
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {selectedRole
                      ? "Current permissions for this role are checked below. Modify as needed."
                      : "Choose the permissions you want to assign to this role"}
                  </p>

                  {loadingRolePermissions ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <PermissionsUI
                      isModal={false}
                      selectedPermissions={selectedPermissions}
                      onPermissionChange={setSelectedPermissions}
                    />
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCloseCreateModal}
                    className="px-5 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRole}
                    disabled={creating || loadingRolePermissions}
                    className="px-5 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        {selectedRole ? "Update Role" : "Create Role"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Role;
