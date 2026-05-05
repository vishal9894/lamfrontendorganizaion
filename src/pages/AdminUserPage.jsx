import { useEffect, useState } from 'react';
import {
  handleCreateAdmin,
  handleDeleteAdminAccount,
  handleGetAllAdmin,
  handleGetAllRoles,
  handleUpdateAdmin,
} from '../api/allApi';
import { FiCheckCircle, FiEdit2, FiMail, FiPhone, FiPlus, FiSave, FiShield, FiTrash2, FiUpload, FiUser, FiUsers, FiX, FiXCircle } from 'react-icons/fi';
import Toast from '../components/ui/Toast';

const AdminUserPage = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ================= FORM STATES ================= */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [status, setStatus] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchAllAdmins();
    fetchAllRoles();
  }, []);

  const fetchAllAdmins = async () => {
    try {
      setLoading(true);
      const res = await handleGetAllAdmin();

      let adminData = [];
      if (res?.admins && Array.isArray(res.admins)) {
        adminData = res.admins;
      } else if (res?.data && Array.isArray(res.data)) {
        adminData = res.data;
      } else if (Array.isArray(res)) {
        adminData = res;
      }

      const formattedAdmins = adminData.map(admin => ({
        id: admin.id,
        name: admin.name || '',
        email: admin.email || '',
        phone: admin.phone || admin.phone_number || '',
        roleName: admin.roleName || admin.role?.name || admin.role || '-',
        roleId: admin.roleId || admin.role?.id,
        status: admin.status === true || admin.status === 1 || admin.status === 'active',
        organizationId: admin.organizationId || admin.organization?.id,
        image: admin.image || admin.avatar || null,
        createdAt: admin.createdAt,
        type: admin.type
      }));

      setAdmins(formattedAdmins);
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRoles = async () => {
    try {
      const res = await handleGetAllRoles();
      const rolesData = res?.data || res || [];
      setRoles(rolesData);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles([]);
    }
  };

  /* ================= MODAL ================= */

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRoleId('');
    setRoleName('');
    setOrganizationId('');
    setStatus(true);
    setCurrentAdmin(null);
    setImage(null);
    setImagePreview('');
    setExistingImage('');
  };

  const openModal = (type, admin = null) => {
    setModalType(type);
    setCurrentAdmin(admin);

    if (type === 'update' && admin) {
      setName(admin.name || '');
      setEmail(admin.email || '');
      setPhone(admin.phone || '');
      setRoleId(admin.roleId || '');
      setRoleName(admin.roleName || '');
      setOrganizationId(admin.organizationId || '');
      setStatus(admin.status === true || admin.status === 1 || admin.status === 'active' || admin.status === 'Active');
      setExistingImage(admin.image || '');
      setImagePreview(admin.image || '');
    } else {
      resetForm();
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  /* ================= IMAGE HANDLING ================= */

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Invalid file type. Please upload JPEG, PNG, GIF, or WEBP images only.', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast('File size too large. Maximum size is 5MB.', 'error');
        return;
      }

      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    setExistingImage('');
  };

  // Simple role selection - just set ID and Name from selected option
  const handleRoleSelect = (e) => {
    const selectedRoleId = e.target.value;
    const selectedRole = roles.find(role => role.id === selectedRoleId);

    setRoleId(selectedRoleId);
    setRoleName(selectedRole ? selectedRole.name : '');
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Email is required', 'error');
      return;
    }
    if (modalType === 'create' && !password.trim()) {
      showToast('Password is required', 'error');
      return;
    }
    if (!roleId) {
      showToast('Please select a role', 'error');
      return;
    }
    if (!organizationId) {
      showToast('Organization ID is required', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('phone', phone.trim() || '');
    formData.append('roleId', roleId);
    formData.append('roleName', roleName);
    formData.append('organizationId', organizationId);
    formData.append('status', status ? 'active' : 'inactive');

    if (modalType === 'create') {
      formData.append('password', password.trim());
    }

    if (image) {
      formData.append('image', image);
    } else if (modalType === 'update' && existingImage === '' && imagePreview === '') {
      formData.append('remove_image', 'true');
    }

    // Log the payload

    setSubmitting(true);

    try {
      if (modalType === 'create') {
        await handleCreateAdmin(formData);
        await fetchAllAdmins();
        closeModal();
        showToast('Admin created successfully!');
      } else {
        await handleUpdateAdmin(currentAdmin.id, formData);
        await fetchAllAdmins();
        closeModal();
        showToast('Admin updated successfully!');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      showToast(error.response?.data?.message || 'An error occurred. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await handleDeleteAdminAccount(id);
        await fetchAllAdmins();
        showToast('Admin deleted successfully!');
      } catch (error) {
        console.error('Delete failed:', error);
        showToast('Failed to delete admin. Please try again.', 'error');
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50/30 ">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Admin Management
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <FiShield className="w-4 h-4" />
                  Create and manage administrator accounts
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal('create')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2 text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Create Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Admins</p>
                <p className="text-3xl font-bold text-gray-900">{admins.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <FiUsers className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Admins</p>
                <p className="text-3xl font-bold text-green-600">
                  {admins.filter(a => a.status === true).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Roles</p>
                <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiShield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Administrator Accounts</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-20">
              <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FiUsers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No admins found</h3>
              <p className="text-sm text-gray-500 mt-1">Click "Create Admin" to add your first administrator</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((admin, index) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {admin.image ? (
                            <img
                              src={admin.image}
                              alt={admin.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {admin.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900">{admin.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FiMail className="w-4 h-4 text-gray-400" />
                          {admin.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          {admin.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                          <FiShield className="w-3 h-3 mr-1" />
                          {admin.roleName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${admin.status === true
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {admin.status === true ? (
                            <FiCheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <FiXCircle className="w-3 h-3 mr-1" />
                          )}
                          {admin.status === true ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal('update', admin)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Admin"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Admin"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-indigo-600" />
                  {modalType === 'create' ? 'Create New Admin' : 'Edit Admin'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  {/* Profile Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Image
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Profile preview"
                              className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                            {name ? name.charAt(0).toUpperCase() : <FiUser className="w-8 h-8" />}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700">
                            <FiUpload className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {imagePreview ? 'Change Image' : 'Upload Image'}
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG, GIF or WEBP. Max 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password (only for create) */}
                  {modalType === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Minimum 6 characters"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  {/* Organization ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter Organization ID"
                      required
                    />
                  </div>

                  {/* Role Dropdown - Simple Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        value={roleId}
                        onChange={handleRoleSelect}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                        required
                      >
                        <option value="">Select a role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setStatus(!status)}
                      className={`w-full py-2.5 rounded-xl font-medium transition-all ${status
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-400 text-white hover:bg-gray-500'
                        }`}
                    >
                      {status ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {modalType === 'create' ? 'Creating...' : 'Updating...'}
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        {modalType === 'create' ? 'Create Admin' : 'Update Admin'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default AdminUserPage;