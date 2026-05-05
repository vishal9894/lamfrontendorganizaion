import { useState, useEffect } from 'react';


import { toast } from 'react-toastify';
import DeleteModal from '../components/DeleteModal';



const UserManagement = () => {


  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ROLES.LEARNER,
    organizationRole: ROLES.LEARNER,
    status: 'active',
    password: '',
    confirmPassword: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    if (hasPermission('manage_org_users')) {
      fetchUsers();
    }
  }, [hasPermission, filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await userApiCalls.getOrganizationUsers(params);
      setUsers(response.users || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const userData = {
        ...formData,
        organizationRole: formData.role
      };
      delete userData.confirmPassword;

      await userApiCalls.createOrganizationUser(userData);
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
      toast.success('User created successfully');
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const updateData = {
        ...formData,
        organizationRole: formData.role
      };
      delete updateData.password;
      delete updateData.confirmPassword;

      await userApiCalls.updateUserProfile(selectedUser.id, updateData);
      setShowEditModal(false);
      resetForm();
      fetchUsers();
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      if (!canManageRole(newRole)) {
        toast.error('You cannot assign this role');
        return;
      }

      await userApiCalls.changeUserRole(userId, newRole);
      fetchUsers();
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Failed to change role:', error);
      toast.error(error.message || 'Failed to change role');
    }
  };

  const handleDeactivateUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeactivateUser = async () => {
    if (!selectedUser) return;

    try {
      await userApiCalls.deactivateUser(selectedUser.id);
      fetchUsers();
      toast.success('User deactivated successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      toast.error(error.message || 'Failed to deactivate user');
    }
  };

  const cancelDeactivateUser = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: ROLES.LEARNER,
      organizationRole: ROLES.LEARNER,
      status: 'active',
      password: '',
      confirmPassword: ''
    });
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.organizationRole || user.role,
      organizationRole: user.organizationRole || user.role,
      status: user.status || 'active',
      password: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getAvailableRoles = () => {
    const userRole = localStorage.getItem('userData') ?
      JSON.parse(localStorage.getItem('userData')).role : null;

    switch (userRole) {
      case ROLES.SUPER_ADMIN:
        return Object.values(ROLES);
      case ROLES.ORG_ADMIN:
        return [ROLES.INSTRUCTOR, ROLES.LEARNER];
      case ROLES.INSTRUCTOR:
        return [ROLES.LEARNER];
      default:
        return [];
    }
  };

  if (!hasPermission('manage_org_users')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Access denied. User management permissions required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users and their roles in your organization</p>
        </div>
        {hasPermission('manage_org_users') && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <Select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <SelectItem value="">All Roles</SelectItem>
                {getAvailableRoles().map(role => (
                  <SelectItem key={role} value={role}>
                    {role.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Users ({pagination.total})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const roleBadge = getRoleBadge(user.organizationRole || user.role);
                    return (
                      <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-sm font-medium">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {user.phone && (
                              <div className="flex items-center text-gray-600">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </div>
                            )}
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={roleBadge.className}>
                            {roleBadge.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewModal(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {hasPermission('manage_org_users') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}

                            {canManageRole(user.organizationRole || user.role) && (
                              <Select
                                value={user.organizationRole || user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="w-32"
                              >
                                {getAvailableRoles().map(role => (
                                  <SelectItem key={role} value={role}>
                                    {role.replace('_', ' ').toUpperCase()}
                                  </SelectItem>
                                ))}
                              </Select>
                            )}

                            {hasPermission('manage_org_users') && user.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeactivateUser(user.id)}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page * pagination.limit >= pagination.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New User"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role *</label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                {getAvailableRoles().map(role => (
                  <SelectItem key={role} value={role}>
                    {role.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password *</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>
              Create User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit User"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role *</label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                {getAvailableRoles().map(role => (
                  <SelectItem key={role} value={role}>
                    {role.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Update User
            </Button>
          </div>
        </div>
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-medium">
                  {selectedUser.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <Badge
                  className={getRoleBadge(selectedUser.organizationRole || selectedUser.role).className}
                >
                  {getRoleBadge(selectedUser.organizationRole || selectedUser.role).label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedUser.email}
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedUser.phone}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-gray-400" />
                    Role: {getRoleBadge(selectedUser.organizationRole || selectedUser.role).label}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                    Status: <Badge variant={selectedUser.status === 'active' ? 'success' : 'secondary'} className="ml-2">
                      {selectedUser.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={cancelDeactivateUser}
        onConfirm={confirmDeactivateUser}
        title="Deactivate User"
        message={`Are you sure you want to deactivate "${selectedUser?.name}"? This action can be reversed later.`}
        itemName={selectedUser?.name}
        confirmText="Deactivate"
        cancelText="Cancel"
        size="md"
      />
    </div>
  );
};

export default UserManagement;
