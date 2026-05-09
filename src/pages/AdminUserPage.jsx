import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  handleCreateAdmin,
  handleDeleteAdminAccount,
  handleGetAllAdmin,
  handleGetAllRoles,
  handleUpdateAdmin,
} from '../api/allApi';
import { FiCheckCircle, FiEdit2, FiMail, FiPhone, FiPlus, FiSave, FiShield, FiTrash2, FiUpload, FiUser, FiUsers, FiX, FiXCircle } from 'react-icons/fi';
import DeleteModal from '../components/DeleteModal';

const AdminUserPage = () => {
  const { user: reduxUser } = useSelector((state) => state.user);
  const user = reduxUser || (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || 'null'));

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [status, setStatus] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, admin: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast state removed

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
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRoles = async () => {
    try {
      const res = await handleGetAllRoles();
      const rolesData = res?.data || res?.roles || [];
      setRoles(rolesData);
    } catch (err) {
      setRoles([]);
    }
  };

  /* ================= MODAL ================= */

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhone('');
    setRoleId('');
    setRoleName('');
    setOrganizationId(user?.organizationId || user?.organization?.id || user?.orgId || 'default-org-id');
    setStatus(true);
    setCurrentAdmin(null);
    setImage(null);
    setImagePreview('');
    setExistingImage('');
  };

  // Initialize organization ID when user data is available
  useEffect(() => {
    if (user && !organizationId) {
      setOrganizationId(user.organizationId || user.organization?.id || user?.orgId || 'default-org-id');
    }
  }, [user]);

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
      alert('Name is required');
      return;
    }
    if (!email.trim()) {
      alert('Email is required');
      return;
    }
    if (modalType === 'create' && !password.trim()) {
      alert('Password is required');
      return;
    }
    if (modalType === 'create' && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!roleId) {
      alert('Please select a role');
      return;
    }


    const payload = {
      name: name.trim(),
      email: email.trim(),
      roleName: roleName,
      roleId: roleId,
      status: status ? 'active' : 'inactive',
      phone: phone.trim() || '',
    };

    // Only include password if it's provided (for updates)
    if (password.trim()) {
      payload.password = password.trim();
    }

    if (image) {
      payload.image = image;
    } else if (modalType === 'update' && existingImage === '' && imagePreview === '') {
      payload.remove_image = 'true';
    }

    // Log the payload

    setSubmitting(true);

    try {
      if (modalType === 'create') {
        await handleCreateAdmin(payload);
        await fetchAllAdmins();
        closeModal();
      } else if (modalType === 'update') {
        await handleUpdateAdmin(currentAdmin.id, payload);
        await fetchAllAdmins();
        closeModal();
      }
    } catch (error) {
      alert('An error occurred while saving admin');
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    const admin = admins.find(a => a.id === id);
    setDeleteModal({
      isOpen: true,
      admin
    });
  };

  const confirmDeleteAdmin = async () => {
    if (!deleteModal.admin?.id) return;

    setDeleteLoading(true);
    try {
      await handleDeleteAdminAccount(deleteModal.admin.id);
      await fetchAllAdmins();
      closeModal();
      setDeleteModal({ isOpen: false, admin: null });
    } catch (error) {
      alert('An error occurred while deleting admin');
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, admin: null });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50/30 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200">
                <FiUsers className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Admin Management
                </h1>
                <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <FiShield className="w-3 h-3 md:w-4 md:h-4" />
                  Create and manage administrator accounts
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal('create')}
              className="px-3 md:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2 text-xs md:text-sm font-medium w-full sm:w-auto justify-center"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Admin</span>
              <span className="sm:hidden">New Admin</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Total Admins</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{admins.length}</p>
              </div>
              <div className="p-2 md:p-3 bg-indigo-100 rounded-xl">
                <FiUsers className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Active Admins</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">
                  {admins.filter(a => a.status === true).length}
                </p>
              </div>
              <div className="p-2 md:p-3 bg-green-100 rounded-xl">
                <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Total Roles</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{roles.length}</p>
              </div>
              <div className="p-2 md:p-3 bg-purple-100 rounded-xl">
                <FiShield className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Administrator Accounts</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-20">
              <div className="p-4 bg-gray-50 rounded-full w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 flex items-center justify-center">
                <FiUsers className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900">No admins found</h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Click "Create Admin" to add your first administrator</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
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

              {/* Mobile Card View */}
              <div className="md:hidden">
                {admins.map((admin, index) => (
                  <div key={admin.id} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {admin.image ? (
                          <img
                            src={admin.image}
                            alt={admin.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {admin.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-gray-900">
                            {admin.name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${admin.status === true
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {admin.status === true ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <FiMail className="w-3 h-3 text-gray-400" />
                            {admin.email}
                          </div>
                          {admin.phone && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <FiPhone className="w-3 h-3 text-gray-400" />
                              {admin.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                        <FiShield className="w-3 h-3 mr-1" />
                        {admin.roleName}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal('update', admin)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
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
              <form onSubmit={handleSubmit} className="p-4 md:p-6">
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
                              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-indigo-500"
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
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl md:text-2xl">
                            {name ? name.charAt(0).toUpperCase() : <FiUser className="w-6 h-6 md:w-8 md:h-8" />}
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password (only for create) */}
                  {modalType === 'create' && (
                    <>
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
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            placeholder="Minimum 6 characters"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            placeholder="Re-enter password"
                            required
                          />
                        </div>
                      </div>
                    </>
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        placeholder="10-digit mobile number"
                      />
                    </div>
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-sm"
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
                      className={`w-full py-2.5 rounded-xl font-medium transition-all text-sm ${status
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-400 text-white hover:bg-gray-500'
                        }`}
                    >
                      {status ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors font-medium w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 w-full sm:w-auto order-1 sm:order-2"
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

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteAdmin}
        title="Delete Admin"
        message="Are you sure you want to delete this admin? This action cannot be undone."
        itemName={deleteModal.admin?.name || "Admin"}
        isLoading={deleteLoading}
        confirmText="Delete Admin"
      />

    </div>
  );
}

export default AdminUserPage;