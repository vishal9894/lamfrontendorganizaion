import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

const PermissionsUI = ({ user, role, onClose, onSave, isModal = true, selectedPermissions: externalSelectedPermissions, onPermissionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);

  // Permission groups data with correct IDs matching your database
  const permissionGroups = [
    {
      name: 'Admin',
      permissions: [
        { id: 1, name: 'admin-menu' },
        { id: 71, name: 'create-role' },
        { id: 72, name: 'edit-role' },
        { id: 73, name: 'delete-role' },
        { id: 74, name: 'create-admin' },
        { id: 75, name: 'edit-admin' },
        { id: 76, name: 'delete-admin' }
      ]
    },
    {
      name: 'Content',
      permissions: [
        { id: 2, name: 'content-menu' },
        { id: 3, name: 'create-folder' },
        { id: 4, name: 'import-video' },
        { id: 5, name: 'import-pdf' },
        { id: 6, name: 'import-test' },
        { id: 175, name: 'add-category' }
      ]
    },
    {
      name: 'User',
      permissions: [
        { id: 7, name: 'users-menu' },
        { id: 8, name: 'users-list' },
        { id: 9, name: 'login-analytics' },
        { id: 10, name: 'send-notification' },
        { id: 11, name: 'course-notifications' },
        { id: 135, name: 'in-app-notifications' },
        { id: 139, name: 'notification-history' },
        { id: 171, name: 'add-in-app-notification' },
        { id: 172, name: 'edit-in-app-notification' },
        { id: 173, name: 'delete-in-app-notification' },
        { id: 174, name: 'view-in-app-notification' },
        { id: 191, name: 'edit-user' }
      ]
    },
    {
      name: 'Banner',
      permissions: [
        { id: 18, name: 'banner-menu' },
        { id: 19, name: 'banner-list' },
        { id: 20, name: 'add-banner' },
        { id: 21, name: 'delete-banner' },
        { id: 22, name: 'publish-unpublish-banner' },
        { id: 121, name: 'news-banner' },
        { id: 176, name: 'view-banner' }
      ]
    },
    {
      name: 'Stream',
      permissions: [
        { id: 23, name: 'stream-menu' },
        { id: 24, name: 'add-stream' },
        { id: 25, name: 'view-stream' },
        { id: 26, name: 'edit-stream' },
        { id: 27, name: 'delete-stream' }
      ]
    },
    {
      name: 'Course',
      permissions: [
        { id: 34, name: 'course-menu' },
        { id: 35, name: 'add-course' },
        { id: 36, name: 'view-course' },
        { id: 37, name: 'edit-course' },
        { id: 38, name: 'publish-unpublish-course' },
        { id: 39, name: 'delete-course' }
      ]
    },
    {
      name: 'Live Event',
      permissions: [
        { id: 40, name: 'live-event-menu' },
        { id: 41, name: 'live-chat' },
        { id: 78, name: 'add-live-event' },
        { id: 79, name: 'edit-live-event' },
        { id: 92, name: 'view-live-event' },
        { id: 93, name: 'delete-live-event' },
        { id: 94, name: 'publish-unpublish-event' },
        { id: 177, name: 'publish-unpublish-live-event' }
      ]
    },
    {
      name: 'Assign Course',
      permissions: [
        { id: 42, name: 'assign-course-menu' },
        { id: 43, name: 'assign-course' },
        { id: 44, name: 'view-assign-course' },
        { id: 45, name: 'delete-assign-course' },
        { id: 46, name: 'view-enrolled-course' },
        { id: 47, name: 'delete-enrolled-course' },
        { id: 48, name: 'online-payment' },
        { id: 161, name: 'view-payment-leads' },
        { id: 162, name: 'view-success-payments' },
        { id: 178, name: 'delete-assigned-course' },
        { id: 192, name: 'block-course' }
      ]
    },
    {
      name: 'Promotion',
      permissions: [
        { id: 49, name: 'promotion-menu' },
        { id: 50, name: 'add-promotion' },
        { id: 51, name: 'edit-promotion' },
        { id: 52, name: 'view-promotion' },
        { id: 53, name: 'promotion-detail' },
        { id: 54, name: 'publish-unpublish-promotion' },
        { id: 55, name: 'delete-promotion' },
        { id: 145, name: 'top-teacher-menu' },
        { id: 146, name: 'add-top-teacher' },
        { id: 147, name: 'view-top-teacher' },
        { id: 148, name: 'edit-top-teacher' },
        { id: 149, name: 'delete-top-teacher' },
        { id: 150, name: 'top-student-menu' },
        { id: 151, name: 'add-top-student' },
        { id: 152, name: 'view-top-student' },
        { id: 153, name: 'edit-top-student' },
        { id: 154, name: 'delete-top-student' },
        { id: 155, name: 'frame-menu' },
        { id: 156, name: 'add-frame' },
        { id: 157, name: 'view-frame' },
        { id: 158, name: 'edit-frame' },
        { id: 159, name: 'delete-frame' }
      ]
    },
    {
      name: 'Teacher',
      permissions: [
        { id: 56, name: 'teacher-menu' },
        { id: 57, name: 'add-teacher' },
        { id: 58, name: 'edit-teacher' },
        { id: 59, name: 'view-teacher' },
        { id: 60, name: 'delete-teacher' }
      ]
    },
    {
      name: 'Setting',
      permissions: [
        { id: 67, name: 'general-settings' },
        { id: 68, name: 'default-routing-account' },
        { id: 69, name: 'delete-default-routing-account' },
        { id: 70, name: 'add-coin' },
        { id: 116, name: 'social-media' },
        { id: 117, name: 'add-social-media' },
        { id: 118, name: 'edit-social-media' },
        { id: 119, name: 'view-social-media' },
        { id: 120, name: 'delete-social-media' },
        { id: 179, name: 'setting-menu' }
      ]
    },
    {
      name: 'Other',
      permissions: [
        { id: 77, name: 'other-menu' },
        { id: 80, name: 'import-bulk-test' },
        { id: 108, name: 'ticket' },
        { id: 109, name: 'ticket-status' },
        { id: 110, name: 'view-ticket' },
        { id: 189, name: 'import-bulk' },
        { id: 190, name: 'course-doubt' }
      ]
    },
    {
      name: 'Test',
      permissions: [
        { id: 81, name: 'test-menu' },
        { id: 82, name: 'add-test' },
        { id: 83, name: 'edit-test' },
        { id: 84, name: 'view-question' },
        { id: 85, name: 'test-rank' },
        { id: 86, name: 'delete-test' }
      ]
    },
    {
      name: 'Question',
      permissions: [
        { id: 87, name: 'delete-all-question' },
        { id: 88, name: 'download-csv' },
        { id: 89, name: 'edit-question' },
        { id: 90, name: 'delete-question' },
        { id: 91, name: 'details' },
        { id: 107, name: 'add-question' }
      ]
    },
    {
      name: 'Video',
      permissions: [
        { id: 95, name: 'add-video' },
        { id: 96, name: 'edit-video' },
        { id: 97, name: 'view-video' },
        { id: 98, name: 'delete-video' },
        { id: 99, name: 'publish-unpublish-video' }
      ]
    },
    {
      name: 'PDF',
      permissions: [
        { id: 100, name: 'add-pdf' },
        { id: 101, name: 'edit-pdf' },
        { id: 102, name: 'view-pdf' },
        { id: 103, name: 'delete-pdf' },
        { id: 104, name: 'publish-unpublish-pdf' }
      ]
    },
    {
      name: 'Category',
      permissions: [
        { id: 105, name: 'edit-category' },
        { id: 106, name: 'delete-category' }
      ]
    },
    {
      name: 'OMR',
      permissions: [
        { id: 111, name: 'OMR-Sheet-menu' },
        { id: 112, name: 'add-OMR' },
        { id: 113, name: 'view-OMR' },
        { id: 114, name: 'edit-OMR' },
        { id: 115, name: 'delete-OMR' },
        { id: 184, name: 'publish-unpublish-OMR' }
      ]
    },
    {
      name: 'Quiz',
      permissions: [
        { id: 122, name: 'add-quiz' },
        { id: 123, name: 'view-quiz' },
        { id: 124, name: 'edit-quiz' },
        { id: 125, name: 'add-quiz-category' },
        { id: 126, name: 'add-quiz-ques' },
        { id: 127, name: 'view-quiz-ques' },
        { id: 128, name: 'delete-quiz' },
        { id: 129, name: 'delete-all-quiz-ques' },
        { id: 130, name: 'download-quiz-csv' },
        { id: 131, name: 'edit-quiz-ques' },
        { id: 132, name: 'details-quiz' },
        { id: 133, name: 'delete-quiz-ques' },
        { id: 134, name: 'quiz-menu' },
        { id: 185, name: 'add-quiz-question' },
        { id: 186, name: 'edit-quiz-question' },
        { id: 187, name: 'delete-quiz-question' },
        { id: 188, name: 'view-quiz-question' }
      ]
    },
    {
      name: 'Super Stream',
      permissions: [
        { id: 140, name: 'super-stream-menu' },
        { id: 141, name: 'add-super-stream' },
        { id: 142, name: 'view-super-stream' },
        { id: 143, name: 'edit-super-stream' },
        { id: 144, name: 'delete-super-stream' }
      ]
    },
    {
      name: 'Payment',
      permissions: [
        { id: 160, name: 'payment-menu' },
        { id: 163, name: 'export-payment-data' },
        { id: 197, name: 'payment-analytics-view' }
      ]
    },
    {
      name: 'Export',
      permissions: [
        { id: 164, name: 'export-csv' },
        { id: 165, name: 'export-payment-csv' },
        { id: 166, name: 'export-leads-csv' },
        { id: 193, name: 'user-list-csv' }
      ]
    },
    {
      name: 'Wallet',
      permissions: [
        { id: 180, name: 'wallet-menu' },
        { id: 181, name: 'view-coin' }
      ]
    },
    {
      name: 'Ticket',
      permissions: [
        { id: 182, name: 'ticket-menu' },
        { id: 183, name: 'edit-ticket' }
      ]
    },
    {
      name: 'Blog Management',
      permissions: [
        { id: 194, name: 'blog-menu' }
      ]
    },
    {
      name: 'Dashboard',
      permissions: [
        { id: 195, name: 'dashboard-analytics-view' }
      ]
    },
    {
      name: 'Assignment',
      permissions: [
        { id: 196, name: 'assign-analytics-view' }
      ]
    }
  ];

  // Initialize permissions based on props
  useEffect(() => {
    const initialPermissions = {};
    
    // Set all permissions to false initially
    permissionGroups.forEach(group => {
      group.permissions.forEach(perm => {
        initialPermissions[perm.id] = false;
      });
    });

    // If external selected permissions provided (for edit role)
    if (externalSelectedPermissions && Array.isArray(externalSelectedPermissions) && externalSelectedPermissions.length > 0) {
      externalSelectedPermissions.forEach(permId => {
        // Convert to number if it's string
        const id = typeof permId === 'string' ? parseInt(permId) : permId;
        if (initialPermissions.hasOwnProperty(id)) {
          initialPermissions[id] = true;
        }
      });
    }

    setPermissions(initialPermissions);
    
   
  }, [externalSelectedPermissions]);

  // Handle checkbox change
  const handlePermissionChange = (permId) => {
    const newPermissions = {
      ...permissions,
      [permId]: !permissions[permId]
    };
    setPermissions(newPermissions);
    
    if (onPermissionChange) {
      const selected = Object.entries(newPermissions)
        .filter(([_, isChecked]) => isChecked === true)
        .map(([id]) => parseInt(id));
      onPermissionChange(selected);
    }
  };

  // Handle select all in a group
  const handleSelectAll = (groupPermissions) => {
    const newPermissions = { ...permissions };
    groupPermissions.forEach(perm => {
      newPermissions[perm.id] = true;
    });
    setPermissions(newPermissions);
    
    if (onPermissionChange) {
      const selected = Object.entries(newPermissions)
        .filter(([_, isChecked]) => isChecked === true)
        .map(([id]) => parseInt(id));
      onPermissionChange(selected);
    }
  };

  // Handle deselect all in a group
  const handleDeselectAll = (groupPermissions) => {
    const newPermissions = { ...permissions };
    groupPermissions.forEach(perm => {
      newPermissions[perm.id] = false;
    });
    setPermissions(newPermissions);
    
    if (onPermissionChange) {
      const selected = Object.entries(newPermissions)
        .filter(([_, isChecked]) => isChecked === true)
        .map(([id]) => parseInt(id));
      onPermissionChange(selected);
    }
  };

  // Filter groups based on search
  const filteredGroups = permissionGroups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.permissions.some(perm => perm.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // If used as inline component (not modal) - for create/edit role
  if (!isModal) {
    return (
      <div>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[400px] scrollbar-thin overflow-y-auto p-2">
          {filteredGroups.map((group, index) => {
            // Calculate how many permissions are selected in this group
            const selectedCount = group.permissions.filter(perm => permissions[perm.id] === true).length;
            const totalCount = group.permissions.length;
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-gray-900">
                    {group.name}
                    {selectedCount > 0 && (
                      <span className="ml-1 text-xs text-gray-500">({selectedCount}/{totalCount})</span>
                    )}
                  </h4>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(group.permissions)}
                      className="text-xs px-2 py-0.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeselectAll(group.permissions)}
                      className="text-xs px-2 py-0.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 max-h-32 scrollbar-thin overflow-y-auto">
                  {group.permissions
                    .filter(perm => perm.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((permission) => (
                      <div key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`perm${permission.id}`}
                          checked={permissions[permission.id] === true}
                          onChange={() => handlePermissionChange(permission.id)}
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label 
                          htmlFor={`perm${permission.id}`}
                          className="ml-2 text-xs text-gray-700 cursor-pointer hover:text-gray-900"
                        >
                          {permission.name}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

export default PermissionsUI;